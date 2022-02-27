var geometry = /* color: #23cba7 */ee.Geometry.MultiPoint();

// CONSTANTS
var baseRepo = "users/reachsyriagee/"

var imageNameBase = "users/reachsyriagee/SY_NDVI_test/SY_NDVI_" // NDVI with UNOSAT crop masks


var waterNameBase = 'users/reachsyriagee/SY_Water/final/water_'
var CHIRPSNameBase = 'users/reachsyriagee/SY_Rainfall/SY_CHIRPS_'
var SPINameBase = 'users/reachsyriagee/SY_SPI/SY_SPI_'

var croplandNameBase = 'users/reachsyriagee/SY_Cropland/UNOSAT_crop_'

var logo = ee.Image("users/reachsyriagee/Logo_REACH_Final");

var Utils = require('users/reachsyriagee/Modules:Utilities')
var Interface = require('users/reachsyriagee/Modules:Interface_public_v4_SPI')
var Preprocess = require('users/reachsyriagee/Modules:Preprocess')

var syrAdm3  = ee.FeatureCollection(baseRepo + "Admin_Areas/syr_adm3_NES_NWS")

var NES = ee.FeatureCollection(baseRepo + "Admin_Areas/NES")
var NES_extended = ee.FeatureCollection(baseRepo + "Admin_Areas/NES_extended")
var NWS = ee.FeatureCollection(baseRepo + "Admin_Areas/NWS_dissolved")

var control_zones_mask = NES_extended.merge(NWS)
var conrol_zones = NES.merge(NWS)

var NDVIColor  = "006600"
var visParamsNDVI = {bands: ["NDVI"], max: 0.85, min: 0.1, opacity: 1, palette: ["ffffff", NDVIColor ]}
var waterVisParams = {bands: ["Water"], palette: ["ffffff00","ffffff00",'blue'], min:1, max:3}
var CHIRPSVisParam = {"opacity":1,"bands":["Precipitation"],"min":0,"max":500,"palette":["ffffff","0000ff"]};

var start = ee.Date('2017-01-01');
var end = ee.Date('2022-01-15')

var startYear = start.get('year').getInfo()
var endYear = end.get('year').getInfo()
var endMonth = end.get('month').getInfo()

print('startYear', startYear, 'endYear', endYear, 'endMonth' ,endMonth)

// CREATE COLLECTION FROM ASSETS
var NDVI_imgCol = Utils.generateCollectionFromAssets(imageNameBase,startYear,endYear,endMonth,true)
     .map(function(image){return image.clip(control_zones_mask)})

var waterCollect= Utils.generateCollectionFromAssets(waterNameBase,startYear,endYear,endMonth,false)
waterCollect = waterCollect.map(function(image){return image.selfMask().select(["classification"],["Water"]).clip(control_zones_mask)
                                                                                                           // .clip(syrAdm3)
})

var CHIRPS_mosaics = Utils.generateCollectionFromAssets(CHIRPSNameBase,startYear,endYear,endMonth,false) // if CHIRPS is not uploaded yet, use endMonth-1
   .map(function(image){return image.clip(control_zones_mask)})

var SPI_mosaics = Utils.generateCollectionFromAssets(SPINameBase,startYear,endYear,endMonth,false)
   .map(function(image){return image.clip(control_zones_mask)})



var cropland_imgCol = Utils.generateCollectionCropland(croplandNameBase,startYear,2021)

print('NDVI imgcol', NDVI_imgCol)
print('water imgcol', waterCollect)
print('CHIRPS_mosaics', CHIRPS_mosaics)
print('cropland_imgCol', cropland_imgCol)

print('SPI_mosaics', SPI_mosaics)



//SETTING THE UI PANEL
var panel = ui.Panel({style: {width: '400px', backgroundColor:'ffffff50'}})

var dataSeriesPanel = ui.Panel({
 style: {width: '400px', backgroundColor:'ffffff50', padding: '5px 5px'},
 layout: ui.Panel.Layout.flow('horizontal'),
})


