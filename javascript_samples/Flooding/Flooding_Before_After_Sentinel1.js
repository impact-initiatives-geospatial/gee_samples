//contact josef.clifford@impact-initiatives.org

// Set time frame (before and after the flood)

// Before the flood
var before_start= '2020-08-01';
var before_end='2020-08-31';

// After the flood
var after_start='2020-09-01';
var after_end='2020-09-30';

// Load Sentinel-1 C-band SAR Ground Range collection (VH, descending)
var collection = ee.ImageCollection('COPERNICUS/S1_GRD')
.filter(ee.Filter.eq('instrumentMode', 'IW'))
.filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
.filter(ee.Filter.eq('orbitProperties_pass', 'DESCENDING'))
.filter(ee.Filter.eq('resolution_meters',10))
.filterBounds(aoi)
.select('VH');

//Filter by date
var before_collection = collection.filterDate(before_start, before_end);
var after_collection = collection.filterDate(after_start, after_end);

// Print selected tiles to the console

      // Extract date from meta data
      function dates(imgcol){
        var range = imgcol.reduceColumns(ee.Reducer.minMax(), ["system:time_start"]);
        var printed = ee.String('from ')
          .cat(ee.Date(range.get('min')).format('YYYY-MM-dd'))
          .cat(' to ')
          .cat(ee.Date(range.get('max')).format('YYYY-MM-dd'));
        return printed;
      }
      // print dates of before images to console
      var before_count = before_collection.size();
      print(ee.String('Tiles selected: Before Flood ').cat('(').cat(before_count).cat(')'),
        dates(before_collection), before_collection);
      
      // print dates of after images to console
      var after_count = after_collection.size();
      print(ee.String('Tiles selected: After Flood ').cat('(').cat(after_count).cat(')'),
        dates(after_collection), after_collection);
        
// Create a mosaic of selected tiles and clip to AOI
var before = before_collection.mosaic().clip(aoi);
var after = after_collection.mosaic().clip(aoi);

//Apply filter to reduce speckle
var smoothing_radius = 50;
var before_filtered = before.focal_mean(smoothing_radius, 'circle', 'meters');
var after_filtered = after.focal_mean(smoothing_radius, 'circle', 'meters');

// Calculate difference between before and after
var difference = after_filtered.divide(before_filtered);

//Apply Threshold
var diff_upper_threshold = 1.25;
var difference_thresholded = difference.gt(diff_upper_threshold);

// Refine flood result using additional datasets
      
      // Include JRC layer on surface water seasonality to mask flood pixels from areas
      // of "permanent" water (where there is water > 10 months of the year)
      var swater = ee.Image('JRC/GSW1_0/GlobalSurfaceWater').select('seasonality');
      var swater_mask = swater.gte(10).updateMask(swater.gte(10));
      
      //Flooded layer where perennial water bodies (water > 10 mo/yr) is assigned a 0 value
      var flooded_mask = difference_thresholded.where(swater_mask,0);
      // final flooded area without pixels in perennial waterbodies
      var flooded = flooded_mask.updateMask(flooded_mask);
      
      // Compute connectivity of pixels to eliminate those connected to 8 or fewer neighbours
      // This operation reduces noise of the flood extent product 
      var connections = flooded.connectedPixelCount();    
      var flooded = flooded.updateMask(connections.gte(8));
      
      // Mask out areas with >5% slope using a DEM 
      var DEM = ee.Image('WWF/HydroSHEDS/03VFDEM');
      var terrain = ee.Algorithms.Terrain(DEM);
      var slope = terrain.select('slope');
      var flooded = flooded.updateMask(slope.lt(5));
      
// Calculate flood extent area
// Create a raster layer containing the area information of each pixel 
var flood_pixelarea = flooded.select('VH')
  .multiply(ee.Image.pixelArea());

// Sum the areas of flooded pixels
// default is set to 'bestEffort: true' in order to reduce compuation time, for a more 
// accurate result set bestEffort to false and increase 'maxPixels'. 
var flood_stats = flood_pixelarea.reduceRegion({
  reducer: ee.Reducer.sum(),              
  geometry: aoi,
  scale: 10, // native resolution 
  //maxPixels: 1e9,
  bestEffort: true
  });
  
// Convert the flood extent to hectares
var flood_area_ha = flood_stats
  .getNumber('VH')
  .divide(10000)
  .round(); 
  
// Convert the flood extent to km2 
var flood_area_km2 = flood_stats
  .getNumber('VH')
  .divide(1000000)
  .round(); 

print("Estimated flooded area (km2): ", flood_area_km2);

//Display filtered images
Map.centerObject(aoi,6);
Map.addLayer(before_filtered, {min:-25,max:0}, 'Before Flood VH Filtered',1);
Map.addLayer(after_filtered, {min:-25,max:0}, 'After Flood VH Filtered',1);
Map.addLayer(difference, {min: 0,max:2}, 'Difference VH Filtered', 0);
Map.addLayer(before_filtered.addBands(after_filtered).addBands(before_filtered), {min: -25, max: -8}, 'BVH/AVH Composite', 0);
Map.addLayer(difference_thresholded.updateMask(difference_thresholded),{palette:"0000FF"},'Flooded Areas',1);

