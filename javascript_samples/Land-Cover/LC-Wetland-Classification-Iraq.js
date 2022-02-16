/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var geometry = 
    /* color: #0b4a8b */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[46.20544738332081, 32.265205382831816],
          [46.20544738332081, 30.320865970703387],
          [48.28735656300831, 30.320865970703387],
          [48.28735656300831, 32.265205382831816]]], null, false),
    image = ee.Image("projects/remote-sensing-331615/assets/classification2019_1"),
    imageVisParam2 = {"opacity":1,"bands":["b1"],"min":1,"max":4,"palette":["05a4ff","fffd03","cbcbcb","1be90a"]},
    imageVisParam = {"opacity":1,"bands":["B4","B3","B2"],"min":810.2373314532396,"max":2246.3135446917227,"gamma":1},
    imageVisParam3 = {"opacity":1,"bands":["B4","B3","B2"],"min":273.36,"max":3266.64,"gamma":1},
    imageVisParam4 = {"opacity":1,"bands":["B4","B3","B2"],"min":273.36,"max":3266.64,"gamma":1},
    imageVisParam5 = {"opacity":1,"bands":["red","green","green"],"min":0.08478679442564246,"max":0.3885151014237375,"gamma":1},
    imageVisParam6 = {"opacity":1,"bands":["red","green","green"],"min":0.06405608676373958,"max":0.2922301521152258,"gamma":1},
    geometry2 = 
    /* color: #d63000 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[47.34747997241767, 31.500687835992686],
          [47.34747997241767, 31.287338843157485],
          [47.69629589038642, 31.287338843157485],
          [47.69629589038642, 31.500687835992686]]], null, false),
    TS19_asset = ee.FeatureCollection("users/victormackenhauer/Iraq/TS19"),
    image2 = ee.Image("users/victormackenhauer/Iraq/L8-2021_test1"),
    image3 = ee.Image("users/victormackenhauer/Iraq/L8-2021_test2"),
    image4 = ee.Image("users/victormackenhauer/Iraq/L8-2019_test1"),
    table = ee.FeatureCollection("users/victormackenhauer/Iraq/TS18_4of4"),
    table2 = ee.FeatureCollection("users/victormackenhauer/Iraq/TS18_3of4"),
    table3 = ee.FeatureCollection("users/victormackenhauer/Iraq/TS18_1of4"),
    table4 = ee.FeatureCollection("users/victormackenhauer/Iraq/TS17_1of4"),
    table5 = ee.FeatureCollection("users/victormackenhauer/Iraq/TS17_2of4"),
    image5 = ee.Image("users/victormackenhauer/Iraq/L8-2021_test3");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
/*
Decription: Land Cover / Wetland classifications for Iraq. A random forest is trained on 
            land cover maps from year A and applied on year B.
Requiremnets: Land cover datasets to sample training data in
Contributor: victor.olsen@reach-initiative.org
*/

var t_sample = TS19_asset.merge(table).merge(table2).merge(table3).merge(table4).merge(table5)

/*************************************************************************************
///////////////////////////////////// 01_Variables ///////////////////////////////////
*************************************************************************************/

// Defining AOI
var clip_feature = geometry

// Defining time range
var start = ee.Date('2019-01-01');
var end = ee.Date('2019-12-31');

/*************************************************************************************
///////////////////////////////////// 02_Functions ///////////////////////////////////
*************************************************************************************/

// Reference module repository (includes cloud masking function)
var Preprocess = require('users/victormackenhauer/REACH-BackUps:Modules/Preprocess')

//Monthly Mosaick maker Sen2
function make_date_range_monthly(start, end){
  var n_months = end.difference(start,'month').round().subtract(1);
  var range = ee.List.sequence(0,n_months,1); 
  var make_datelist = function (n) {
    return start.advance(n,'month')
  };
  return range.map(make_datelist);
}

var date_range_monthly = make_date_range_monthly(start, end)

function composite_monthly(imgCol, date_range){
  return ee.ImageCollection.fromImages(
      date_range.map(function (date) {
        date = ee.Date(date)
        imgCol = imgCol.filterDate(date, date.advance(1,'month'))
        return imgCol.mean()
                    .set('date', date.format('YYYY-MM'))
                    .set('year', date.get('year'))
                    .set('month', date.get('month'))
                    .set('system:time_start', date.millis())
                    .clip(clip_feature)
      }))
}


