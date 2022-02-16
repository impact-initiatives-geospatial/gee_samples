/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var syria_training_allyears = ee.FeatureCollection("users/ahnpriscilla/Syria_Agriculture/Checked_AllYears_GEE_750p"),
    syria_adm0_buffer = ee.FeatureCollection("users/ahnpriscilla/Syria_Agriculture/Syria_AOI_Buffer_3km");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
/*************************************************************************************
/////////////////////////////////// 00_Introduction //////////////////////////////////
*************************************************************************************/

/*
This code uses random forest classification to classify agriculture in Syria.
Adapted from a script provided by REACH (contact victor.olsen@reach-initiative.org).

IMPORT ASSETS:p
  - All training sampling points

RESOURCES:
  - https://code.earthengine.google.com/df0de8be0ea629cf4dc8f506c81a3e97
  - https://github.com/ndminhhus/geeguide
  
Contributor: UNOSAT and victor.olsen@reach-initiative.org
*/

/*************************************************************************************
///////////////////////////////////// 01_Variables ///////////////////////////////////
*************************************************************************************/
// -----------------------------------------------------------------------------------
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> FIXED VARIABLES <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// -----------------------------------------------------------------------------------
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

// -----------------------------------------------------------------------------------
// >>>>>>>>>>>>>>>>>>>>>>>>>> USER DEFINES VARIABLES HERE!!! <<<<<<<<<<<<<<<<<<<<<<<<<
// -----------------------------------------------------------------------------------
// Define start year of agricultural season
// e.g.) 2016 would be the Nov 1, 2016 - Oct 31, 2017 agricultural season
var year = 2020;
var endyear = year + 1;
var start = ee.Date(year + '-11-01');
var end = ee.Date(endyear + '-10-31');

// Define AOI
var AOI = syria_adm0_buffer;

// Define bands
var bands = ['blue', 'green', 'red', 'nir', 'swir2', 'NDVI'];

// Sample data
var points = syria_training_allyears;

/*************************************************************************************
///////////////////////////////////// 02_Functions ///////////////////////////////////
*************************************************************************************/
// -----------------------------------------------------------------------------------
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> BUFFER FUNCTION <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
/*
  "bufferBy" creates a buffer around a feature.
*/
// -----------------------------------------------------------------------------------

var bufferBy = function(size) {
  return function(feature) {
    return feature.buffer(size);
  };
};

// -----------------------------------------------------------------------------------
// >>>>>>>>>>>>>>>>>>>>>>>>> RESAMPLE AND REPROJECT FUNCTION <<<<<<<<<<<<<<<<<<<<<<<<<
/*
  "resampleReproject" resamples to 10m and Reproject to WGS 84 (EPSG:4326)
*/
// -----------------------------------------------------------------------------------

var crs = 'EPSG:4326 '; // WGS 84 EPSG:4326
var resampleReproject = function(image) {
  image = image.reproject({
  crs: crs,
  scale: 10});
  return image;
};

// -----------------------------------------------------------------------------------
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> NDVI FUNCTION <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
/*
  "addNDVI" adds an NDVI band.
*/
// -----------------------------------------------------------------------------------

var addNDVI = function(image) {
  return image.addBands(image.normalizedDifference(['nir', 'red']).rename('NDVI'))
                              .copyProperties(image, ["system:time_start"]);
};

// -----------------------------------------------------------------------------------
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> NDWI FUNCTION <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
/*
  "addNDWI" adds an NDWI band.
*/
// -----------------------------------------------------------------------------------

var addNDWI = function(image) {
  return image.addBands(image.normalizedDifference(['nir', 'swir2']).rename('NDWI'))
                              .copyProperties(image, ["system:time_start"]);
};

// -----------------------------------------------------------------------------------
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> CLIP FUNCTION <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
/*
  "clipper" clips image in image collection for a user-defined 'AOI'.
*/
// -----------------------------------------------------------------------------------

var clipper = function(image) {
    return image.clip(AOI).copyProperties(image).copyProperties(image,['system:time_start']);
};

// -----------------------------------------------------------------------------------
// >>>>>>>>>>>>>>>>>>>>>>>>>> LANDSAT-8 CLOUD MASK FUNCTION <<<<<<<<<<<<<<<<<<<<<<<<<<
/*
  Source: https://gis.stackexchange.com/questions/292835/landsat-8-bqa-using-cloud-confidence-to-create-a-cloud-mask
  Adapted by REACH (contact Victor Olsen victor.olsen@reach-initiative.org)

  "l8mask" masks image of cloud and cloud shadows using the QA band.
*/
// -----------------------------------------------------------------------------------

