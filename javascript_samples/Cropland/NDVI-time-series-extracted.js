/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var imageVisParam = {"opacity":1,"bands":["B4","B3","B2"],"min":-2241.503217111397,"max":4737.462064848022,"gamma":1},
    imageVisParam2 = {"opacity":1,"bands":["B4","B3","B2"],"min":735.9480858134843,"max":5068.300971501751,"gamma":1},
    geometry = 
    /* color: #d63000 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[38.935351640748436, 36.0098873326188],
          [38.935351640748436, 35.73390908184799],
          [39.624743730592186, 35.73390908184799],
          [39.624743730592186, 36.0098873326188]]], null, false),
    imageVisParam3 = {"opacity":1,"bands":["red","green","blue"],"max":2000,"gamma":1},
    imageVisParam4 = {"opacity":1,"bands":["NDVI"],"min":0,"palette":["ffffff","439f49"]},
    imageVisParam5 = {"opacity":1,"bands":["smod_code"],"max":3,"gamma":1},
    test_fc = 
    /* color: #d63000 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      },
      {
        "type": "rectangle"
      },
      {
        "type": "rectangle"
      }
    ] */
    ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Polygon(
                [[[38.96684163762423, 35.97336922533175],
                  [38.96684163762423, 35.93779670821616],
                  [39.03275960637423, 35.93779670821616],
                  [39.03275960637423, 35.97336922533175]]], null, false),
            {
              "system:index": "0"
            }),
        ee.Feature(
            ee.Geometry.Polygon(
                [[[39.51066487981173, 35.813166810216394],
                  [39.51066487981173, 35.768608636483954],
                  [39.60404866887423, 35.768608636483954],
                  [39.60404866887423, 35.813166810216394]]], null, false),
            {
              "system:index": "1"
            }),
        ee.Feature(
            ee.Geometry.Polygon(
                [[[39.24699300481173, 35.86660363061134],
                  [39.24699300481173, 35.837663154557916],
                  [39.30741780949923, 35.837663154557916],
                  [39.30741780949923, 35.86660363061134]]], null, false),
            {
              "system:index": "2"
            })]),
    imageVisParam6 = {"opacity":1,"bands":["NDVI"],"min":0,"palette":["ffffff","17b74e"]},
    syria_admin1 = ee.FeatureCollection("users/victormackenhauer/Syria/syria_admin1"),
    table = ee.FeatureCollection("users/victormackenhauer/NES-admin3"),
    admin3 = ee.FeatureCollection("users/victormackenhauer/Syria/NES-admin3"),
    NES_AOI = 
    /* color: #98ff00 */
    /* shown: false */
    ee.Geometry.Polygon(
        [[[41.177391136802, 34.4985856210337],
          [41.3147202383645, 34.724634882152216],
          [41.2927475821145, 34.995080167753464],
          [41.3476792227395, 35.36324760494168],
          [41.463035668052, 35.64943689134167],
          [41.4465561758645, 35.85895672868302],
          [41.441063011802, 36.44885607505191],
          [41.847557152427, 36.53717837270636],
          [42.2485581289895, 36.86309396917149],
          [42.429832543052, 37.02991842149633],
          [42.451805199302, 37.130713535674744],
          [42.3694077383645, 37.30568995848292],
          [42.1826401602395, 37.37556682582043],
          [41.836570824302, 37.213877942931326],
          [41.3916245352395, 37.130713535674744],
          [41.144432152427, 37.16574128444684],
          [40.7214585196145, 37.14822943803388],
          [40.0403061758645, 36.8938522337135],
          [39.5349350821145, 36.76194391359016],
          [39.1394272696145, 36.74433895998502],
          [38.7329331289895, 36.77074487536299],
          [38.628563011802, 36.8543036184459],
          [38.309959496177, 36.950941851088594],
          [38.156150902427, 36.9377711181024],
          [38.013328636802, 36.87627759942113],
          [37.9858628164895, 36.77074487536299],
          [38.024314964927, 36.673878758275436],
          [37.980369652427, 36.69590451128864],
          [37.8869858633645, 36.70911693511193],
          [37.7771225821145, 36.691499865319244],
          [37.704251350910326, 36.60705942867721],
          [37.63623767170939, 36.40371160255361],
          [37.95484118733439, 36.20007033391754],
          [38.05371814045939, 35.906962000260044],
          [38.30640368733439, 35.65740929591319],
          [38.59204821858439, 35.60383186430689],
          [38.93262439045939, 35.69310762936065],
          [39.22925524983439, 35.809016876880364],
          [39.72364001545939, 35.65740929591319],
          [39.96533923420939, 35.32644377750476],
          [40.23999743733439, 35.24573272185364],
          [40.55654670617843, 34.793793204218005],
          [40.69387580774093, 34.70126490654016],
          [40.91085578820968, 34.43212096865185],
          [40.97677375695968, 34.370933559577274],
          [41.04269172570968, 34.400399749258405]]]),
    com = ee.FeatureCollection("users/victormackenhauer/Syria/communities"),
    geometry3 = 
    /* color: #d63000 */
    /* shown: false */
    ee.Geometry.MultiPoint(),
    geometry4 = 
    /* color: #98ff00 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[38.98237011329531, 36.06781489987192],
          [38.98237011329531, 35.96729038340447],
          [39.16982433692812, 35.96729038340447],
          [39.16982433692812, 36.06781489987192]]], null, false),
    imageVisParam7 = {"opacity":1,"bands":["NDVI"],"min":0.11100433375686408,"max":0.7679417377337814,"palette":["ffffff","1ca22e"]},
    imageVisParam8 = {"opacity":1,"bands":["NDVI_any"],"palette":["25ba0c"]},
    geometry5 = 
    /* color: #d63000 */
    /* shown: false */
    ee.Geometry.MultiPoint(),
    geometry2 = 
    /* color: #98ff00 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[40.551689137363965, 37.04232182694689],
          [40.551689137363965, 36.59157282354606],
          [41.425102223301465, 36.59157282354606],
          [41.425102223301465, 37.04232182694689]]], null, false);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
/*
Description: Extracting NDVI time-series
Requirements: Admin feature collection
Contributor: victor.olsen@reach-initiative.org
*/


