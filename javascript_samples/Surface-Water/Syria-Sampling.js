/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var geom_display = 
    /* color: #0b4a8b */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[39.30619081306865, 36.01875721966312],
          [39.30619081306865, 35.80715365438439],
          [39.58084901619365, 35.80715365438439],
          [39.58084901619365, 36.01875721966312]]], null, false),
    geometry = 
    /* color: #d63000 */
    /* shown: false */
    ee.Geometry.LineString(
        [[38.57456733139241, 37.86611328330581],
         [38.70159675033772, 37.88399943557838],
         [38.803906931001784, 37.90892440116932],
         [39.04098648843626, 37.938173372798495],
         [39.20028824624876, 37.9251752661041],
         [39.3341841202722, 37.74024567497591],
         [39.58961624917845, 37.87641190136555]]),
    aoi_WoS = /* color: #d69510 */ee.Geometry.Polygon(
        [[[41.528302800003864, 37.09991023802735],
          [40.825177800003864, 37.14589954649934],
          [40.388471257035114, 37.04074008200067],
          [39.863874089066364, 36.80359822521314],
          [39.509565007035114, 37.22467333366744],
          [39.331037175003864, 37.741212849368836],
          [39.120244258109786, 37.914217502747114],
          [39.037846797172286, 37.94238135956709],
          [38.274296992484786, 37.793858202822776],
          [37.730473750297286, 37.282054968008104],
          [37.464055293266036, 36.804142207811736],
          [36.618108027641036, 36.85910135410095],
          [36.36635939643444, 36.21764122077319],
          [36.27297560737194, 36.015736183604396],
          [35.87197463080944, 35.93127063964658],
          [35.78683058784069, 35.85116731894637],
          [35.70717970893444, 35.56570000475867],
          [35.745360276529645, 35.49049513953964],
          [35.893675706217145, 35.33380178076972],
          [35.846983811685895, 34.96099896210254],
          [35.962340256998395, 34.61362208922421],
          [36.371580979654645, 34.61814284750354],
          [36.297423264810895, 34.47788492077032],
          [36.500670335123395, 34.39407005288347],
          [36.589437713642425, 34.197918902017314],
          [36.33263229372055, 33.99321818534453],
          [36.257101287861175, 33.918037316501405],
          [35.99205612184555, 33.77318436602938],
          [35.91936242711074, 33.62016261995777],
          [35.85825097691543, 33.43012014033398],
          [35.607625366563866, 33.2718155230402],
          [35.57530406511393, 32.888392663257626],
          [35.58217052019206, 32.69675595782452],
          [35.62748912370768, 32.665547112197736],
          [35.68722728288737, 32.688087927996214],
          [35.776491198902995, 32.72622096274504],
          [35.93167308366862, 32.6776851813433],
          [35.993471179371745, 32.616399991685164],
          [36.06900218523112, 32.50296966743375],
          [36.30795482194987, 32.44040600937395],
          [36.39309886491862, 32.36272033227923],
          [36.85177806413737, 32.29773776168148],
          [37.259645495777995, 32.54812748293111],
          [38.080873523121745, 32.9926951795142],
          [38.894012403828526, 33.417943080842186],
          [40.114242660465166, 34.04095425105291],
          [40.65467696185652, 34.30201554521087],
          [40.99250655170027, 34.39498858914254],
          [41.18476729388777, 34.707163498723524],
          [41.24131136774266, 34.7987538777446],
          [41.23307162164891, 35.14759667926703],
          [41.27976351618016, 35.41664626198585],
          [41.277538046996305, 35.480572972781054],
          [41.401134238402555, 35.64646706653163],
          [41.38412858894215, 35.831473619323695],
          [41.2715187256609, 36.07714989116612],
          [41.30859758308277, 36.35745973345429],
          [41.409663597457, 36.52007324052001],
          [41.86147634159762, 36.57633856468297],
          [42.27621022831637, 36.9712417185868],
          [42.387446800582, 37.07649748535323],
          [42.354487816207, 37.24832001384355],
          [42.178706566207, 37.34882421976823],
          [41.97683278691012, 37.18160734148348]]]),
    snow_areas = /* color: #98ff00 */ee.Geometry({
      "type": "GeometryCollection",
      "geometries": [
        {
          "type": "Polygon",
          "coordinates": [
            [
              [
                38.05618801870907,
                38.004385441575195
              ],
              [
                37.86804714956845,
                37.453709884932216
              ],
              [
                38.13917397662848,
                37.43950288670941
              ],
              [
                38.385312044101305,
                37.37565703345686
              ],
              [
                38.93784085074032,
                37.3522544424389
              ],
              [
                39.55307522574032,
                37.40681745318141
              ],
              [
                40.03372708120907,
                38.738658304010414
              ],
              [
                40.04899199428657,
                38.947109050401295
              ],
              [
                39.262240658003904,
                39.16140230751786
              ],
              [
                38.60428984584907,
                39.243403259793176
              ],
              [
                38.0769827694748,
                39.14267787641129
              ],
              [
                38.09067900600532,
                38.50356097066155
              ]
            ]
          ],
          "geodesic": true,
          "evenOdd": true
        },
        {
          "type": "Polygon",
          "coordinates": [
            [
              [
                38.786446946438396,
                35.14033617896605
              ],
              [
                37.891061204250896,
                35.13584404916528
              ],
              [
                37.380196946438396,
                34.8613559420084
              ],
              [
                37.440621751125896,
                34.73505343670406
              ],
              [
                37.534005540188396,
                34.68538168174272
              ],
              [
                38.149239915188396,
                34.644718974411205
              ],
              [
                38.594186204250896,
                34.73956757147511
              ],
              [
                38.846871751125896,
                34.960457787427956
              ]
            ]
          ],
          "evenOdd": true
        },
        {
          "type": "Polygon",
          "coordinates": [
            [
              [
                36.53307140051719,
                34.15759756579806
              ],
              [
                35.96258002212619,
                33.75583130154784
              ],
              [
                35.81510356978896,
                33.40465786618018
              ],
              [
                35.7157116325331,
                33.34932512938577
              ],
              [
                35.71365169600966,
                33.27128350414474
              ],
              [
                35.79055599288466,
                33.27128350414474
              ],
              [
                35.83724788741591,
                33.308017676146065
              ],
              [
                35.98281673507216,
                33.408956863344855
              ],
              [
                36.05422786788466,
                33.53267663154078
              ],
              [
                37.02926448897841,
                34.01895536372372
              ],
              [
                37.07870296554091,
                34.23267743467713
              ],
              [
                37.01827816085341,
                34.34160351779476
              ],
              [
                36.53487972335341,
                34.48209055214339
              ]
            ]
          ],
          "evenOdd": true
        }
      ],
      "coordinates": []
    });
