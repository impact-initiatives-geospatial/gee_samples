/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var AOI = /* color: #d63000 */ee.Geometry.Polygon(
        [[[38.539085589748325, 35.94354877143385],
          [38.539085589748325, 35.823382050038624],
          [38.82541676650614, 35.823382050038624],
          [38.82541676650614, 35.94354877143385]]], null, false);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
///// Procedure to update the 2021 time series for the Syria Agri app /////  

// (A) On the top of the script:
// -- Enter new month (e.g. 9 for Sep) and number of days (e.g. 30 for Sep)

// --> Not only the last month (in this case Sep) will be produced, also the second previous one, as this can now be updated with the entire filling procedure (not only annual median filling but previous/consecutive image filling)
	
// (B) On the bottom of the script (run these parts of the script separately!):
// -- Step 1 - Export both classified images and check them
// -- Step 2 - Delete first image from both folders ( if new results are fine) - there will sometimes not be a difference for the first image.
// -- Step 3 - Copy asset from updated_review to final folders
 
 /// (A) Update current month parameter
var current_month = 12


   
///////////////////////////////////////////////////////////////////////////////////////////////

 var Preprocess = require('users/reachsyriagee/Modules:Preprocess_Water')
// Defining AOI
var aoi_name = 'AOI_WoS'
var aoi_fc = ee.FeatureCollection('users/estherbarvels/SY_Water/AOIs/'+aoi_name)
var clip_feature = aoi_fc.geometry()

var selection_bands = ['MNDWI', 'NDVI', 'NDWI2', 'blue', 'green', 'red', 'nir', 'swir1', 'swir2'] 



var snow_areas = ee.FeatureCollection('users/reachsyriagee/SY_Water/AOIs/snow_areas')

/////////////////////////////////////////////////////////////////////////////////////////

var year = 2021
var start_s2 = ee.Date.fromYMD(year-1, 11, 1)
var start = ee.Date.fromYMD(year, 1, 1)
var end =  ee.Date.fromYMD(year, current_month, 1)

var range = ee.List.sequence(1, current_month-1, 1)

// var ids = range
var ids = [current_month-3, current_month-1] // if only wanting to export latest images for updates
 

/////////////////////////// Loading Imagery //////////////////////////////////////////////

 

// Loading and filtering imageCollections
var sentinel2 = ee.ImageCollection('COPERNICUS/S2_SR')
                    .filterDate(start_s2, end)
                    .filterBounds(clip_feature);

print('sentinel2 last image date', ee.Image(sentinel2.toList(sentinel2.size()).reverse().get(0)).date())


var dem = ee.Image('USGS/SRTMGL1_003');
var elevation = dem.select('elevation');
var slope = ee.Terrain.slope(elevation);
var HAND = ee.Image("MERIT/Hydro/v1_0_1").select('hnd');

var sentinel1 = ee.ImageCollection('COPERNICUS/S1_GRD')
                  .sort('system:time_start')
                  .filterBounds(clip_feature.buffer(4000))  //Geometry, not feature!!   sen1_selection
                  .filterDate(start, end)
                  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
                  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
                  .filter(ee.Filter.eq('instrumentMode', 'IW'))
                  .select(['VV', 'VH']);
                  // .map(function(image) {
                  //   return image.unitScale(-30, 30).copyProperties(image, ['system:time_start']);        //No clamping performed, may be a problem for outliers
                  // });
print('sentinel1 last image date', ee.Image(sentinel1.toList(sentinel1.size()).reverse().get(0)).date())

var sentinel1_DES = sentinel1.filterMetadata('orbitProperties_pass', 'equals', 'DESCENDING');
var sentinel1_AS = sentinel1.filterMetadata('orbitProperties_pass', 'equals', 'ASCENDING');


var date_range_monthly = make_date_range_monthly(start_s2,end)

 

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

//////////////////////////// Processing sentinel1_AS /////////////////////////////////////////////////////////
var sentinel1_AS = composite_monthly(sentinel1_AS, date_range_monthly)
//Filters out images outside of current temporal scope
var sentinel1_AS_mosaics = sentinel1_AS.map(function(image) {
  return ee.Algorithms.If(ee.Number(image.bandNames().size().gt(0)), image.set('approved','true'), image.set('approved','false'));
}).filterMetadata('approved', 'equals', 'true').select(['VV', 'VH'], ['VV_AS', 'VH_AS']);

print('sentinel1_AS_mosaics', sentinel1_AS_mosaics)

