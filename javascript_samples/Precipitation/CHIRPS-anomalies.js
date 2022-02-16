/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var admin3 = ee.FeatureCollection("users/victormackenhauer/Syria/NES-admin3"),
    imageVisParam = {"opacity":1,"bands":["precipitation_mean"],"min":0.37642799615859984,"max":1.1924307465553283,"palette":["ffffff","4057ff"]},
    geometry = 
    /* color: #d63000 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[39.56850676306881, 36.102645293651825],
          [39.56850676306881, 35.94270514372915],
          [39.86513762244381, 35.94270514372915],
          [39.86513762244381, 36.102645293651825]]], null, false);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
/*
Description: Export CHIRPS Anomalies
Requirements: Admin areas
Contributor: victor.olsen@reach-initiative.org
*/


// var properties = ['admin1Pcod',
//                   'admin1Name',
//                   'admin2Pcod',
//                   'admin2Name',
//                   'admin3Pcod',
//                   'admin3Name',
//                   'baseline',
//                   'MEAN_18',
//                   'MEAN_19',
//                   'MEAN_20',
//                   'MEAN_21',
//                   'precip_anomaly_base_abs_18',
//                   'precip_anomaly_base_abs_19',
//                   'precip_anomaly_base_abs_20',
//                   'precip_anomaly_base_abs_21',
//                   'precip_anomaly_base_per_18',
//                   'precip_anomaly_base_per_19',
//                   'precip_anomaly_base_per_20',
//                   'precip_anomaly_base_per_21',
//                   'precip_anomaly_annual_abs_18',
//                   'precip_anomaly_annual_abs_19',
//                   'precip_anomaly_annual_abs_20',
//                   'precip_anomaly_annual_abs_21',
//                   'precip_anomaly_annual_per_18',
//                   'precip_anomaly_annual_per_19',
//                   'precip_anomaly_annual_per_20',
//                   'precip_anomaly_annual_per_21']

var properties = ['admin1Pcod',
                  'admin1Name',
                  'admin2Pcod',
                  'admin2Name',
                  'admin3Pcod',
                  'admin3Name',
                  'baseline',
                  'MEAN_21',
                  'precip_anomaly_base_abs_21',
                  'precip_anomaly_base_per_21',
                  'precip_anomaly_annual_abs_21',
                  'precip_anomaly_annual_per_21']

var adm_boundary_filtered = admin3.map(function(feature) {
  return feature.select(properties)})

var start_date = ee.Date('2021-01-01')
var end_date = ee.Date('2021-09-30')

var CHIRPS = ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY")
                .map(function(image) {
                return image.clip(adm_boundary_filtered)
                })

var CHIRPS_MEAN_18 = CHIRPS 
  .select('precipitation')
  .filterDate('2017-09-01','2018-09-01')
  .reduce(ee.Reducer.mean())

var CHIRPS_MEAN_19 = CHIRPS
  .select('precipitation')
  .filterDate('2018-09-01','2019-09-01')
  .reduce(ee.Reducer.mean())

var CHIRPS_MEAN_20 = CHIRPS
  .select('precipitation')
  .filterDate('2019-09-01','2020-09-01')
  .reduce(ee.Reducer.mean())

var CHIRPS_MEAN_21 = CHIRPS
  .select('precipitation')
  .filterDate('2020-09-01','2021-09-01')
  .reduce(ee.Reducer.mean())


// Compute historical mean for comparison
var start_date_his = ee.Date(ee.List(CHIRPS.get('date_range')).get(0));
var end_date_his = ee.Date('2021-09-30')
var CHIRPS_his = CHIRPS
  .select('precipitation')
  .filterBounds(adm_boundary_filtered) // This doesnt do anything on a gobal image
  .filterDate(start_date_his, end_date_his)
  .filter(ee.Filter.calendarRange(1,9,'month')) // to get rid of seasonal variation
var baseline = CHIRPS_his.reduce(ee.Reducer.mean()).clip(adm_boundary_filtered)


// Compute absolute anomaly maps from baseline for each year
var precipitation_anomaly_absolute_18 = CHIRPS_MEAN_18.subtract(baseline)
var precipitation_anomaly_absolute_19 = CHIRPS_MEAN_19.subtract(baseline)
var precipitation_anomaly_absolute_20 = CHIRPS_MEAN_20.subtract(baseline)
var precipitation_anomaly_absolute_21 = CHIRPS_MEAN_21.subtract(baseline)