var l8mask = function(image) {
  
  // Radix for binary (base 2) data.
  var radix = 2;
  
  // Extract the QA band.
  var qa = image.select('BQA');
  
  // Function that masks dual QA bits
  var extractQABits = function (qaBand, bitStart, bitEnd) {
    var numBits = bitEnd - bitStart + 1;
    var qaBits = qaBand.rightShift(bitStart).mod(Math.pow(radix, numBits));
    return qaBits;
  };
  
  // Create a mask for the dual QA bit "Cloud Confidence".
  var bitStartCloudConfidence = 5;
  var bitEndCloudConfidence = 6;
  var qaBitsCloudConfidence = extractQABits(qa, bitStartCloudConfidence, bitEndCloudConfidence);
  // Test for clouds, based on the Cloud Confidence value.
  var testCloudConfidence = qaBitsCloudConfidence.gte(2);
  
  // Create a mask for the dual QA bit "Cloud Shadow Confidence".
  var bitStartShadowConfidence = 7;
  var bitEndShadowConfidence = 8;
  var qaBitsShadowConfidence = extractQABits(qa, bitStartShadowConfidence, bitEndShadowConfidence);
  // Test for shadows, based on the Cloud Shadow Confidence value.
  var testShadowConfidence = qaBitsShadowConfidence.gte(2);
  
  // Calculate a composite mask and apply it to the image.   
  var maskComposite = (testCloudConfidence.or(testShadowConfidence)).not();
  
  return image.updateMask(maskComposite);
};


// -----------------------------------------------------------------------------------
// >>>>>>>>>>>>>>>>>>>>>>>>>> SENTINEL-2 CLOUD MASK FUNCTION <<<<<<<<<<<<<<<<<<<<<<<<<
/*
  CloudScore originally written by jdbdcode
  https://developers.google.com/earth-engine/tutorials/community/sentinel-2-s2cloudless

  //adjust the parameters 
  // find images with clouds -> visualise ->  keep CLD_PROB_THRESH as low as possible, will otherwise exclude steep terrain

  Bust clouds using cloudScore and shadows using TDOM
   
  "sentinelCloudScore" computes several indicators of cloudiness and takes the minimum of them.
  "s2mask" masks clouds using sentinelCloudScore
  "simpleTDOM2" finds and masks dark outlier pixels in time series
  "maskS2clouds" is an additional cloud mask function
  "get_s2cloudless" joins the two collections by adding a s2_cloudless_col image as a a property to the corresponding sen2 image
  "add_cloud_bands" adds cloud propability and is_cloud to each sen2 image
  "add_shadow_bands" adds shadow bands
  "add_cld_shdw_mask" final cloud-shadow mask
  
  User Parameter guidelines:
    - CLOUD_FILTER: Maximum image cloud cover percent allowed in image collection
    - CLD_PRB_THRESH: Cloud probability (%); values greater than are considered cloud (the lower, the more pixels are considered clouds)
    - NIR_DRK_THRESH: Near-infrared reflectance; values less than are considered potential cloud shadow (the higher the th, the more pixels are considered as shadows)
    - CLD_PRJ_DIST: Maximum distance (km) to search for cloud shadows from cloud edges
    - BUFFER: Distance (m) to dilate the edge of cloud-identified objects
    - cloudThresh:  Ranges from 1-100. Lower value will mask more pixels out. Generally
                    values 10-30 works well with 20 being used most commonly 
    - cloudHeights: Height of clouds to use to project cloud shadows
    - irSumThresh:  Sum of IR bands to include as shadows within TDOM and the shadow shift
                    method. Lower number masks out less.
    - dilatePixels: Pixels to dilate around clouds
    - contractPixels: Pixels to reduce cloud mask and dark shadows by to reduce inclusion
                      of single-pixel comission errors
*/
// -----------------------------------------------------------------------------------

var cloudThresh = 5;
var cloudHeights = ee.List.sequence(200, 10000, 250);
var irSumThresh = 0.35;
var dilatePixels = 2;
var contractPixels = 1;

var rescale = function(image, exp, thresholds) {
    return image.expression(exp, {image: image})
        .subtract(thresholds[0])
        .divide(thresholds[1] - thresholds[0]);
  };

function sentinelCloudScore(image) {
  
  // Compute several indicators of cloudyness and take the minimum of them.
  var score = ee.Image(1);

  // Clouds are reasonably bright in the blue and cirrus bands.
  score = score.min(rescale(image, 'image.blue', [0.1, 0.5]));
  score = score.min(rescale(image, 'image.cb', [0.1, 0.3]));
  score = score.min(rescale(image, 'image.cb + image.cirrus', [0.15, 0.2]));
  
  // Clouds are reasonably bright in all visible bands.
  score = score.min(rescale(image, 'image.red + image.green + image.blue', [0.2, 0.8])); //[0.2, 0.8]

  // Clouds are moist
  var ndmi = image.normalizedDifference(['nir','swir1']);
  score = score.min(rescale(ndmi, 'image', [-0.1, 0.1]));
  
  // However, clouds are not snow.
  //var ndsi = image.normalizedDifference(['green', 'swir1']);
  //score=score.min(rescale(ndsi, 'image', [0.8, 0.6]));
  
  score = score.multiply(100).byte();
 
  return image.addBands(score.rename('cloudScore'));
}
  
function s2mask(image) {
  image = sentinelCloudScore(image);
  image = image.updateMask(image.select(['cloudScore'])
                .gt(cloudThresh)
                .focal_min(contractPixels)
                .focal_max(dilatePixels)
                .not());
  
  return image;
}

