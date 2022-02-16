/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var geom_display = 
    /* color: #d63000 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[35.94127701465294, 33.1158270164571],
          [35.94127701465294, 32.920359640999635],
          [36.16615341846153, 32.920359640999635],
          [36.16615341846153, 33.1158270164571]]], null, false),
    dam_Tishrin = 
    /* color: #d63000 */
    /* shown: false */
    ee.Geometry.Point([38.17848300813228, 36.380737152690656]),
    dam_Tabqa = 
    /* color: #d63000 */
    /* shown: false */
    ee.Geometry.Point([38.56510446209167, 35.870972690621606]),
    dam_Hurriyah = 
    /* color: #98ff00 */
    /* shown: false */
    ee.Geometry.Point([38.74803072140846, 35.885044983958736]),
    reservoir_Sfan = 
    /* color: #0b4a8b */
    /* shown: false */
    ee.Geometry.Point([42.071207224523334, 37.144020048857186]),
    dam_Ataturk = 
    /* color: #ffc82d */
    /* shown: false */
    ee.Geometry.Point([38.523777242267556, 37.514717078588205]),
    reservoir_Hasakah_East_dam = 
    /* color: #00ffff */
    /* shown: false */
    ee.Geometry.Point([40.66850348121576, 36.5944455085102]),
    reservoir_Hasakah_South_dam = 
    /* color: #bf04c2 */
    /* shown: false */
    ee.Geometry.Point([40.78126590402885, 36.33075273410688]),
    reservoir_Tishrin = 
    /* color: #ff0000 */
    /* shown: false */
    ee.Geometry.Point([38.0779886916235, 36.68440324822885]),
    cloud_shadow_water = 
    /* color: #d63000 */
    /* shown: false */
    ee.Geometry.Point([41.376604120839474, 35.70599468995193]),
    dam_Keban = 
    /* color: #d63000 */
    /* shown: false */
    ee.Geometry.Point([38.75443695803264, 38.80563795291479]),
    dam_Karakaya = 
    /* color: #98ff00 */
    /* shown: false */
    ee.Geometry.Point([39.13490538388588, 38.22603907121886]),
    dams_Turkey = 
    /* color: #0b4a8b */
    /* shown: false */
    ee.Geometry.MultiPoint(
        [[38.032466765799605, 36.86769530173293],
         [37.89200447696771, 37.05478159798348]]),
    error_urban = 
    /* color: #d63000 */
    /* shown: false */
    ee.Geometry.MultiPoint(
        [[38.79218817348173, 37.170314090397774],
         [38.64661932582548, 37.11831708858434],
         [38.73107672328642, 37.14787766367103]]);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
/*
Description: Surface Water Classifications based on reference imagery
Requirements: Sampling script for producing training data
Contributor: Pedro, Esther, Reem and Victor (REACH Yemen and Syria)
*/


var dataset = ee.ImageCollection('COPERNICUS/S2_SR')
                  .filterDate('2020-01-01', '2020-01-30')
                  // Pre-filter to get less cloudy granules.
                  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',20))
                  //.map(maskS2clouds);

var visualization = {
  min: 0.0,
  max: 0.3,
  bands: ['B4', 'B3', 'B2'],
};

Map.setCenter(83.277, 17.7009, 12);

Map.addLayer(dataset.mean(), visualization, 'RGB');








 
var palette = ["white", "red", "yellow", "blue"]
 
// Defining AOI
var aoi_name = 'AOI_WoS'
var aoi_fc = ee.FeatureCollection('users/estherbarvels/SY_Water/AOIs/'+aoi_name)
var clip_feature = aoi_fc.geometry()
// var selection_bands = ['MNDWI', 'NDVI', 'blue', 'green', 'red', 'nir', 'swir1', 'swir2']
var selection_bands = ['MNDWI', 'NDVI', 'NDWI2', 'blue', 'green', 'red', 'nir', 'swir1', 'swir2'] // 'NDWI1',



var aoi_syria = ee.FeatureCollection("USDOS/LSIB_SIMPLE/2017").filterMetadata('country_na', 'equals', 'Syria')
var elevation = ee.Image('USGS/SRTMGL1_003').select('elevation').clip(clip_feature);


var slope = ee.Terrain.slope(elevation);
Map.setOptions("hybrid")
// Map.centerObject(aoi_fc, 10)
Map.addLayer(aoi_syria, {}, "Syria borders",false)
Map.addLayer(elevation, {min:150,max:1200}, "Elevation",false)
Map.addLayer(slope, {min:0,max:7}, "slope",false)
Map.addLayer(ee.FeatureCollection('users/estherbarvels/SY_Water/AOIs/AOI_WoS'), {}, "AOI WoS",false)



var snow_areas = ee.FeatureCollection('users/estherbarvels/SY_Water/AOIs/snow_areas')
Map.addLayer(snow_areas, {}, 'snow_areas', false)

/////////////////////////// Loading Imagery //////////////////////////////////////////////

 
// // different for 2021

var year = 2021
var start = year+'-01-01'
var end = year+'-06-30'
var start_s2 = ee.Date((year-1)+'-11-01');
var end_s2 = ee.Date((year)+'-08-31');
var range = ee.List.sequence(1, 6, 1)


// Loading and filtering imageCollections
var sentinel2 = ee.ImageCollection('COPERNICUS/S2_SR')
                    .filterDate(start_s2, end_s2)
                    .filterBounds(clip_feature);
print(sentinel2.first())                    
var dem = ee.Image('USGS/SRTMGL1_003');
var elevation = dem.select('elevation');
var slope = ee.Terrain.slope(elevation);
var HAND = ee.Image("MERIT/Hydro/v1_0_1").select('hnd');

