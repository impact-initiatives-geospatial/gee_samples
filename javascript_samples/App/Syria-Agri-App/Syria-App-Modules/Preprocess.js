

exports.calculateIndices = function(sentinel2){

  return sentinel2.map(function(image) {
              return image.addBands(image.normalizedDifference(['B8','B4']).select(['nd'], ['NDVI']));    //.addBands(image.metadata('system:time_start'))
            })
            .map(function(image) {
              return image.addBands(image.normalizedDifference(['B3','B11']).select(['nd'], ['MNDWI']));
            })
            .select(['NDVI','B2','B3','B4'],
                    ['NDVI', 'blue', 'green', 'red'])
}



exports.filterCloudsAndShadows = function(sentinel2, AOI, START_DATE, END_DATE,isTOA, coverage ) {
// Original code: https://developers.google.com/earth-engine/tutorials/community/sentinel-2-s2cloudless

var CLOUD_FILTER = coverage         //Maximum image cloud cover percent allowed in image collection
// var CLD_PRB_THRESH = 40       //Cloud probability (%); values greater than are considered cloud
// var NIR_DRK_THRESH = 0.20     //Near-infrared reflectance; values less than are considered potential cloud shadow
// var CLD_PRJ_DIST = 1          //Maximum distance (km) to search for cloud shadows from cloud edges
// var BUFFER = 50               //Distance (m) to dilate the edge of cloud-identified objects

var CLD_PRB_THRESH = 40;
var NIR_DRK_THRESH = 0.19;
var CLD_PRJ_DIST = 3.3;
var BUFFER = 33;


// Import and filter S2 SR. Loading s2cloudless collections based on predefined parameters
var s2_sr_col = sentinel2.filter(ee.Filter.lte('CLOUDY_PIXEL_PERCENTAGE', CLOUD_FILTER))

var get_s2_sr_cld_col = function(aoi, start_date, end_date) {

    // Import and filter s2cloudless.
    var s2_cloudless_col = ee.ImageCollection('COPERNICUS/S2_CLOUD_PROBABILITY')
        .filterBounds(aoi)
        .filterDate(start_date, end_date)

    // Join the filtered s2cloudless collection to the SR collection by the 'system:index' property.
    return ee.ImageCollection(ee.Join.saveFirst('s2cloudless').apply({
        'primary': s2_sr_col,
        'secondary': s2_cloudless_col,
        'condition': ee.Filter.equals({
            'leftField': 'system:index',
            'rightField': 'system:index'
          })
    }))}

//Apply the get_s2_sr_cld_col function to build a collection according to the parameters defined above.
var s2_sr_cld_col = get_s2_sr_cld_col(AOI, START_DATE, END_DATE)

//Define cloud mask component functions
// adding cloud propability and is_cloud to each sen2 image

var add_cloud_bands = function(img) {

    // Get s2cloudless image, subset the probability band.
    var cld_prb = ee.Image(img.get('s2cloudless')).select('probability')

    // Condition s2cloudless by the probability threshold value
    var is_cloud = cld_prb.gt(CLD_PRB_THRESH).rename('clouds')

    // Add the cloud probability layer and cloud mask as image bands.
    return img.addBands(ee.Image([cld_prb, is_cloud]))
}

//Cloud shadow components
var add_shadow_bands = function(img) {

    // Identify water pixels from the SCL band.
    // var not_water = img.select('SCL').neq(6) // Uncomment for exporting of other land cover classes

    if(isTOA){
    // var not_water = GLC10_LULC.neq(60)
    // Map.addLayer(not_water, {min: 10, max: 90, palette: discrete_colors}, 'NotWater', false)
    }
    // Identify dark NIR pixels that are not water (potential cloud shadow pixels).
    var SR_BAND_SCALE = 1e4
    var dark_pixels = img.select('B8').lt(NIR_DRK_THRESH*SR_BAND_SCALE).rename('dark_pixels')
                                                          // .multiply(not_water)


    // Determine the direction to project cloud shadow from clouds (assumes UTM projection).
    var shadow_azimuth = ee.Number(90).subtract(ee.Number(img.get('MEAN_SOLAR_AZIMUTH_ANGLE')));

    // Project shadows from clouds for the distance specified by the CLD_PRJ_DIST input.
    var cld_proj = (img.select('clouds').directionalDistanceTransform(shadow_azimuth, CLD_PRJ_DIST*10)
        .reproject({'crs': img.select(0).projection(), 'scale': 100})
        .select('distance')
        .mask()
        .rename('cloud_transform'))

    // Identify the intersection of dark pixels with cloud shadow projection.
    var shadows = cld_proj.multiply(dark_pixels).rename('shadows')

    // Add dark pixels, cloud projection, and identified shadows as image bands.
    return img.addBands(ee.Image([dark_pixels, cld_proj, shadows]))}

//Final cloud-shadow mask
var add_cld_shdw_mask = function(img) {
    // Add cloud component bands.
    var img_cloud = add_cloud_bands(img)

    // Add cloud shadow component bands.
    var img_cloud_shadow = add_shadow_bands(img_cloud)

    // Combine cloud and shadow mask, set cloud and shadow as value 1, else 0.
    var is_cld_shdw = img_cloud_shadow.select('clouds').add(img_cloud_shadow.select('shadows')).gt(0)

    // Remove small cloud-shadow patches and dilate remaining pixels by BUFFER input.
    // 20 m scale is for speed, and assumes clouds don't require 10 m precision.
    var is_cld_shdw = (is_cld_shdw.focal_min(2).focal_max(BUFFER*2/20)
        .reproject({'crs': img.select([0]).projection(), 'scale': 20})
        .rename('cloudmask'))

    // Add the final cloud-shadow mask to the image.
    return img_cloud_shadow.addBands(is_cld_shdw)

}

// Apply cloud and cloud shadow mask. Define cloud mask application function
var apply_cld_shdw_mask = function(img) {
    // Subset the cloudmask band and invert it so clouds/shadow are 0, else 1.
    var not_cld_shdw = img.select('cloudmask').not()

    // Subset reflectance bands and update their masks, return the result.
    return img.select('B.*').updateMask(not_cld_shdw)
}

//Process the collection
var s2_cloudless = s2_sr_cld_col.map(add_cld_shdw_mask)
                            .map(apply_cld_shdw_mask)

if(isTOA){
  var s2_cloudless = s2_cloudless.map(function(image){    // Necessary only for TOA image collections
  return image.toFloat();
  });
}

return s2_cloudless
}



