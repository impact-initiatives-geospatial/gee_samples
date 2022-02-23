/*===========================================================================================
                CALCULATION OF VEGETATION CONDITION INDEX FROM MODIS DATA
  ===========================================================================================
  
  Email: josef.clifford@impact-initiatives.org  

  This script utilises MODIS 500m resolution Enhanced Vegetation Index (EVI) data to calculate
  mean vegetation condition index (VCI) for a selected month/season for your chosen AOI.
  
  Vegetation condition index provides an estimate of drought severity based on vegetation health.
  The index is calculated for a selected time period based on the long term mean in this same 
  time period. The selected time period should be appropriate for the region and purpose of the study.
  For example accounting for the cultivation calnder in the region if trying to understand the impact
  on crop production. Note that this index may not be suitable in all locations and should ideally be
  triangulated with other sources to understand true impacts. 
  
  AOI can be a feature class with a single feature (e.g. one county) or multiple features
  (e.g. multiple counties / states). 
  
  Data produced includes monthly or seasonal images of mean VCI (which may be exported to TIFF) and
  long-term timeseries of VCI for selected month/season (which can be exported to CSV). See the tasks
  tab to generate exports.  
  
  This script uses MODIS Enhanced Vegetation Index (EVI), but can easily be substitued for NDVI.
  Adapted from UNSPIDER Reccommended Practice for Drought Monitoring by Josef Clifford 
  Email: josef.clifford@impact-initiatives.org

  ===========================================================================================*/

//------------------------------- SPECIFY PARAMETERS --------------------------//
//------------------------------- USER INPUT REQUIRED -------------------------//

/*select AOI. Can use this country boundaries shapefile below, or upload your own shapefile, just import it into
the script and name it AOI*/
/*
var fc = ee.FeatureCollection('USDOS/LSIB_SIMPLE/2017')
    .filter(ee.Filter.eq('country_na', 'South Sudan'))
    .first();
    
var AOI = fc.geometry();
print(AOI, 'AOI');
*/

//import MODIS collection, select dataset required
//can select "NDVI" instead if interested, otherwise leave as default
var collection = ee.ImageCollection('MODIS/006/MOD13A1').select('EVI').filterBounds(AOI); 

/*select reference period for baseline (by default this is the full period of MODIS data availability, but end
date may need to be updated*/
var reference = collection.filterDate('2001-01-01', '2022-01-31')
  .sort('system:time_start');
  
/*select timeframe of interest and filter images from each year for this timeframe. This could be a single month
or season when you want to investigate trends in drought severity. You will need to enter the day numbers*/
var baseline = reference.filter(ee.Filter.dayOfYear(1,31)).filterBounds(AOI);

/*select the specific year for which you want to calculate the average VCI. The timeframe should also match the
timeframe (month/season) selected above.*/
var drought = collection.filterDate('2022-01-01', '2022-01-31').filterBounds(AOI)
  .sort('system:time_start');

//enter the name of the month and year entered above
var m = "January";
var y = "2022";

//enter name of the region you are analysing, with no spaces 
var region = "Eastern_Equatoria";

/*if your AOI is a feature collection with multiple sub-regions (e.g. counties/states), enter the name of the field here
that contains the names of those sub-regions*/
var sub_reg = AOI['ADM2_EN'];

/*mask if required, e.g. using layer for agricultural land if only interested in drought impact for specific land use
The example below utilises pixels classified as agriculture from the Copernicus land cover dataset, but this can be 
replaced with a more detailed file if available */ 

/*
//import Copernicus 2019 Land Cover dataset
var land_cover_2019 = ee.Image("COPERNICUS/Landcover/100m/Proba-V-C3/Global/2019")
.select('discrete_classification');

//extract agriculture (value=40) and clip to AOI
var agrimask = land_cover_2019.eq(40).clip(AOI);

var baseline = baseline
.map(function(image){
  return image.updateMask(agrimask);
  });
var drought = drought
.map(function(image){
  return image.updateMask(agrimask);
  }); 
*/

//----------------------------Now you can click run, no more inputs required-------//
//----------------------------calculate VCI for selected AOI-------------------------//

//vci equation for period of interest
var vci_drought = ((drought.mean()).subtract(baseline.min())).divide((baseline.max()).subtract(baseline.min())).clip(AOI);


//define vci visualisation parameters 
//define an SLD style of discrete intervals to apply to the image.
var sld_intervals =
  '<RasterSymbolizer>' +
    '<ColorMap type="intervals" extended="false" >' +
      '<ColorMapEntry color="#b30000" quantity="0" label="0"/>' +
      '<ColorMapEntry color="#e34a33" quantity="0.1" label="1-100" />' +
      '<ColorMapEntry color="#fc8d59" quantity="0.2" label="110-200" />' +
      '<ColorMapEntry color="#fdcc8a" quantity="0.3" label="210-300" />' +
      '<ColorMapEntry color="#fef0d9" quantity="0.4" label="310-400" />' +
      '<ColorMapEntry color="#c2e699" quantity="1" label="410-1000" />' +
    '</ColorMap>' +
  '</RasterSymbolizer>';

Map.addLayer(vci_drought.sldStyle(sld_intervals), {}, 'VCI');
Map.centerObject(AOI);