var sentinel1 = ee.ImageCollection('COPERNICUS/S1_GRD')
                  .sort('system:time_start')
                  .filterBounds(clip_feature.buffer(4000))  //Geometry, not feature!!   sen1_selection
                  .filterDate(start, end)
                  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
                  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
                  .filter(ee.Filter.eq('instrumentMode', 'IW'))
                  .select(['VV', 'VH']);
                  // .map(function(image) {
                  //   return image.unitScale(-30, 30).copyProperties(image, ['system:time_start']);        //No clamping performed, may be a problem for outliers
                  // });

var sentinel1_DES = sentinel1.filterMetadata('orbitProperties_pass', 'equals', 'DESCENDING');
var sentinel1_AS = sentinel1.filterMetadata('orbitProperties_pass', 'equals', 'ASCENDING');

function make_date_range_monthly(start,end){
  var n_months = end.difference(start,'month').round().subtract(1);
  var range = ee.List.sequence(0,n_months,1); 
  var make_datelist = function (n) {
    return start.advance(n,'month')
  };
  return range.map(make_datelist);
}

var date_range_monthly = make_date_range_monthly(start_s2,end_s2)

 

function composite_monthly(imgCol, date_range){
  return ee.ImageCollection.fromImages(
      date_range.map(function (date) {
        date = ee.Date(date)
        imgCol = imgCol.filterDate(date, date.advance(1,'month'))
        return imgCol.mean()
                     .set('date', date.format('YYYY-MM'))
                     .set('year', date.get('year'))
                     .set('month', date.get('month'))
                     .set('system:time_start', date.millis())
                     .clip(clip_feature)
      }))
}

//////////////////////////// Processing sentinel1_AS /////////////////////////////////////////////////////////
var sentinel1_AS = composite_monthly(sentinel1_AS, date_range_monthly)
//Filters out images outside of current temporal scope
var sentinel1_AS_mosaics = sentinel1_AS.map(function(image) {
  return ee.Algorithms.If(ee.Number(image.bandNames().size().gt(0)), image.set('approved','true'), image.set('approved','false'));
}).filterMetadata('approved', 'equals', 'true').select(['VV', 'VH'], ['VV_AS', 'VH_AS']);

print('sentinel1_AS_mosaics', sentinel1_AS_mosaics)

// var dates = sentinel1_AS_mosaics.toList(sentinel1_AS_mosaics.size()).map(function(img){
//     return ee.Image(img).date().format()
//   })



//////////////////////////// Processing sentinel1_DES /////////////////////////////////////////////////////////

var sentinel1_DES = composite_monthly(sentinel1_DES, date_range_monthly)

//Filters out images outside of current temporal scope
var sentinel1_DES_mosaics = sentinel1_DES.map(function(image) {
  return ee.Algorithms.If(ee.Number(image.bandNames().size().gt(0)), image.set('approved','true'), image.set('approved','false'));
}).filterMetadata('approved', 'equals', 'true').select(['VV', 'VH'], ['VV_DES', 'VH_DES']);


// // Adding copying the April sentinel1_Des to fill in time-series gap for Jan-March
// var sentinel1_DES_mosaics = sentinel1_DES_mosaics.merge(ee.ImageCollection([
//   sentinel1_DES_mosaics.first().set('month', 1),
//   sentinel1_DES_mosaics.first().set('month', 2),
//   sentinel1_DES_mosaics.first().set('month', 3),
//   sentinel1_DES_mosaics.first().set('month', 4)])) // OBS: Some areas might have April coverage
// Map.addLayer(sentinel1_DES_mosaics.filterMetadata('month', 'equals', 8), '', 'month 8')


/////////////////////////// Cloud Masking Sentinel 2  //////////////////////////////////////////////
// Original code: https://developers.google.com/earth-engine/tutorials/community/sentinel-2-s2cloudless

//adjust the parameters 
// find images with clouds -> visualise ->  keep CLD_PROB_THRESH as low as possible, will otherwise exclude steep terrain

var AOI = clip_feature;
var START_DATE = start_s2;
var END_DATE = end_s2;
// var CLOUD_FILTER = 20;         //Maximum image cloud cover percent allowed in image collection
// var CLD_PRB_THRESH = 30;        //Cloud probability (%); values greater than are considered cloud (the lower, the more pixels are considered clouds)
// var NIR_DRK_THRESH = 0.2;      //Near-infrared reflectance; values less than are considered potential cloud shadow (the higher the th, the more pixels are considered as shadows)
// var CLD_PRJ_DIST = 3;          //Maximum distance (km) to search for cloud shadows from cloud edges
// var BUFFER = 70;               //Distance (m) to dilate the edge oef cloud-identified objects

var CLOUD_FILTER = 32;        
var CLD_PRB_THRESH = 45;    
var NIR_DRK_THRESH = 0.19;      
var CLD_PRJ_DIST = 3.3;         
var BUFFER = 33;   

// Import and filter S2 SR.
// Loading s2cloudless collections based on predefined parameters
// Joining the two collections by adding a s2_cloudless_col image as a a property to the corresponding sen2 image

var s2_sr_col = sentinel2.filter(ee.Filter.lte('CLOUDY_PIXEL_PERCENTAGE', CLOUD_FILTER));


print('sentinel2',sentinel2.size())
print('s2_sr_col',s2_sr_col.size())

