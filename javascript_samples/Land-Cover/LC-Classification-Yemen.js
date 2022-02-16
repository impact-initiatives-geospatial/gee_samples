/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var hajjah_area = 
    /* color: #d63000 */
    /* shown: false */
    ee.Geometry.Polygon(
        [[[42.70997522099318, 15.857863727736866],
          [42.92146203739943, 15.720430248422067],
          [43.06153772099318, 15.731005360329396],
          [43.20435998661818, 15.768013920526826],
          [43.17414758427443, 15.511459633886375],
          [43.22083947880568, 15.439990616949702],
          [43.67402551396193, 15.461169194434378],
          [43.75092981083693, 15.55644596190589],
          [43.79762170536818, 15.675479897348636],
          [43.73170373661818, 15.958236747579145],
          [43.58338830693068, 16.227409781605644],
          [43.59162805302443, 16.567307461953813],
          [43.53912243195667, 16.633519707216607],
          [43.32488903351917, 16.599305180890738],
          [43.20129284211292, 16.680883589361322],
          [43.14361461945667, 16.712452996216484],
          [42.93487438508167, 16.53085786431311],
          [42.70690807648792, 16.45711822131349],
          [42.73437389680042, 16.30164658638206],
          [42.73437389680042, 16.053691371874113]]]),
    sen2_3std = {"opacity":1,"bands":["red","green","blue"],"min":0.05764464249028858,"max":0.33161699384485077,"gamma":1},
    sand = 
    /* color: #ffc82d */
    /* shown: false */
    ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([42.80504353260233, 16.302038936521473]),
            {
              "class": 1,
              "system:index": "0"
            }),
        ee.Feature(
            ee.Geometry.Point([42.80045159076884, 16.305292915217954]),
            {
              "class": 1,
              "system:index": "1"
            }),
        ee.Feature(
            ee.Geometry.Point([42.810000254861855, 16.30370712222573]),
            {
              "class": 1,
              "system:index": "2"
            }),
        ee.Feature(
            ee.Geometry.Point([42.83725269441765, 16.31240929481154]),
            {
              "class": 1,
              "system:index": "3"
            }),
        ee.Feature(
            ee.Geometry.Point([42.83218868379753, 16.328142388572406]),
            {
              "class": 1,
              "system:index": "4"
            }),
        ee.Feature(
            ee.Geometry.Point([42.80635364656609, 16.330613440162377]),
            {
              "class": 1,
              "system:index": "5"
            }),
        ee.Feature(
            ee.Geometry.Point([42.803950387288744, 16.31957583470135]),
            {
              "class": 1,
              "system:index": "6"
            })]),
    water = /* color: #00ffff */ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([42.78238769558022, 16.30492859343583]),
            {
              "class": 2,
              "system:index": "0"
            }),
        ee.Feature(
            ee.Geometry.Point([42.78489597444695, 16.31702227011943]),
            {
              "class": 2,
              "system:index": "1"
            }),
        ee.Feature(
            ee.Geometry.Point([42.78352268343132, 16.325424195763432]),
            {
              "class": 2,
              "system:index": "2"
            }),
        ee.Feature(
            ee.Geometry.Point([42.78461062144867, 16.297006622493377]),
            {
              "class": 2,
              "system:index": "3"
            }),
        ee.Feature(
            ee.Geometry.Point([42.791992060657655, 16.2914045659275]),
            {
              "class": 2,
              "system:index": "4"
            }),
        ee.Feature(
            ee.Geometry.Point([42.782035700794374, 16.28950971644453]),
            {
              "class": 2,
              "system:index": "5"
            })]),
    test_area = 
    /* color: #d63000 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[42.77818784877033, 16.333198761496252],
          [42.77818784877033, 16.286079293424844],
          [42.848225690567205, 16.286079293424844],
          [42.848225690567205, 16.333198761496252]]], null, false),
    urban = /* color: #98ff00 */ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([42.81250547161985, 16.320593877507207]),
            {
              "class": 3,
              "system:index": "0"
            }),
        ee.Feature(
            ee.Geometry.Point([42.81430791607786, 16.31989371353149]),
            {
              "class": 3,
              "system:index": "1"
            }),
        ee.Feature(
            ee.Geometry.Point([42.81572412243772, 16.32203538368602]),
            {
              "class": 3,
              "system:index": "2"
            }),
        ee.Feature(
            ee.Geometry.Point([42.80995200863767, 16.32343569380459]),
            {
              "class": 3,
              "system:index": "3"
            }),
        ee.Feature(
            ee.Geometry.Point([42.80857871762205, 16.323023838927753]),
            {
              "class": 3,
              "system:index": "4"
            }),
        ee.Feature(
            ee.Geometry.Point([42.813900220307595, 16.316639977480552]),
            {
              "class": 3,
              "system:index": "5"
            })]),
    vegetation = /* color: #0b4a8b */ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([42.82818001787397, 16.302861354592846]),
            {
              "class": 4,
              "system:index": "0"
            }),
        ee.Feature(
            ee.Geometry.Point([42.827804508611884, 16.303196021212056]),
            {
              "class": 4,
              "system:index": "1"
            }),
        ee.Feature(
            ee.Geometry.Point([42.82466632406446, 16.302719422605534]),
            {
              "class": 4,
              "system:index": "2"
            }),
        ee.Feature(
            ee.Geometry.Point([42.82514912168714, 16.301766906100756]),
            {
              "class": 4,
              "system:index": "3"
            }),
        ee.Feature(
            ee.Geometry.Point([42.82212317353557, 16.301451638170068]),
            {
              "class": 4,
              "system:index": "4"
            }),
        ee.Feature(
            ee.Geometry.Point([42.82086253529857, 16.302069488235706]),
            {
              "class": 4,
              "system:index": "5"
            }),
        ee.Feature(
            ee.Geometry.Point([42.823077687403156, 16.305618546162943]),
            {
              "class": 4,
              "system:index": "6"
            })]);