function simpleTDOM2(c) {
  var shadowSumBands = ['nir','swir1'];
  var irSumThresh = 0.4;
  var zShadowThresh = -1.2;
  
  // Get some pixel-wise stats for the time series
  // Extracts stdDev and mean for image in NIR and SWIR1
  var irStdDev = c.select(shadowSumBands).reduce(ee.Reducer.stdDev());
  var irMean = c.select(shadowSumBands).mean();
  var bandNames = ee.Image(c.first()).bandNames();
  
  //Mask out dark outliers
  c = c.map(function(image){
    // For each image, subtracts mean from NIR and SWIR1, then divides by stdDev
    var z = image.select(shadowSumBands).subtract(irMean).divide(irStdDev);
    // Gets sum of NIR and SWIR1
    var irSum = image.select(shadowSumBands).reduce(ee.Reducer.sum());
    // Gets area where z ???? 
    var m = z.lt(zShadowThresh).reduce(ee.Reducer.sum()).eq(2).and(irSum.lt(irSumThresh)).not();
    
    return image.updateMask(image.mask().and(m));
  });
  
  return c.select(bandNames);
}

function maskS2clouds(image) {
   
  var qa = image.select('QA60');
  var cloudBitMask = ee.Number(2).pow(10).int();  // clouds
  var cirrusBitMask = ee.Number(2).pow(11).int(); // cirrus
  var date = image.get('system:time_start');
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0).and(
            qa.bitwiseAnd(cirrusBitMask).eq(0));
  
  return image.updateMask(mask).set('system:time_start', date);   //.divide(10000)
}

// S2 Cloud Mask Parameters
var CLOUD_FILTER = 32;        
var CLD_PRB_THRESH = 45;    
var NIR_DRK_THRESH = 0.19;      
var CLD_PRJ_DIST = 3.3;         
var BUFFER = 33;
var SNOW_THRESH = 7;

function get_s2cloudless(s2filt, s2cloudless) {
  
  // Join the filtered s2cloudless collection to the SR collection by the 'system:index' property.
  return ee.ImageCollection(ee.Join.saveFirst('s2cloudless').apply({
    'primary': s2filt,
    'secondary': s2cloudless,
    'condition': ee.Filter.equals({
      'leftField': 'system:index',
      'rightField': 'system:index'
    })
  })
)}

function add_cloud_bands(image) {
  
    // Get s2cloudless image, subset the probability band.
    var cld_prb = ee.Image(image.get('s2cloudless')).select('probability');

    // Condition s2cloudless by the probability threshold value
    var is_cloud = cld_prb.gt(CLD_PRB_THRESH).rename('clouds');

    // Add the cloud probability layer and cloud mask as image bands.
    return image.addBands(ee.Image([cld_prb, is_cloud]));
}

function add_shadow_bands(image) {
  
  // Identify water pixels from the SCL band.
  var not_water = image.select('SCL').neq(6);

  // Identify dark NIR pixels that are not water (potential cloud shadow pixels).
  var SR_BAND_SCALE = 1e4;
  var dark_pixels = image.select('nir').lt(NIR_DRK_THRESH*SR_BAND_SCALE).multiply(not_water).rename('dark_pixels');

  // Determine the direction to project cloud shadow from clouds (assumes UTM projection).
  var shadow_azimuth = ee.Number(90).subtract(ee.Number(image.get('MEAN_SOLAR_AZIMUTH_ANGLE')));

  // Project shadows from clouds for the distance specified by the CLD_PRJ_DIST input.
  var cld_proj = (image.select('clouds').directionalDistanceTransform(shadow_azimuth, CLD_PRJ_DIST*10)
                    .reproject({'crs': image.select(0).projection(), 'scale': 100})
                    .select('distance')
                    .mask()
                    .rename('cloud_transform'));

  // Identify the intersection of dark pixels with cloud shadow projection.
  var shadows = cld_proj.multiply(dark_pixels).rename('shadows');

  // Add dark pixels, cloud projection, and identified shadows as image bands.
  return image.addBands(ee.Image([dark_pixels, cld_proj, shadows]));
}

function add_cld_shdw_mask(image) {
  
  // Add cloud component bands.
  var img_cloud = add_cloud_bands(image);

  // Add cloud shadow component bands.
  var img_cloud_shadow = add_shadow_bands(img_cloud);

  // Combine cloud and shadow mask, set cloud and shadow as value 1, else 0.
  var is_cld_shdw = img_cloud_shadow.select('clouds').add(img_cloud_shadow.select('shadows')).gt(0);

  // Remove small cloud-shadow patches and dilate remaining pixels by BUFFER input.
  // 20 m scale is for speed, and assumes clouds don't require 10 m precision.
  var is_cld_shdw_buff = (is_cld_shdw.focal_min(2).focal_max(BUFFER*2/20)
                        .reproject({'crs': image.select([0]).projection(), 'scale': 20})
                        .rename('cloudmask'));
  
  // Add the final cloud-shadow mask to the image.
  return img_cloud_shadow.addBands(is_cld_shdw_buff);
}