var get_s2_sr_cld_col = function(aoi, start_date, end_date) {
    
    // Import and filter s2cloudless.
    var s2_cloudless_col = ee.ImageCollection('COPERNICUS/S2_CLOUD_PROBABILITY')
        .filterBounds(aoi)
        .filterDate(start_date, end_date);

    // Join the filtered s2cloudless collection to the SR collection by the 'system:index' property.
    return ee.ImageCollection(ee.Join.saveFirst('s2cloudless').apply({
        'primary': s2_sr_col,
        'secondary': s2_cloudless_col,
        'condition': ee.Filter.equals({
            'leftField': 'system:index',
            'rightField': 'system:index'
          })
    }))};


//Apply the get_s2_sr_cld_col function to build a collection according to the parameters defined above.
//This produces a filtered Sentinel2 collection joined with the Sen2Cloudless images
var s2_sr_cld_col_eval = get_s2_sr_cld_col(AOI, START_DATE, END_DATE)


//Define cloud mask component functions
// adding cloud propability and is_cloud to each sen2 image

var add_cloud_bands = function(img) {

    // Get s2cloudless image, subset the probability band.
    var cld_prb = ee.Image(img.get('s2cloudless')).select('probability');

    // Condition s2cloudless by the probability threshold value
    var is_cloud = cld_prb.gt(CLD_PRB_THRESH).rename('clouds');

    // Add the cloud probability layer and cloud mask as image bands.
    return img.addBands(ee.Image([cld_prb, is_cloud]));
};



//Cloud shadow components

var add_shadow_bands = function(img) {
    
    // Identify water pixels from the SCL band.
    var not_water = img.select('SCL').neq(6);

    // Identify dark NIR pixels that are not water (potential cloud shadow pixels).
    var SR_BAND_SCALE = 1e4;
    var dark_pixels = img.select('B8').lt(NIR_DRK_THRESH*SR_BAND_SCALE).multiply(not_water).rename('dark_pixels');

    // Determine the direction to project cloud shadow from clouds (assumes UTM projection).
    var shadow_azimuth = ee.Number(90).subtract(ee.Number(img.get('MEAN_SOLAR_AZIMUTH_ANGLE')));

    // Project shadows from clouds for the distance specified by the CLD_PRJ_DIST input.
    var cld_proj = (img.select('clouds').directionalDistanceTransform(shadow_azimuth, CLD_PRJ_DIST*10)
        .reproject({'crs': img.select(0).projection(), 'scale': 100})
        .select('distance')
        .mask()
        .rename('cloud_transform'));

    // Identify the intersection of dark pixels with cloud shadow projection.
    var shadows = cld_proj.multiply(dark_pixels).rename('shadows');

    // Add dark pixels, cloud projection, and identified shadows as image bands.
    return img.addBands(ee.Image([dark_pixels, cld_proj, shadows]))};


//Final cloud-shadow mask

var add_cld_shdw_mask = function(img) {
    // Add cloud component bands.
    var img_cloud = add_cloud_bands(img);

    // Add cloud shadow component bands.
    var img_cloud_shadow = add_shadow_bands(img_cloud);

    // Combine cloud and shadow mask, set cloud and shadow as value 1, else 0.
    var is_cld_shdw = img_cloud_shadow.select('clouds').add(img_cloud_shadow.select('shadows')).gt(0);

    // Remove small cloud-shadow patches and dilate remaining pixels by BUFFER input.
    // 20 m scale is for speed, and assumes clouds don't require 10 m precision.
    var is_cld_shdw = (is_cld_shdw.focal_min(2).focal_max(BUFFER*2/20)
        .reproject({'crs': img.select([0]).projection(), 'scale': 20})
        .rename('cloudmask'));

    // Add the final cloud-shadow mask to the image.
    return img_cloud_shadow.addBands(is_cld_shdw);
};



// Apply cloud and cloud shadow mask
//Define cloud mask application function

var apply_cld_shdw_mask = function(img) {
    // Subset the cloudmask band and invert it so clouds/shadow are 0, else 1.
    var not_cld_shdw = img.select('cloudmask').not();

    // Subset reflectance bands and update their masks, return the result.
    // Selects all bands starting with B + the terrain shadow layer calcualted earlier
    // return img.select('B.*').updateMask(not_cld_shdw);
    return img.select(['QA60', 'B1','B2','B3','B4','B5','B6','B7','B8','B8A', 'B9', 'B11','B12'])
              .updateMask(not_cld_shdw);
};
//, 'shadow']


//Process the collection
var s2_cloudless = s2_sr_cld_col_eval.map(add_cld_shdw_mask).map(apply_cld_shdw_mask);

// mask snow
var rescale = function(img, exp, thresholds) {
    return img.expression(exp, {img: img})
        .subtract(thresholds[0]).divide(thresholds[1] - thresholds[0]);
        
}        

function sentinelSnowScore(img) {
  img= img.divide(10000)
  img= img.select(['QA60', 'B1','B2','B3','B4','B5','B6','B7','B8','B8A', 'B9', 'B11','B12']
                  ,['QA60','cb', 'blue', 'green', 'red', 're1','re2','re3','nir', 'nir2', 'waterVapor', 'swir1', 'swir2'])
                    
  // Compute several indicators of cloudyness and take the minimum of them.
  var score = ee.Image(1);
  
  // Clouds are reasonably bright in the blue and cirrus bands.
  score = score.min(rescale(img, 'img.blue', [0.1, 0.5]));
  score = score.min(rescale(img, 'img.cb', [0.1, 0.3]));
  // score = score.min(rescale(img, 'img.cb + img.cirrus', [0.15, 0.2]));
  
  // Clouds are reasonably bright in all visible bands.
  score = score.min(rescale(img, 'img.red + img.green + img.blue', [0.2, 0.8]));

  
  //Clouds are moist
  var ndmi = img.normalizedDifference(['nir','swir1']);
  score = score.min(rescale(ndmi, 'img', [-0.1, 0.1]));
  
  // However, clouds are not snow.
  var ndsi = img.normalizedDifference(['green', 'swir1']);
  score=score.min(rescale(ndsi, 'img', [0.05, 0.9])); // 0.6 0.8
  
  score = score.multiply(100).byte();
 
  return img.addBands(score.rename('snowScore'));
}