exports.generateMosaicCollection = function(imageCollection, temporalResolution, range, reducer){
  var temporal_composites = function(date, newlist) {
    date = ee.Date(date);
    newlist = ee.List(newlist);
    var filtered = imageCollection.filterDate(date, date.advance(temporalResolution, 'day'));
    var filtered_addedQA = filtered.map(function(image) {return image.addBands(image.metadata('system:time_start'))});
    var image = ee.Image(filtered_addedQA.reduce(reducer)).set('system:time_start', date)//.clip(clip_feature); //filtered_addedQA.first().get('system:time_start')); // date);      qualityMosaic('system:time_start'))                  //Change to qualityMosaic()
    return ee.List(ee.Algorithms.If(filtered.size(), newlist.add(image), newlist));
};
  var imageCollection_unfiltered = ee.ImageCollection(ee.List(range.iterate(temporal_composites, ee.List([]))));
  return imageCollection_unfiltered.limit(range.size().subtract(1), 'system:time_start');
}



// Adding month to metadata
exports.setDateMetada = function(mosaicCollection){ mosaicCollection = mosaicCollection.map(function(image) {
  var number_of_month = ee.Number.parse(image.get('system:index')).add(ee.Number(1))
  var dataset_year = ee.Date(image.get('system:time_start')).get("year")
  return image.set('year', dataset_year).set('month', number_of_month)
})
return mosaicCollection
}