// Cloud masking L8
var l8_cloud_remover = function(image) {
  
  var RADIX = 2;  // Radix for binary (base 2) data.
  
  // Extract the QA band.
  var image_qa = image.select('BQA');
  
  var extractQABits = function (qaBand, bitStart, bitEnd) {
    var numBits = bitEnd - bitStart + 1;
    var qaBits = qaBand.rightShift(bitStart).mod(Math.pow(RADIX, numBits));
    return qaBits;
  };
  
  // Create a mask for the dual QA bit "Cloud Confidence".
  var bitStartCloudConfidence = 5;
  var bitEndCloudConfidence = 6;
  var qaBitsCloudConfidence = extractQABits(image_qa, bitStartCloudConfidence, bitEndCloudConfidence);
  // Test for clouds, based on the Cloud Confidence value.
  var testCloudConfidence = qaBitsCloudConfidence.gte(2);
  
  // Create a mask for the dual QA bit "Cloud Shadow Confidence".
  var bitStartShadowConfidence = 7;
  var bitEndShadowConfidence = 8;
  var qaBitsShadowConfidence = extractQABits(image_qa, bitStartShadowConfidence, bitEndShadowConfidence);
  // Test for shadows, based on the Cloud Shadow Confidence value.
  var testShadowConfidence = qaBitsShadowConfidence.gte(2);
  
  // Calculate a composite mask and apply it to the image.   
  var maskComposite = (testCloudConfidence.or(testShadowConfidence)).not();
  
  return image.updateMask(maskComposite);
};


//Monthly Mosaick maker L8

// Date range
var diff = end.difference(start, 'day');
var temporalResolution = 30; // days
var range = ee.List.sequence(0, diff.subtract(1), temporalResolution).map(function(day){return start.advance(day,'day')});

// Mosaic maker function (same code used for Sentinel 2)  - Inspiration: https://code.earthengine.google.com/20ad3c83a17ca27b28640fb922819208
function mosaic_maker(imageCollection){
  var temporal_composites = function(date, newlist) {
    date = ee.Date(date);
    newlist = ee.List(newlist);
    var filtered = imageCollection.filterDate(date, date.advance(temporalResolution, 'day'));
    var filtered_addedQA = filtered.map(function(image) {return image.addBands(image.metadata('system:time_start'))});
    var image = ee.Image(filtered_addedQA.median()).set('system:time_start', date).clip(clip_feature); //filtered_addedQA.first().get('system:time_start')); // date);      qualityMosaic('system:time_start'))                  //Change to qualityMosaic()
    return ee.List(ee.Algorithms.If(filtered.size(), newlist.add(image), newlist));
};
  var imageCollection_unfiltered = ee.ImageCollection(ee.List(range.iterate(temporal_composites, ee.List([]))));
  return imageCollection_unfiltered.limit(range.size().subtract(1), 'system:time_start');
}


// Annual mosaic for Landsat 8
var annual_mosaick_function_l8 = function(img, start, end) {
  var landsat_filtered = landsat.filterDate(start, end)
  var landsat_masked = landsat_filtered.map(l8_cloud_remover)
  var annual_mosaick_l8 = landsat_masked.mean()
  return annual_mosaick_l8
}


/*************************************************************************************
//////////////////////////////////////// 03_Data /////////////////////////////////////
*************************************************************************************/

// Sen2
var sentinel2 = ee.ImageCollection('COPERNICUS/S2_SR')
                    .filterDate(start, end)
                    .filterBounds(clip_feature)
var s2_cloudless = Preprocess.filterCloudsAndShadowsUkraine(sentinel2,clip_feature,start,end,false, 60)
var sentinel2_mosaick = composite_monthly(s2_cloudless, date_range_monthly)
var s2_annual_mosaick = s2_cloudless.mean() 

// L8
var landsat = ee.ImageCollection('LANDSAT/LC08/C01/T1_TOA')
                  //.filterDate(start, end)
                  .filterBounds(clip_feature)
                  .select(['B2', 'B3', 'B4','B5', 'B6', 'B7', 'BQA'],['blue', 'green', 'red', 'nir', 'swir1', 'swir2', 'BQA'])
                  .map(function(image) {
                  return image.addBands(image.normalizedDifference(['nir','red']).select(['nd'], ['NDVI']));
                  })
                  .sort('system:time_start');

var landsat_mosaic_2013 = annual_mosaick_function_l8(landsat, ee.Date('2013-01-01'), ee.Date('2019-12-14'))
var landsat_mosaic_2014 = annual_mosaick_function_l8(landsat, ee.Date('2014-01-01'), ee.Date('2019-12-14'))
var landsat_mosaic_2015 = annual_mosaick_function_l8(landsat, ee.Date('2015-01-01'), ee.Date('2019-12-14'))
var landsat_mosaic_2016 = annual_mosaick_function_l8(landsat, ee.Date('2016-01-01'), ee.Date('2019-12-14'))
var landsat_mosaic_2017 = annual_mosaick_function_l8(landsat, ee.Date('2017-01-01'), ee.Date('2019-12-14'))
var landsat_mosaic_2018 = annual_mosaick_function_l8(landsat, ee.Date('2018-01-01'), ee.Date('2019-12-14'))
var landsat_mosaic_2019 = annual_mosaick_function_l8(landsat, ee.Date('2019-01-01'), ee.Date('2019-12-14'))
var landsat_mosaic_2020 = annual_mosaick_function_l8(landsat, ee.Date('2020-01-01'), ee.Date('2020-12-14'))
var landsat_mosaic_2021 = annual_mosaick_function_l8(landsat, ee.Date('2021-01-01'), ee.Date('2021-12-14'))