var snow_mask_geom = ee.Image.constant(1).clip(snow_areas).mask()


var snow_th = 7
var s2_snowless = s2_cloudless.map(function(image) { 
  var snow_mask = sentinelSnowScore(image).select(['snowScore'],['snowScore']).lte(snow_th)
  return image.updateMask(snow_mask.where(snow_mask_geom.neq(1), 1))
  // return image.updateMask(snow_mask)
})

// ///// // //// Test snow mask ////////
// print(s2_snowless.size())
// print(s2_cloudless.size())

// var start_snow = '2020-12-01'
// var end_snow = '2020-12-31'
                    
// var img_snowless = s2_snowless
//                   .filterBounds(turkey)
//                   .filterDate(start_snow', end_snow)
//                   .filterMetadata('SNOW_ICE_PERCENTAGE', 'greater_than', 15) // turkey
//                   .first()
                  
// var img_cloudless = s2_cloudless
//                   .filterBounds(turkey)
//                   .filterDate(start_snow, end_snow)
//                   .filterMetadata('SNOW_ICE_PERCENTAGE', 'greater_than', 15) // turkey
//                   .first()

// var start_snow = '2020-01-01'
// var end_snow = '2020-01-31'

// var start_snow = '2018-12-01'
// var end_snow = '2018-12-31'


// var img_snowless = s2_snowless
//                   .filterBounds(geom_display)
//                   .filterDate(start_snow, end_snow)
//                   .filterMetadata('SNOW_ICE_PERCENTAGE', 'greater_than', 15) // turkey
//                   .first()
//                   .clip(geom_display)
                  
// var img_cloudless = s2_cloudless
//                   .filterBounds(geom_display)
//                   .filterDate(start_snow, end_snow)
//                   .filterMetadata('SNOW_ICE_PERCENTAGE', 'greater_than', 15) // turkey
//                   .first()
//                   .clip(geom_display)
// var img_cloudy = s2_sr_cld_col_eval
//                   .filterBounds(geom_display)
//                   .filterDate(start_snow, end_snow)
//                   .filterMetadata('SNOW_ICE_PERCENTAGE', 'greater_than', 15) // turkey
//                   .first()
//                   .clip(geom_display)
                  
                  

// var rgbVis = {
//   min: 170, 
//   max: 3000,
//   bands:['B4', 'B3', 'B2']
// }
// Map.addLayer(img_snowless,rgbVis,'img_snowless')
// Map.addLayer(img_cloudless,rgbVis,'img_cloudless')
// Map.addLayer(img_cloudy,rgbVis,'img_cloudy')

// var hillshadow = function(img) {
//   var shadowMap = ee.Terrain.hillShadow({
//   image: dem,
//   azimuth: img.get('MEAN_SOLAR_AZIMUTH_ANGLE'),
//   zenith: img.get('MEAN_SOLAR_ZENITH_ANGLE'),
//   neighborhoodSize: 0,
//   hysteresis: true});
//   return img.addBands(shadowMap);
// };


//Adding hillshadow as a band
// var sentinel2 = s2_snowless.map(hillshadow);

// Mask hillshadows everywhere
// sentinel2 = sentinel2.map(function(img){return img.updateMask(img.select('shadow'))})

// Mask hillshadows everywhere within AOI
// var mask_geom = ee.Image.constant(1).clip(snow_areas).mask()
// sentinel2 = sentinel2.map(function(img){return img.updateMask(img.select('shadow').where(mask_geom.neq(1), 1))})




/////////////////////////// Calculate indices on Sentinel 2  //////////////////////////////////////////////

// var sentinel2 = sentinel2
var sentinel2 = s2_snowless
                    .map(function(image) {
                    return image.addBands(image.normalizedDifference(['B8','B4']).rename('NDVI'))
                                .addBands(image.normalizedDifference(['B3','B11']).rename('MNDWI')) // green - swir 1 (same as NDSI)
                                // .addBands(image.normalizedDifference(['B8','B11']).rename('NDWI1')) // nir - swir1
                                .addBands(image.normalizedDifference(['B8','B3']).rename('NDWI2')) // nir - green
                    })
                    .select(['MNDWI','NDVI', 'NDWI2', 'B2','B3','B4', 'B8', 'B11','B12'],
                            ['MNDWI', 'NDVI', 'NDWI2', 'blue', 'green', 'red', 'nir', 'swir1', 'swir2'])
                            
                    // .select(['MNDWI','NDVI', 'B2','B3','B4', 'B8', 'B11','B12'],
                    //       ['MNDWI', 'NDVI', 'blue', 'green', 'red', 'nir', 'swir1', 'swir2']);

                            
/////////////////////////// Make monthly Sentinel 2 mosaics ///////////////////////////////////////////////////
function composite_monthly_median(imgCol, date_range){
  return ee.ImageCollection.fromImages(
      date_range.map(function (date) {
        date = ee.Date(date)
        imgCol = imgCol.filterDate(date, date.advance(1,'month'))
        return imgCol.median()
                     .set('date', date.format('YYYY-MM'))
                     .set('year', date.get('year'))
                     .set('month', date.get('month'))
                     .set('system:time_start', date.millis())
                     .clip(clip_feature)
      }))
}