dataSeriesPanel.widgets().set(0, ui.Label(" "))


// ADDING LOGO
var logoImage = ui.Thumbnail({
 image:logo,
 params:{bands:['b1','b2','b3'],min:0,max:255},
 style:{width:'130px',height:'40px', padding: '0px', margin: '3% 30% 2% 30%', position: 'top-center', textAlign:'center'}});

var logoPanel = ui.Panel({style: { margin: '2px', padding: '0px',position: 'top-center'}});

// Map.add(logoPanel)

// panel.widgets().set(1, dataSeriesPanel);
var title = Interface.createTitle1('Explore monthly cropland and surface water dynamics across Syria at 10 meter resolution')
//var title2 = Interface.createTitle2('Explore monthly cropland and surface water dynamics across Syria at 10 meter resolution')

//logoPanel.add(logoImage)
logoPanel.add(title)
//logoPanel.add(title2)



panel.widgets().set(0,logoPanel);

panel = Interface.setPanel1(panel,"Syria", 1)

var methods_link = ui.Label({value:'Methodology and Data Description'
 , style: {
     position: 'bottom-center',
     color: 'blue',
     backgroundColor: 'ffffff99',
       // fontWeight: 'light',
     fontSize: '12px',
     // margin: '0 0 4px 0',
     padding: '2px',
     whiteSpace: 'pre'}}).setUrl('https://reach-syria.github.io/agri-app-public/')

panel.widgets().set(2, methods_link)




// CREATE WIDGETS TO DISPLAY COMPOSITES (DATESLIDERS AND DROPDOWNS)
var collections =  [NDVI_imgCol, waterCollect]

var labels = ["NDVI - Year: ","Water - Year: "]
var visParams = [visParamsNDVI, waterVisParams]


var showMosaicYear = function(year) {
   for(var i =0; i < collections.length; i++){
     var collection = collections[i]
     var label = labels[i]
     var visParam = visParams[i]
     var month = Interface.getMonth(monthSelect)
     if(month == null){
       month = endMonth
       monthSelect.setValue("1")
     }

     // if(year == 2021){
     //   print("Testing")
     //   var list =
     //   monthSelect.items().reset()
     // }


     var date = ee.Date(year+"-"+month)
     var mosaic =  collections[i].filterDate(date)

     if(mosaic.size().getInfo() == 1){
     var layer = ui.Map.Layer(mosaic, visParam, label + year+"; Month: "+ month );
     Map.layers().set(i, layer);
     }
   }
}

var showMosaicMonth = function(month) {
   for(var i =0; i < collections.length; i++){
     var collection = collections[i]
     var label = labels[i]
     var visParam = visParams[i]
     var year = Interface.getYear(yearSelect)
     if(year == null){
       year = endYear
       yearSelect.setValue("2020")
     }
     var date = ee.Date(year+"-"+month)
     var mosaic =  collections[i].filterDate(date)

     if(mosaic.size().getInfo() == 1){
     var layer = ui.Map.Layer(mosaic, visParam, label + year+"; Month: " + month );
     Map.layers().set(i, layer);
     }
 }
}




var yearSelect = Interface.createYearDropDown(startYear, endYear, collections, visParams, labels)
yearSelect.onChange(showMosaicYear)
Map.add(yearSelect);

var monthSelect = Interface.createMonthDropDown(endYear, endMonth, collections, visParams, labels)
monthSelect.onChange(showMosaicMonth)
Map.add(monthSelect);

for(var i =0; i < collections.length; i++){
     var collection = collections[i]
     var label = labels[i]
     var visParam = visParams[i]
     var date = ee.Date(endYear+"-"+endMonth)
     var mosaic =  collections[i].filterDate(date)
     // print(mosaic.size())
     if(mosaic.size().getInfo() == 1){

     var layer = ui.Map.Layer(mosaic, visParam, label + endYear+"; Month: " + endMonth );
     Map.layers().set(i, layer);
     }
 }