//// Referencing admin features

// Clip to features within NES only
var clipper = function(feature) {
  return ee.Feature(NES_AOI.intersection(feature.geometry())).copyProperties(feature) }
var admin1 = ee.FeatureCollection(syria_admin1.map(clipper))

// Reference communities
var com = com.filterBounds(admin1)

//// Reference modules
var Preprocess = require('users/victormackenhauer/REACH-BackUps:Modules/Preprocess')
var mosaick_maker_optical = require('users/victormackenhauer/REACH-BackUps:Modules/mosaick_maker_optical')

//// Defining AOI
var aoi_syria = ee.FeatureCollection("USDOS/LSIB_SIMPLE/2017").filterMetadata('country_na', 'equals', 'Syria')
var clip_feature = aoi_syria

//// Loading Imagery
// Filters
var start = ee.Date('2017-01-30');
var end = ee.Date('2017-04-01');

// Data
var sentinel2 = ee.ImageCollection('COPERNICUS/S2_SR')
                    .filterDate(start, end)
                    .filterBounds(clip_feature);


//// Processing Sentinel 2

// Cloud masking
var sentinel2Cloudless = Preprocess.filterCloudsAndShadows(sentinel2,clip_feature,start,end,false, 32)

// Indices
var sentinel2Cloudless_indices = sentinel2Cloudless
                    .map(function(image) {
                    return image.addBands(image.normalizedDifference(['B8','B4']).select(['nd'], ['NDVI']));    //.addBands(image.metadata('system:time_start'))
                    })
                    .map(function(image) {
                    return image.addBands(image.normalizedDifference(['B3','B11']).select(['nd'], ['MNDWI']));
                    })
                    .select(['MNDWI','NDVI','B2','B3','B4', 'B8', 'B11','B12'],
                            ['MNDWI', 'NDVI', 'blue', 'green', 'red', 'nir', 'swir1', 'swir2']);

// Mosaicking
var diff = end.difference(start, 'day');
var temporalResolution = 30;
var range = ee.List.sequence(0, diff.subtract(1), temporalResolution).map(function(day){return start.advance(day,'day')});
var sentinel2_mosaics = mosaick_maker_optical.mosaick_maker(sentinel2Cloudless_indices, temporalResolution, range, clip_feature)

// Gap filling
var sentinel2_mosaics = sentinel2_mosaics.map(function(image) {
  return image.unmask(sentinel2_mosaics.median());   //sentinel2_mosaics.median()  //OBS: Selection bands deactivated .select(selection_bands) 
});

// Clip to NES
var sentinel2_mosaics = sentinel2_mosaics.map(function(image) {
  return image.clip(NES_AOI)
});


//// Indicator export function
// Exports a feature collection of feature collections to a time-series
// Output: Row = time-stamp, Columns = admin areas
var extractor = function(img_col, fC, admin_label, scale) {

  var admin_collection = img_col.map(function(image) {
      
      // Loop through NL images, produce a feature collection for each with mean values
      return image.reduceRegions({
                      collection: fC,     //UPDATE FEATURE COLLECTIONS HERE
                      reducer: ee.Reducer.mean(), 
                      scale: scale
                      // tileScale: 16
                  })
                  // Filtering out nodata values
                  .filter(ee.Filter.neq('mean', null)) //filter everything that is not null
                  // Getting the date from the image and saving it as property to each feature
                  .map(function(f) { //f = image
                    // return f.set('imageId', image.id());
                    var date = image.get('system:time_start');
                    var date_format = ee.Date(date).format('YYYY-MM-dd');
                      return f.set('date', date_format)//make new property; das hier später durch Datum ersetzen  
                    });
                })
                
                //Turns a feature collection of feature collections into just one feature collection
              .flatten();
  
//print('adm1_collection', admin_collection)
  
  
    // Create unique date IDs
    var rows = admin_collection.distinct('date');
              
    // Creates a table with the unique IDs, adds a list of matching feature a property (matching on common date ID)
    // The features in the 'joined' collection simply holds a property which includes the all features with a common date
    var joined = ee.Join.saveAll('matches').apply({ // determines how the join is applied
      primary: rows, //primary feature collection
      secondary: admin_collection,  //secondary feature collection
      condition: ee.Filter.equals({
        leftField: 'date', 
        rightField: 'date'
      })
    });
  
//print('joined', joined)
  
    var flat_table = joined.map(function(row) { 
        
        // Get the list of features from the property in the new joined collection
        var values = ee.List(row.get('matches'))
          // Map a function over the list of dates to return a list of
          // column ID and value. Turn list of ID/value pairs into Dictionary.
          // add dictionary as property.
          .map(function(feature) {
          //OBS: change admin here
            feature = ee.Feature(feature);
            return ee.List([ee.String(feature.get(admin_label)), ee.String(feature.get('mean'))]);
          });
        return row.select(['date']).set(ee.Dictionary(values.flatten()))
  });
  return flat_table
};


//// Creating Indicators
var ndvi = extractor(sentinel2_mosaics.select(['NDVI']), admin3.limit(3), 'admin3Pcod', 300)


Export.table.toDrive({
  collection: ndvi,
  description: 'ndvi_2020', 
  fileNamePrefix: 'ndvi_2020',
  fileFormat: 'CSV'
});
