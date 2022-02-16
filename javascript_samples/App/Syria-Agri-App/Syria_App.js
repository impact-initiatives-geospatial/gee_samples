/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var imageVisParams = {"bands":["red","green","blue"],"gamma":1,"max":2875.28,"min":200.72,"opacity":1},
    WaPorVisParams = {"bands":["b1"],"max":100},
    geometry = /* color: #23cba7 */ee.Geometry.MultiPoint();
/***** End of imports. If edited, may not auto-convert in the playground. *****/


// CONSTANTS
var baseRepo = "users/pedrovieirac/"
var imageNameBase = "users/pedrovieirac/Syria/Syria_NDVI_"

var NDVI_color = "006600"

var imageVisParamsNDVI = {bands: ["NDVI"],
max: 0.85,
min: 0.1,
opacity: 1,
palette: ["ffffff", NDVI_color]}


var yem_adm3  = ee.FeatureCollection(baseRepo + "Syria/syr_adm3");


// Configure the map.
Map.style().set('cursor', 'crosshair');
Map.setCenter(37,35, 7)


// Import images from assets as a list
var imageNameBase = "users/pedrovieirac/Syria/Syria_NDVI_"
var imageNameList =  ee.List([]);
var i,j;
for (j= 2019; j <= 2021; j++){
for (i = 1; i < 13; i++) {
  if(j<2021 ||(j == 2021 && i <= 4)){                                 // Change back to current month 2021
  var file_name = imageNameBase.concat(j).concat("_").concat(i);
  var image = ee.Image(file_name)
              .set("month", i)
              .set("year", j)
  imageNameList = imageNameList.add(image)}
}}


// Creating the slider collection and setting DATE property for collections
var slider_collect = ee.ImageCollection(imageNameList)

 slider_collect = slider_collect.map(function(image){
       var m = image.get("month")
       var y= image.get("year")
       return image.toFloat().divide(255).set('system:time_start', ee.Date.fromYMD(y, m, 1)).set("month",m).set("year",y);
     })     

 var chart_collect = slider_collect
 

var filtered_collect = chart_collect.map(function(image){    
  return image.updateMask(image.select("NDVI").gt(0.3))})
  
  var chart_collect = chart_collect.map(function(image){    
  return image.updateMask(image.select("NDVI").gt(0.3))})
 

var filtered_collect = filtered_collect.select(["NDVI"], ["Area"])

var chart_series = function(geo) {return ui.Chart.image.series(chart_collect, geo, ee.Reducer.mean(), 30)
      .setOptions({
        title: 'NDVI Over Time',
        vAxis: {title: 'NDVI'},
        lineWidth: 1,
        pointSize: 3,
        maxPixels: 1000000000,
        bestEffort: true
      });
}

var chart_area = function(geo) {return ui.Chart.image.series(filtered_collect, geo, ee.Reducer.count(), 30)
      .setOptions({
        title: 'Area Over Time',
        vAxis: {title: 'Number of Pixel'},
        lineWidth: 1,
        pointSize: 3,
        maxPixels: 1000000000,
        bestEffort: true
      });
}

// Create an empty panel in which to arrange widgets
var panel = ui.Panel({style: {width: '400px', backgroundColor:'ffffff50'}})

//callback function for charting NDVI series
Map.onClick(function(coords) {  // var location = 'lon: ' + coords.lon.toFixed(2) + ' ' +'lat: ' + coords.lat.toFixed(2);
  // var coords_label = "Coordinates: " + location
  // panel.widgets().set(1, ui.Label(coords_label));
    drawPolygon()
    var point = ee.Geometry.Point(coords.lon, coords.lat);
    var chart = chart_series(point)
    chart.style().set({width: '95%',backgroundColor: '00000010', position:"bottom-center" })
  // Map.add( chart);
  panel.widgets().set(4, chart);
  var area_chart = chart_area(point)
  area_chart.style().set({width: '95%',backgroundColor: '00000010', position:"bottom-center" })
  panel.widgets().set(5, area_chart);

});

ui.root.add(panel);