// Apply cloud and cloud shadow mask
// Define cloud mask application function
function apply_cld_shdw_mask(image) {
  
    // Subset the cloudmask band and invert it so clouds/shadow are 0, else 1.
    var not_cld_shdw = image.select('cloudmask').not();

    // Subset reflectance bands and update their masks, return the result.
    // Selects all bands starting with B + the terrain shadow layer calcualted earlier
    // return image.select('B.*').updateMask(not_cld_shdw);
    // return image.select(['QA60', 'B1','B2','B3','B4','B5','B6','B7','B8','B8A', 'B9', 'B11','B12'])
    //           .updateMask(not_cld_shdw);
    return image.updateMask(not_cld_shdw);
}
//, 'shadow']

// Snow Mask
var rescale = function(image, exp, thresholds) {
    return image.expression(exp, {image: image})
        .subtract(thresholds[0]).divide(thresholds[1] - thresholds[0]);
        
};     

function sentinelSnowScore(image) {
  image = image.divide(10000);
  // image = image.select(['QA60', 'B1','B2','B3','B4','B5','B6','B7','B8','B8A','B9','B11','B12'],
  //                 ['QA60','cb','blue', 'green', 'red', 're1','re2','re3','nir','nir2','waterVapor','swir1','swir2']);

  // Compute several indicators of cloudyness and take the minimum of them.
  var score = ee.Image(1);
  
  // Clouds are reasonably bright in the blue and cirrus bands.
  score = score.min(rescale(image, 'image.blue', [0.1, 0.5]));
  score = score.min(rescale(image, 'image.cb', [0.1, 0.3]));
  // score = score.min(rescale(image, 'image.cb + image.cirrus', [0.15, 0.2]));
  
  // Clouds are reasonably bright in all visible bands.
  score = score.min(rescale(image, 'image.red + image.green + image.blue', [0.2, 0.8]));

  
  //Clouds are moist
  var ndmi = image.normalizedDifference(['nir','swir1']);
  score = score.min(rescale(ndmi, 'image', [-0.1, 0.1]));
  
  // However, clouds are not snow.
  var ndsi = image.normalizedDifference(['green', 'swir1']);
  score=score.min(rescale(ndsi, 'image', [0.05, 0.9])); // 0.6 0.8
  
  score = score.multiply(100).byte();
 
  return image.addBands(score.rename('snowScore'));
}

// Apply snow mask
var snow_areas = ee.FeatureCollection('users/estherbarvels/SY_Water/AOIs/snow_areas');
// Map.addLayer(snow_areas, {}, 'snow_areas', false);

var snow_mask_geom = ee.Image.constant(1).clip(snow_areas).mask();

function s2_apply_snowless(image) {
  var snow_mask = sentinelSnowScore(image).select(['snowScore'],['snowScore']).lte(SNOW_THRESH);
  return image.updateMask(snow_mask.where(snow_mask_geom.neq(1), 1));
  // return image.updateMask(snow_mask);
}

// -----------------------------------------------------------------------------------
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> MOSAIC FUNCTION <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
/*
  "mosaic" creates monthly mosaics for S2, L8, and MODIS imagery and clips to a user-
  defined 'AOI'. Reducer options include qualityMosaic('NDVI'),  mean(), or median()
   
  "s1mosaic" creates monthly mosaics for S1 imagery and clips to AOI using mean().
*/
// -----------------------------------------------------------------------------------

var months = ee.List.sequence(1, 12);

function mosaicker(imageCollection) {
  var monthly = function(step, newlist) {
    newlist = ee.List(newlist);
    var startstep = start.advance(ee.Number(step).subtract(1), 'month');
    var endstep = start.advance(ee.Number(step), 'month').advance(-1, 'day');
    var filtered = imageCollection.filterDate(startstep, endstep);
    
    var mosaic = ee.Image(filtered.median()) // .qualityMosaic('NDVI')
                .set('system:time_start', ee.Date(startstep.millis()))
                .set('system:time_end', ee.Date(endstep.millis()))
                .clip(AOI);
    
    return ee.List(ee.Algorithms.If(filtered.size(), newlist.add(mosaic), newlist));
  };
  return ee.ImageCollection(ee.List(months.iterate(monthly, ee.List([]))));
}

function s1mosaicker(imageCollection) {
  var monthly = function(step, newlist) {
    newlist = ee.List(newlist);
    var startstep = start.advance(ee.Number(step).subtract(1), 'month');
    var endstep = start.advance(ee.Number(step), 'month').advance(-1, 'day');
    var filtered = imageCollection.filterDate(startstep, endstep);
    
    var mosaic = ee.Image(filtered.mean())
                  .set('system:time_start', ee.Date(startstep.millis()))
                  .set('system:time_end', ee.Date(endstep.millis()))
                  .clip(AOI);
    
    return ee.List(ee.Algorithms.If(filtered.size(), newlist.add(mosaic), newlist));
  };
  
  return ee.ImageCollection(ee.List(months.iterate(monthly, ee.List([]))));
}

