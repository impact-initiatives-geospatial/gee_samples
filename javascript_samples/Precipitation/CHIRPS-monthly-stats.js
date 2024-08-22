/*Script to develop graph showing AVERAGE TOTAL MONTHLY PRECIPITATION for specified time period
+ long term monthly average. Can export tables from tasks tab. Contact: josef.clifford@impact-initiatives.org */

//****User input required:*****
//enter start year for analysis
var start_year = 2021; 

//enter end year for analysis
var end_year = 2023;



//****No more input required below****


//filter CHIRPS collection by time period of interest
var chirps = ee.ImageCollection('UCSB-CHG/CHIRPS/DAILY')
var chirps_poi = chirps
                  .filter(ee.Filter.date(start_year+'-01-01',end_year+'-12-31')) //adjust time period
                  .sort('system:time_start');
var precipitation = chirps_poi.select('precipitation');
var years = ee.List.sequence(start_year, end_year);
var months = ee.List.sequence(1, 12);


//-------------------create graph showing average total monthly rainfall for period of interest in selected AOI---------------------//

print("precip",precipitation);
//function to iterate through each month in sequence and calculate average rainfall

var blankValue = 0;

var precip_monthly_sum = ee.ImageCollection.fromImages(
  years.map(function (y) {
    return months.map(function (m) {
      var collection = precipitation.filter(ee.Filter.calendarRange(y, y, 'year'))
        .filter(ee.Filter.calendarRange(m, m, 'month'));
      var collectionExists = collection.size().gt(0)
      var result = ee.Algorithms.If({
        condition: collectionExists,
        trueCase: collection
          .sum()
          .set('year', y)
          .set('month', m)
          .copyProperties(collection.first(),['system:time_start']),
        falseCase: ee.Image().set('year', y).set('month', m).set('system:time_start', blankValue)
      })
      return result
    });
  }).flatten());
print("precip_monthly_sum",precip_monthly_sum);


// Define the chart and print it to the console.
var chart =
    ui.Chart.image.series({
          imageCollection: precip_monthly_sum,
          region: AOI,
          reducer: ee.Reducer.mean(),
          scale: 5566,
          xProperty: 'system:time_start'
        })
        .setSeriesNames(['Average total monthly precipitation (mm)'])
        .setOptions({
          title: 'Average total monthly precipitation (mm)',
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
total monthly rainfall for each one. */

var chart_all =

    ui.Chart.image
        .seriesByRegion({
          imageCollection: precip_monthly_sum,
          regions: AOI,
          reducer: ee.Reducer.mean(),
          scale: 5566,
          xProperty: 'system:time_start',
          seriesProperty: 'layer' // here select the field with the admin area names / feature names 
        })
        .setOptions({
          title: 'Average total monthly precipitation by region (mm)',
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

/*Calculate long-term average total MONTHLY precipitation (baseline) by region for comparison.*/

//filter CHIRPS collection by time period of interest - adjust time period and years variable as necessary
var end_year_baseline = end_year-1
//print(end_year_baseline)
var chirps_baseline = chirps
                  .filter(ee.Filter.date('1981-01-01', end_year_baseline+'-12-31')) //adjust time period
                  .sort('system:time_start');
var precipitation = chirps_baseline.select('precipitation');
var years_baseline = ee.List.sequence(1981, end_year_baseline);

//function to iterate through each month in sequence and calculate total average monthly rainfall

var lt_precip = ee.ImageCollection.fromImages(
      years_baseline.map(function (y) {
        return months.map(function (m) {
          return precipitation
                    .filter(ee.Filter.calendarRange(y, y, 'year'))
                    .filter(ee.Filter.calendarRange(m, m, 'month'))
                    .select('precipitation')
                    .sum() 
                    .set('year', y)
                    .set('month', m)
                    .set('system:time_start', ee.Date.fromYMD(y, m, 1));
      });
      }).flatten());
print("lt_precip",lt_precip);


var lt_precip_monthly = ee.ImageCollection.fromImages(
        months.map(function (m) {
          return lt_precip
                    .filter(ee.Filter.eq('month', m))
                    .mean() 
                    .set('month', m)
      }).flatten());
print("lt_precip_monthly",lt_precip_monthly);


//---------------------Create task to export statistics to csv----------------------------//

// Select multiple reducers / statistics
var reducers_all = ee.Reducer.mean()
//                                .combine(ee.Reducer.count(), null, true)
//                                .combine(ee.Reducer.min(), null, true)
//                                .combine(ee.Reducer.max(), null, true)
//                                .combine(ee.Reducer.stdDev(), null, true);
;

//convert monthly mean values for period of interest to table
var precip_monthly_sum_ave = precip_monthly_sum.map(function(image){
  return image.reduceRegions({
    collection: AOI, //here you can put a sub-district shapefile to get values for each district
    reducer:reducers_all,
    scale: 5566
  }).map(function(f) {
    
    // Add a date property to each output feature.
     return f.set('year', image.get('year')).set('month', image.get('month'));
     
  });
});
print("check");
var precip_monthly_sum_ave_table = precip_monthly_sum_ave.flatten();
print(precip_monthly_sum_ave_table);

// Select only points that overlay with images
var precip_monthly_sum_ave_table1 = precip_monthly_sum_ave_table
                  .filterMetadata('count', "not_equals", 0);
                  
//and for long-term monthly averages
var lt_precip_monthly_ave = lt_precip_monthly.map(function(image){
  return image.reduceRegions({
    collection: AOI, //here you can put a sub-district shapefile to get values for each district
    reducer:reducers_all,
    scale: 5566
  }).map(function(f) {
    
    // Add a date property to each output feature.
     return f.set('year', image.get('year')).set('month', image.get('month'));
     
  });
});
print("check");
var lt_precip_monthly_ave_table = lt_precip_monthly_ave.flatten();
print(lt_precip_monthly_ave_table);

// Select only points that overlay with images
var lt_precip_monthly_ave_table1 = lt_precip_monthly_ave_table
                  .filterMetadata('count', "not_equals", 0);

//----------------------------Export data to Google Drive----------------------------//
Export.table.toDrive({
  collection: precip_monthly_sum_ave_table1,
  description: "monthly_total_precip_for_selected_time_period",
  fileFormat: 'CSV',
  selectors: ["layer","month","year", "mean"] //change these if necessary based on fields in AOI shapefile
});

Export.table.toDrive({
  collection: lt_precip_monthly_ave_table1,
  description: "monthly_total_precip_longterm_average",
  fileFormat: 'CSV',
  selectors: ["layer","month", "mean"] //change these if necessary based on fields in AOI shapefile
});