var sentinel2_mosaics = composite_monthly_median(sentinel2, date_range_monthly)
print('sentinel2_mosaics', sentinel2_mosaics)

// var liste = sentinel2_mosaics.toList(sentinel2_mosaics.size())
// Map.addLayer(ee.Image(liste.get(5)).clip(geom_display), {}, 'sentinel2_mosaics')
// Map.addLayer(ee.Image(liste.get(6)).clip(geom_display), {}, 'sentinel2_mosaics')

// /////////////////////////// Fill gaps with previous and consecutive images ///////////////////////////////////////////////////
var len = sentinel2_mosaics.size().getInfo();

function make_median_img_1month(monthly_composites_list){
  var median_imgCol = [];
    
  for (var i=1; i < len-1; i++) {
    var img = ee.Image(monthly_composites_list.get(i))
    
    // compute median img of previous and consecutive image
    var median_img = ee.ImageCollection([ee.Image(monthly_composites_list.get(i-1)),ee.Image(monthly_composites_list.get(i+1))])
                                  .median()
                                  .copyProperties(img)
    median_imgCol.push(median_img)
  }
  return ee.ImageCollection(median_imgCol);
}


function make_median_img_2month(monthly_composites_list){
  var median_imgCol = [];
  for (var i=2; i < len-2; i++) {
    var img = ee.Image(monthly_composites_list.get(i))
    
    // compute median img of 2 previous and 2 consecutive images
    var median_img = ee.ImageCollection([ee.Image(monthly_composites_list.get(i-2)),
                                        ee.Image(monthly_composites_list.get(i-1)),
                                        ee.Image(monthly_composites_list.get(i+1)),
                                        ee.Image(monthly_composites_list.get(i+2))])
                                  .median()
                                  .copyProperties(img)
    median_imgCol.push(median_img)
  }
  return ee.ImageCollection(median_imgCol);
}


var sentinel2_mosaics_list = sentinel2_mosaics.toList(sentinel2_mosaics.size())
var median_col_1 = make_median_img_1month(sentinel2_mosaics_list)
var median_col_2 = make_median_img_2month(sentinel2_mosaics_list)

print('median_col_1', median_col_1)
print('median_col_2', median_col_2)


function fill_gaps(monthly_composites, median_composites){
  
  var dates = median_composites.toList(median_composites.size()).map(function(img){ return ee.Image(img).get('date')})
  var filled_imgCol = ee.ImageCollection.fromImages(dates.map(function(date){ 
    
    var img = monthly_composites.filterMetadata('date', 'equals', date).first()
    var fill_img = median_composites.filterMetadata('date', 'equals', date).first()
    
    return img.unmask(fill_img)
  }))
  
  return filled_imgCol
}

var filled_imgCol = fill_gaps(sentinel2_mosaics, median_col_1)
print('filled_imgCol', filled_imgCol)

var filled_imgCol = fill_gaps(filled_imgCol, median_col_2)
print('filled_imgCol', filled_imgCol)

/////////////////////////// Fill remaining gaps with annual median  ///////////////////////////////////////////////////
var sentinel2_annual_median = sentinel2_mosaics
                                .filterDate(ee.Date(year+'-01-01'), ee.Date(year+'-12-31'))
                                .median() 
print('sentinel2_annual_median',sentinel2_annual_median)

// Gap filling with annual median composite
var filled_imgCol = filled_imgCol.map(function(image) { return image.unmask(sentinel2_annual_median);});


print('final filled_imgCol', filled_imgCol)


// var rgbVis = {
//   min: 170, 
//   max: 3000,
//   bands:['red', 'green', 'blue']
// }

// Map.addLayer(filled_imgCol.first().clip(geom_display),rgbVis, 'filled img' )


////////////////////////////////// Layer Stacking ////////////////////////////////////////////

// Combine all images
var image_collection_raw = ee.ImageCollection(filled_imgCol.select(selection_bands))
.merge(ee.ImageCollection(sentinel1_AS_mosaics))
// .merge(ee.ImageCollection(sentinel1_DES_mosaics)) // exlucde as otherwise property 'VH_DES_1' is missing.
.merge(elevation.set('static', 'true')) // Setting a property to enable filtering later
.merge(slope.set('static', 'true'))
.merge(HAND.set('static', 'true'));

print('image_collection_raw', image_collection_raw.first().bandNames())



// Layer stack maker
var layer_stacker = function(image_collection) {
  var first = ee.Image(image_collection.first()).select([]);
  var appendBands = function(image, previous) {   //Previous = result of previous iteration, NOT previous image
    return ee.Image(previous).addBands(image);
  };
  return ee.Image(image_collection.iterate(appendBands, first));   //First is the starting image to be used as starting point for adding onto for each interation
};



 
////////////////////////////////// Extract samples to training samples  ////////////////////////////////////////////

//////// Load samples (points without features) ////////

var year = 2020
var asset_name_samples = year+'_samples_'+aoi_name
print('asset_name_samples', asset_name_samples)
var samples = ee.FeatureCollection('users/estherbarvels/SY_Water/samples/' + asset_name_samples)

//// Extract error samples to training samples
// wetlands //1
// volcano //2
// urban //3
// cropland //4
// terrain1 //5
// terrain2 //6

var sample_size = 15
var area_name = 'volcano'

var asset_name_samples = year + '_samples_' + area_name + '_'+ sample_size