// -----------------------------------------------------------------------------------
// >>>>>>>>>>>>>>>>>>>>>>>>>>> SENTINEL-1 TEXTURE FUNCTION <<<<<<<<<<<<<<<<<<<<<<<<<<<
/*
  "s1texturize" computes the entropy surrounding S1 pixels.
  *Note, the computation is not normalized.
*/
// -----------------------------------------------------------------------------------

var square = ee.Kernel.square({radius: 4});

function s1texturize(image) {
  var scaled = image.select('VV').multiply(ee.Image(100)).toInt();
  var entropy = scaled.entropy(square)
                      .select(['VV'],['VV_entropy']); //entropy
  var glcm = scaled.glcmTexture({size: 4});
  var inertia = glcm.select('VV_inertia'); //inertia
  
  return entropy.addBands(inertia);
}

// -----------------------------------------------------------------------------------
// >>>>>>>>>>>>>>>>>>>>>>>>>> CORRELATION ADJUSTER FUNCTION <<<<<<<<<<<<<<<<<<<<<<<<<<
/*
  Source: REACH (contact Victor Olsen victor.olsen@reach-initiative.org)
  
  "correlation_adjuster" adjusts filler pixels (l8/modis) to sen2 values.
  *Beware of potential problem if no overlapping pixels exist for sen2 and landsat/modis
*/
// -----------------------------------------------------------------------------------

var correlation_adjuster = function(image) {
  var time = image.get('system:time_start');
  var s2image = s2_mosaic.filterMetadata('system:time_start', 'equals', time).first();
  //var s2image = s2_mosaic.filterMetadata('system:time_start', 'not_less_than', time).first()
  
  //get s2mean where s2 overlaps with filler
  var s2mean = s2image.select(bands).updateMask(image.select(bands)).reduceRegion({
  reducer: ee.Reducer.mean(), // ee.Reducer.mean() or ee.Reducer.median()
  geometry: AOI,
  scale: 1000,
  tileScale: 16,
  bestEffort: true
  //maxPixels: 1e9
  });
  
  //get fillermean where filler overlaps with s2
  var fillermean = image.select(bands).updateMask(s2image.select(bands)).reduceRegion({
  reducer: ee.Reducer.mean(), // ee.Reducer.mean() or ee.Reducer.median()
  geometry: AOI,
  scale: 1000,
  tileScale: 16,
  //maxPixels: 1e9
  bestEffort: true
  });

  var factor_NDVI = ee.Number(s2mean.get('NDVI')).divide(ee.Number(fillermean.get('NDVI')));
  var factor_red = ee.Number(s2mean.get('red')).divide(ee.Number(fillermean.get('red')));
  var factor_green = ee.Number(s2mean.get('green')).divide(ee.Number(fillermean.get('green')));
  var factor_blue = ee.Number(s2mean.get('blue')).divide(ee.Number(fillermean.get('blue')));
  var factor_nir = ee.Number(s2mean.get('nir')).divide(ee.Number(fillermean.get('nir')));
  var factor_swir2 = ee.Number(s2mean.get('swir2')).divide(ee.Number(fillermean.get('swir2')));
  
  var ndvi = image.select('NDVI').multiply(ee.Image(factor_NDVI)).set('system:time_start', time);
  var red = image.select('red').multiply(ee.Image(factor_red));
  var green = image.select('green').multiply(ee.Image(factor_green));
  var blue = image.select('blue').multiply(ee.Image(factor_blue));
  var nir = image.select('nir').multiply(ee.Image(factor_nir));
  var swir2 = image.select('swir2').multiply(ee.Image(factor_swir2));


  return ee.Algorithms.If(fillermean.get('NDVI'),
                          ee.Image(ndvi).addBands(ee.Image(blue)).addBands(ee.Image(green))
                          .addBands(ee.Image(red)).addBands(ee.Image(nir)).addBands(ee.Image(swir2)),
                          ee.Algorithms.If(image.get('type'), image, null ));   //OBS: type refers to a property specifying MODIS or nothing  //.addBands(ee.Image(green))
};

// -----------------------------------------------------------------------------------
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> LAYER STACK FUNCTION <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
/*
  Source: REACH (contact Victor Olsen victor.olsen@reach-initiative.org)
  
  "stackCollection" combines image collection into a stack of data layers.
    - Previous = result of previous iteration, NOT previous image
    - First = starting image used as starting point for adding onto for each iteration.
*/
// -----------------------------------------------------------------------------------

var stackCollection = function(image_collection) {
  var first = ee.Image(image_collection.first()).select([]);
  var appendBands = function(image, previous) {
    return ee.Image(previous).addBands(image);
  };
  return ee.Image(image_collection.iterate(appendBands, first));
};

