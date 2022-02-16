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
          [41.425102223301465, 37.04232182694689]]], null, false),
    geometry6 = 
    /* color: #d63000 */
    /* shown: false */
    ee.Geometry.Polygon(
        [[[37.9993248226133, 36.8287263100211],
          [37.98696520347268, 36.802340371282476],
          [37.98696520347268, 36.76934515937987],
          [38.00069811362893, 36.73633574255987],
          [38.0542564632383, 36.66476663180879],
          [38.08584215659768, 36.64603756568848],
          [38.1860924007383, 36.61517976179471],
          [38.20531847495705, 36.52142862501591],
          [38.22729113120705, 36.47174961686223],
          [38.18471910972268, 36.450764468423586],
          [38.16686632651955, 36.389985979290365],
          [38.1586265804258, 36.325840785695036],
          [38.16137316245705, 36.285999945366385],
          [38.08996202964455, 36.277143661373174],
          [38.0817222835508, 36.236170278531816],
          [38.00756456870705, 36.14750574679619],
          [37.9828453304258, 36.097587846138985],
          [37.94713976401955, 36.04541749482479],
          [37.91830065269143, 35.942084870348225],
          [37.95812609214455, 35.89203663507516],
          [38.0267906429258, 35.867557086259204],
          [38.12429430503518, 35.824142933528705],
          [38.30282213706643, 35.815234529198676],
          [38.34814074058205, 35.79295914522403],
          [38.3948326351133, 35.794073062780214],
          [38.47860338706643, 35.8085525699392],
          [38.59945299644143, 35.84863589025856],
          [38.6804771663633, 35.83305033812671],
          [38.73266222495705, 35.836390357086586],
          [38.77798082847268, 35.86644419974923],
          [38.81505968589455, 35.90538592724176],
          [38.85900499839455, 35.91317197460414],
          [38.92904284019143, 35.902048815265104],
          [39.0265465023008, 35.88091050528637],
          [39.1309166194883, 35.849749026799515],
          [39.23940660972268, 35.81300727192014],
          [39.3506431819883, 35.77513434080044],
          [39.42892076987893, 35.76287746933849],
          [39.4989586116758, 35.75061870910364],
          [39.58272936362893, 35.741702060932205],
          [39.67748644370705, 35.727210377503475],
          [39.74340441245705, 35.71717612884874],
          [39.79284288901955, 35.71271605713591],
          [39.8120689632383, 35.6692172788832],
          [39.78597643394143, 35.625694784351396],
          [39.82580187339455, 35.57321310339378],
          [39.86425402183205, 35.517343759471856],
          [39.88485338706643, 35.47485703298693],
          [39.9823570491758, 35.44353664917258],
          [40.0208091976133, 35.42003836028057],
          [40.07986071128518, 35.380859311184686],
          [40.1416588069883, 35.29908176559277],
          [40.16637804526955, 35.263207990466434],
          [40.22817614097268, 35.20375710320233],
          [40.28860094566018, 35.154368560702096],
          [40.38198473472268, 35.08809593560538],
          [40.43004992026955, 34.980147341854675],
          [40.4987144710508, 34.8957133469556],
          [40.5811119319883, 34.794277884545046],
          [40.69372179526955, 34.74689856877801],
          [40.70882799644143, 34.68707157952823],
          [40.80495836753518, 34.59442382514076],
          [40.83242418784768, 34.56050245331799],
          [40.87911608237893, 34.4914863247174],
          [40.92306139487893, 34.412217052731776],
          [40.9766197444883, 34.3906881285887],
          [41.02331163901955, 34.450728667625604],
          [40.9876060726133, 34.45299350406359],
          [40.98348619956643, 34.48809061360902],
          [40.97249987144143, 34.572941896893155],
          [40.96975328941018, 34.60911878678415],
          [40.8118248226133, 34.78074371285608],
          [40.75414659995705, 34.825848980102116],
          [40.68960192222268, 34.85628107922319],
          [40.60445787925393, 34.929497375359254],
          [40.5646324398008, 35.0138965933642],
          [40.52343370933205, 35.095961608126494],
          [40.48635485191018, 35.16222783595944],
          [40.4273033382383, 35.21609954930158],
          [40.33529284019143, 35.27442025232303],
          [40.18697741050393, 35.39541375194729],
          [40.11007311362893, 35.461435504504024],
          [39.9548912288633, 35.584382300560485],
          [39.87112047691018, 35.65694410422861],
          [39.84914782066018, 35.701564785843736],
          [39.8010826351133, 35.7751343407993],
          [39.6912193538633, 35.811893619851446],
          [39.52779772300393, 35.83750366549293],
          [39.45775988120705, 35.84640957029995],
          [39.39046862144143, 35.86755708625798],
          [39.20919420737893, 35.88424850835674],
          [39.10619738120705, 35.97098719209208],
          [39.01693346519143, 35.96209529645095],
          [38.9826011898008, 36.00987745969058],
          [38.90981676597268, 36.04208629765603],
          [38.81917955894143, 35.978766779305296],
          [38.72030260581643, 35.94208487034683],
          [38.63241198081643, 35.94319669365373],
          [38.6090660335508, 35.89314916207416],
          [38.51156237144143, 35.9376374207011],
          [38.4717369319883, 35.96654136944251],
          [38.39757921714455, 35.98098937767509],
          [38.3893394710508, 35.938749306574856],
          [38.2849693538633, 35.99543474123576],
          [38.11742784995705, 36.102026278026955],
          [38.13802721519143, 36.163029286021334],
          [38.16549303550393, 36.22176912414314],
          [38.24926378745705, 36.23949324521623],
          [38.28084948081643, 36.27935782657831],
          [38.24377062339455, 36.35017794401776],
          [38.33028795737893, 36.415408225174254],
          [38.33303453941018, 36.489416915355754],
          [38.33715441245705, 36.5512207294776],
          [38.2575035335508, 36.661461833554256],
          [38.2135582210508, 36.69230109863778],
          [38.13528063316018, 36.722027251739455],
          [38.0707359554258, 36.801240759791476],
          [38.0322838069883, 36.85839961758312]]]);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