var samples = ee.FeatureCollection('users/estherbarvels/SY_Water/samples_error_areas/' + asset_name_samples)

print('samples.first()', samples.first())

// Map.addLayer(samples, {}, 'samples', false )
// Map.addLayer(aoi_fc, {}, 'AOI',false)



//////// Extract sample features for each month ////////
var image_combiner = function(imageCollection, featureCollection, range){
  
  //Filters an image collection, produces a subset and adds it to a list (this function is later iterated over the an image collection)
  var temporal_composites = function(range, list) {
    //newlist = ee.List(newlist);
    var filtered_imgCol = imageCollection.filterMetadata('month', 'equals', range)
                          .merge(image_collection_raw.filterMetadata('static', 'equals', 'true'))
    var filtered_fC = featureCollection.filterMetadata('month', 'equals', range)
    var layer_stack = layer_stacker(filtered_imgCol);
    
    // Sampling from one image
    var sample = layer_stack.sampleRegions({
      collection: filtered_fC,
      scale: 10, 
      geometries: true,
      tileScale: 16})
      
      // Use if there are memory limit issues 
      // var sample = filtered_fC.map(function(feature) {
      //             return layer_stack.sample({
      //               region: ee.Feature(feature).geometry(),
      //               scale: 10,
      //               tileScale: 16,
      //               geometries: true                           
      //             }).first().set('class', feature.get('class'))});
  
    //return ee.ImageCollection(list).merge(ee.ImageCollection(filtered))
    return ee.FeatureCollection(list).merge(sample)
    //return ee.Listfiltered//ee.List(newlist).add(filtered);
};

// Iterates the function above over a list of numbers signifying months
  return range.iterate(temporal_composites, ee.FeatureCollection([]));
};





var training_sample = image_combiner(image_collection_raw, samples, range);

print('training_sample.limit(2)', ee.FeatureCollection(training_sample).limit(2))

// Generic Function to remove a property from a feature
var removeProperty = function(feature, property) {
  var properties = ee.Feature(feature).propertyNames()
  var selectProperties = properties.filter(ee.Filter.neq('item', property));
  return feature.select(selectProperties);
};

// Removing property: month
var training_sample = ee.FeatureCollection(training_sample).map(function(feature) {
  return removeProperty(feature,'month')
})
var training_sample = ee.FeatureCollection(training_sample).map(function(feature) {
  return removeProperty(feature,'classification')
})  
 
print('training_sample.limit(2)', ee.FeatureCollection(training_sample).limit(2)) 
 
//// Export training samples ////
var asset_name_train_samples = year + '_train_'+aoi_name 
print('export  asset_name_train_samples', asset_name_train_samples)
// Export.table.toAsset(training_sample, asset_name_train_samples, 'users/estherbarvels/SY_Water/train_samples/final/' + asset_name_train_samples)


//// Export error training samples ////

// var asset_name_train_samples = year+'_train_error_' + area_name + '_'+ sample_size
// Export.table.toAsset(training_sample, asset_name_train_samples, 'users/estherbarvels/SY_Water/train_samples_error_areas/final/' + asset_name_train_samples)


//////////////////////////////// Training and Classification ////////////////////////////////////////////
var year = 2020
//// Loading training samples ////
var asset_path = 'users/estherbarvels/SY_Water/train_samples/final/'
var asset_name_train_samples = year + '_train_'+aoi_name 
var training_sample = ee.FeatureCollection(asset_path + asset_name_train_samples)
print('loaded asset_name_train_samples', asset_name_train_samples)
print('training_sample size()', training_sample.size())
print('training_sample first()', training_sample.first())

// // Combine training samples 
var asset_path = 'users/estherbarvels/SY_Water/train_samples_error_areas/final/'

// wetlands //1
// volcano //2
// urban //3
// cropland //4
// terrain1 //5
// terrain2 //6

var training_sample_error_1 = ee.FeatureCollection(asset_path + year+'_train_error_' + 'wetlands' + '_' + sample_size)
var training_sample_error_2 = ee.FeatureCollection(asset_path + year+'_train_error_' + 'volcano' + '_' + sample_size)
var training_sample_error_3 = ee.FeatureCollection(asset_path + year+'_train_error_' + 'urban' + '_' + sample_size)
var training_sample_error_4 = ee.FeatureCollection(asset_path + year+'_train_error_' + 'cropland' + '_' + sample_size)
var training_sample_error_5 = ee.FeatureCollection(asset_path + year+'_train_error_' + 'terrain1' + '_' + sample_size)
var training_sample_error_6 = ee.FeatureCollection(asset_path + year+'_train_error_' + 'terrain2' + '_' + sample_size)




var training_sample = training_sample.merge(training_sample_error_1)
                                    .merge(training_sample_error_2)
                                    .merge(training_sample_error_3)
                                    // .merge(training_sample_error_4)
                                    // .merge(training_sample_error_5)
                                    // .merge(training_sample_error_6)
                

print('training_sample with added error samples', training_sample.size())


Map.addLayer(ee.FeatureCollection('users/estherbarvels/SY_Water/error_areas/error_wetlands'), {}, 'error wetlands',false)
Map.addLayer(ee.FeatureCollection('users/estherbarvels/SY_Water/error_areas/error_volcano'), {}, 'error volcano',false)
Map.addLayer(ee.FeatureCollection('users/estherbarvels/SY_Water/error_areas/error_cropland'), {}, 'error_cropland',false)
Map.addLayer(ee.FeatureCollection('users/estherbarvels/SY_Water/error_areas/error_terrain1'), {}, 'error_terrain1',false)
Map.addLayer(ee.FeatureCollection('users/estherbarvels/SY_Water/error_areas/error_terrain2'), {}, 'error_terrain2',false)
Map.addLayer(ee.FeatureCollection('users/estherbarvels/SY_Water/error_areas/error_urban'), {}, 'error_urban',false)