/***** End of imports. If edited, may not auto-convert in the playground. *****/

var clip_feature = test_area //hajjah_area

var training_points = sand.merge(water).merge(urban).merge(vegetation)







/////////////////////////// Loading Imagery //////////////////////////////////////////////

// Filters
var sen2_selection = clip_feature.buffer(4000); //OBS changed from 40000
var selection_bands = ['NDVI', 'blue', 'red', 'green', 'nir']; //['NDWI', 'NDVI', 'blue', 'red', 'green', 'nir', 'swir1','swir2'];
var start = ee.Date('2020-01-01');
var end = ee.Date('2020-11-16');


var sentinel2 = ee.ImageCollection('COPERNICUS/S2')
                    .filterDate(start, end)
                    .filterBounds(sen2_selection)
                    .map(function(image) {
                    return image.addBands(image.normalizedDifference(['B8','B4']).select(['nd'], ['NDVI']));    //.addBands(image.metadata('system:time_start'))
                    })
                    .map(function(image) {
                    return image.addBands(image.normalizedDifference(['B8','B12']).select(['nd'], ['NDWI']));
                    })
                    .map(function(img) {
                    var t = img.select(['B1','B2','B3','B4', 'B8','B10', 'B11','B12']).divide(10000);//Rescale to 0-1
                    t = t.addBands(img.select(['QA60']));                                                                   //Is this necessary?
                    t = t.addBands(img.select(['NDVI']));
                    t = t.addBands(img.select(['NDWI']))
                    var out = t.copyProperties(img).copyProperties(img,['system:time_start']);
                    return out;
                    })
                    .select(['NDWI','NDVI', 'QA60', 'B1','B2','B3','B4', 'B8','B10', 'B11','B12'],
                            ['NDWI','NDVI', 'QA60','cb', 'blue', 'green', 'red', 'nir', 'cirrus','swir1', 'swir2'])
                    .sort('system:time_start');



//var dem = ee.Image('USGS/SRTMGL1_003');
//var elevation = dem.select('elevation');
//var slope = ee.Terrain.slope(elevation);








////////////////// Mosaicing //////////////////////////

// Inspiration: https://code.earthengine.google.com/20ad3c83a17ca27b28640fb922819208

// Date range
var diff = end.difference(start, 'day');
var temporalResolution = 30; // days
var range = ee.List.sequence(0, diff.subtract(1), temporalResolution).map(function(day){return start.advance(day,'day')});