print(Map.widgets())


//ADMINISTRATIVE AREA CHART AND ZOOM TOOL

// var collections_graph =  [NDVI_imgCol, cropland_imgCol, waterCollect, CHIRPS_mosaics]
var collections_graph =  [NDVI_imgCol, cropland_imgCol, waterCollect, CHIRPS_mosaics, SPI_mosaics]

var admAttributeNames = ["admin1Name","admin2Name","admin3Name"]

var placeHolders = ['Select a Governorate','Select a District','Select a Sub-district']

var buildAdmWidgets = function(){
 var selectAdm1 = Interface.buildAdmAreaWidget(admAttributeNames, placeHolders, 1, collections_graph, syrAdm3, panel)
 panel.widgets().set(3, selectAdm1);

 var selectAdm2 = Interface.buildAdmAreaWidget(admAttributeNames, placeHolders, 2, collections_graph, syrAdm3, panel)
 panel.widgets().set(4, selectAdm2);

 var selectAdm3 = Interface.buildAdmAreaWidget(admAttributeNames, placeHolders, 3, collections_graph, syrAdm3, panel)
 panel.widgets().set(5, selectAdm3);


}

buildAdmWidgets()


//GEOMETRY DRAWING TOOL
var drawingTools = Map.drawingTools().setShown(false);

while (drawingTools.layers().length() > 0) {
 var layer = drawingTools.layers().get(0);
 drawingTools.layers().remove(layer);
}

var dummyGeo = ui.Map.GeometryLayer({geometries: null, name: 'geometry', color: '23cba7'});


drawingTools.layers().add(dummyGeo)

function chartGeometry() {
 var aoi = drawingTools.layers().get(0).getEeObject();

 drawingTools.setShape(null);

 var NDVI_chart = Interface.chartSeries_NDVI("NDVI",aoi,NDVI_imgCol)
 panel.widgets().set(6, NDVI_chart);

 var cropChart = Interface.chartSeries_cropland("Cropland (km²)",aoi, cropland_imgCol)
 panel.widgets().set(7, cropChart);

 var waterChart = Interface.chartSeries_water("Surface Water (m²)",aoi,waterCollect)
 panel.widgets().set(8, waterChart);

 var precipChart = Interface.chartSeries_precip("Precipitation (mm)",aoi, CHIRPS_mosaics)
 panel.widgets().set(9, precipChart);

 var SPIChart = Interface.chartSeries_precip("SPI ",aoi, SPI_mosaics)
 panel.widgets().set(10, SPIChart);


 Interface.drawPolygon(drawingTools)
}

drawingTools.onDraw(ui.util.debounce(chartGeometry, 500));

Interface.drawPolygon(drawingTools)




// SETTING LEGEND  ELEMENTS
var legendPaletteNDVI =[ NDVIColor +'00', NDVIColor+'50', NDVIColor,'0000ff' ];
var legendNamesNDVI = ['NDVI: 0 ','NDVI: 0.5','NDVI: 1', "Water"];


Interface.createAndSetLegend(legendPaletteNDVI,legendNamesNDVI,4)


// CONFIGURE MAP
// Create an empty image into which to paint the features, cast to byte.
var empty = ee.Image().byte();

// Paint all the polygon edges with the same number and width, display.
var outline = empty.paint({
 featureCollection: conrol_zones,
 color: 1,
 width: 3
});
// Map.addLayer(outline, {palette: 'FF0000'}, 'edges');


var layer = ui.Map.Layer(outline, {}, 'Lines of control');
Map.layers().set(3, layer);

Map.style().set('cursor', 'crosshair');

Map.setOptions('HYBRID',{} ,  ['HYBRID', "TERRAIN", "ROADMAP"]);
// Map.setOptions('HYBRID',{} ,[]);
Map.setCenter(37,35, 7)