// var dates = sentinel1_AS_mosaics.toList(sentinel1_AS_mosaics.size()).map(function(img){
//     return ee.Image(img).date().format()
//   })



//////////////////////////// Processing sentinel1_DES /////////////////////////////////////////////////////////

var sentinel1_DES = composite_monthly(sentinel1_DES, date_range_monthly)

//Filters out images outside of current temporal scope
var sentinel1_DES_mosaics = sentinel1_DES.map(function(image) {
  return ee.Algorithms.If(ee.Number(image.bandNames().size().gt(0)), image.set('approved','true'), image.set('approved','false'));
}).filterMetadata('approved', 'equals', 'true').select(['VV', 'VH'], ['VV_DES', 'VH_DES']);


// // Adding copying the April sentinel1_Des to fill in time-series gap for Jan-March
// var sentinel1_DES_mosaics = sentinel1_DES_mosaics.merge(ee.ImageCollection([
//   sentinel1_DES_mosaics.first().set('month', 1),
//   sentinel1_DES_mosaics.first().set('month', 2),
//   sentinel1_DES_mosaics.first().set('month', 3),
//   sentinel1_DES_mosaics.first().set('month', 4)])) // OBS: Some areas might have April coverage
// Map.addLayer(sentinel1_DES_mosaics.filterMetadata('month', 'equals', 8), '', 'month 8')


/////////////////////////// Cloud Masking Sentinel 2  ///////////////////////////////////
var s2_cloudless = Preprocess.filterCloudsAndShadows(sentinel2,clip_feature,start_s2,end, 32)

/////////////////////////// Snow Masking Sentinel 2  //////////////////////////////////////////////
var snow_mask_geom = ee.Image.constant(1).clip(snow_areas).mask()

var s2_snowless = Preprocess.maskSnow(s2_cloudless, snow_mask_geom)




/////////////////////////// Calculate indices on Sentinel 2  /////////////////////////////////
var sentinel2 = Preprocess.calculateIndices(s2_snowless)

/////////////////////////// Make monthly Sentinel 2 mosaics ///////////////////////////////////////////////////

var sentinel2_mosaics = composite_monthly_median(sentinel2, date_range_monthly)
// print('sentinel2_mosaics', sentinel2_mosaics)


// /////////////////////////// Fill gaps with previous and consecutive images //////////////////////////////
// /////////////////////////// except for last two images                     ///////////////////////////// 
var len = sentinel2_mosaics.size().getInfo();




var sentinel2_mosaics_list = sentinel2_mosaics.toList(sentinel2_mosaics.size())
var median_col_1 = make_median_img_1month(sentinel2_mosaics_list)
var median_col_2 = make_median_img_2month(sentinel2_mosaics_list)

// print('median_col_1', median_col_1)
// print('median_col_2', median_col_2)




var filled_imgCol = fill_gaps(sentinel2_mosaics, median_col_1)
// print('filled_imgCol1', filled_imgCol)

var filled_imgCol = fill_gaps(filled_imgCol, median_col_2)
// print('filled_imgCol2', filled_imgCol)

// filter last two images from all Sentinel-2 mosaics and append to filled imgCol
var s2_fill_only_annMed = sentinel2_mosaics.filterDate(ee.Date.fromYMD(year, current_month-2, 1), ee.Date.fromYMD(year, current_month, 1))

var sentinel2_mosaics_merged = filled_imgCol.merge(s2_fill_only_annMed)
// print('sentinel2_mosaics_merged', sentinel2_mosaics_merged)

/////////////////////////// Fill remaining gaps with annual median  ///////////////////////////////////////////////////
var sentinel2_annual_median = sentinel2_mosaics
                                .filterDate(ee.Date(year+'-01-01'), ee.Date(year+'-12-31'))
                                .median() 
// print('sentinel2_annual_median',sentinel2_annual_median)

// Gap filling with annual median composite
var filled_imgCol = sentinel2_mosaics_merged.map(function(image) { return image.unmask(sentinel2_annual_median);});
// print('final filled_imgCol', filled_imgCol)



////////////////////////////////// Layer Stacking ////////////////////////////////////////////

// Combine all images
var image_collection_raw = ee.ImageCollection(filled_imgCol.select(selection_bands))
.merge(ee.ImageCollection(sentinel1_AS_mosaics))
// .merge(ee.ImageCollection(sentinel1_DES_mosaics)) // exlucde as otherwise property 'VH_DES_1' is missing.
.merge(elevation.set('static', 'true')) // Setting a property to enable filtering later
.merge(slope.set('static', 'true'))
.merge(HAND.set('static', 'true'));