// Indices
var sentinel2_mosaick = sentinel2_mosaick
                    .map(function(image) {
                    return image.addBands(image.normalizedDifference(['B8','B4']).select(['nd'], ['NDVI']));    //.addBands(image.metadata('system:time_start'))
                    })
                    .map(function(image) {
                    return image.addBands(image.normalizedDifference(['B3','B8']).select(['nd'], ['NDWI']));
                    })
                    .map(function(image) {
                    return image.addBands(image.normalizedDifference(['B3','B11']).select(['nd'], ['MNDWI']));
                    })

// Thresholding MNDWI
var s2_water = sentinel2_mosaick.map(function(image){
  var mask = image.select('MNDWI').gte(0)
  return image.mask(mask)})



/*************************************************************************************
//////////////////////////////////////// 05_Sampling /////////////////////////////////
*************************************************************************************/

var samp19_VO = ee.FeatureCollection('users/victormackenhauer/Iraq/samp19')
var samp18_VO = ee.FeatureCollection('users/victormackenhauer/Iraq/samp18').limit(500)
var samp17_VO = ee.FeatureCollection('users/victormackenhauer/Iraq/samp17')

var samp18_VO = ee.FeatureCollection('users/victormackenhauer/Iraq/samp18').randomColumn('random')

print('random', samp18_VO.filter(ee.Filter.lt('random', 0.25)))
print('random', samp18_VO.filter(ee.Filter.gt('random', 0.25)).filter(ee.Filter.lt('random', 0.5)))
print('random', samp18_VO.filter(ee.Filter.gt('random', 0.5)).filter(ee.Filter.lt('random', 0.75)))
print('random', samp18_VO.filter(ee.Filter.gt('random', 0.75)))

var samp18_VO_1of4 = samp18_VO.filter(ee.Filter.lt('random', 0.15))
var samp18_VO_2of4 = samp18_VO.filter(ee.Filter.gt('random', 0.25)).filter(ee.Filter.lt('random', 0.5))
var samp18_VO_3of4 = samp18_VO.filter(ee.Filter.gt('random', 0.5)).filter(ee.Filter.lt('random', 0.75))
var samp18_VO_4of4 = samp18_VO.filter(ee.Filter.gt('random', 0.75))

var TS18_1of4 = landsat_mosaic_2018.sampleRegions({
  collection: samp18_VO_1of4,
  scale: 30, 
  geometries: true})

var TS18_2of4 = landsat_mosaic_2018.sampleRegions({
  collection: samp18_VO_2of4,
  scale: 30, 
  geometries: true})

var TS18_3of4 = landsat_mosaic_2018.sampleRegions({
  collection: samp18_VO_3of4,
  scale: 30, 
  geometries: true})

var TS18_4of4 = landsat_mosaic_2018.sampleRegions({
  collection: samp18_VO_4of4,
  scale: 30, 
  geometries: true})




var samp17_VO = ee.FeatureCollection('users/victormackenhauer/Iraq/samp17').randomColumn('random')

var samp17_VO_1of4 = samp17_VO.filter(ee.Filter.lt('random', 0.15))
var samp17_VO_2of4 = samp17_VO.filter(ee.Filter.gt('random', 0.15)).filter(ee.Filter.lt('random', 0.30))
var samp17_VO_3of4 = samp17_VO.filter(ee.Filter.gt('random', 0.30)).filter(ee.Filter.lt('random', 0.45))
var samp17_VO_4of4 = samp17_VO.filter(ee.Filter.gt('random', 0.45))

var TS17_1of4 = landsat_mosaic_2017.sampleRegions({
  collection: samp17_VO_1of4,
  scale: 30, 
  geometries: true})

var TS17_2of4 = landsat_mosaic_2017.sampleRegions({
  collection: samp17_VO_2of4,
  scale: 30, 
  geometries: true})

var TS17_3of4 = landsat_mosaic_2017.sampleRegions({
  collection: samp17_VO_3of4,
  scale: 30, 
  geometries: true})