/// Train the classifier 
print('Input properties', training_sample.first().propertyNames().remove('system:index').remove('classification'))


var classifier = ee.Classifier.smileRandomForest(500);
var trained_classifier = classifier.train(training_sample, 'class', training_sample.first().propertyNames().remove('system:index').remove('classification')); // .first().propertyNames().remove('system:index')
print(trained_classifier)

var trainAccuracy = trained_classifier.confusionMatrix();
print('Resubstitution error matrix: ', trainAccuracy);
print('Training overall accuracy: ', trainAccuracy.accuracy());
print('PA: ', trainAccuracy.producersAccuracy());
print('UA: ', trainAccuracy.consumersAccuracy());



/////// Classify, display, export /////// 

var clip_feature = aoi_fc

var classified_imgCol = ee.ImageCollection.fromImages(range.map(function(id){
  var image_collection_month = image_collection_raw.filterMetadata('month', 'equals', id)
                              .merge(image_collection_raw.filterMetadata('static', 'equals', 'true'))
  var layer_stack = layer_stacker(image_collection_month)
  var classified_image = layer_stack.classify(trained_classifier).clip(clip_feature).set('month', id);
  return classified_image
  
}))
print('classified_imgCol', classified_imgCol)
var rgbVis = {
  min: 170, 
  max: 2400,
  bands:['red', 'green', 'blue']
}

var waterVis = {
  palette: ['red', 'white', 'blue'], 
  min: -0.9, 
  max: 0.9,
  bands:['MNDWI']
}

var waterVis_ndwi1 = {
  palette: ['red', 'white', 'blue'], 
  min: -0.9, 
  max: 0.9,
  bands:['NDWI1']
}
var waterVis_ndwi2 = {
  palette: ['red', 'white', 'blue'], 
  min: -0.9, 
  max: 0.9,
  bands:['NDWI2']
}

var HAND_mask = HAND.lt(35)

///// Display all classified images, if not exported yet. Otherwise comment this part out ////

/// compare with previous ones 
var asset_path = 'users/estherbarvels/SY_Water/classified/' + aoi_name + '/final/'
var asset_name = 'water_'
var year = 2021
var year = year + '_'
var descr = asset_name.concat(year)
var assetId =asset_path.concat(descr)
print('assetId', assetId)

var imgCol_prev = ee.ImageCollection([
  ee.Image(assetId+1).set('month', 1),
  ee.Image(assetId+2).set('month', 2),
  ee.Image(assetId+3).set('month', 3),
  ee.Image(assetId+4).set('month', 4),
  ee.Image(assetId+5).set('month', 5),
  ee.Image(assetId+6).set('month', 6),
  // ee.Image(assetId+7).set('month', 7),
  // ee.Image(assetId+8).set('month', 8),
  // ee.Image(assetId+9).set('month', 9),
  // ee.Image(assetId+10).set('month', 10),
  // ee.Image(assetId+11).set('month', 11),
  // ee.Image(assetId+12).set('month', 12)
  ])
  
print(imgCol_prev)
imgCol_prev = imgCol_prev.toList(imgCol_prev.size()) 

var listOfImages = classified_imgCol
                      .map(function(img){ return img.clip(geom_display) }) // clip to smaller area, otherwise too heavy
listOfImages = listOfImages.toList(listOfImages.size())
var len = listOfImages.size();

print('listOfImages', listOfImages)
// i is the starting month , e.g. Jan = 1
len.evaluate(function(l) 
{
  for (var i=0; i < l; i++) {
    
    var img = ee.Image(listOfImages.get(i)).clip(geom_display); 
    var img_prev = ee.Image(imgCol_prev.get(i)).clip(geom_display); 
    Map.addLayer(img_prev, {palette: ['white', 'blue'], min:0, max:3}, 'Classified previous '+(i+1).toString(),false);
    Map.addLayer(img, {palette: ['white', 'blue'], min:0, max:3}, 'Classified '+(i+1).toString(),false);
    
    
    // Map.addLayer(img.updateMask(HAND_mask), {palette: ['white', 'blue'], min:0, max:3}, 'Classified hand masked'+(i+1).toString(),false);
    
    
    var id = i+1
    var mosaick = filled_imgCol.filterMetadata('month', 'equals', id).first().clip(geom_display);
    // Map.addLayer(mosaick, waterVis_ndwi1, 'Sentinel-2 Mosaick NDWI1 - '+ id,false);
    // Map.addLayer(mosaick, waterVis_ndwi2, 'Sentinel-2 Mosaick NDWI2 - '+ id,false);
    Map.addLayer(mosaick, waterVis, 'Sentinel-2 Mosaick MNDWI - '+ id,false);
    Map.addLayer(mosaick, rgbVis, 'Sentinel-2 Mosaick RGB -' + id,false);
    // var img_GLAD = ee.Image(GLAD_imgCol_list.get(i))//.clip(geom_display);
    // Map.addLayer(img_GLAD, {bands:['wp'], palette:palette_GLAD,min: 0, max: 3}, 'GLAD reclassified-'+id,false);
    
    

  } 
});




// //// Export classified images ////
// var asset_path = 'users/estherbarvels/SY_Water/classified/' + aoi_name + '/final/' 
// print('export asset path',asset_path)
// var asset_name = 'water_'
// // var year = 2021
// var descr = asset_name.concat(year).concat('_')
// var assetId =asset_path.concat(descr)
// print('export assetId', assetId)

