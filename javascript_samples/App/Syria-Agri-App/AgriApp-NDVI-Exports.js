/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var aoi = 
    /* color: #d63000 */
    /* shown: false */
    /* locked: true */
    ee.Geometry.Polygon(
        [[[35.684149846535576, 37.31291707686042],
          [35.684149846535576, 32.322619959759066],
          [42.432501897316826, 32.322619959759066],
          [42.432501897316826, 37.31291707686042]]], null, false),
    WaPor_LULC17 = ee.Image("users/reachsyriagee/WaPor/L2_SYR_LCC_17"),
    WaPor_LULC18 = ee.Image("users/reachsyriagee/WaPor/L2_SYR_LCC_18"),
    WaPor_LULC19 = ee.Image("users/reachsyriagee/WaPor/L2_SYR_LCC_19"),
    WaPor_LULC20 = ee.Image("users/reachsyriagee/WaPor/L2_SYR_LCC_20");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
/*
Description: NDVI Export script for the Syria Agri App
Contributor: Pedro, Esther, Reem and Victor (REACH Yemen and Syria)
*/

// CONSTANTES
var imageVisParamNDVI = {"opacity":1,"bands":["NDVI"],"min":0,"max":0.7,"palette":["ffffff","006600"]};

var clipFeature = aoi  ///SELECT AOI

var Preprocess = require('users/reachsyriagee/Modules:Preprocess')


// var GLC10_LULC = ee.Image("users/WaPor/GLC10m_Yemen");

/////////////////////////////// LOADING IMAGE COLLECTIONS

var start = ee.Date('2021-01-01');
var end = ee.Date('2021-10-01');

// Loading and filtering imageCollections
var sentinel2 = ee.ImageCollection('COPERNICUS/S2_SR')
                    .filterDate(start, end)
                    .filterBounds(clipFeature)



//Visualizing images in the Sentinel-2 imageCollection
var listOfImages = sentinel2.select(['B2','B3','B4'], ['blue', 'green', 'red']).toList(sentinel2.size());

print('original sentinel2', sentinel2)

// Map.addLayer(ee.Image(listOfImages.get(0)), imageVisParam, 'img1', false)



/////////////////////////////// CLOUD MASKING

var sentinel2Cloudless = Preprocess.filterCloudsAndShadows(sentinel2,clipFeature,start,end,false, 80)

var cloudlessList = sentinel2Cloudless.select(['B2','B3','B4'], ['blue', 'green', 'red']).toList(sentinel2Cloudless.size());

print('S2_Cloudless', sentinel2Cloudless)



/////////////////////////////// CALCULATING INDICES 
var sentinel2Indices = Preprocess.calculateIndices(sentinel2Cloudless)

var NDVI_list = sentinel2Indices.select(['NDVI']).toList(sentinel2.size());

// print('Sentinel 2 - With Indices', sentinel2Indices)

// Map.addLayer(ee.Image(NDVI_list.get(4)), imageVisParamNDVI, 'NDVI 5', false)


/////////////////////////////// COMPOSITING AND MOSAICKING
// Inspiration: https://code.earthengine.google.com/20ad3c83a17ca27b28640fb922819208

// Mosaic maker function (same code used for Sentinel 2)  - Inspiration: https://code.earthengine.google.com/20ad3c83a17ca27b28640fb922819208
var mosaick_maker = function(imageCollection, diff, temporalResolution, range, clip_feature){
  var temporal_composites = function(date, newlist) {
    date = ee.Date(date);
    newlist = ee.List(newlist);
    var filtered = imageCollection.filterDate(date, date.advance(20, 'day'));
    var filtered_addedQA = filtered.map(function(image) {return image.addBands(image.metadata('system:time_start'))});
    var image = ee.Image(filtered_addedQA.median()).set('system:time_start', date)//.clip(clip_feature); //filtered_addedQA.first().get('system:time_start')); // date);      qualityMosaic('system:time_start'))                  //Change to qualityMosaic()
    return ee.List(ee.Algorithms.If(filtered.size(), newlist.add(image), newlist));
};
  var imageCollection_unfiltered = ee.ImageCollection(ee.List(range.iterate(temporal_composites, ee.List([]))));
  return imageCollection_unfiltered.limit(range.size().subtract(1), 'system:time_start');
}

// Mosaicking
var diff = end.difference(start, 'day');
var temporalResolution = 30; // days
var range = ee.List.sequence(0, diff.subtract(1), temporalResolution).map(function(day){return start.advance(day,'day')});
var sentinel2_mosaics = mosaick_maker(sentinel2Indices, diff, temporalResolution, range, clipFeature)
// print("Range",range)
 
// Adding month to metadata
var sentinel2_mosaics = sentinel2_mosaics.map(function(image) {
  var number_of_month = ee.Number.parse(image.get('system:index')).add(ee.Number(1))
  var dataset_year = ee.Date(image.get('system:time_start')).get("year")
  return image.set('year', dataset_year).set('month', number_of_month)
})

// Gap filling with constant value
var sentinel2_mosaics = sentinel2_mosaics.map(function(image) {
  return image.unmask(0);     //OBS: Selection bands deactivated .select(selection_bands)
});


// print('Sentinel 2 Mosaics', sentinel2_mosaics)


// Map.addLayer(sentinel2_mosaics.filterMetadata('month', 'equals', 4), imageVisParamNDVI, 'Comp 4', false)



var sentinel2_mosaics = sentinel2_mosaics.select("NDVI")

var listOfImages = sentinel2_mosaics.toList(sentinel2_mosaics.size());

print('NDVI Mosaics', sentinel2_mosaics)



// Map.addLayer(sentinel2_mosaics.filterMetadata('month', 'equals', 1), imageVisParamNDVI, 'Comp 1', false)


/////////////////////////////// APPLYING CROP MASKS AND FILTERING

// var crop_mask = GLC10_LULC.eq(10)
var crop_mask = WaPor_LULC19.eq(42).or(WaPor_LULC19.eq(41))

var clipped_mosaics = sentinel2_mosaics.map(function(image){    
  return image.updateMask(crop_mask)})
  
var filtered_mosaics = clipped_mosaics.map(function(image){    
  return image.updateMask(image.select("NDVI").gt(0))})

var filtered_mosaics =filtered_mosaics.map(function(image){    
  return image.multiply(255).toByte()})

var listOfImages = filtered_mosaics.toList(filtered_mosaics.size());

var comp = ee.Image(listOfImages.get(7));

print(listOfImages, "Filtered")

Map.addLayer(comp, imageVisParamNDVI, 'Filtered 8', false)

Map.addLayer(WaPor_LULC19.eq(42).or(WaPor_LULC19.eq(41)),{pallete:"ffffff"} ,  'WaPor', false)

///////////////////////////////// EXPORTING RESULTS

var year = start.get('year')
var name_base = ee.String("Syria_NDVI_").cat(ee.String(year)).cat(ee.String("_"))
var i;

for (i = 1; i < 10; i++) {
  var image1 = ee.Image(listOfImages.get(i-1))
  var b= i+6
  var name = name_base.getInfo().concat(i)
  
  Export.image.toAsset({
  description: name,
  image:image1,
  assetId: 'SY_NDVI/'+name,
  scale: 10,
  region: WaPor_LULC20.geometry(),
  maxPixels: 2000000000000
})}


