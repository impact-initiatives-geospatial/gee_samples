/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var imageVisParam = {"opacity":1,"bands":["B4","B3","B2"],"min":-193.3338479912902,"max":1746.0281050013366,"gamma":1},
    MNDWI_VIS = {"opacity":1,"bands":["MNDWI"],"min":-0.8285170496439082,"max":-0.14302002658711166,"palette":["ff0a14","ffffff","0a8cff"]},
    NDWI_VIS = {"opacity":1,"bands":["NDWI"],"min":-0.5930011690025799,"max":-0.22246829559026107,"palette":["ff0a14","ffffff","0a8cff"]},
    geometry = 
    /* color: #d63000 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[38.2036940631575, 48.24747868879769],
          [38.2036940631575, 48.12771146019842],
          [38.42093153569168, 48.12771146019842],
          [38.42093153569168, 48.24747868879769]]], null, false),
    discolouring = /* color: #d63000 */ee.Geometry.MultiPoint(
        [[38.41549658991665, 48.251645204350574],
         [38.33874866112138, 48.270289177526195],
         [38.338866678318034, 48.26952505267633],
         [38.338340965351115, 48.26964645645329],
         [38.24704207819689, 48.24636944635125],
         [38.25028218668688, 48.24466899319037],
         [38.20092318670342, 48.204612761881386],
         [38.24533892003391, 48.22831334068664],
         [38.04498733636234, 48.25386529007498],
         [38.13331892538272, 48.33679446418411],
         [38.077308649817795, 48.34775873238343],
         [37.943929470766925, 48.36729670266452],
         [37.87135539178122, 48.3531891442134],
         [37.831795103907346, 48.33551781111099],
         [37.750538268998, 48.35851765286799],
         [37.79636456726946, 48.36475277476745],
         [37.997022856501175, 48.27624099173272],
         [38.247987786325176, 48.19446742594973],
         [38.314916744009224, 48.16606493528115]]),
    hand_vis = {"opacity":1,"bands":["hnd"],"min":-19.66679480600995,"max":61.79246980167895,"gamma":1},
    dem_vis = {"opacity":1,"bands":["elevation"],"min":52.38406179940745,"max":358.367485503864,"gamma":1},
    slope_vis = {"opacity":1,"bands":["slope"],"min":0.1832276599854231,"max":6.195683384463191,"gamma":1},
    geometry2 = /* color: #0b4a8b */ee.Geometry.Polygon(
        [[[37.827970811515705, 48.333759626077914],
          [37.82882911840047, 48.330906575771046],
          [37.832434007316486, 48.3267979028805],
          [37.837240525871174, 48.323259613747396],
          [37.841188737541096, 48.31766633351498],
          [37.84290535131063, 48.313214100725226],
          [37.847711869865314, 48.31195827251439],
          [37.84788353124227, 48.318008796868085],
          [37.845480271964924, 48.322917185643355],
          [37.839472123771564, 48.328053365828374],
          [37.83380729833211, 48.33490080150269],
          [37.82985908666219, 48.345626602055546],
          [37.82779915013875, 48.35190128990583],
          [37.825224229484455, 48.357947076346996],
          [37.81767112889852, 48.36513264402083],
          [37.81337959447469, 48.3693522668637],
          [37.80616981664266, 48.37414168533949],
          [37.796041795402424, 48.37779046372201],
          [37.793981858878986, 48.38109694325779],
          [37.79295189061727, 48.387253263916804],
          [37.79243690648641, 48.39078711156325],
          [37.78986198583211, 48.39409274688054],
          [37.782995530753986, 48.39443469689787],
          [37.77647239842977, 48.395004608486374],
          [37.77235252538289, 48.39739816744774],
          [37.77046425023641, 48.40172908313424],
          [37.771322557121174, 48.405034007565924],
          [37.77509910741414, 48.408680571520755],
          [37.781278916984455, 48.41073164884428],
          [37.78539879003133, 48.41392204913542],
          [37.78007728734578, 48.41414992721058],
          [37.77321083226766, 48.41073164884428],
          [37.76548607030477, 48.40207098182642],
          [37.765829393058674, 48.398423943958825],
          [37.76874763646688, 48.3943207138137],
          [37.77492744603719, 48.39169903241025],
          [37.78969032445516, 48.3894191996489],
          [37.78969032445516, 48.384745223164565],
          [37.786772081046955, 48.3798427866456],
          [37.79106361547078, 48.3766502485675],
          [37.80187828221883, 48.37254526256693],
          [37.8166411606368, 48.36159701516901],
          [37.82093269506063, 48.35418280303015],
          [37.822992631584064, 48.346082969039976],
          [37.82539589086141, 48.33695485290282]]]),
    anomaly_vis = {"opacity":1,"bands":["MNDWI"],"min":-0.08565061915667714,"max":0.06801097762071907,"palette":["1023ff","fd0bff"]},
    geometry3 = 
    /* color: #61ff90 */
    /* shown: false */
    ee.Geometry.MultiPolygon(
        [[[[38.2388991459213, 48.23689097687314],
           [38.23924246867521, 48.23667659743207],
           [38.23969307978971, 48.236405048850486],
           [38.240315352281165, 48.23644792503814],
           [38.24085179408414, 48.23677664128303],
           [38.24070159037931, 48.23714823101668],
           [38.240036402543616, 48.23727685760338],
           [38.239285384019446, 48.237334024871444]]],
         [[[38.223282968450796, 48.22298937368855],
           [38.22019306366564, 48.223103740086714],
           [38.21976391022326, 48.22201724898719],
           [38.22023597900988, 48.22150258725934],
           [38.22242466156603, 48.22181710337458],
           [38.22336879913927, 48.22198865680475]]],
         [[[38.09778209188927, 48.328634005255616],
           [38.096966700348744, 48.327877886472464],
           [38.09756751516808, 48.32737855660166],
           [38.09836144903649, 48.327250156701815],
           [38.09909100988854, 48.327335756670976],
           [38.09905882338036, 48.327678155110824],
           [38.09858675459374, 48.328184615254784]]],
         [[[38.09926267126549, 48.32926171799292],
           [38.100721792969594, 48.32860547267488],
           [38.100957827362905, 48.32886939843755],
           [38.09950943449486, 48.32948997525449]]],
         [[[38.06370286794936, 48.36032385298856],
           [38.05743722769057, 48.35772893662386],
           [38.06194333883559, 48.355133888079266],
           [38.06593446584975, 48.353907610362945],
           [38.06825189443862, 48.35490574562255],
           [38.06945352407729, 48.35678789033928],
           [38.06735067220961, 48.35898363796397],
           [38.0646470055226, 48.35995315874333]]],
         [[[38.06069457433391, 48.35072113660617],
           [38.05947148702312, 48.34990830405097],
           [38.060265420891525, 48.34945197131984],
           [38.06219661138225, 48.349594575737285]]],
         [[[37.95376456272513, 48.35001044714028],
           [37.95365727436453, 48.34946855265331],
           [37.955019836544096, 48.34941864102918],
           [37.95518076908499, 48.350046097891344]]],
         [[[37.9076653326545, 48.365918919428545],
           [37.91122730622628, 48.36410839390982],
           [37.912321647504356, 48.365419962127355],
           [37.91049774537423, 48.36641787184159],
           [37.90944631944039, 48.36681703025255],
           [37.90841635117867, 48.3670166082849],
           [37.907364925244835, 48.367344484783],
           [37.90830906281808, 48.36658894011506]]],
         [[[37.907386382916954, 48.36590466357348],
           [37.905347904065636, 48.36584764011336],
           [37.903137763837364, 48.36516335361191],
           [37.90249403367379, 48.36382326591511],
           [37.90296610246041, 48.36299638570417],
           [37.90423210511544, 48.36279679191797],
           [37.90532644639352, 48.3636521883521],
           [37.907107433179405, 48.36514909754537]]],
         [[[37.83204369045933, 48.33760876673128],
           [37.8313355872794, 48.33688130898824],
           [37.83131412960728, 48.33581149933314],
           [37.83221535183628, 48.33502695798556],
           [37.832150978819925, 48.33770861306234]]],
         [[[37.87734967211184, 48.37076546497574],
           [37.876298246178, 48.371278624261315],
           [37.875461396965356, 48.37109331733808],
           [37.873980817589135, 48.37154945624381],
           [37.87340146044192, 48.37187730355851],
           [37.872006711754175, 48.37182028678585],
           [37.87129860857424, 48.37053739252221],
           [37.87142735460696, 48.370166772606545],
           [37.87230711916384, 48.37033782828741],
           [37.8729293916553, 48.36968211172369],
           [37.872500238212915, 48.36936850516499],
           [37.8733800027698, 48.36889809170581],
           [37.87417393663821, 48.369539563527326],
           [37.875997838768335, 48.36835639809722],
           [37.876469907554956, 48.369211701161426]]],
         [[[37.909301686945334, 48.399048982462546],
           [37.906555104914084, 48.39748183481933],
           [37.903508115473166, 48.395857649047315],
           [37.90492432183303, 48.39491730726923],
           [37.90659802025832, 48.39600012355816],
           [37.9066838509468, 48.39668399565639],
           [37.90913002556838, 48.39733936445788],
           [37.90968792504348, 48.39867857010372]]],
         [[[37.89981739586867, 48.39126975653239],
           [37.89857285088576, 48.39041482400429],
           [37.900289464655295, 48.389844861005734],
           [37.90183441704787, 48.3885909199376],
           [37.902778554621115, 48.39021533768097],
           [37.904795575800314, 48.392865592154116],
           [37.90307896203078, 48.39303657157368],
           [37.90067570275344, 48.39087078980676]]],
         [[[37.80058511404217, 48.42456079314007],
           [37.80115374235333, 48.424098009516435],
           [37.80138977674664, 48.42449671565888],
           [37.800992809812435, 48.42457503256935]]]]);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
