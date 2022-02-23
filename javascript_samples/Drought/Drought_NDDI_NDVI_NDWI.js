/*===========================================================================================
      MODIS APPROACH TO CALCULATE NDDI, NDVI, NDWI FOR DOUGHT MONITORING IN SOUTH SUDAN
  ===========================================================================================
  
  This script utilises MODIS Terra surface reflectance (500m resolution) imagery to create 
  monthly composite images and calculate monthly mean NDVI, NDWI, and NDDI values for each 
  county in South Sudan. Results are exported to CSV and TIFF. 
  
  Note: Mean values during wet season months will be affected by persistent cloud cover. This 
  is visible in the rasters as clusters of pixels with NaNs. 
  
  Email: s.w.coughlan@gmail.com / josef.clifford@impact-initiatives.org
  
  ===========================================================================================*/

//------------------------------- SPECIFY DATE RANGE --------------------------//
//------------------------------- USER INPUT REQUIRED -------------------------//

// Specify the date range required
var startDate = ee.Date('2021-02-01');
var endDate = ee.Date('2021-02-28'); // remember number of days in each month to avoid errors

// Specify the month and year for file naming
var month = '02';
var year = '2021';

//----------------------------------------------------------------------------//

// Print date range to console
print('Observations begin on: ', startDate.format('YYYY-MM-dd'),
      'and end on: ', endDate.format('YYYY-MM-dd'));
      
// Calculate the number of months to process (ignore this)
var nMonths = ee.Number(endDate.difference(startDate,'month')).round();
print ('Number of months to process: ', nMonths);

//------------------------------- REQUIRED FUNCTIONS --------------------------//

// Function to create NDVI & NDWI bands
var addIndices = function(image) {
    var ndvi = image.normalizedDifference(['B2', 'B1']).rename('NDVI');
    var ndwi = image.normalizedDifference(['B2', 'B7']).rename('NDWI');
  return image.addBands([ndvi,ndwi]);
};

// Function to create NDDI band
var addNDDI = function(image) {
    var nddi = image.normalizedDifference(['NDVI', 'NDWI']).rename('NDDI');
  return image.addBands(nddi);
};

// Function to create NDDI band (alternative - allows negative values)
var addNDDI2 = function(image) {
    var nddi2 = image.select('NDVI').subtract(image.select('NDWI')).divide(image.select('NDVI')
    .add(image.select('NDVI'))).rename('NDDI');
  return image.addBands(nddi2);
}; 

// Helper function to extract the QA bits
function getQABits(image, start, end, newName) {
 // Compute the bits we need to extract.
 var pattern = 0;
 for (var i = start; i <= end; i++) {
 pattern += Math.pow(2, i);
 }
 // Return a single band image of the extracted QA bits, giving the band
 // a new name.
 return image.select([0], [newName])
 .bitwiseAnd(pattern)
 .rightShift(start);
}
 
// Function to mask out cloudy pixels
function maskQuality(image) {
 // Select the QA band.
 var QA = image.select('StateQA');
 // Get the internal_cloud_algorithm_flag bit.
 var internalQuality = getQABits(QA,8, 13, 'internal_quality_flag');
 // Return an image masking out cloudy areas.
 return image.updateMask(internalQuality.eq(0));
}

//---------------------- LOAD MODIS IMAGE COLLECTION -------------------------//

var modis = ee.ImageCollection('MODIS/006/MOD09A1')
  .filter(ee.Filter.date(startDate, endDate))
  .select(['sur_refl_b01','sur_refl_b02','sur_refl_b03',
           'sur_refl_b04','sur_refl_b05','sur_refl_b06',
           'sur_refl_b07','StateQA'],
          //rename bands
          ['B1','B2','B3','B4','B5','B6','B7','StateQA'])
  .map(maskQuality)
  .map(addIndices)
  .map(addNDDI)
  .map(function(image) { return image.clip(aoi); });

var modis2 = ee.ImageCollection(modis)
  .select(['NDVI','NDWI'])
  .map(addNDDI2)
  .map(function(image) { return image.clip(aoi); });

// Create composite image from MODIS collection
var modisCom = modis2.select(['NDVI','NDWI','NDDI']).mean();
print('Basic band info: ', modisCom);

//------------------------------ MEAN DATA PER COUNTY -----------------------------------------//

// Specify the column containing county names
var countyName = 'admin2RefN';

// Create a list of the county names
var counties = ee.List(aoi.reduceColumns(ee.Reducer.toList(),[countyName])
  .get('list'))
  .getInfo();

// Function to convert ee.Date object to a string date object
function eeDateToString(date){
  date = (new Date(date.getInfo().value));
  var Y = date.getFullYear();
  var m = date.getMonth() + 1;
  var d = date.getDate();
  return Y + '_' + m + '_' + d;
}

// Date range string to show the image description when exporting
var dateRangeString = eeDateToString(startDate) + '_to_' + eeDateToString(endDate);
// Name of folder to export to 
var folderString = 'SSD_Drought' + '_'  + year + '_' + month;

