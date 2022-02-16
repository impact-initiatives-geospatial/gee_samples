/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var CHIRPS = ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY"),
    adm0 = ee.FeatureCollection("users/mh_khan/irq_admbnda_adm0_cso_itos_20190603"),
    imageVisParam = {"opacity":1,"bands":["precipitation"],"min":-1.433718692546338,"max":1.7994131001741256,"palette":["ffffff","3b0aff"]};
/***** End of imports. If edited, may not auto-convert in the playground. *****/
/*
Description: Calculating precipitation deficit for a month by comparing blong term baseline with a given month
Requirements: admin featureCollection
Contributor: Mehedi Hasan Khan
*/

// select buffer dist
var buffer_dist = 100
//PUT BUFFER ON CAMP SHAPEFILE TO CLIP IMAGES TO LATER
var adm_boundary=adm0.union().map(function(feature){
  var buffered = feature.buffer(buffer_dist)
  return buffered
})

Map.addLayer(adm_boundary)

// select start date and end date 
// var start_date =ee.Date(ee.List(CHIRPS.get('date_range')).get(0));
// var end_date = ee.Date(CHIRPS.limit(1, 'system:time_start',  false).first().get('system:time_start'));
// print(end_date)
var start_date =ee.Date( '2021-01-01')
var end_date = ee.Date('2021-07-31')

// spatially and temporally filter CHIRPS
var CHIRPS_21 = CHIRPS
  .select('precipitation')
  .filterBounds(adm_boundary)
  .filterDate(start_date,end_date)

Map.addLayer(CHIRPS_21.first())
print('CHIRPS_21', CHIRPS_21)

//print(ui.Chart.image.series(
  //CHIRPS, adm_boundary, ee.Reducer.mean(),25000
  //),'CHIRPS')
  
  // Calculating MEAN percepitation in 2021 (GLOBALLY)
  
  var CHIRPS_MEAN_21 = CHIRPS_21.reduce(ee.Reducer.mean())
  print('All metadata: CHIRPS MEAN 21', CHIRPS_MEAN_21)
  Map.addLayer(CHIRPS_MEAN_21, '', 'CHIRPS_MEAN_21')
//Map.addLayer(CHIRPS_MEAN_21.first()) //, imageVisParam, 'mean')

////////////////////////////////////////////////////////////////////////////
  
 var start_date_his =ee.Date(ee.List(CHIRPS.get('date_range')).get(0));
 var end_date_his = ee.Date('2020-12-31')
  
print(start_date_his)
print(end_date_his)

  var CHIRPS_his = CHIRPS
  .select('precipitation')
  .filterBounds(adm_boundary) // This doesnt do anything on a gobal image
  .filterDate(start_date_his,end_date_his)
  .filter(ee.Filter.calendarRange(1,7,'month')) // to get rid of seasonal variation
  
  var CHIRPS_MEAN_his = CHIRPS_his.reduce(ee.Reducer.mean())
  print('All metadata:', CHIRPS_MEAN_his)
  
//////////////////////////////////////////////////////////////////////////
  
var precipitation_defict = CHIRPS_MEAN_21.subtract(CHIRPS_MEAN_his)
  
print('All metadata:', precipitation_defict)

Export.image.toDrive({
  image: precipitation_defict,
  description: 'precipitation_defict_sep',
  scale: 5500,
  maxPixels: 10119010512,
  region: adm_boundary,
  fileFormat: 'GeoTIFF',
  formatOptions: {
    cloudOptimized: true
  }
});
  
  