/*************************************************************************************
/////////////////////////////////// 00_Introduction //////////////////////////////////
*************************************************************************************/

// Analysing changes in surface water area and wetness in proximity to coal mines
// The Modified Normalized Difference Water Index, based on Sentinel-2, is used as a proxy for wetness water extent.
// Changes are plotted and compared across months and years 2019-2021.

// Contributer: victor.olsen@reach-initiative.org

/*************************************************************************************
///////////////////////////////////// 01_Variables ///////////////////////////////////
*************************************************************************************/

// Defining AOI
var aoi_fc = ee.FeatureCollection('users/victormackenhauer/Ukraine/ukraine_aoi')
var clip_feature = aoi_fc.geometry()
var small_aoi = geometry

var mines = ee.FeatureCollection('users/victormackenhauer/Ukraine/mines')
var mines_buf = mines.map(function(feature) {
                return feature.buffer(500)})
var dams = ee.FeatureCollection('users/victormackenhauer/Ukraine/tailling_dams')

// Defining time range
var start = ee.Date('2019-01-01');
var end = ee.Date('2021-12-31');

/*************************************************************************************
///////////////////////////////////// 02_Functions ///////////////////////////////////
*************************************************************************************/

// Reference module repository (includes cloud masking function)
var Preprocess = require('users/victormackenhauer/REACH-BackUps:Modules/Preprocess')