print('image_collection_raw', image_collection_raw)
print('image_collection_raw bandNames', image_collection_raw.first().bandNames())



// Layer stack maker
// !! could be replaced by using toBands() - might reduce computatin time.
var layer_stacker = function(image_collection) {
  var first = ee.Image(image_collection.first()).select([]);
  var appendBands = function(image, previous) {   //Previous = result of previous iteration, NOT previous image
    return ee.Image(previous).addBands(image);
  };
  return ee.Image(image_collection.iterate(appendBands, first));   //First is the starting image to be used as starting point for adding onto for each interation
};





//////////////////////////////// Training and Classification ////////////////////////////////////////////
var sample_size = 15
var year = 2020
//// Loading training samples ////
var asset_path = 'users/reachsyriagee/SY_Water/train_samples/final/'
var asset_name_train_samples = year + '_train_'+aoi_name 
var training_sample = ee.FeatureCollection(asset_path + asset_name_train_samples)
print('loaded asset_name_train_samples', asset_name_train_samples)
print('training_sample size()', training_sample.size())
print('training_sample first()', training_sample.first())

// // Combine training samples 
var asset_path = 'users/reachsyriagee/SY_Water/train_samples_error_areas/final/'


var training_sample_error_1 = ee.FeatureCollection(asset_path + year+'_train_error_' + 'wetlands' + '_' + sample_size)
var training_sample_error_2 = ee.FeatureCollection(asset_path + year+'_train_error_' + 'volcano' + '_' + sample_size)
var training_sample_error_3 = ee.FeatureCollection(asset_path + year+'_train_error_' + 'urban' + '_' + sample_size)
var training_sample_error_4 = ee.FeatureCollection(asset_path + year+'_train_error_' + 'cropland' + '_' + sample_size)
var training_sample_error_5 = ee.FeatureCollection(asset_path + year+'_train_error_' + 'terrain1' + '_' + sample_size)
var training_sample_error_6 = ee.FeatureCollection(asset_path + year+'_train_error_' + 'terrain2' + '_' + sample_size)


var training_sample = training_sample.merge(training_sample_error_1)
                                    .merge(training_sample_error_2)
                                    // .merge(training_sample_error_3)
                                    // .merge(training_sample_error_4)
                                    // .merge(training_sample_error_5)
                                    // .merge(training_sample_error_6)
                

// print('training_sample with added error samples', training_sample.size())


/// Train the classifier 
print('Input properties', training_sample.first().propertyNames().remove('system:index').remove('classification'))


var classifier = ee.Classifier.smileRandomForest(500);
var trained_classifier = classifier.train(training_sample, 'class', training_sample.first().propertyNames().remove('system:index').remove('classification')); // .first().propertyNames().remove('system:index')
print(trained_classifier)


// /////// Display before exporting /////// 

// var clip_feature = aoi_fc

// var classified_imgCol = ee.ImageCollection.fromImages(ids.map(function(id){
//   var image_collection_month = image_collection_raw.filterMetadata('month', 'equals', id)
//                               .merge(image_collection_raw.filterMetadata('static', 'equals', 'true'))
//   var layer_stack = layer_stacker(image_collection_month)
//   var classified_image = layer_stack.classify(trained_classifier).clip(clip_feature).set('month', id);
//   return classified_image
  
// }))
// print('classified_imgCol', classified_imgCol)

// var first_img = classified_imgCol.first().clip(AOI)
// var last_img = classified_imgCol.sort('month', false).first().clip(AOI)
// print('last img', last_img)


// Map.addLayer(first_img, {palette: ['white', 'blue'], min:0, max:3}, 'Classified first');
// Map.addLayer(last_img, {palette: ['white', 'blue'], min:0, max:3}, 'Classified last');






function make_date_range_monthly(start,end){
  var n_months = end.difference(start,'month').round().subtract(1);
  var range = ee.List.sequence(0,n_months,1); 
  var make_datelist = function (n) {
    return start.advance(n,'month')
  };
  return range.map(make_datelist);
}



function composite_monthly_median(imgCol, date_range){
  return ee.ImageCollection.fromImages(
      date_range.map(function (date) {
        date = ee.Date(date)
        imgCol = imgCol.filterDate(date, date.advance(1,'month'))
        return imgCol.median()
                     .set('date', date.format('YYYY-MM'))
                     .set('year', date.get('year'))
                     .set('month', date.get('month'))
                     .set('system:time_start', date.millis())
                     .clip(clip_feature)
      }))
}

