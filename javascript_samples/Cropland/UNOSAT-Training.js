/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var syria_adm1_ocha = ee.FeatureCollection("users/ahnpriscilla/Syria_Agriculture/syr_admbnda_adm1_uncs_unocha_20201217");
/***** End of imports. If edited, may not auto-convert in the playground. *****/


//**************************************************************************
////////////////////////////// 00_Introduction /////////////////////////////
//**************************************************************************

/* This code plots sampling points over median composites of Sentinel imagery.

    Governorate Names
      - Al-Hasakeh
      - Aleppo
      - Ar-Raqqa
      - As-Sweida
      - Damascus
      - Deir-ez-Zor
      - Hama
      - Homs
      - Idleb
      - Lattakia
      - Quneitra
      - Rural Damascus
      - Tartous
      - Dar'a
 
 
Contributer: UNOSAT
*/

//**************************************************************************
//////////////////////////// 01_Define_Variables ///////////////////////////
//**************************************************************************
// -------------------------------------------------------------------------
// >>>>>>>>>>>>>>>>>>>>>>>>>>>> FIXED VARIABLES <<<<<<<<<<<<<<<<<<<<<<<<<<<<
// -------------------------------------------------------------------------
// Administrative Boundaries
var syria_adm0 = ee.FeatureCollection("FAO/GAUL/2015/level0")
                .filter(ee.Filter.eq('ADM0_NAME', 'Syrian Arab Republic'));

var syria_adm1 = ee.FeatureCollection("FAO/GAUL/2015/level1")
                .filter(ee.Filter.eq('ADM0_NAME', 'Syrian Arab Republic'));

var syria_adm2 = ee.FeatureCollection("FAO/GAUL/2015/level2")
                .filter(ee.Filter.eq('ADM0_NAME', 'Syrian Arab Republic'))
                .filter(ee.Filter.eq('ADM1_NAME', 'Dayr_Az_Zor'));

var syria = ee.FeatureCollection("USDOS/LSIB_SIMPLE/2017")
            .filterMetadata('country_na', 'equals', 'Syria');

// var govnames = syria_adm1_ocha.aggregate_array("ADM1_EN").getInfo();
// print('Governorate Names', govnames);

// -------------------------------------------------------------------------
// >>>>>>>>>>>>>>>>>> USER DEFINES VARIABLES HERE!!! <<<<<<<<<<<<<<<<<<<<<<
// -------------------------------------------------------------------------
// Define Start Year of Agricultural Season
// e.g.) 2016 would be the Nov 1, 2016 - Oct 31, 2017 agricultural season
var year = 2020;

// Define governorate (see 00_Introduction for govnames)
var govname = 'Ar-Raqqa';
var AOI = syria_adm1_ocha.filter(ee.Filter.eq('ADM1_EN', govname));

// Define monthly increment (1, 2, 3, 4, 6, 12)
var increment = 12;

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
} else if (increment==12) {
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

Map.centerObject(AOI, 9);
Map.setOptions('SATELLITE');

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

//**************************************************************************
///////////////////////////// 05_User_Interface ////////////////////////////
//**************************************************************************

// Create a panel to hold our widgets
var panel = ui.Panel();
panel.style().set('width', '200px');
ui.root.insert(0, panel);

// Create an intro panel with labels
var intro = ui.Panel([
  ui.Label('Click a point on the map to get coordinates.')
]);
panel.add(intro);

// Hold lon/lat values in panel
var lon = ui.Label();
var lat = ui.Label();
panel.add(ui.Panel([lon, lat], ui.Panel.Layout.flow('horizontal')));

// Register a callback on the default map to be invoked when the map is clicked
Map.onClick(function(coords) {
  // Update the lon/lat panel with values from click
  lon.setValue('lon: ' + coords.lon.toFixed(4)),
  lat.setValue('lat: ' + coords.lat.toFixed(4));
  var point = ee.Geometry.Point(coords.lon, coords.lat);
});

// Cursor style
Map.style().set('cursor', 'crosshair');

//**************************************************************************
///////////////////////////////// 06_Export ////////////////////////////////
//**************************************************************************

// // Export training points
// var training = annual.merge(perennial).merge(forest).merge(fallow).merge(grassland)
//                       .merge(rangeland).merge(bare).merge(water).merge(artificial);

// Export.table.toDrive({
//   collection: training,
//   description: govname + '_training_' + year + '_' + endyear,
//   // folder: 'GEEOutputs',
//   fileFormat: 'SHP'
// });

// // Select Month
// var month = 1;
// var i = month - 1;

// var img = ee.Image(list.get(i));

// // Map
// var rgbVis = {
//   min: 0.0,
//   max: 0.3,
//   bands: ['B4', 'B3', 'B2'],
// };

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