// Mosaic maker function (same code used for Sentinel 2)  - Inspiration: https://code.earthengine.google.com/20ad3c83a17ca27b28640fb922819208
function mosaic_maker(imageCollection){
  var temporal_composites = function(date, newlist) {
    date = ee.Date(date);
    newlist = ee.List(newlist);
    var filtered = imageCollection.filterDate(date, date.advance(temporalResolution, 'day'));
    var filtered_addedQA = filtered.map(function(image) {return image.addBands(image.metadata('system:time_start'))});
    var image = ee.Image(filtered_addedQA.qualityMosaic('NDVI')).set('system:time_start', date).clip(clip_feature); //filtered_addedQA.first().get('system:time_start')); // date);      qualityMosaic('system:time_start'))                  //Change to qualityMosaic()
    return ee.List(ee.Algorithms.If(filtered.size(), newlist.add(image), newlist));
};
  var imageCollection_unfiltered = ee.ImageCollection(ee.List(range.iterate(temporal_composites, ee.List([]))));
  return imageCollection_unfiltered.limit(range.size().subtract(1), 'system:time_start');
}









//////////////////////////// Cloud Masking Sentinel 2///////////////////////////////////
//Output: sentinel2_masked

//User Params
var cloudThresh =5;//Ranges from 1-100.Lower value will mask more pixels out. Generally 10-30 works well with 20 being used most commonly 
var cloudHeights = ee.List.sequence(200,10000,250);//Height of clouds to use to project cloud shadows
var irSumThresh =0.35;//Sum of IR bands to include as shadows within TDOM and the shadow shift method (lower number masks out less)
var dilatePixels = 2; //Pixels to dilate around clouds
var contractPixels = 1;//Pixels to reduce cloud mask and dark shadows by to reduce inclusion of single-pixel comission errors

var rescale = function(img, exp, thresholds) {
    return img.expression(exp, {img: img})
        .subtract(thresholds[0]).divide(thresholds[1] - thresholds[0]);
  };

//Cloud masking algorithm for Sentinel2
function sentinelCloudScore(img) {

  // Compute several indicators of cloudyness and take the minimum of them.
  var score = ee.Image(1);

  // Clouds are reasonably bright in the blue and cirrus bands.
  score = score.min(rescale(img, 'img.blue', [0.1, 0.5]));
  score = score.min(rescale(img, 'img.cb', [0.1, 0.3]));
  score = score.min(rescale(img, 'img.cb + img.cirrus', [0.15, 0.2]));
  
  // Clouds are reasonably bright in all visible bands.
  score = score.min(rescale(img, 'img.red + img.green + img.blue', [0.2, 0.8])); //[0.2, 0.8]

  
  //Clouds are moist
  var ndmi = img.normalizedDifference(['nir','swir1']);
  score=score.min(rescale(ndmi, 'img', [-0.1, 0.1]));
  
  // However, clouds are not snow.
  //var ndsi = img.normalizedDifference(['green', 'swir1']);
  //score=score.min(rescale(ndsi, 'img', [0.8, 0.6]));
  
  score = score.multiply(100).byte();
 
  return img.addBands(score.rename('cloudScore'));
}
 

//Function to bust clouds from S2 image
function bustClouds(img){
  img = sentinelCloudScore(img);
  img = img.updateMask(img.select(['cloudScore']).gt(cloudThresh).focal_min(contractPixels).focal_max(dilatePixels).not());
  return img;
}

// QA60 cloud masking (additional cloud mask)
function maskS2clouds(image) {
  var qa = image.select('QA60');
  var cloudBitMask = ee.Number(2).pow(10).int();  // clouds
  var cirrusBitMask = ee.Number(2).pow(11).int(); // cirrus
  var date = image.get('system:time_start');
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0).and(
            qa.bitwiseAnd(cirrusBitMask).eq(0));
  return image.updateMask(mask).set('system:time_start', date);   //.divide(10000)
}

// simpleTDOM2
function simpleTDOM2(c){
  var shadowSumBands = ['nir','swir1'];
  var irSumThresh = 0.4;
  var zShadowThresh = -1.2;
  
  //Get some pixel-wise stats for the time series
  //Extracts stdDev and mean for image in NIR and SWIR1
  var irStdDev = c.select(shadowSumBands).reduce(ee.Reducer.stdDev());
  var irMean = c.select(shadowSumBands).mean();
  var bandNames = ee.Image(c.first()).bandNames();
  //Mask out dark dark outliers
  c = c.map(function(img){
    //For each image, subtracts mean from NIR and SWIR1, then divides by stdDev
    var z = img.select(shadowSumBands).subtract(irMean).divide(irStdDev);
    //Gets sum of NIR and SWIR1
    var irSum = img.select(shadowSumBands).reduce(ee.Reducer.sum());
    //Gets area where z ???? 
    var m = z.lt(zShadowThresh).reduce(ee.Reducer.sum()).eq(2).and(irSum.lt(irSumThresh)).not();
    
    return img.updateMask(img.mask().and(m));
  });
  
  return c.select(bandNames);
}