function make_median_img_1month(monthly_composites_list){
  var median_imgCol = [];
    
  for (var i=1; i < len-1; i++) {
    var img = ee.Image(monthly_composites_list.get(i))
    
    // compute median img of previous and consecutive image
    var median_img = ee.ImageCollection([ee.Image(monthly_composites_list.get(i-1)),ee.Image(monthly_composites_list.get(i+1))])
                                  .median()
                                  .copyProperties(img)
    median_imgCol.push(median_img)
  }
  return ee.ImageCollection(median_imgCol);
}


function make_median_img_2month(monthly_composites_list){
  var median_imgCol = [];
  for (var i=2; i < len-2; i++) {
    var img = ee.Image(monthly_composites_list.get(i))
    
    // compute median img of 2 previous and 2 consecutive images
    var median_img = ee.ImageCollection([ee.Image(monthly_composites_list.get(i-2)),
                                        ee.Image(monthly_composites_list.get(i-1)),
                                        ee.Image(monthly_composites_list.get(i+1)),
                                        ee.Image(monthly_composites_list.get(i+2))])
                                  .median()
                                  .copyProperties(img)
    median_imgCol.push(median_img)
  }
  return ee.ImageCollection(median_imgCol);
}

function fill_gaps(monthly_composites, median_composites){
  
  var dates = median_composites.toList(median_composites.size()).map(function(img){ return ee.Image(img).get('date')})
  var filled_imgCol = ee.ImageCollection.fromImages(dates.map(function(date){ 
    
    var img = monthly_composites.filterMetadata('date', 'equals', date).first()
    var fill_img = median_composites.filterMetadata('date', 'equals', date).first()
    
    return img.unmask(fill_img)
  }))
  
  return filled_imgCol
}



///////////////////////////// (B) /////////////////////////////
// ----- Step 1 ------ Export classified images  ------------------------------------------------------


// var asset_path = 'users/reachsyriagee/SY_Water/classified/AOI_WoS/updated_review/error_corrected_12/' 
// print('export asset path',asset_path)
// var asset_name = 'water_'
// var year = 2021
// var descr = asset_name.concat(year).concat('_')
// var assetId =asset_path.concat(descr)
// print('export assetId', assetId)


// print('ids',ids)

  
// for (var i=0; i<ids.length; i++){
  
//   var id = ids[i]

//   var image_collection_month = image_collection_raw.filterMetadata('month', 'equals', id)
//                               .merge(image_collection_raw.filterMetadata('static', 'equals', 'true'))
//   var layer_stack = layer_stacker(image_collection_month)
//   var classified_image = layer_stack.classify(trained_classifier).clip(clip_feature);

//   Export.image.toAsset({
//   image: classified_image.toByte(),
//   description: descr+id,
//   assetId: assetId+id,
//   scale: 10,
//   region: aoi_fc,
//   maxPixels: 2000000000000
// });

// }




// ----- Step 2 ------ Delete the first image from both folders, if new results are fine -------------

// var descr = 'water_2021_'+ids[0]

// var asset_path = 'users/reachsyriagee/SY_Water/classified/AOI_WoS/final/error_corrected_12/' 
// var assetId =asset_path + descr
// print('assetId to delete', assetId)


// ee.data.deleteAsset(assetId)

// var asset_path = 'users/reachsyriagee/SY_Water/final/'
// var assetId =asset_path + descr
// print('assetId to delete', assetId)
// ee.data.deleteAsset(assetId)


// ----- Step 3 ------ Copy asset from updated_review to final folders --------------------------------


// for (var i=0; i<ids.length; i++){
  
//   var sourcePath = 'users/reachsyriagee/SY_Water/classified/AOI_WoS/updated_review/error_corrected_12/'
 
//   var destinationPath_1 = 'users/reachsyriagee/SY_Water/classified/AOI_WoS/final/error_corrected_12/' 
//   var destinationPath_2 = 'users/reachsyriagee/SY_Water/final/'

//   var asset_name = 'water_2021_'+ ids[i]
  
//   console.log(sourcePath)
//   console.log(destinationPath_1)
//   console.log(destinationPath_2)
//   console.log(asset_name)
//   ee.data.copyAsset(sourcePath + asset_name, destinationPath_1 + asset_name)
//   ee.data.copyAsset(sourcePath + asset_name, destinationPath_2 + asset_name)
  
// }