// Compute percentage anomaly maps from baseline for each year
var precipitation_anomaly_percent_18 = precipitation_anomaly_absolute_18.divide(baseline).multiply(100)
var precipitation_anomaly_percent_19 = precipitation_anomaly_absolute_19.divide(baseline).multiply(100)
var precipitation_anomaly_percent_20 = precipitation_anomaly_absolute_20.divide(baseline).multiply(100)
var precipitation_anomaly_percent_21 = precipitation_anomaly_absolute_21.divide(baseline).multiply(100)

// Compute absolute anomaly maps from previous year
var precipitation_anomaly_absolute_19_annual = CHIRPS_MEAN_19.subtract(CHIRPS_MEAN_18)
var precipitation_anomaly_absolute_20_annual = CHIRPS_MEAN_20.subtract(CHIRPS_MEAN_19)
var precipitation_anomaly_absolute_21_annual = CHIRPS_MEAN_21.subtract(CHIRPS_MEAN_20)

// Compute precentage anomaly maps from previous year
var precipitation_anomaly_per_19_annual = CHIRPS_MEAN_19.subtract(CHIRPS_MEAN_18).divide(CHIRPS_MEAN_18)
var precipitation_anomaly_per_20_annual = CHIRPS_MEAN_20.subtract(CHIRPS_MEAN_19).divide(CHIRPS_MEAN_19)
var precipitation_anomaly_per_21_annual = CHIRPS_MEAN_21.subtract(CHIRPS_MEAN_20).divide(CHIRPS_MEAN_20)


Map.addLayer(CHIRPS_MEAN_18, imageVisParam, 'CHIRPS_MEAN_18', false)
Map.addLayer(precipitation_anomaly_percent_18, imageVisParam, 'precipitation_anomaly_percent_18', false)



// Extract raw values
// Keep adding new extracted values to the same feature collection

var precip_anomaly = baseline.reduceRegions({
                    collection: adm_boundary_filtered,
                    reducer: ee.Reducer.mean(), 
                    scale: 5500})
                    .map(function(feature) {
                      return feature.set('baseline', feature.get('mean')).select(properties)
                    })

var precip_anomaly = CHIRPS_MEAN_18.reduceRegions({
                    collection: precip_anomaly,
                    reducer: ee.Reducer.mean(), 
                    scale: 5500})
                    .map(function(feature) {
                      return feature.set('MEAN_18', feature.get('mean')).select(properties)
                    })

var precip_anomaly = CHIRPS_MEAN_19.reduceRegions({
                    collection: precip_anomaly,
                    reducer: ee.Reducer.mean(), 
                    scale: 5500})
                    .map(function(feature) {
                      return feature.set('MEAN_19', feature.get('mean')).select(properties)
                    })
                    
var precip_anomaly = CHIRPS_MEAN_20.reduceRegions({
                    collection: precip_anomaly,
                    reducer: ee.Reducer.mean(), 
                    scale: 5500})
                    .map(function(feature) {
                      return feature.set('MEAN_20', feature.get('mean')).select(properties)
                    })
                    
var precip_anomaly = CHIRPS_MEAN_21.reduceRegions({
                    collection: precip_anomaly,
                    reducer: ee.Reducer.mean(), 
                    scale: 5500})
                    .map(function(feature) {
                      return feature.set('MEAN_21', feature.get('mean')).select(properties)
                    })

// Extract absolute anomalies to fC
var precip_anomaly = precipitation_anomaly_absolute_18.reduceRegions({
                    collection: precip_anomaly,
                    reducer: ee.Reducer.mean(), 
                    scale: 5500})
                    .map(function(feature) {
                      return feature.set('precip_anomaly_base_abs_18', feature.get('mean')).select(properties)
                    })

var precip_anomaly = precipitation_anomaly_absolute_19.reduceRegions({
                    collection: precip_anomaly,
                    reducer: ee.Reducer.mean(), 
                    scale: 5500})
                    .map(function(feature) {
                      return feature.set('precip_anomaly_base_abs_19', feature.get('mean')).select(properties)
                    })

var precip_anomaly = precipitation_anomaly_absolute_20.reduceRegions({
                    collection: precip_anomaly,
                    reducer: ee.Reducer.mean(), 
                    scale: 5500})
                    .map(function(feature) {
                      return feature.set('precip_anomaly_base_abs_20', feature.get('mean')).select(properties)
                    })

