/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var syria_2016_2017 = ee.FeatureCollection("users/ahnpriscilla/Syria_Agriculture/Vali_Syria_2016_2017_Check"),
    syria_2017_2018 = ee.FeatureCollection("users/ahnpriscilla/Syria_Agriculture/Vali_Syria_2017_2018_Check"),
    syria_2018_2019 = ee.FeatureCollection("users/ahnpriscilla/Syria_Agriculture/Vali_Syria_2018_2019_Check"),
    syria_2019_2020 = ee.FeatureCollection("users/ahnpriscilla/Syria_Agriculture/Vali_Syria_2019_2020_Check"),
    syria_2020_2021 = ee.FeatureCollection("users/ahnpriscilla/Syria_Agriculture/Vali_Syria_2020_2021_Check");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
//**************************************************************************
////////////////////////////// 00_Introduction /////////////////////////////
//**************************************************************************
 
/* This code plots sampling points over median composites of Sentinel imagery.

Contributer: UNOSAT
*/

//**************************************************************************
//////////////////////////// 01_Define_Variables ///////////////////////////
//**************************************************************************
// >>>>>>>>>>>>>>>>>> USER DEFINES VARIABLES HERE!!! <<<<<<<<<<<<<<<<<<<<<<
// Define Start Year of Agricultural Season
// e.g.) 2016 would be the Nov 1, 2016 - Oct 31, 2017 agricultural season
var year = 2020;

// Define Validation Points
var sample = syria_2020_2021;

// Define Point ID #
var id = 1;

// Define monthly increment (1, 2, 3, 4, 6)
var increment = 3;

// >>>>>>>>>>>>>>>>>>>>>>>>>> OTHER VARIABLES <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

////////// Buffer function - "bufferBy" //////////
var bufferBy = function(size) {
  return function(feature) {
    return feature.buffer(size);
  };
};

// Create AOI
var point = sample.filterMetadata('Id', 'equals', id);
var AOI = point.map(bufferBy(1000));

// Define bands
var bands = ['B2', 'B3', 'B4', 'B8', 'nd'];

//**************************************************************************
//////////////////////////// 02_Sentinel_Imagery ///////////////////////////
//**************************************************************************

////////// Cloud Mask/NDVI function - "maskANDndvi" //////////
function maskANDndvi(image) {
  var qa = image.select('QA60');

  // Bits 10 and 11 are clouds and cirrus, respectively.
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;

  // Both flags should be set to zero, indicating clear conditions.
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
      .and(qa.bitwiseAnd(cirrusBitMask).eq(0));

  return image.updateMask(mask)
              .divide(10000)
              // NDVI
              .addBands(image.normalizedDifference(['B8', 'B4']))
              // time in days
              .copyProperties(image, ["system:time_start"]);
}

// Filter Dates
var endyear = year + 1;
var startdate = ee.Date(year + '-11-01');
var enddate = ee.Date(endyear + '-10-31');

// Load Sentinel-2 TOA reflectance data.
var data = ee.ImageCollection('COPERNICUS/S2')
              .filterBounds(AOI)
              .filterDate(startdate, enddate)
              // Pre-filter to get less cloudy granules.
              .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
              .map(maskANDndvi)
              .select(bands);

//**************************************************************************
/////////////////////// 03_Monthly_Median_Composites ///////////////////////
//**************************************************************************

// Increment
if (increment==1) {
  var step = enddate.difference(startdate, 'month').divide(increment).ceil();
  var steps = ee.List.sequence(1, step);
} else if (increment==2) {
  var step = enddate.difference(startdate, 'month').divide(increment).ceil();
  var steps = ee.List.sequence(1, step);
} else if (increment==3) {
  var step = enddate.difference(startdate, 'month').divide(increment).ceil();
  var steps = ee.List.sequence(1, step);
} else if (increment==4) {
  var step = enddate.difference(startdate, 'month').divide(increment).ceil();
  var steps = ee.List.sequence(1, step);
} else if (increment==6) {
  var step = enddate.difference(startdate, 'month').divide(increment).ceil();
  var steps = ee.List.sequence(1, step);
}

// Create median mosaics
var list = steps.map(function(step) {
  var startstep = startdate.advance(ee.Number(step).subtract(1).multiply(increment), 'month');
  var endstep = startdate.advance(ee.Number(step).multiply(increment), 'month').advance(-1, 'day');
  var monthly = data.filterDate(startstep, endstep);
  var mosaic = monthly.median().clip(AOI);
  
  return mosaic.set({'system:time_start': ee.Date(startstep.millis()),
                    'system:time_end': ee.Date(endstep.millis())});
}).flatten();

// Compile list of images into an Image Collection
var imgcol = ee.ImageCollection.fromImages(list);

//**************************************************************************
/////////////////////////////////// 04_Map /////////////////////////////////
//**************************************************************************

//  Visualizaton Parameters
var rgbVis = {
  min: 0.0,
  max: 0.3,
  bands: ['B4', 'B3', 'B2'],
};

var fccVis = {
  min: 0.0,
  max: 0.3,
  bands: ['B8', 'B4', 'B3'],
};

var ndviVis = {
  min: 1,
  max: 0,
  bands: ['nd'],
  palette: ["#bae1eb","white","#ccd6a8","green","#65934f"]
};

// Define Visualization
var ival = steps.size().getInfo();

// Print Date Ranges
for(var i = 0; i < ival; i++){
  var image = ee.Image(list.get(i));
  var startstep = ee.Date(image.get('system:time_start')).format("YYYY-MM-dd");
  var endstep = ee.Date(image.get('system:time_end')).format("YYYY-MM-dd");
  print('Date Range for Image ' + i, startstep, endstep);
}

// RGB Stack
for(var i = 0; i < ival; i++){
  var image = ee.Image(list.get(i));
  Map.addLayer(image, rgbVis, 'RGB' + i.toString());
}

// FCC Stack
for(var i = 0; i < ival; i++){
  var image = ee.Image(list.get(i));
  var idno = i + 1;
  Map.addLayer(image, fccVis, 'FCC' + i.toString());
}

// NDVI Stack
for(var i = 0; i < ival; i++){
  var image = ee.Image(list.get(i));
  var idno = i + 1;
  Map.addLayer(image, ndviVis, 'NDVI' + i.toString());
}

Map.centerObject(AOI, 15);
Map.setOptions('SATELLITE');
Map.addLayer(point, {}, 'Point ID ' + id);

// //**************************************************************************
// ///////////////////////////////// 05_Export ////////////////////////////////
// //**************************************************************************

// // Select Month
// var month = 1;
// var i = month - 1;

// var img = ee.Image(list.get(i));

// // Map
// Map.centerObject(AOI);
// Map.addLayer(img, rgbVis, 'RGB_' + month);

// // Export result
// Export.image.toDrive({
//   image: img,
//   description: AOIname + '_' + year + '_' + endyear + '_' + month,
// //   folder: 'GEEOutputs',
//   region: AOI,
//   scale: 10,
//   maxPixels: 1e10,
// });