// Mosaick maker
function make_date_range_monthly(start, end){
  var n_months = end.difference(start,'month').round().subtract(1);
  var range = ee.List.sequence(0,n_months,1); 
  var make_datelist = function (n) {
    return start.advance(n,'month')
  };
  return range.map(make_datelist);
}

var date_range_monthly = make_date_range_monthly(start, end)

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

// Change pixel values to area of pixel, apply within water (used later to extract water area time-series)
var water_extent_function = function(img){
  var water = img.select('MNDWI').gte(0).rename('water')
  var water_area = water.multiply(ee.Image.pixelArea()).divide(1000000)
  return water_area.copyProperties(img, ['system:time_start', 'month', 'date', 'year'])}

/*************************************************************************************
//////////////////////////////////////// 03_Data /////////////////////////////////////
*************************************************************************************/

var HAND = ee.Image("MERIT/Hydro/v1_0_1").select('hnd').clip(clip_feature);

var dem = ee.Image('USGS/SRTMGL1_003').clip(clip_feature);
var elevation = dem.select('elevation');
var slope = ee.Terrain.slope(elevation);

var sentinel2 = ee.ImageCollection('COPERNICUS/S2_SR')
                    .filterDate(start, end)
                    .filterBounds(clip_feature)
                    .filter(ee.Filter.calendarRange(4, 10, 'month'))

// Cloud masking
var s2_cloudless = Preprocess.filterCloudsAndShadowsUkraine(sentinel2,clip_feature,start,end,false, 60)

// Mosaicking
var sentinel2_mosaick = composite_monthly(s2_cloudless, date_range_monthly)
                          .filter(ee.Filter.calendarRange(4, 10, 'month'))

// Indices
var sentinel2_mosaick = sentinel2_mosaick
                    .map(function(image) {
                    return image.addBands(image.normalizedDifference(['B8','B4']).select(['nd'], ['NDVI']));    //.addBands(image.metadata('system:time_start'))
                    })
                    .map(function(image) {
                    return image.addBands(image.normalizedDifference(['B3','B8']).select(['nd'], ['NDWI']));
                    })
                    .map(function(image) {
                    return image.addBands(image.normalizedDifference(['B3','B11']).select(['nd'], ['MNDWI']));
                    })

// Thresholding MNDWI
var s2_water = sentinel2_mosaick.map(function(image){
  var mask = image.select('MNDWI').gte(0)
  return image.mask(mask)})