var precip_anomaly = precipitation_anomaly_absolute_21.reduceRegions({
                    collection: precip_anomaly,
                    reducer: ee.Reducer.mean(), 
                    scale: 5500})
                    .map(function(feature) {
                      return feature.set('precip_anomaly_base_abs_21', feature.get('mean')).select(properties)
                    })



// Extract percentage anomalies to fC
var precip_anomaly = precipitation_anomaly_percent_18.reduceRegions({
                    collection: precip_anomaly,
                    reducer: ee.Reducer.mean(), 
                    scale: 5500})
                    .map(function(feature) {
                      return feature.set('precip_anomaly_base_per_18', feature.get('mean')).select(properties)
                    })

var precip_anomaly = precipitation_anomaly_percent_19.reduceRegions({
                    collection: precip_anomaly,
                    reducer: ee.Reducer.mean(), 
                    scale: 5500})
                    .map(function(feature) {
                      return feature.set('precip_anomaly_base_per_19', feature.get('mean')).select(properties)
                    })

var precip_anomaly = precipitation_anomaly_percent_20.reduceRegions({
                    collection: precip_anomaly,
                    reducer: ee.Reducer.mean(), 
                    scale: 5500})
                    .map(function(feature) {
                      return feature.set('precip_anomaly_base_per_20', feature.get('mean')).select(properties)
                    })

var precip_anomaly = precipitation_anomaly_percent_21.reduceRegions({
                    collection: precip_anomaly,
                    reducer: ee.Reducer.mean(), 
                    scale: 5500})
                    .map(function(feature) {
                      return feature.set('precip_anomaly_base_per_21', feature.get('mean')).select(properties)
                    })



// Extract absolute anomalies from previous year to fC
var precip_anomaly = precipitation_anomaly_absolute_19_annual.reduceRegions({
                    collection: precip_anomaly,
                    reducer: ee.Reducer.mean(), 
                    scale: 5500})
                    .map(function(feature) {
                      return feature.set('precip_anomaly_annual_abs_19', feature.get('mean')).select(properties)
                    })

var precip_anomaly = precipitation_anomaly_absolute_20_annual.reduceRegions({
                    collection: precip_anomaly,
                    reducer: ee.Reducer.mean(), 
                    scale: 5500})
                    .map(function(feature) {
                      return feature.set('precip_anomaly_annual_abs_20', feature.get('mean')).select(properties)
                    })

var precip_anomaly = precipitation_anomaly_absolute_21_annual.reduceRegions({
                    collection: precip_anomaly,
                    reducer: ee.Reducer.mean(), 
                    scale: 5500})
                    .map(function(feature) {
                      return feature.set('precip_anomaly_annual_abs_21', feature.get('mean')).select(properties)
                    })


// Extract percentage anomalies from previous year to fC
var precip_anomaly = precipitation_anomaly_per_19_annual.reduceRegions({
                    collection: precip_anomaly,
                    reducer: ee.Reducer.mean(), 
                    scale: 5500})
                    .map(function(feature) {
                      return feature.set('precip_anomaly_annual_per_19', feature.get('mean')).select(properties)
                    })

var precip_anomaly = precipitation_anomaly_per_20_annual.reduceRegions({
                    collection: precip_anomaly,
                    reducer: ee.Reducer.mean(), 
                    scale: 5500})
                    .map(function(feature) {
                      return feature.set('precip_anomaly_annual_per_20', feature.get('mean')).select(properties)
                    })

var precip_anomaly = precipitation_anomaly_per_21_annual.reduceRegions({
                    collection: precip_anomaly,
                    reducer: ee.Reducer.mean(), 
                    scale: 5500})
                    .map(function(feature) {
                      return feature.set('precip_anomaly_annual_per_21', feature.get('mean')).select(properties)
                    })

//print('precip_anomaly', precip_anomaly.first())


Map.addLayer(CHIRPS_MEAN_21, imageVisParam, 'CHIRPS_MEAN_21', false)
Map.addLayer(baseline, imageVisParam, 'baseline', false)
Map.addLayer(adm_boundary_filtered, '', 'adm_boundary', false)


Export.table.toDrive({
  collection: precip_anomaly,
  description: 'precip_anomaly_test',
  fileFormat: 'csv'
});