// Description
var description_label = ui.Label({value:'This Google Earth Engine application allows for localized agricultural analysis of Yemen at\nGovernorate, District and Sub-district level, as well as of custom-drawn features and \nindividual pixels, by plotting an NDVI time series of specified areas on the map.'+ 
'\n\nThe application also allows scrolling through monthly NDVI products of agricultural areas of the \ncountry. For plotting an NDVI time series at any administrative level, use the drop-down buttons.\nFor custom plots, draw or click directly on the map. '+
'Click on different periods of the year in the\ntime-slider (located in bottom portion of the map) to view the different monthly NDVI products for\n the agricultural areas of the country.'+
'\n\nNDVI is an indicator of vegetation health due to its close correlation with photosynthetic activity\n and chlorophyll. An NDVI value of <0.2 indicates dry or sparse vegetation, whilst a value\n of >0.5 tipically indicates healthy vegetation.'+
'The NDVI products are derived from Sentinel-2\n10-meter resolution satellite imagery, treated for cloud and cloud-shadow coverage, masked\nby FAO WaPor crop masks of the year, and filtered to remove zero values.'
, style: {
    position: 'bottom-center',
    backgroundColor: 'ffffff99',
      // fontWeight: 'light',
    fontSize: '9px',
    // margin: '0 0 4px 0',
    padding: '2px',
    whiteSpace: 'pre'}})

 panel.widgets().set(0, description_label);



// Selelct adm areas widgets
var adm1_names = yem_adm3.aggregate_array("admin1Name").distinct().sort().getInfo()
var adm2_names = yem_adm3.aggregate_array("admin2Name").distinct().sort().getInfo()
var adm3_names = yem_adm3.aggregate_array("admin3Name").distinct().sort().getInfo()


// Update select widgets 
var build_widgets = function(adm2, adm3) {
  
  var select_adm1 = ui.Select({
  items: adm1_names,
  placeholder:'Select a Governorate',
  onChange: zoomToAdm1
});
panel.widgets().set(1, select_adm1);


var select_adm2 = ui.Select({
  items: adm2,
  placeholder:'Select a District',
  onChange: zoomToAdm2
});
panel.widgets().set(2, select_adm2);


var select_adm3 = ui.Select({
  items: adm3,
  placeholder:'Select a Sub-district',
  onChange:  zoomToAdm3
});
panel.widgets().set(3, select_adm3);
  
}

var update_widgets = function(feature, level) {
  if(level ==1){
  var adm2_filtered = feature.aggregate_array("admin2Name").distinct().sort().getInfo()
  var adm3_filtered = feature.aggregate_array("admin3Name").distinct().sort().getInfo()

  build_widgets(adm2_filtered, adm3_filtered)
  }
  else if(level ==2){
      var adm3_filtered = feature.aggregate_array("admin3Name").distinct().sort().getInfo()
      build_widgets(adm2_names, adm3_filtered)
  }
}

var create_and_set_layer = function(feature, key, adm) {
    var feature = feature.union();
    Map.centerObject(feature)
    
    var empty = ee.Image().byte();
    var outline = empty.paint({
    featureCollection: feature,
    color: 1,
    width: 2
    });
    
    var layer = ui.Map.Layer(outline, {palette: '202020'}, adm+key, true, 0.9 );
    Map.layers().set(1, layer);
    
    // Map.addLayer(outline, {palette: 'FF0000'}, 'edges');
}


var zoomToAdm1 = function(key) {
    var feature = yem_adm3.filter(ee.Filter.eq('admin1Name', key))
    update_widgets(feature, 1);
    create_and_set_layer(feature, key, "Governorate: ")
    var chart = chart_series(feature)
    panel.widgets().set(4, chart);
  }

var zoomToAdm2 = function(key) {
  var feature = yem_adm3.filter(ee.Filter.eq('admin2Name', key))
    update_widgets(feature, 2);
    create_and_set_layer(feature, key, "District: ")
    var chart = chart_series(feature)
    panel.widgets().set(4, chart);
}

var zoomToAdm3 = function(key) {
  var feature = yem_adm3.filter(ee.Filter.eq('admin3Name', key))
    print(key,"adm3")
    print(feature)
    create_and_set_layer(feature, key, "Sub-district: ")
    var chart = chart_series(feature)
    panel.widgets().set(4, chart);
}

build_widgets(adm2_names,adm3_names)




// Create DateSlider to display composites
var collection = slider_collect;

// Use the start of the collection and now to bound the slider.
var start = ee.Image(collection.first()).get("system:time_start")
// var now = Date.now();
// var end = ee.Date(now).format();
var end = ee.Date('2021-04-20')

print(start, "start")
print(end, "end")

// Function for change of the dateSlider range.
var showMosaic = function(range) {
      var mosaic =  collection.filterDate(range.start(), range.end())
  // Asynchronously compute the name of the composite.  Display it.
      range.start().get('month').evaluate(function(month) {
        var year = ee.String(range.start().get('year')).getInfo()
        var layer = ui.Map.Layer(mosaic, imageVisParamsNDVI, "NDVI Year: "+ year+"; Month: "+month );
        Map.layers().set(0, layer);
  });
};
  var dateSlider = ui.DateSlider({
    start: 1546300800000,
    end: 1618876800000,
    value: null,
    period: 30,
    onChange: showMosaic,
     style: {width: '70%',backgroundColor: 'ffffff50', 
     position:"bottom-center", padding: '2px 2px 2px 2px', margin: '0px 0px 0px 0px'   }
  });
  
  Map.add(dateSlider.setValue(end));