// Mean MNDWI per year for mine buffer zones
var mines_avg_MNDWI_2019 = s2_water.select('MNDWI').filter(ee.Filter.calendarRange(2019, 2019, 'year')).mean()
                            .reduceRegion({
                              reducer: ee.Reducer.mean(),
                              geometry: mines_buf,
                              scale: 10,
                              maxPixels: 9999999999
                              })
                              
var mines_avg_MNDWI_2020 = s2_water.select('MNDWI').filter(ee.Filter.calendarRange(2020, 2020, 'year')).mean()
                            .reduceRegion({
                              reducer: ee.Reducer.mean(),
                              geometry: mines_buf,
                              scale: 10,
                              maxPixels: 9999999999
                              })
                              
var mines_avg_MNDWI_2021 = s2_water.select('MNDWI').filter(ee.Filter.calendarRange(2021, 2021, 'year')).mean()
                            .reduceRegion({
                              reducer: ee.Reducer.mean(),
                              geometry: mines_buf,
                              scale: 10,
                              maxPixels: 9999999999
                              })

print('mines_avg_MNDWI_2019', mines_avg_MNDWI_2019)
print('mines_avg_MNDWI_2020', mines_avg_MNDWI_2020)
print('mines_avg_MNDWI_2020', mines_avg_MNDWI_2021)

// Average MNDVI per year
var avg_2019_2020 = sentinel2_mosaick.select('MNDWI').filter(ee.Filter.calendarRange(2019, 2020, 'year')).mean()
var avg_2019 = sentinel2_mosaick.select('MNDWI').filter(ee.Filter.calendarRange(2019, 2019, 'year')).mean()
var avg_2020 = sentinel2_mosaick.select('MNDWI').filter(ee.Filter.calendarRange(2020, 2020, 'year')).mean()
var avg_2021 = sentinel2_mosaick.select('MNDWI').filter(ee.Filter.calendarRange(2021, 2021, 'year')).mean()

// Annual anomalies
var anomaly_2020 = avg_2020.subtract(avg_2019)
var anomaly_2021 = avg_2021.subtract(avg_2020)
var anomaly_2021_v2 = avg_2021.subtract(avg_2019_2020)

// Water extent
var water_extent = sentinel2_mosaick.map(water_extent_function)

// Low lying areas
var sentinel2_mosaick_low = sentinel2_mosaick.map(function(image) {
  return image.mask(dem.lt(170))
})

/*************************************************************************************
//////////////////////////////////////// 04_Charts ///////////////////////////////////
*************************************************************************************/

// Monthly MNDWI for 2017-2021 within AOI
var chart1 = ui.Chart.image.seriesByRegion({
            imageCollection: sentinel2_mosaick,
            regions: clip_feature,
            reducer:ee.Reducer.mean(),
            band:'MNDWI',
            scale: 10
            });

// Monthly MNDWI for water layer for 2017-2021 within AOI
var chart2 = ui.Chart.image.seriesByRegion({
            imageCollection: s2_water,
            regions: clip_feature,
            reducer:ee.Reducer.mean(),
            band:'MNDWI',
            scale: 10
            });

// Monthly MNDWI for water layer within individual mine buffer zones
var chart3 = ui.Chart.image.seriesByRegion({
            imageCollection: s2_water,
            regions: mines_buf,
            reducer:ee.Reducer.mean(),
            band:'MNDWI',
            scale: 10
            });

// Monthly MNDWI for water layer within combined mine buffer zones
var chart4 = ui.Chart.image.seriesByRegion({
            imageCollection: s2_water,
            regions: mines_buf.union(),
            reducer:ee.Reducer.mean(),
            band:'MNDWI',
            scale: 10
            });

// Monthly MNDWI for within low lying areas (<170m)
var chart5 = ui.Chart.image.seriesByRegion({
            imageCollection: sentinel2_mosaick_low,
            regions: clip_feature,
            reducer:ee.Reducer.mean(),
            band:'MNDWI',
            scale: 10
            });

// Monthly MNDWI for within valley
var chart6 = ui.Chart.image.seriesByRegion({
            imageCollection: sentinel2_mosaick,
            regions: geometry2,
            reducer:ee.Reducer.mean(),
            band:'MNDWI',
            scale: 10
            });

// Monthly surface water extent within AOI
var chart7 = ui.Chart.image.seriesByRegion({
            imageCollection: water_extent,
            regions: clip_feature,
            reducer: ee.Reducer.mean(),
            band:'water',
            scale: 10
            });