print('Initializing exports. This may take a while...');
print('Check the Tasks tab...');

// Initialising code for each county
for (var i = 0; i < counties.length; i++) {
  
  // Filter the original feature collection to get a single county as a feature
  var fCounty = ee.Feature(
    aoi.filter(ee.Filter.eq(countyName,counties[i]))
    .first());
  
  // Create an image collection for charts 
  var byMonth = ee.ImageCollection(
    // map over each month
    ee.List.sequence(0,nMonths).map(function(n) {
      // calculate the offset from startDate
      var ini = startDate.advance(n,'month');
      // advance just one month
      var end = ini.advance(1,'month');
      // filter and reduce
      return modis.filterDate(ini,end)
                  .select('NDDI','NDVI','NDWI').mean()
                  .set('system:time_start', ini);
  }));

  // Activate chart visualisation/styling options to see charts in console
  // Only useful if the time period is longer than 1 month
  // This will slow overall processing
  
  // Chart styling options
  var chartOptions = {
    title: 'Average NDDI, NDVI, NDWI by month (County: ' + counties[i] + ')',
    hAxis: {title: 'Time Period'},
    vAxis: {title: 'Range'},
    pointSize: 0,
    lineSize: 3,
    colors: ['ee5859', '84bc7d', '5499c5'],
    curveType: 'function'
  };
  
    // Plot NDDI, NDVI, NDWI time series
  var chart = ui.Chart.image.series({
    imageCollection: byMonth,
    region: fCounty,
    reducer: ee.Reducer.mean(),
    scale: 500,
  }).setOptions(chartOptions);
  /*
  // Print the charts by county
  print('COUNTY: ' + counties[i],chart); 
  */
  // Function to reduce image collection
  function reduceImageCollection(img){
    var dict = img.reduceRegion(ee.Reducer.mean(),fCounty.geometry(),500);
    var date = ee.Date(img.get('system:time_start')).format('Y-M-d');
    return ee.Feature(null,dict).set({'date':date});
  }

  // Reduce the image collection for the specific county
  var FCbyMonth = ee.FeatureCollection(byMonth.limit(byMonth.size().subtract(1)).map(reduceImageCollection));
  
  // Description and folder strings for naming exports
  var descriptionString = 'SSD_Drought_' + counties[i] + '_' + year + '_' + month;

  //------------------------------------------ EXPORTS -------------------------------------//

  // Export chart CSV by county 
  Export.table.toDrive({
    collection: FCbyMonth, 
    folder: folderString,
    description: 'Chart_Data_' + descriptionString,
    fileNamePrefix: 'Chart_Data_' + descriptionString,
    selectors:(["date","NDDI","NDVI", "NDWI"]),
  });
}

// Export TIFF raster of whole country
Export.image.toDrive({
  image: modisCom.toDouble().clip(aoi), 
  folder: folderString,
  description: 'Image_' + 'SSD_Drought_' + 'AllCounties' + '_' + year + '_' + month,
  fileNamePrefix: 'Image_' + 'SSD_Drought_' + 'All_Counties_' + year + '_' + month,
  region: aoi, 
  scale: 500,
  maxPixels: 1e10,
});

//------------------------------ RASTER & LEGEND VISUALISATION ----------------------------------//

// Activate raster visualisations to see layers in map viewer
// This will slow down overall processing

// Visualisation settings for each layer
var vizNDDI = {min: -1.0, max: 1.0, palette: ['#013220','#458b00','#ffcc00','#8b0000'], bands: ['NDDI'],};
var vizNDVI = {min: -1.0, max: 1.0, palette: ['#8b0000','#de5900','#d2e8ba','#013220'], bands: ['NDVI'],};
var vizNDWI = {min: -1.0, max: 1.0, palette: ['#8b0000','#ffcc00','#1874d2','#040084'], bands: ['NDWI'],};
var RGB = {min: 0.0, max: 2000.0, bands: ['B1','B4','B3'],};

// Add layers to the map panel
Map.centerObject(aoi,7); // the number is the zoom level, it can be changed. 
Map.addLayer(modisCom, vizNDVI, 'NDVI');
Map.addLayer(modisCom, vizNDWI, 'NDWI');
Map.addLayer(modisCom, vizNDDI, 'NDDI');
Map.addLayer(modis.median(), RGB, 'RGB');

// Create legend UI items
// Legend gradient settings
function ColorBar(palette) {
  return ui.Thumbnail({
    image: ee.Image.pixelLonLat().select(0),
    params: {
      bbox: [0, 0, 1, 0.1],
      dimensions: '300x15',
      format: 'png',
      min: 0,
      max: 1,
      palette: palette,
    },
    style: {stretch: 'horizontal', margin: '0px 0px'},
  });
}