/***** End of imports. If edited, may not auto-convert in the playground. *****/
/*
Description: Surface Water Classifications Sampling script 
Contributor: Pedro, Esther, Reem and Victor (REACH Yemen and Syria)
*/


var palette = ["white", "red", "yellow", "blue"]
var aoi_syria = ee.FeatureCollection("USDOS/LSIB_SIMPLE/2017").filterMetadata('country_na', 'equals', 'Syria')
// var aoi = aoi_WoS

var aoi = ee.FeatureCollection('users/estherbarvels/SY_Water/AOIs/AOI_WoS')


// var clip_feature = aoi
var year = '2017'
var start = ee.Date(year+'-01-01'); 
var end = ee.Date(year+'-12-31');

// Export.table.toAsset(ee.FeatureCollection(aoi_WoS_new), 'AOI_WoS_new', 'users/estherbarvels/SY_Water/AOIs/AOI_WoS_new')
// Export.table.toAsset(ee.FeatureCollection(snow_area_Turkey), 'snow_area_Turkey', 'users/estherbarvels/SY_Water/AOIs/snow_area_Turkey')

var elevation = ee.Image('USGS/SRTMGL1_003').select('elevation').clip(aoi_WoS);
var slope = ee.Terrain.slope(elevation);
// var landCover = ee.ImageCollection("COPERNICUS/Landcover/100m/Proba-V-C3/Global")
//                   .filterMetadata('system:index', 'equals', '2019')
//                   .first()
//                   .select('discrete_classification')
//                   .clip(aoi.geometry())


// Selecting reference imagery (GLAD - Global Surface Water Dynamics)
var GLAD = ee.ImageCollection('projects/glad/water/individualMonths')
            .filterDate(start, end)
            .map(function(img){return img.clip(aoi)})


Map.setOptions("hybrid")
Map.centerObject(aoi, 10)
Map.addLayer(aoi, {}, "aoi",false)
Map.addLayer(aoi_syria, {}, "aoi_syria",false)
Map.addLayer(elevation, {min:150,max:1200}, "Elevation",false)
Map.addLayer(slope, {min:0,max:7}, "slope",false)