// Monthly surface water extent within mine buffer zones
var chart8 = ui.Chart.image.seriesByRegion({
            imageCollection: water_extent,
            regions: mines_buf.union(),
            reducer:ee.Reducer.mean(),
            band:'water',
            scale: 10
            });

print('Monthly MNDWI for 2017-2021 within AOI', chart1)
print('Monthly MNDWI for water layer for 2017-2021 within AOI', chart2)
print('Monthly MNDWI for water layer within individual mine buffer zones', chart3)
print('Monthly MNDWI for water layer within combined mine buffer zones', chart4)
print('Monthly MNDWI for within low lying areas (<170m)', chart5)
print('Monthly MNDWI for within valley', chart6)
print('Monthly surface water extent within AOI', chart7)
print('Monthly surface water extent within mine buffer zones', chart8)

// Histograms - MNDWI and NDWI
var histo1 = ui.Chart.image.histogram({
            image: sentinel2_mosaick.first().select('MNDWI').clip(small_aoi),
            region: clip_feature,
            scale: 10,
            maxPixels:9999999999
})

var histo2 = ui.Chart.image.histogram({
            image: sentinel2_mosaick.first().select('NDWI').clip(small_aoi),
            region: clip_feature,
            scale: 10,
            maxPixels:9999999999
})

//print('histo1', histo1)
//print('histo2', histo2)

/*************************************************************************************
//////////////////////////////////////// Map /////////////////////////////////////////
*************************************************************************************/

// Visualize all of AOI
var labels = ee.List(['mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct'])

// Average RBG across 2021
Map.addLayer(sentinel2_mosaick.filter(ee.Filter.calendarRange(2021, 2021, 'year')), imageVisParam, 'RBG Avg 2021', false);


// 2021 MNDWI
var i;
for (i = 1; i < 8; i++) {
  var year = 2021
  var col = sentinel2_mosaick.filter(ee.Filter.calendarRange(year, year, 'year'))
  var image1 = ee.Image(col.toList(col.size()).get(i-1))
  var name = labels.get(i-1).getInfo()             
  Map.addLayer(image1.select('MNDWI', 'NDWI'), MNDWI_VIS, name+'_MNDWI', false)
}

// // 2021 NDWI
// var i;
// for (i = 1; i < 8; i++) {
//   var year = 2021
//   var col = sentinel2_mosaick.filter(ee.Filter.calendarRange(year, year, 'year'))
//   var image1 = ee.Image(col.toList(col.size()).get(i-1))
//   var name = labels.get(i-1).getInfo()             
//   Map.addLayer(image1.select('MNDWI', 'NDWI'), NDWI_VIS, name+'_NDWI', false)
// }

// 2021 RGB
var i;
for (i = 1; i < 8; i++) {
  var year = 2021
  var col = sentinel2_mosaick.filter(ee.Filter.calendarRange(year, year, 'year'))
  var image1 = ee.Image(col.toList(col.size()).get(i-1))
  var name = labels.get(i-1).getInfo()             
  Map.addLayer(image1.select('B2', 'B3', 'B4'), imageVisParam, name+'_RBG', false)
}

// 2021 Water Extent in RGB
var i;
for (i = 1; i < 8; i++) {
  var year = 2021
  var col = s2_water.filter(ee.Filter.calendarRange(year, year, 'year'))
  var image1 = ee.Image(col.toList(col.size()).get(i-1))
  var name = labels.get(i-1).getInfo()             
  Map.addLayer(image1.select('B2', 'B3', 'B4'), imageVisParam, name+'_W', false)
}

// MNDVI Anomaly Maps
Map.addLayer(anomaly_2020, anomaly_vis, 'anomaly 2020')
Map.addLayer(anomaly_2021, anomaly_vis, 'anomaly 2021')
Map.addLayer(anomaly_2021_v2, anomaly_vis, 'anomaly 2021 v2')

// DEM datasets
Map.addLayer(HAND, hand_vis, 'hand', false)
Map.addLayer(dem, dem_vis, 'DEM', false)
Map.addLayer(slope, slope_vis, 'slope', false)

// Visualizing mine and dam locations  
Map.addLayer(mines, {color: 'FF0000'}, 'mines', false)
Map.addLayer(mines_buf, {color: 'FF0000'}, 'mines buf', false)
Map.addLayer(dams, {color: '006600'}, 'dams', false)

// Visualizing AOI boundary
var empty = ee.Image().byte();
var AOI_outline = empty.paint({
  featureCollection: clip_feature,
  color: 1,
  width: 3
});

Map.addLayer(AOI_outline, {palette: 'FF0000'}, 'AOI', false);