//add legend
// set position of panel
var legend = ui.Panel({
  style: {
    position: 'bottom-left',
    padding: '8px 15px'
  }
});
 
// Create legend title
var legendTitle = ui.Label({
  value: 'Vegetation condition index',
  style: {
    fontWeight: 'bold',
    fontSize: '15px',
    margin: '0 0 4px 0',
    padding: '0'
    }
});
 
// Add the title to the panel
legend.add(legendTitle);
 
// Creates and styles 1 row of the legend.
var makeRow = function(color, name) {
 
      // Create the label that is actually the colored box.
      var colorBox = ui.Label({
        style: {
          backgroundColor: '#' + color,
          // Use padding to give the box height and width.
          padding: '8px',
          margin: '0 0 4px 0'
        }
      });
 
      // Create the label filled with the description text.
      var description = ui.Label({
        value: name,
        style: {margin: '0 0 4px 6px'}
      });
 
      // return the panel
      return ui.Panel({
        widgets: [colorBox, description],
        layout: ui.Panel.Layout.Flow('horizontal')
      });
};
 
//  Palette with the colors
var palette =['c2e699', 'fef0d9', 'fdcc8a', 'fc8d59', 'e34a33'];
 
// name of the legend
var names = ['No drought','Light drought','Moderate drought', 'Severe drought', 'Extreme drought' ];
 
// Add color and and names
for (var i = 0; i <5; i++) {
  legend.add(makeRow(palette[i], names[i]));
  }  
 
// add legend to map
Map.add(legend);

//----------------------------create VCI trend graphs for selected AOI---------------------//

//function to iterate through chosen time period (e.g. month) for each year in sequence and calculate average Vegetation condition Index
var years = ee.List.sequence(2001, 2022);
print("years",years);

var lt_vci = ee.ImageCollection.fromImages(
      years.map(function (y) {
        return baseline.filter(ee.Filter.calendarRange(y, y, 'year'))
                    .select('EVI').mean()
                    .subtract(baseline.min())
                    .divide(baseline.max().subtract(baseline.min()))
                    .set('year', y)
                    .rename('VCI');
}));
print("lt_vci",lt_vci);

// Define the chart and print it to the console.
var chart =
    ui.Chart.image
        .series({
          imageCollection: lt_vci,
          region: AOI,
          reducer: ee.Reducer.mean(),
          scale: 500,
          xProperty: 'year'
        })
        .setSeriesNames(['VCI'])
        .setOptions({
          title: 'Average Vegetation Condition Index ('+ m + '), ' + region,
          hAxis: {title: 'Year', titleTextStyle: {italic: false, bold: true}},
          vAxis: {
            title: 'VCI',
            titleTextStyle: {italic: false, bold: true}
          },
          lineWidth: 2,
          colors: ['e37d05', '1d6b99'],
          curveType: 'function'
        });
print(chart);

var chart_all =
    ui.Chart.image
        .seriesByRegion({
          imageCollection: lt_vci,
          regions: AOI,
          reducer: ee.Reducer.mean(),
          scale: 500,
          xProperty: 'year',
          seriesProperty: 'ADM2_EN' 
        })
        .setSeriesNames(['VCI'])
        .setOptions({
          title: 'Average Vegetation Condition Index by region ('+ m + '), ' + region,
          hAxis: {title: 'Date', titleTextStyle: {italic: false, bold: true}},
          vAxis: {
            title: 'VCI',
            titleTextStyle: {italic: false, bold: true}
          },
          lineWidth: 1,
//          colors: ['e37d05', '1d6b99'],
          curveType: 'function'
        });
print(chart_all);


// Select multiple reducers / statistics
var reducers_all = ee.Reducer.mean()
                                .combine(ee.Reducer.count(), null, true)
                                .combine(ee.Reducer.min(), null, true)
                                .combine(ee.Reducer.max(), null, true)
                                .combine(ee.Reducer.stdDev(), null, true);
//convert annual mean VCI values for period of interest to table
var lt_vci_means = lt_vci.map(function(image){
  return image.reduceRegions({
    collection: AOI, //here you can put a sub-district shapefile to get values for each district
    reducer:reducers_all,
    scale: 500
  }).map(function(f) {
    
    // Add a date property to each output feature.
     return f.set('year', image.get('year'));
  });
});
print("check");
var lt_vci_table = lt_vci_means.flatten();
print(lt_vci_table);

// Select only points that overlay with images
var lt_vci_table1 = lt_vci_table
                  .filterMetadata('count', "not_equals", 0);

//----------------------------Export data to Google Drive----------------------------//
Export.table.toDrive({
  collection: lt_vci_table1,
  description: "lt_vci_table_"+ region + '_' + m + '_' + y,
  fileFormat: 'CSV',
  selectors: ["ADM0_EN","ADM1_EN","ADM2_EN","year", "mean","min","max","stdDev"] //change these if necessary based on fields in AOI shapefile
});

//export geotiffs for VCI data to Google Drive
Export.image.toDrive({
  image: vci_drought,
  description: 'vci_'+ '_' + region + '_' + m + '_' + y,
//  region:
  scale: 500
});

print("See tasks tab to generate exports");

 