/*************************************************************************************
//////////////////////////////////////// 03_Data /////////////////////////////////////
*************************************************************************************/
// -----------------------------------------------------------------------------------
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> LOAD IMAGERY <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// Sentinel-2
if (year <= 2016) {
  
  // Sentinel-2 TOA
  var s2 = ee.ImageCollection('COPERNICUS/S2')
              .filterDate(start, end)
              .filterBounds(AOI)
              .select(['B1','B2','B3','B4','B8','B10','B11','B12','QA60'],
                      ['cb','blue','green','red','nir','cirrus','swir1','swir2','QA60'])
              .map(function(image) {
                var rescaled = image.select(['cb','blue','green','red','nir','cirrus','swir1','swir2']).divide(10000);
                return rescaled.addBands(image.select(['QA60']))
                              .copyProperties(image)
                              .copyProperties(image,['system:time_start']);
              })
              .map(addNDVI)
              .sort('system:time_start');
  
  // S2 TOA Cloud Mask
  // var s2_masked = simpleTDOM2(s2.map(s2mask)).map(maskS2clouds).select(bands);
  var s2_masked = s2.map(s2mask).map(maskS2clouds).select(bands);
  
} else {
  
  // Sentinel-2 SR
  var s2 = ee.ImageCollection('COPERNICUS/S2_SR')
              .filterDate(start, end)
              .filterBounds(AOI)
              .select(['B1','B2','B3','B4','B8','B11','B12','SCL','QA60'],
                      ['cb','blue','green','red','nir','swir1','swir2','SCL','QA60'])
              .map(function(image) {
                var rescaled = image.select(['cb','blue','green','red','nir','swir1','swir2']).divide(10000);
                return rescaled.addBands(image.select(['QA60'])).addBands(image.select(['SCL']))
                              .copyProperties(image)
                              .copyProperties(image,['system:time_start']);
              })
              .map(addNDVI)
              .sort('system:time_start');
  
  // S2 SR Cloud Mask
  var s2filt = s2.filter(ee.Filter.lte('CLOUDY_PIXEL_PERCENTAGE', CLOUD_FILTER));
  var s2cloudless = ee.ImageCollection('COPERNICUS/S2_CLOUD_PROBABILITY')
          .filterBounds(AOI)
          .filterDate(start, end);
  
  var s2cloudless = get_s2cloudless(s2filt, s2cloudless);

  var s2_s2cloudless = s2cloudless.map(add_cld_shdw_mask).map(apply_cld_shdw_mask);
  var s2_masked = s2_s2cloudless.map(s2_apply_snowless).select(bands);
}

// Sentinel-1
var s1 = ee.ImageCollection('COPERNICUS/S1_GRD')
            .filterDate(start, end)
            .filterBounds(AOI)
            .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
            .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
            .filter(ee.Filter.eq('instrumentMode', 'IW'))
            .select(['VV', 'VH'])
            .map(function(image) {
              return image.unitScale(-30, 30).copyProperties(image, ['system:time_start']);
            })
            .sort('system:time_start');

// Landsat-8 TOA
var l8 = ee.ImageCollection('LANDSAT/LC08/C01/T1_TOA')
            .filterDate(start, end)
            .filterBounds(AOI)
            .select(['B2','B3','B4','B5','B6','B7','BQA'],
                    ['blue','green','red','nir','swir1','swir2','BQA'])
            .map(addNDVI)
            .sort('system:time_start');

// MODIS
var aqua = ee.ImageCollection("MODIS/006/MYD09A1")
              .filterDate(start, end)
              .filterBounds(AOI)
              .select(['sur_refl_b03','sur_refl_b04','sur_refl_b01','sur_refl_b02','sur_refl_b06','sur_refl_b07'],
                      ['blue','green','red','nir','swir1','swir2'])
              .map(function(image) {
                var rescaled = image.divide(10000);
                return rescaled.copyProperties(image)
                              .copyProperties(image,['system:time_start']);
              })
              .map(addNDVI)
              .sort('system:time_start');

var terra = ee.ImageCollection("MODIS/006/MOD09A1")
              .filterDate(start, end)
              .filterBounds(AOI)
              .select(['sur_refl_b03','sur_refl_b04','sur_refl_b01','sur_refl_b02','sur_refl_b06','sur_refl_b07'],
                      ['blue','green','red','nir','swir1','swir2'])
              .map(function(image) {
                var rescaled = image.divide(10000);
                return rescaled.copyProperties(image)
                              .copyProperties(image,['system:time_start']);
              })
              .map(addNDVI)
              .sort('system:time_start');

var modis = terra.merge(aqua).sort('system:time_start').select(bands);

// -----------------------------------------------------------------------------------
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> PREPARE IMAGERY <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// Cloud Mask
var l8_masked = l8.map(l8mask).select(bands);

// Mosaic
var s2_mosaic = mosaicker(s2_masked);
var l8_mosaic = mosaicker(l8_masked);
var modis_mosaic = mosaicker(modis);
var s1_mosaic = s1mosaicker(s1);

// print(s2_mosaic, l8_mosaic, modis_mosaic, s1_mosaic);

// Corrections
var l8_mosaic_adj = l8_mosaic.map(correlation_adjuster, true);
var modis_mosaic_adj = modis_mosaic.map(correlation_adjuster, true);

