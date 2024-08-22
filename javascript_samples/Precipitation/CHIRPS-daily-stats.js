/*Script to develop graph showing average DAILY precipitation by year, or specific month/season within each year. Also produces a map showing mean
precipitation for a selected timeframe. Developed by Josef Clifford (josef.clifford@impact-initiatives.org)*/

//filter CHIRPS collection by time period of interest - adjust time period and years variable as necessary
var chirps = ee.ImageCollection('UCSB-CHG/CHIRPS/DAILY')
                  .filter(ee.Filter.date('1981-01-01', '2022-12-31')) //adjust time period
                  .sort('system:time_start');
var precipitation = chirps.select('precipitation');
var years = ee.List.sequence(1981, 2022); //adjust years

/*Optional: edit this variable if you only want to calculate average daily precipitation for a specific time period
within each year, e.g. one month or season*/  
var precipitation_seas = precipitation.filter(ee.Filter.dayOfYear(1,366)).filterBounds(AOI);

//*Optional: Add map layer showing average daily rainfall in a specified time period  
var precipitation_filter = precipitation_seas.filterDate('2022-12-01', '2022-12-31').mean().clip(AOI);
var precipitationVis = {
  min: 1.0,
  max: 17.0,
  palette: ['001137', '0aab1e', 'e7eb05', 'ff4a2d', 'e90000'],
};
Map.centerObject(AOI);
Map.addLayer(precipitation_filter, precipitationVis, 'Precipitation');

/*Adjust "series_property" parameter on line 72 if want to analyse trends by admin area. Also adjust column
headings ("selectors") in line 122 based on relevant fields in AOI.*/

//-------------------create graph showing annual average daily rainfall for selected AOI---------------------//


//function to iterate through each year (or time period within year) in sequence and calculate average daily rainfall

var lt_precip = ee.ImageCollection.fromImages(
      years.map(function (y) {
        return precipitation.filter(ee.Filter.calendarRange(y, y, 'year'))
                    .mean()
                    .set('year', y);
}));
print("lt_precip",lt_precip);

// Define the chart and print it to the console.
var chart =
    ui.Chart.image
        .series({
          imageCollection: lt_precip,
          region: AOI,
          reducer: ee.Reducer.mean(),
          scale: 5566,
          xProperty: 'year'
        })
        .setSeriesNames(['Ave. daily precipitation (mm)'])
        .setOptions({
          title: 'Average daily precipitation',
          hAxis: {title: 'Year', titleTextStyle: {italic: false, bold: true}},
          vAxis: {
            title: 'Precipitation',
            titleTextStyle: {italic: false, bold: true}
          },
          lineWidth: 2,
          colors: ['e37d05', '1d6b99'],
          curveType: 'function'
        });
print(chart);

/*This chart can be used if you have an AOI with multiple admin areas/features and you want to calculate the mean
daily rainfall for each one. */
var chart_all =
    ui.Chart.image
        .seriesByRegion({
          imageCollection: lt_precip,
          regions: AOI,
          reducer: ee.Reducer.mean(),
          scale: 5566,
          xProperty: 'year',
          seriesProperty: 'ADM1_EN' // here select the field with the admin area names / feature names 
        })
        .setOptions({
          title: 'Average daily precipitation by region (mm)',
          hAxis: {title: 'Date', titleTextStyle: {italic: false, bold: true}},
          vAxis: {
            title: 'Precipitation',
            titleTextStyle: {italic: false, bold: true}
          },
          lineWidth: 1,
//          colors: ['e37d05', '1d6b99'],
          curveType: 'function'
        });
print(chart_all);


//---------------------Create task to export statistics to csv----------------------------//

// Select multiple reducers / statistics
var reducers_all = ee.Reducer.mean()
                                .combine(ee.Reducer.count(), null, true)
                                .combine(ee.Reducer.min(), null, true)
                                .combine(ee.Reducer.max(), null, true)
                                .combine(ee.Reducer.stdDev(), null, true);

//convert annual mean values for period of interest to table
var lt_precip_means = lt_precip.map(function(image){
  return image.reduceRegions({
    collection: AOI, //here you can put a sub-district shapefile to get values for each district
    reducer:reducers_all,
    scale: 5566
  }).map(function(f) {
    
    // Add a date property to each output feature.
     return f.set('year', image.get('year'));
  });
});
print("check");
var lt_precip_table = lt_precip_means.flatten();
print(lt_precip_table);

// Select only points that overlay with images
var lt_precip_table1 = lt_precip_table
                  .filterMetadata('count', "not_equals", 0);

//----------------------------Export data to Google Drive----------------------------//
Export.table.toDrive({
  collection: lt_precip_table1,
  description: "lt_precip_table_",
  fileFormat: 'CSV',
  selectors: ["ADM0_EN","ADM1_EN","ADM2_EN","year", "mean","min","max","stdDev"] //change these if necessary based on fields in AOI shapefile
});

/*
//Optional - if you want to export 

//export geotiff for  precipitation map to Google Drive
Export.image.toDrive({
  image: precipitation_filter,
  description: 'precipitation',
//  region:
  scale: 5566
});

print("See tasks tab to generate exports");
*/
 