// Spacing settings for the three legend gradients/text (repetitive... could be made into one function?)
function makeLegend1(lowLine, midLine, highLine,lowText, midText, highText, palette) {
  var  labelheader = ui.Label('NDDI ( ⪆0.5 indicates possible drought )',
                        {margin: '5px 17px', textAlign: 'center', stretch: 'horizontal', fontWeight: 'bold'});
  var labelLines = ui.Panel(
      [
        ui.Label(lowLine, {margin: '-4px 0px;'}),
        ui.Label(midLine, {margin: '-4px 0px', textAlign: 'center', stretch: 'horizontal'}),
        ui.Label(highLine, {margin: '-4px 0px'})
      ],
      ui.Panel.Layout.flow('horizontal'));
      var labelPanel = ui.Panel(
      [
        ui.Label(lowText, {margin: '0px 0px'}),
        ui.Label(midText, {margin: '0px 0px', textAlign: 'center', stretch: 'horizontal'}),
        ui.Label(highText, {margin: '0px 0px'})
      ],
      ui.Panel.Layout.flow('horizontal'));
    return ui.Panel({
      widgets: [labelheader, ColorBar(palette), labelLines, labelPanel], 
      style: {position:'bottom-left'}});
}

function makeLegend2(lowLine, midLine, highLine,lowText, midText, highText, palette) {
  var  labelheader = ui.Label('NDWI',{margin: '5px 17px', textAlign: 'center', stretch: 'horizontal', fontWeight: 'bold'});
  var labelLines = ui.Panel(
      [
        ui.Label(lowLine, {margin: '-4px 0px;'}),
        ui.Label(midLine, {margin: '-4px 0px', textAlign: 'center', stretch: 'horizontal'}),
        ui.Label(highLine, {margin: '-4px 0px'})
      ],
      ui.Panel.Layout.flow('horizontal'));
      var labelPanel = ui.Panel(
      [
        ui.Label(lowText, {margin: '0px 0px'}),
        ui.Label(midText, {margin: '0px 0px', textAlign: 'center', stretch: 'horizontal'}),
        ui.Label(highText, {margin: '0px 0px'})
      ],
      ui.Panel.Layout.flow('horizontal'));
    return ui.Panel({
      widgets: [labelheader, ColorBar(palette), labelLines, labelPanel], 
      style: {position:'bottom-left'}});
}

function makeLegend3(lowLine, midLine, highLine,lowText, midText, highText, palette) {
  var  labelheader = ui.Label('NDVI',{margin: '5px 17px', textAlign: 'center', stretch: 'horizontal', fontWeight: 'bold'});
  var labelLines = ui.Panel(
      [
        ui.Label(lowLine, {margin: '-4px 0px;'}),
        ui.Label(midLine, {margin: '-4px 0px', textAlign: 'center', stretch: 'horizontal'}),
        ui.Label(highLine, {margin: '-4px 0px'})
      ],
      ui.Panel.Layout.flow('horizontal'));
      var labelPanel = ui.Panel(
      [
        ui.Label(lowText, {margin: '0px 0px'}),
        ui.Label(midText, {margin: '0px 0px', textAlign: 'center', stretch: 'horizontal'}),
        ui.Label(highText, {margin: '0px 0px'})
      ],
      ui.Panel.Layout.flow('horizontal'));
    return ui.Panel({
      widgets: [labelheader, ColorBar(palette), labelLines, labelPanel], 
      style: {position:'bottom-left'}});
}

// Specify the gradient colours and add legends to the map panel 
Map.add(makeLegend3('|', '|', '|', "-1.0", '0', '1.0', ['#8b0000','#de5900','#d2e8ba','#013220']));
Map.add(makeLegend2('|', '|', '|', "-1.0", '0', '1.0', ['#8b0000','#ffcc00','#1874d2','#040084']));
Map.add(makeLegend1('|', '|', '|', "-1.0", '0', '1.0', ['#013220','#458b00','#ffcc00','#8b0000']));

//------------------------------ BATCH EXPORT SCRIPT ----------------------------------//

/**
 * Batch execute GEE Export tasks
 *
 * Click on the 'Tasks' tab. Wait until all task exports are ready.
 * Press F12 to get into console, then paste this script into console
 * and press enter. All the tasks will start exporting automatically.
 * This could take over an hour... grab a coffee. 
 *
 
function runTaskListTIFF(){
    var tasklist = document.getElementsByClassName('task local type-EXPORT_IMAGE awaiting-user-config');
    for (var i = 0; i < tasklist.length; i++)
            tasklist[i].getElementsByClassName('run-button')[0].click();
}

function runTaskListCSV(){
    var tasklist = document.getElementsByClassName('task local type-EXPORT_FEATURES awaiting-user-config');
    for (var i = 0; i < tasklist.length; i++)
            tasklist[i].getElementsByClassName('run-button')[0].click();
}

function confirmAll() {
    var ok = document.getElementsByClassName('goog-buttonset-default goog-buttonset-action');
    for (var i = 0; i < ok.length; i++)
        ok[i].click();
}

runTaskListTIFF();
runTaskListCSV();
confirmAll();

 */