// ADD AVERAGE BASELINE
print(slider_collect)

var baseline_collect = slider_collect.filterMetadata('month', 'equals', '1')

print(baseline_collect)

// baseline_collect.map(function(image){
//       print(image)
//       var date = image.get("system:time_start")
//       // var month = date.get("month")
//       print("date", date)
//       // print("month", month)
       
//       return print(image);
//     })     

// return image.toFloat().divide(255).set('system:time_start', ee.Date.fromYMD(y, m, 1));


// var months = ee.List.sequence(1, 12);
// var years = ee.List.sequence(2019, 2020);

// var byMonthYear = ee.ImageCollection.fromImages(
//   years.map(function(y) {
//     return months.map(function (m) {
//       return baseline_collect
//         .filter(ee.Filter.calendarRange(y, y, 'year'))
//         .filter(ee.Filter.calendarRange(m, m, 'month'))
//         .mean()
//         // .set('month', m).set('year', y)
//   });
  
// }).flatten());
// print(byMonthYear)

// var baseline_chart = ui.Chart.image.series(byMonthYear.select('NDVI'), geometry, ee.Reducer.mean(), 30);
// print(baseline_chart); 







//GEOMETRY DRAWING TOOL
var drawingTools = Map.drawingTools();

drawingTools.setShown(false);

while (drawingTools.layers().length() > 0) {
  var layer = drawingTools.layers().get(0);
  drawingTools.layers().remove(layer);
}

var dummyGeo = ui.Map.GeometryLayer({geometries: null, name: 'geometry', color: '23cba7'});

drawingTools.layers().add(dummyGeo)

function clearGeometry() {
  var layers = drawingTools.layers();
  layers.get(0).geometries().remove(layers.get(0).geometries().get(0));
}

function drawPolygon() {
  clearGeometry();
  drawingTools.setShape('polygon');
  drawingTools.draw();
}

function chart_Ndvi_Geometry() {
  var aoi = drawingTools.layers().get(0).getEeObject();

  drawingTools.setShape(null);

  // Reduction scale is based on map scale to avoid memory/timeout errors.
  var mapScale = Map.getScale();
  var scale = mapScale > 5000 ? mapScale * 2 : 5000;
  
  var chart = chart_series(aoi)
  panel.widgets().set(4, chart);
  
  var area_chart = chart_area(aoi)
  area_chart.style().set({width: '95%',backgroundColor: '00000010', position:"bottom-center" })
  panel.widgets().set(5, area_chart);

  
}

drawingTools.onDraw(ui.util.debounce(chart_Ndvi_Geometry, 500));




// LEGEND elements
var legend = ui.Panel({
  style: {
    position: 'bottom-left',
    padding: '8px 15px',
    backgroundColor: 'ffffff22'
  }
});

var legendTitle = ui.Label({
  value: 'Legend',
  style: {
    fontWeight: 'bold',
    fontSize: '16px',
    // margin: '0 0 4px 0',
    padding: '0',
    backgroundColor: 'ffffff00'
    }
});

legend.add(legendTitle);

var makeRow = function(color, name) {
      var colorBox = ui.Label({
        style: {
          backgroundColor: '#' + color,
          // Use padding to give the box height and width.
          padding: '8px',
          margin: '0 0 4px 0'
          //backgroundColor: '#C0C0C0'
        }
      });
      var description = ui.Label({
        value: name,
        style: {margin: '0 0 4px 6px',
        backgroundColor: 'ffffff50'
        }
      });
      return ui.Panel({
        widgets: [colorBox, description],
        layout: ui.Panel.Layout.Flow('horizontal')
      });
};

var palette =['00660000', '00660050', '006600'];
var names = ['NDVI: <0.1','NDVI: 0.5','NDVI: 1'];

for (var i = 0; i < 3; i++) {
  legend.add(makeRow(palette[i], names[i]));
  }  

Map.add(legend);




//Application Tittle
var title = ui.Label({
  value: 'NDVI of Agricultural Areas in Syria 2019-2021',
  style: {
    position: 'top-center',
    backgroundColor: 'ffffff22',
      // fontWeight: 'light',
    fontSize: '20px',
    // margin: '0 0 4px 0',
    padding: '8px',
  }
})

Map.add(title);

Map.setOptions('HYBRID',{} ,  ['HYBRID', "TERRAIN"]);