var TS17_4of4 = landsat_mosaic_2017.sampleRegions({
  collection: samp17_VO_4of4,
  scale: 30, 
  geometries: true})




/// Full sample

var TS17 = landsat_mosaic_2017.sampleRegions({
  collection: samp17_VO,
  scale: 30, 
  geometries: true})

var TS18 = landsat_mosaic_2018.sampleRegions({
  collection: samp18_VO,
  scale: 30, 
  geometries: true})

var TS19 = landsat_mosaic_2019.sampleRegions({
  collection: samp19_VO,
  scale: 30, 
  geometries: true})




/*************************************************************************************
//////////////////////////////////////// Classifying /////////////////////////////////
*************************************************************************************/

//print(landsat_mosaic_2021.select(['blue', 'green', 'red', 'nir', 'swir1', 'swir2', 'NDVI']))
//print(TS19.limit(2).select(['blue', 'green', 'red', 'nir', 'swir1', 'swir2', 'NDVI', 'land_class']))

//OBS filer bounds applied!!!

var training_sample = t_sample //TS19_asset// TS19.select(['blue', 'green', 'red', 'nir', 'swir1', 'swir2', 'NDVI', 'land_class']).filterBounds(geometry2)

var classifier = ee.Classifier.smileRandomForest(500);

var trained_classifier = classifier.train(training_sample, 'land_class', training_sample.first().propertyNames().remove('land_class').remove('system:index')) //.first().propertyNames().remove('system:index').remove('classification'));

// OBS small geometry applied!!!
var classified_image = landsat_mosaic_2021.classify(trained_classifier)//.clip(geometry2);

// // Export classification
// Export.image.toAsset({
//   image: classified_image,
//   description: 'L8-2021_test3',
//   assetId: 'users/victormackenhauer/Iraq/L8-2021_test3',
//   scale: 30,
//   region: clip_feature,
//   maxPixels: 2000000000000
// });




var marsh = image5.mask(image5.lt(3))


Map.addLayer(marsh, imageVisParam_new, 'marsh', false);



/*************************************************************************************
//////////////////////////////////////// 06_Visuals //////////////////////////////////
*************************************************************************************/
var imageVisParam_new = {"opacity":1,"bands":["classification"],"min":1,"max":4,"palette":["05a4ff","fffd03","cbcbcb","1be90a"]}

// Map.addLayer(s2_water.first(), '', 'water S2', false)
Map.addLayer(landsat_mosaic_2018.clip(clip_feature), imageVisParam6, 'l8 2018', false);
Map.addLayer(landsat_mosaic_2021.clip(clip_feature), imageVisParam6, 'l8 2021', false);
Map.addLayer(image, imageVisParam2, 'class old', false);
Map.addLayer(image2, imageVisParam_new, 'class 1', false);
Map.addLayer(image3, imageVisParam_new, 'class 2', false);
Map.addLayer(image5, imageVisParam_new, 'class 3', false);
Map.addLayer(image4, imageVisParam_new, 'class 2019', false);

/*************************************************************************************
//////////////////////////////////////// 07_Exports //////////////////////////////////
*************************************************************************************/

Export.image.toDrive({
  image: image5,
  description: 'L8-2021_test3',
  region: geometry,
  scale: 30,
  maxPixels: 1e13
})

Export.image.toDrive({
  image: marsh,
  description: 'marsh-2021',
  region: geometry,
  scale: 30,
  maxPixels: 1e13
})


// // Define a kernel.
// var kernel = ee.Kernel.circle({radius: 0.9});

// // Perform an erosion followed by a dilation, display.
// var opened = marsh
//             .focal_min({kernel: kernel, iterations: 2})
//             .focal_max({kernel: kernel, iterations: 2});
// //Map.addLayer(opened, {}, 'opened');


var marsh_poly = marsh.reduceToVectors({maxPixels:1e13}).union(100).map(function(f) {
  return f.buffer(-100)
})
  // {reducer,
  // geometry,
  // scale,
  // geometryType)
print(marsh_poly)
Map.addLayer(marsh_poly)



// Erosion followed by a dilation
var kernel1 = ee.Kernel.circle({radius: 0.5});
var kernel2 = ee.Kernel.circle({radius: 5});

var opened = marsh
            .focal_min({kernel: kernel2, iterations: 2})
            //.focal_max({kernel: kernel1, iterations: 2});


// Dilation followed by erosion
var open_closed = opened
                  .focal_max({kernel: kernel1, iterations: 5})
                  .focal_min({kernel: kernel1, iterations: 5});


Map.addLayer(opened, {}, 'opened');



//var cop_lc_combined = ee.ImageCollection([cop_lc.select(['b1'],['cop_lc']), open_closed.select(['b1'],['cop_lc_morphed'])]);