// -----------------------------------------------------------------------------------
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>> RESAMPLE AND REPROJECT <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// // Modis Terra
// var modis_mosaic_10m = modis_mosaic_adj.map(resampleReproject);
// var modis_mosaic_10m = modis_mosaic.map(resampleReproject);
// var l8_mosaic_10m = l8_mosaic_adj.map(resampleReproject);
// var s2_mosaic_10m = s2_mosaic.map(resampleReproject);
// var s1_mosaic_10m = s1_mosaic.map(resampleReproject);

// print(modis_mosaic_10m, l8_mosaic_10m, s2_mosaic_10m, s1_mosaic_10m);

// -----------------------------------------------------------------------------------
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> GAP FILL SENTINEL-2 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// // GAP FILL IF RESAMPLE AND REPROJECT WAS USED
// // Filling gaps with Landsat (10m)
// var s2_l8 = s2_mosaic_10m.map(function(image) {
//   var time = ee.Date(image.get('system:time_start'));
//   var l8_filler = l8_mosaic_10m.filterMetadata('system:time_start', 'equals', time).first();
//   return ee.Algorithms.If(l8_filler, image.select(bands).unmask(l8_filler.select(bands).toFloat()),
//   image.select(bands).toFloat());
// }, true);

// // Filling gaps with MODIS (10m)
// var s2_l8_modis = s2_l8.map(function(image) {
//   var time = ee.Date(image.get('system:time_start'));
//   var modis_filler = modis_mosaic_10m.filterMetadata('system:time_start', 'equals', time).first().toFloat();
//   // return image.select(bands).unmask(modis_filler).select(bands);
//   return ee.Algorithms.If(modis_filler, image.select(bands).unmask(modis_filler.select(bands).toFloat()),
//   image.select(bands).toFloat());
// }); // true

// // GAP FILL IF RESAMPLE AND REPROJECT WAS NOT USED
// Filling gaps with Landsat
var s2_l8 = s2_mosaic.map(function(image) {
  var time = ee.Date(image.get('system:time_start'));
  var l8_filler = l8_mosaic_adj.filterMetadata('system:time_start', 'equals', time).first();
  return ee.Algorithms.If(l8_filler, image.select(bands).unmask(l8_filler.select(bands).toFloat()),
  image.select(bands).toFloat());
}, true);

// Filling gaps with MODIS
var s2_l8_modis = s2_l8.map(function(image) {
  var time = ee.Date(image.get('system:time_start'));
  var modis_filler = modis_mosaic.filterMetadata('system:time_start', 'equals', time).first().toFloat();
  // return image.select(bands).unmask(modis_filler).select(bands);
  return ee.Algorithms.If(modis_filler, image.select(bands).unmask(modis_filler.select(bands).toFloat()),
  image.select(bands).toFloat());
}); // true

// print(s2_l8, s2_l8_modis);

// -----------------------------------------------------------------------------------
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> OTHER DATA <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// Texture
var s1_texture = s1_mosaic.map(s1texturize);

// MNDWI
var ndwi = s2_l8_modis.map(addNDWI).select(['NDWI']);

//  Slope
var dem = ee.Image('USGS/SRTMGL1_003');
var elevation = dem.select('elevation');
var slope = ee.Terrain.slope(elevation);

// Seasonality Metrics
// Optical metrics
var max = ee.Image(s2_l8_modis.select('NDVI').reduce(ee.Reducer.max()));
var min = ee.Image(s2_l8_modis.select('NDVI').reduce(ee.Reducer.min()));
var amp = max.subtract(min);
var std = ee.Image(s2_l8_modis.select('NDVI').reduce(ee.Reducer.stdDev()));

// SAR metrics
var vv_max = ee.Image(s1_mosaic.select('VV').reduce(ee.Reducer.max()));
var vv_min = ee.Image(s1_mosaic.select('VV').reduce(ee.Reducer.min()));
var vv_amp = vv_max.subtract(vv_min);
var vv_std = ee.Image(s1_mosaic.select('VV').reduce(ee.Reducer.stdDev()));

var metrics = ee.Image.cat([max, min, amp, std, vv_max, vv_min, vv_amp, vv_std])
                      .select(['NDVI_max','NDVI_min','NDVI_max_1','NDVI_stdDev','VV_max','VV_min','VV_max_1','VV_stdDev'],
                              ['max','min','amp','std','vv_max','vv_min','vv_amp','vv_std']);

/*************************************************************************************
/////////////////////////////////// 04_Layer_Stack ///////////////////////////////////
*************************************************************************************/
print('s2_l8_modis', s2_l8_modis.size())
// Image collection of all the layers
var imgcol = s2_l8_modis.merge(s1_mosaic)
                        .merge(metrics)
                        .merge(ndwi)
                        .merge(s1_texture);

var layer_stack = stackCollection(imgcol).clip(AOI);

// print(imgcol, layer_stack);

/*************************************************************************************
//////////////////////////// 05_Random_Forest_Classification /////////////////////////
*************************************************************************************/
// -----------------------------------------------------------------------------------
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> SAMPLE DATA <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// // Add a random column to sampling points (by default named 'random')
// var points_rand = points.randomColumn();