// Applying the cloud mask to dataset
// Cloud masking with simpleTDOM2 and cloudScore and QA60band
var sentinel2_masked = simpleTDOM2(sentinel2.map(bustClouds)).map(maskS2clouds).select(selection_bands);











//////////////////////////// Mosaicking Sentinel 2/////////////////////////////////////////////////////////
//Output: sentinel2_mosaics

var sentinel2_mosaics = mosaic_maker(sentinel2_masked);

var sentinel2_mosaics_meta = ee.Number.parse(sentinel2_mosaics.first().get('system:index')).add(ee.Number(1))

var sentinel2_mosaics_meta = sentinel2_mosaics.map(function(image) {
  var number_of_month = ee.Number.parse(image.get('system:index')).add(ee.Number(1))
  return image.set('month', number_of_month)
})





//Gap filling with constant value
var sentinel2_mosaics_filled = sentinel2_mosaics_meta.map(function(image) {
  return image.select(selection_bands).unmask();
});




// Map.addLayer(sentinel2_mosaics_filled.filterMetadata('month', 'equals', 1), sen2_3std, '1', false)
// Map.addLayer(sentinel2_mosaics_filled.filterMetadata('month', 'equals', 2), sen2_3std, '2', false)
// Map.addLayer(sentinel2_mosaics_filled.filterMetadata('month', 'equals', 3), sen2_3std, '3', false)
// Map.addLayer(sentinel2_mosaics_filled.filterMetadata('month', 'equals', 4), sen2_3std, '4', false)
// Map.addLayer(sentinel2_mosaics_filled.filterMetadata('month', 'equals', 5), sen2_3std, '5', false)
// Map.addLayer(sentinel2_mosaics_filled.filterMetadata('month', 'equals', 6), sen2_3std, '6', false)
// Map.addLayer(sentinel2_mosaics_filled.filterMetadata('month', 'equals', 7), sen2_3std, '7', false)
// Map.addLayer(sentinel2_mosaics_filled.filterMetadata('month', 'equals', 8), sen2_3std, '8', false)
// Map.addLayer(sentinel2_mosaics_filled.filterMetadata('month', 'equals', 9), sen2_3std, '9', false)
// Map.addLayer(sentinel2_mosaics_filled.filterMetadata('month', 'equals', 10), sen2_3std, '10', false)








/////////////////////////////// Layer Stacking ////////////////////////////////////////////

var image_collection = sentinel2_mosaics_filled.limit(2) //OBS: limit is applied for the trail

// Layer stack maker
var stackCollection = function(image_collection) {
  var first = ee.Image(image_collection.first()).select([]);
  var appendBands = function(image, previous) {   //Previous = result of previous iteration, NOT previous image
    return ee.Image(previous).addBands(image);
  };
  return ee.Image(image_collection.iterate(appendBands, first));   //First is the starting image to be used as starting point for adding onto for each interation
};

var layer_stack = stackCollection(image_collection).clip(clip_feature);     //.select(layer_selection)







///////////////////////////////////// Sampling //////////////////////////////////////
//Output: training_sample
// Used subset if feature selection has been conducted: .select(feature_selection)

var training_sample = training_points.map(function(feature) {
                            return layer_stack.sample({
                            region: ee.Feature(feature).geometry(),
                            scale: 10,
                            tileScale: 16,
                            geometries: true                                //add geometries prior to exporting sample
                            }).first().set('class', feature.get('class'))});








///////////////////////////////////// CLASSIFICATION /////////////////////////////////

var classifier = ee.Classifier.randomForest(500);   //OBS: Change to 500 trees!

var trained_classifier = classifier.train(training_sample, 'class', training_sample.first().propertyNames().remove('system:index'));

// Classify the layer_stack.
var classified = layer_stack.classify(trained_classifier).clip(clip_feature);






/////OBS: Commented out to avoid activation of code
Export.image.toDrive({
  image: classified,
  description: 'classification_result_1',
  scale: 10,
  region: clip_feature,
  maxPixels: 2000000000000
});





// Display the classification result and the input image.


Map.addLayer(classified,
             {min: 1, max: 4, palette: ['red', 'green', 'blue']},
             'classification');
