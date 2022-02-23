/*===========================================================================================
    Sentinel-1 SAR methodology to calculate standing water per month/county in South Sudan
  ===========================================================================================
  
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

//------------------------------------- OPTIONAL -----------------------------//

// Specify the threshold for identifying possible surface water
// This is a general value which works relatively well in dry & wet season
// Note: some false values will be returned, especially in dry season
// Can be refined if results don't match local reports etc
var waterThreshold = 0.36;

// Name of folder to export to 
var folderString = 'SSD_Flooding' + '_'  + year + '_' + month;

//----------------------------------------------------------------------------//
 
// Print date range to console
print('Observations begin on: ', startDate.format('YYYY-MM-dd'),
      'and end on: ', endDate.format('YYYY-MM-dd'));
      
// Calculate the number of months to process (ignore this)
var nMonths = ee.Number(endDate.difference(startDate,'month')).round();
print ('Number of months to process: ', nMonths);

//------------------------------- REQUIRED FUNCTIONS --------------------------//

// Function to calculate VV/VH band ratio 
var vvVHband = function(image) {
    var vvVH = image.select('VV').divide(image.select('VH')).rename('VV/VH');
  return image.addBands(vvVH);
};

//---------------------- LOAD SENTINEL-1 IMAGE COLLECTION -------------------------//

var collection = ee.ImageCollection('COPERNICUS/S1_GRD')
  .filter(ee.Filter.eq('instrumentMode', 'IW'))
  .filter(ee.Filter.date(startDate, endDate))
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation','VH'))
  .filter(ee.Filter.eq('orbitProperties_pass', 'DESCENDING'))
  .filter(ee.Filter.eq('resolution_meters',10))
  .filterBounds(aoi)
  .select(['VH','VV'])
  .map(vvVHband); // add VV/VH band

// Calculate median image of time period and clip to county
var SARcom = collection.mean().clip(aoi);

//Apply speckle filter
var smoothing_radius = 50;
var SARfinal = SARcom.focal_mean(smoothing_radius, 'circle', 'meters');

var SARreduced = SARfinal.select('VV/VH')

//---------------------- CREATE ESTIMATED SURFACE WATER MASK IMAGE FOR WHOLE COUNTRY -------------------------//

// Create water mask image using VV/VH difference (estimated surface water) threshold
var water_mask2 = SARfinal.select('VV/VH').lt(waterThreshold);

// Refine flood result using additional datasets
      
    // Include JRC layer on surface water seasonality to mask flood pixels from areas
    // of "permanent" water (where there is water > 10 months of the year)
    var swater2 = ee.Image('JRC/GSW1_0/GlobalSurfaceWater').select('seasonality');
    var swater_mask2 = swater2.gte(10).updateMask(swater2.gte(10));
    
    //Flooded layer where perennial water bodies (water > 10 mo/yr) is assigned a 0 value
    var flooded_mask2 = water_mask2.where(swater_mask2,0);
    // final flooded area without pixels in perennial waterbodies
    var flooded2 = flooded_mask2.updateMask(flooded_mask2);
    
    // Compute connectivity of pixels to eliminate those connected to 8 or fewer neighbours
    // This operation reduces noise of the flood extent product 
    var connections2 = flooded2.connectedPixelCount();    
    var flooded2 = flooded2.updateMask(connections2.gte(8));
    
    // Mask out areas with more than 5 percent slope using a Digital Elevation Model 
    var DEM2 = ee.Image('WWF/HydroSHEDS/03VFDEM');
    var terrain2 = ee.Algorithms.Terrain(DEM2);
    var slope2 = terrain2.select('slope');
    var flooded2 = flooded2.updateMask(slope2.lt(5));

// Calculate flood extent area
// Create a raster layer containing the area information of each pixel 
var flood_pixelarea2 = flooded2.select('VV/VH')
  .multiply(ee.Image.pixelArea());

// Sum the areas of flooded pixels
var flood_stats2 = flood_pixelarea2.reduceRegion({
  reducer: ee.Reducer.sum(),              
  geometry: aoi,
  scale: 10, // native Sentinel-1 resolution 
  // maxPixels: 1e10,
  bestEffort: true
  });

// Convert the flood extent to square km  
var flood_area_km22 = flood_stats2
  .getNumber('VV/VH')
  .divide(1000000)
  //.round(); 
print('Total potential flooded (km2): ', flood_area_km22);

//---------------------- CREATE ESTIMATED SURFACE WATER MASK FOR CHARTS -------------------------//

function floodedArea(img,region,threshold,scaleValue){
  
  // Create water mask image using VV/VH difference (estimated surface water) threshold
  var water_mask = img.select('VV/VH').lt(threshold);
  
  // Refine flood result using additional datasets
        
  // Include JRC layer on surface water seasonality to mask flood pixels from areas
  // of "permanent" water (where there is water > 10 months of the year)
  var swater = ee.Image('JRC/GSW1_0/GlobalSurfaceWater').select('seasonality');
  var swater_mask = swater.gte(10).updateMask(swater.gte(10));
  
  //Flooded layer where perennial water bodies (water > 10 mo/yr) is assigned a 0 value
  var flooded_mask = water_mask.where(swater_mask,0);
  // final flooded area without pixels in perennial waterbodies
  var flooded = flooded_mask.updateMask(flooded_mask);
  
  // Compute connectivity of pixels to eliminate those connected to 8 or fewer neighbours
  // This operation reduces noise of the flood extent product 
  var connections = flooded.connectedPixelCount();    
  var flooded = flooded.updateMask(connections.gte(8));
  
  // Mask out areas with more than 5 percent slope using a Digital Elevation Model 
  var DEM = ee.Image('WWF/HydroSHEDS/03VFDEM');
  var terrain = ee.Algorithms.Terrain(DEM);
  var slope = terrain.select('slope');
  var flooded = flooded.updateMask(slope.lt(5));
  
  // Calculate flood extent area
  // Create a raster layer containing the area information of each pixel 
  var flood_pixelarea = flooded.select('VV/VH')
    .multiply(ee.Image.pixelArea());
  
  // Sum the areas of flooded pixels
  var flood_stats = flood_pixelarea.reduceRegion({
    reducer: ee.Reducer.sum(),              
    geometry: region,
    scale: scaleValue, // native Sentinel-1 resolution 
    //maxPixels: 1e10,
    bestEffort: true
    });
  
  // Convert the flood extent to square km (area calculations are originally returned in square meters)  
  var flood_area = flood_stats
    .getNumber('VV/VH')
    .divide(1000000);
    //.round();
    
  return flood_area;
  
}

var fa = floodedArea(
  SARfinal,
  aoi.first().geometry(),
  waterThreshold,
  500
);
 
print('SSD (first county test) Flooded Area km2 (500 m)',fa);


//------------------------------ FLOOD EXTENT DATA PER COUNTY --------------------------------//

// Specify the scale value to use
var scaleValue = 100;

// Specify the column containing county names.
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
      return collection.filterDate(ini,end)
                  .select('VV/VH').mean()
                  .set('system:time_start', ini);
  }));
  
  // Chart styling options
  var chartOptions = {
    title: 'Flooded Area (Km2) by month (County: ' + counties[i] + ')',
    hAxis: {title: 'Time Period'},
    vAxis: {title: 'Flooded Area (Km2)'},
    pointSize: 0,
    lineSize: 3,
    colors: ['ee5859', '84bc7d', '5499c5'],
    curveType: 'function'
  };
  
  // Function to reduce image collection
  function reduceImageCollection(img){
    var date = ee.Date(img.get('system:time_start'));
    return fCounty.set({'date':date,'flooded':floodedArea(img,
                                                          fCounty.geometry(),
                                                          waterThreshold,
                                                          scaleValue)});
  }

  // Reduce the image collection for the specific county
  var FCbyMonth = ee.FeatureCollection(byMonth.limit(byMonth.size().subtract(1)).map(reduceImageCollection));
  
  var chart = ui.Chart.feature.byFeature(FCbyMonth,
                                         'date',
                                         'flooded').setOptions(chartOptions);
 
  /*
  // Print the charts by county
  print('County: ' + counties[i],chart);
  */
  
  // Description for the the chart exports
  var descriptionString = 'Flooding_' + counties[i] + '_' + dateRangeString;
  
  // Export the chart data by county
  Export.table.toDrive({
    collection: FCbyMonth, 
    folder: folderString,
    description: 'Chart_SSD_' + descriptionString,
    fileNamePrefix: 'Chart_SSD_' + descriptionString,
  });

}

//------------------------------------------ EXPORT IMAGES -------------------------------------//

// Export TIFF images by county
Export.image.toDrive({
  image: flooded2.toDouble().clip(aoi), 
  folder: folderString,
  description: 'Image_' + 'SSD_Flooding_' + 'AllCounties' + '_' + year + '_' + month,
  fileNamePrefix: 'Image_' + 'SSD_Flooding_' + 'All_Counties_' + year + '_' + month,
  region: aoi, 
  scale: scaleValue,
  maxPixels: 1e10,
});

//------------------------------  LAYER VISUALISATION  ----------------------------------//

var S1vvVH = {min: 0.0, max: 1.0, bands: 'VV/VH',};

//Display filtered images
Map.centerObject(aoi,7);
Map.addLayer(SARreduced, S1vvVH, 'VV/VH Composite');
Map.addLayer(flooded2, {palette: 'blue'}, 'Water Mask');


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