// // Split training and validation data
// var training = points_rand.filter(ee.Filter.gt('random', 0.2)); // training 80%
// var validation = points_rand.filter(ee.Filter.lte('random', 0.2)); // validation 20%

// // print(training, validation);

// -----------------------------------------------------------------------------------
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> CLASSIFICATION <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// This property stores the land cover labels as consecutive integers starting from zero.
var label = 'label_' + year;
var trainbands = layer_stack.bandNames();

// Overlay the points on the imagery to get training.
var train = layer_stack.select(trainbands).sampleRegions({
  collection: points,
  properties: [label],
  scale: 10,
  tileScale: 4,
  geometries: true
});

var numberOfTrees = 100;
var variablesPerSplit = 8; // default NULL
// var minLeafPopulation = 1; // default 1
// var bagFraction = 0.5; // default 0.5

// Train a Random Forest classifier with default parameters.
var trained = ee.Classifier.smileRandomForest(numberOfTrees, variablesPerSplit).train({
  features: train,
  classProperty: label,
  inputProperties: trainbands,
}); 

// Classify the image with the same bands used for training.
var classified = layer_stack.select(trainbands).classify(trained).byte();
print(classified);

// -----------------------------------------------------------------------------------
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> VALIDATION <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

// // Get classified band names
// var classbands = classified.bandNames();

// // Get a confusion matrix representing resubstitution accuracy.
// var trainAccuracy = trained.confusionMatrix();
// print('Resubstitution/Training error matrix: ', trainAccuracy);
// print('Training overall accuracy: ', trainAccuracy.accuracy());

// // Overlay the points on the classification to get validation.
// var vali_train = classified.select(classbands).sampleRegions({
//   collection: validation,
//   properties: [label],
//   //properties: [label_label],
//   scale: 10,
//   tileScale: 4,
//   geometries: true
// });

// // Train a Random Forest classifier with default parameters for validation.
// var vali_trained = ee.Classifier.smileRandomForest(numberOfTrees).train({
//   features: vali_train,
//   classProperty: label,
//   //classProperty: label_label,
//   inputProperties: classbands,
// });

// // Validation confusion matrix
// var confusionMatrix = vali_trained.confusionMatrix();

// // Validation overall accuracy
// print('Validation overall accuracy:', confusionMatrix.accuracy());

// // Calculate kappa statistic.
// print('Kappa statistic:', confusionMatrix.kappa());

/*************************************************************************************
//////////////////////////////////////// 07_Map //////////////////////////////////////
*************************************************************************************/
// Visualization Parameters
var rgbVis = {
  min: 0.0,
  max: 0.3,
  bands: ['red', 'green', 'blue'],
};

var ndviVis = {
  min: 1,
  max: 0,
  bands: ["NDVI"],
  palette: ["#bae1eb","white","#ccd6a8","green","#65934f"]
};

var rfVis = {
  min: 0,
  max: 1,
  palette: ['white', 'green']
};

// Map
Map.centerObject(AOI);
Map.addLayer(ee.Image().paint(AOI, 0, 2), {palette: 'black'}, 'syria');
Map.addLayer(s2_mosaic.first(), rgbVis, 's2', false);
Map.addLayer(l8_mosaic.first(), rgbVis, 'l8', false);
Map.addLayer(modis_mosaic.first(), rgbVis, 'modis', false);
Map.addLayer(s2_l8.first(), rgbVis, 's2 + l8', false);
Map.addLayer(s2_l8_modis.first(), rgbVis, 's2 + l8 + modis', false);
Map.addLayer(s2_l8_modis.select(['NDVI']).first(), ndviVis, 'ndvi', false);
Map.addLayer(classified, rfVis, 'RF classified', false);
Map.addLayer(points, {color: 'black'}, 'training', false);

// /*************************************************************************************
// ////////////////////////////////////// 08_Export /////////////////////////////////////
// *************************************************************************************/

// Export classified image
Export.image.toDrive({
  image: classified,
  description: 'Syria_classified_' + year + '_' + endyear,
  // folder: 'GEEOutputs',
  region: AOI,
  crs: crs,
  scale: 10,
  maxPixels: 1e13
});

// // Export gap-filled image
// Export.image.toDrive({
//   image: s2_l8_modis.median(), // median reducer
//   description: 'Syria_' + year + '_' + endyear,
//   // folder: 'GEEOutputs',
//   region: AOI,
//   crs: crs,
//   scale: 10,
//   maxPixels: 1e13
// });

// // Export training points
// Export.table.toDrive({
//   collection: training,
//   description: 'Syria_training_' + year + '_' + endyear,
//   // folder: 'GEEOutputs',
//   fileFormat: 'SHP'
// });

// // Export validation points
// Export.table.toDrive({
//   collection: validation,
//   description: 'Syria_validation_' + year + '_' + endyear,
//   // folder: 'GEEOutputs',
//   fileFormat: 'SHP'
// });