/*
Description: Calculating cropland area based on NDVI threshold for a single area
Requirements: admin featureCollection
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
var start = ee.Date('2020-10-01');
var end = ee.Date('2021-09-01');

var crop_desc = 'cropland_area_2017_feb_march'
var desc = 'nl_raw_2021'


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

print('sentinel2_mosaics', sentinel2_mosaics)


////Calculating area of cropland proxie per district
// Input = 12 month image collection
// Output = FC with one value per feature
//var cropland_extractor = function(img_col) {

// Thresholding NDVI - as a proxie for cropland
var binary_TS = sentinel2_mosaics.select(['NDVI']).map(function(image) {
  return image.gt(0.45)
})

// Combine all pixels with <0.4 across time-series into one image (approximating a cropland map for the given year)
var reduced = binary_TS.reduce(ee.Reducer.anyNonZero())


// // Extracting sum of cropland pixels per admin area
// var cropland_area = reduced.reduceRegions({
//                     collection: admin3,     //UPDATE FEATURE COLLECTIONS HERE
//                     reducer: ee.Reducer.sum(), 
//                     scale: 10})

// // Converting pixel sum to ha
// var cropland_area = cropland_area.map(function(feature) {
//     return feature.set('cropland_ha', ee.Number(feature.get('sum')).multiply(0.01))
    
// })

var cropland_area = reduced.reduceRegion({
                    geometry: geometry6,     //UPDATE FEATURE COLLECTIONS HERE
                    reducer: ee.Reducer.sum(), 
                    scale: 10,
                    maxPixels: 999999999
})


Map.addLayer(reduced.clip(geometry6), '', 'irrigated', false)

//// Visualising cropland maps


print(cropland_area)
//Map.addLayer()



Export.table.toDrive({
  collection: cropland_area,
  description: crop_desc, 
  fileNamePrefix: crop_desc,
  fileFormat: 'CSV'
});