//Function for applying negative buffer around specified pixel values
var buffer = function (image) {
  var mask = image.mask().reduce(ee.Reducer.min())
  var negative_buffer = mask
    .focal_min({radius: 30, units: 'meters'})
  return image.updateMask(negative_buffer)
}

// Creating buffer and reclassing all values
// New classes:
// 3 = Water (GLAD 100), blue, 
// 2 = Water buffer (GLAD 100 within buffer) , yellow
// 1 = Uncertain (GLAD 25-75), red
// 0 =Land (GLAD 0), white
var GLAD = GLAD.map(function(image) {
  var GLAD_water = image.mask(image.eq(100)) // selecting water pixels
  var GLAD_buffer = buffer(GLAD_water) // cuts away a negative buffer around water pixels
  var img = image.where(GLAD_buffer.eq(100), 3) //reclass water outside of buffer (references buffered layer to know which pixels to reclass in the original)
  var img = img.where(img.eq(100), 2); // reclass water inside buffer
  var img = img.where(img.eq(0), 0); // reclass land
  var img = img.where(img.gt(3), 1); // reclass uncertain categories (px 25 50 and 77)
  return img})
print("GLAD reclassified", GLAD)

// Display GLAD reclassified images
var listOfImages = GLAD.toList(GLAD.size())
var len = listOfImages.size();
len.evaluate(function(l) {
  for (var i=0; i < l; i++) {
    
    var img = ee.Image(listOfImages.get(i));
    Map.addLayer(img, {bands:['wp'], palette:palette,min: 0, max: 3}, 'GLAD reclassified-'+(i+1).toString(),false);
  } 
});

print('GLAD', GLAD)

// Adding month as property to each image
// Changing band name to 'class'
var GLAD = GLAD.map(function(image) {
  return image
  .set('month', ee.Number.parse(ee.Date(image.get('system:time_start')).format('M'))) // bug was 'MM' and that is was a string which does not align with img to train on
  .select(['wp'], ['class'])
})

// Stratified random sampling in water and land classes (for each month)
var sampler = function(image) {
  var water_sample = image.stratifiedSample({
    numPoints: 1, //This property is overwritten by 'classPoints'
    classBand: 'class', 
    region: aoi, 
    scale: 10, 
    projection: 'EPSG:4326', 
    classValues: [0, 1, 2, 3],  //0 = Land, 3 = Water far from land ("certain" water pixels)
    classPoints: [800, 0, 0, 200], // SELECT NUMBER OF SAMPLES (per class)
    dropNulls: true, 
    geometries: true
  })
  .map(function(feature) {
  return feature.set('month', image.get('month'))})
  return water_sample}

//Apply sampler function to image and saves it to list
var sample_combiner = function(image, list) { 
  var sample = sampler(image)
  //Add sample (one month) to list
  return ee.FeatureCollection(list).merge(sample) //.toList(sample.size())) //ee.List(list).add(added);
};

// Iterates over image collection, applies sample function and saves output to featureCollection
var GLAD_sample = GLAD.iterate(sample_combiner, ee.FeatureCollection([]))
// print('GLAD_sample', ee.FeatureCollection(GLAD_sample).limit(10))

// function to conditionally set properties of feature collection
var setPointProperties = function(f){ 
  var klass = f.get("class")
  var mapDisplayColors = ee.List(palette) // 0 = land, 1 = uncertain, 2 = water inside buffer, 3 = water outside buffer
  
  // use the class as index to lookup the corresponding display color
  return f.set({style: {color: mapDisplayColors.get(klass)}})
}


// apply the function and view the results on map
var styled = ee.FeatureCollection(GLAD_sample).map(setPointProperties)
                                              // .filterBounds(geom_display);
Map.addLayer(styled.style({styleProperty: "style"}), {}, 'Samples classes',false)
Map.addLayer(aoi, {}, 'AOI',false)

 

// var samples_displ = ee.FeatureCollection(GLAD_sample).filterBounds(geom_display).geometry()
// Map.addLayer(samples_displ, {}, 'Samples')


// print('samples per month', ee.FeatureCollection(GLAD_sample).filterMetadata('month', 'equals', 1).size())

var asset_path = 'users/estherbarvels/SY_Water/samples/'
var asset_name = 'samples_AOI_WoS'
var year = year + '_'
var assetID = asset_path.concat(year).concat(asset_name)

Export.table.toAsset(ee.FeatureCollection(GLAD_sample), year.concat(asset_name), assetID)