// for (var i=0; i<13; i++){
//   var id = i

//   var image_collection_month = image_collection_raw.filterMetadata('month', 'equals', id)
//                               .merge(image_collection_raw.filterMetadata('static', 'equals', 'true'))
//   var layer_stack = layer_stacker(image_collection_month)
//   var classified_image = layer_stack.classify(trained_classifier).clip(clip_feature);

//   Export.image.toAsset({
//   image: classified_image.toByte(),
//   description: descr+id,
//   assetId: assetId+id,
//   scale: 10,
//   region: aoi_fc,//geom_display
//   maxPixels: 2000000000000
// });

// }


// // ///////////////////////////////////// Reviewing previous outputs ////////////////////////////////////////////

// // var rgbVis = {
// //   min: 170, 
// //   max: 2400,
// //   bands:['red', 'green', 'blue']
// // }

// // var waterVis = {
// //   palette: ['red', 'white', 'blue'], 
// //   min: -0.9, 
// //   max: 0.9,
// //   bands:['MNDWI']
// // }

// // var classVis = {
// //   palette: ['white', 'blue'], 
// //   min: 0, 
// //   max: 3,
// //   bands:['classification']
// // }

// // var snowVis = {
// //   palette: ['green', 'white', 'blue'], 
// //   min: -1, 
// //   max: 1,
// //   bands:['NDSI']
// // }



// Map.addLayer(snow_areas, {}, 'snow areas')


// // var palette_GLAD = ["white", "red", "yellow", "blue"]
// // var start = ee.Date('2020-01-01');
// // var end = ee.Date('2020-12-31');
// // var GLAD = ee.ImageCollection('projects/glad/water/individualMonths')
// //             .filterDate(start, end)
// //             .map(function(img){return img.clip(aoi_fc)})
            
// // //Function for applying negative buffer around specified pixel values
// // var buffer = function (image) {
// //   var mask = image.mask().reduce(ee.Reducer.min())
// //   var negative_buffer = mask
// //     .focal_min({radius: 30, units: 'meters'})
// //   return image.updateMask(negative_buffer)
// // }

// // // Creating buffer and reclassing all values
// // // New classes:
// // // 3 = Water (GLAD 100)
// // // 2 = Water buffer (GLAD 100 within buffer) 
// // // 1 = Uncertain (GLAD 25-75) 
// // // 0 =Land (GLAD 0)
// // var GLAD = GLAD.map(function(image) {
// //   var GLAD_water = image.mask(image.eq(100)) // selecting water pixels
// //   var GLAD_buffer = buffer(GLAD_water) // cuts away a negative buffer around water pixels
// //   var img = image.where(GLAD_buffer.eq(100), 3) //reclass water outside of buffer (references buffered layer to know which pixels to reclass in the original)
// //   var img = img.where(img.eq(100), 2); // reclass water inside buffer
// //   var img = img.where(img.eq(0), 0); // reclass land
// //   var img = img.where(img.gt(3), 1); // reclass uncertain categories (px 25 50 and 77)
// //   return img})
  
// // var GLAD_imgCol_list = GLAD.toList(GLAD.size())



// // //// Load and display exported classification results ////
// // var asset_path = 'users/estherbarvels/SY_Water/classified/' + aoi_name + '/'
// // var asset_name = 'water_1000_' 
// // var year = '2020_'
// // var descr = asset_name.concat(year)
// // var assetId =asset_path.concat(descr)

// // var imgCol = ee.ImageCollection([
// //   ee.Image(assetId+1).set('month', 1),
// //   ee.Image(assetId+2).set('month', 2),
// //   ee.Image(assetId+3).set('month', 3),
// //   ee.Image(assetId+4).set('month', 4),
// //   ee.Image(assetId+5).set('month', 5),
// //   ee.Image(assetId+6).set('month', 6),
// //   ee.Image(assetId+7).set('month', 7),
// //   ee.Image(assetId+8).set('month', 8),
// //   ee.Image(assetId+9).set('month', 9),
// //   ee.Image(assetId+10).set('month', 10),
// //   ee.Image(assetId+11).set('month', 11),
// //   ee.Image(assetId+12).set('month', 12)
// //   ])
  
  

// // var listOfImages = imgCol//  .map(function(img){ return img.clip(geom_display) }) 
// // listOfImages = listOfImages.toList(imgCol.size())
// // var len = listOfImages.size();
// // len.evaluate(function(l) {
// //   for (var i=0; i < l; i++) {

// //     // var img = ee.Image(listOfImages.get(i)); 
// //     // Map.addLayer(img, {palette: ['white', 'blue'], min:0, max:3}, asset_name+(i+1).toString(),false, 0.5);
    
// //     var id = i+1
// //     var mosaick = sentinel2_mosaics.filterMetadata('month', 'equals', id).first().clip(geom_display);
// //     var img_GLAD = ee.Image(GLAD_imgCol_list.get(i))//.clip(geom_display);
// //     Map.addLayer(mosaick, waterVis, 'Sentinel-2 Mosaick MNDWI - '+ id,false);
// //     Map.addLayer(mosaick, rgbVis, 'Sentinel-2 Mosaick RGB -' + id,false);
// //     Map.addLayer(img_GLAD, {bands:['wp'], palette:palette_GLAD,min: 0, max: 3}, 'GLAD reclassified-'+id,false);
// //   } 
// // });
  
// // Map.addLayer(HAND.clip(aoi_fc), {}, 'HAND')
