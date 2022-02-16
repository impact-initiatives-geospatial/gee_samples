/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var geometry = 
    /* color: #d63000 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[45.27501578295394, 31.7948886402037],
          [45.27501578295394, 28.95184846507494],
          [48.70275015795394, 28.95184846507494],
          [48.70275015795394, 31.7948886402037]]], null, false);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
/*
Decription: Extracting mean precitation from a watershed covering Iraq.
Contributor: victor.olsen@reach-initiative.org
*/

// AOI
var HydroSHEDS = ee.FeatureCollection("WWF/HydroSHEDS/v1/Basins/hybas_3")
                .filterBounds(geometry);
var iraq_shed = HydroSHEDS.filter(ee.Filter.eq('HYBAS_ID', 2030073570))

// CHIRPS
var chirps = ee.ImageCollection('UCSB-CHG/CHIRPS/DAILY').filter(ee.Filter.calendarRange(1, 11, 'month'))

var chirps_viewer = chirps.limit(1000, 'system:time_start', false)
print(chirps_viewer)

// Aggregate to annual time-series
var yrStart = 1981;
var yrEnd = 2021;

var years = ee.List.sequence(yrStart, yrEnd);
print(years)

var byYear = ee.ImageCollection.fromImages(
      years.map(function (y) {
        return chirps.filter(ee.Filter.calendarRange(y, y, 'year'))
                    .mean()
                    .set('year', y);
}));
print('byYear', byYear)

// Chart time-series
var TimeSeries = ui.Chart.image.seriesByRegion({
    imageCollection: byYear,
    regions: iraq_shed,
    reducer: ee.Reducer.mean(),
    scale: 5000,
    xProperty: 'year',
    seriesProperty: 'VALUE'
  }).setChartType('ColumnChart')
    .setOptions({
      title: 'mean annual precipitaion',
      vAxis: {title: '[mm/year]'},
      lineWidth: 1,
      pointSize: 1,
    });

print('TimeSeries of selected area:', TimeSeries);

//Map.addLayer(ee.Image(byYear.first()));
