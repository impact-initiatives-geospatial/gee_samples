
// var chartSeries = function(varString, geo, imageCollect, reducer, convertArea) {

//   var title = varString.concat(" Over Time")
//   if(convertArea){
//     var scale = getMapScale()
//     var scaleFactor = scale/10

// var imageCollect = imageCollect.map(
//       function(image){return image.eq(3).multiply(ee.Image.pixelArea()).copyProperties(image, image.propertyNames())}) // .divide(1000000)
//   }

//   return ui.Chart.image.series(imageCollect, geo, reducer, 100)
//       .setOptions({
//         title: title,
//         vAxis: {title: varString}, //viewWindow: {minValue: 0, maxValue: 0.7}},
//         hAxis: { title: 'Time' },
//         lineWidth: 1,
//         pointSize: 2,
//         // maxPixels: 1000000000,
//         bestEffort: true
//       })
// }


// exports.chartSeries = chartSeries

var chartSeries = function(varString, geo, imageCollect, reducer, convertArea, bars) {

  var title = varString.concat(" Over Time")
  if(convertArea){
    var scale = getMapScale()
    var scaleFactor = scale/10

 var imageCollect = imageCollect.map(
      function(image){return image.eq(3).multiply(ee.Image.pixelArea()).copyProperties(image, image.propertyNames())}) // .divide(1000000)
  }

  if(bars){
    return ui.Chart.image.series(imageCollect, geo, reducer, 100)
      .setOptions({
        title: title,
        vAxis: {title: varString}, //viewWindow: {minValue: 0, maxValue: 0.7}},
        hAxis: { title: 'Time' },
        // maxPixels: 1000000000,
        bestEffort: true
      })
      .setChartType('ColumnChart')

  }
  else{
    return ui.Chart.image.series(imageCollect, geo, reducer, 100)
      .setOptions({
        title: title,
        vAxis: {title: varString}, //viewWindow: {minValue: 0, maxValue: 0.7}},
        hAxis: { title: 'Time' },
        lineWidth: 1,
        pointSize: 2,
        // maxPixels: 1000000000,
        bestEffort: true
      })
  }

}

exports.chartSeries = chartSeries


exports.setPanel1 = function(panel,country, number) {


  var description_label = ui.Label({value:'SELECT image date in drop-down menu\n'+
                                          'SELECT admin area to plot time-series\n'+
                                          'DRAW area on map to plot time-series\n'+
                                          'CLICK on charts to download time-series (top right corner)\n'+
                                          'PAN (hold click) and ZOOM to explore the datasets'
  , style: {
      position: 'bottom-center',
      backgroundColor: 'ffffff99',
        // fontWeight: 'light',
      fontSize: '12px',
      // margin: '0 0 4px 0',
      padding: '2px',
      whiteSpace: 'pre'}})

   panel.widgets().set(number, description_label);

   ui.root.add(panel);

   return panel
}


exports.setPanel2 = function(panel,country, number) {


  var description_label = ui.Label({value:'Methodology and Data Description'
  , style: {
      position: 'bottom-center',
      backgroundColor: 'ffffff99',
        // fontWeight: 'light',
      fontSize: '12px',
      // margin: '0 0 4px 0',
      padding: '2px',
      whiteSpace: 'pre'}}).setUrl('https://reach-syria.github.io/agri-app-public/')


   panel.widgets().set(number, description_label);

   ui.root.add(panel);

   return panel
}


// STABLE SLIDER
// exports.createAndSetDateSlider = function(start, end, collection, imageVisParamsNDVI, label) {

//   var startClient = start.getInfo()
//   var endClient = end.getInfo()

//   var showMosaic = function(range) {
//       var mosaic =  collection.filterDate(range.start(), range.end())
//   // Asynchronously compute the name of the composite.  Display it.
//       range.start().get('month').evaluate(function(month) {
//         var year = ee.String(range.start().get('year')).getInfo()
//         var layer = ui.Map.Layer(mosaic, imageVisParamsNDVI, label + year+"; Month: "+month );
//         Map.layers().set(0, layer);
//   });
// }

// return ui.DateSlider({
//     start: startClient.value,
//     end: endClient.value,
//     period: 30,
//     onChange: showMosaic,
//     style: {width: '55%',backgroundColor: 'ffffff50',
//     position:"bottom-center", padding: '2px 2px 2px 2px', margin: '0px 0px 0px 0px'   }
//   });

// }


// MULTIPLE COLLECTION SLIDER
exports.createAndSetDateSliders = function(start, end, collections, visParams, labels) {

  var startClient = start.getInfo()
  var endClient = end.getInfo()

  var showMosaic = function(range) {
    for(var i =0; i < collections.length; i++){
      var collection = collections[i]
      var label = labels[i]
      var visParam = visParams[i]
      var mosaic =  collections[i].filterDate(range.start(), range.end())

      // range.start().get('month').evaluate(function(month) {
        var year = ee.String(range.start().get('year')).getInfo()
        var layer = ui.Map.Layer(mosaic, visParam, label + year+"; Month: "+ range.start().get('month').getInfo() );
        if(layer){
        Map.layers().set(i, layer);
        }
      // });
  }
}

  return ui.DateSlider({
      start: startClient.value,
      end: endClient.value,
      period: 30,
      onChange: showMosaic,
      style: {width: '55%',backgroundColor: 'ffffff50',
      position:"bottom-center", padding: '2px 2px 2px 2px', margin: '0px 0px 0px 0px'   }
    });

}



// // NEW DATA CORRECTED SLIDER
var createAndSetDateSlider = function(start, end, collection, imageVisParamsNDVI, label) {

  var startClient = start.getInfo()
  var endClient = end.getInfo()

  // for(i=0, collections.lenght)
  var showMosaic = function(range) {
      var mosaic =  collection.filterDate(range.start(), range.end())
  // Asynchronously compute the name of the composite.  Display it.
      range.start().get('month').evaluate(function(month) {
        var year = ee.String(range.start().get('year')).getInfo()
        if(range.start().get('year')===2018){
          dateSlider.setStart(range.start().advance(-5,"months"))
          dateSlider.setEnd(range.end().advance(5,"months"))
        }
        var layer = ui.Map.Layer(mosaic, imageVisParamsNDVI, label + year+"; Month: "+month );
        Map.layers().set(0, layer);
  });
}


var dateSlider =  ui.DateSlider({
    start: startClient.value,
    end: endClient.value,
    period: 30,
    onChange: showMosaic,
    style: {width: '55%',backgroundColor: 'ffffff50',
    position:"bottom-center", padding: '2px 2px 2px 2px', margin: '0px 0px 0px 0px'   }
  });

Map.add(dateSlider.setValue(end.advance(-3,"week")))


}

exports.createAndSetDateSlider=createAndSetDateSlider





var getMonth = function(dateMonthSelect) {
   return dateMonthSelect.getValue()
}

exports.getMonth=getMonth


var getYear = function(dateYearSelect) {
   return dateYearSelect.getValue()
}

exports.getYear=getYear





// // MONTH SELECT DROPDOWN WIDGET
var createMonthDropDown = function(endYear, endMonth, collections, visParams, labels, dateYearSelect) {

var months = ee.List.sequence(1, 12, 1)

var months = ["1","2","3","4","5","6","7","8","9","10","11","12"]

// print(months)

var dateMonthSelect =  ui.Select({
    items: months,
    placeholder: "Select a Month",
    // value: ee.String(ee.Number(endMonth)).getInfo(),
    // onChange: showMosaic,
    style: {width: '20%',backgroundColor: 'ffffff50',
    position:"top-center", padding: '2px 2px 2px 2px', margin: '0px 0px 0px 0px'   }
  });

return dateMonthSelect

}

exports.createMonthDropDown=createMonthDropDown





// // YEAR SELECT DROPDOWN WIDGET
var createYearDropDown = function(startYear, endYear, collections, visParams, labels) {

var years =  ee.List.sequence(startYear, endYear, 1).map(function(number) {
  return ee.String(ee.Number(number))
})

// print(years)

years = ["2017","2018","2019","2020","2021"]

var dateYearSelect =  ui.Select({
    items: years,
    placeholder: "Select a Year",
    // value: "2021",
    // onChange: showMosaic,
    style: {width: '20%',backgroundColor: 'ffffff50',
    position:"top-center", padding: '2px 2px 2px 2px', margin: '20px 20px '   }
  });

  return dateYearSelect
}


exports.createYearDropDown=createYearDropDown





var createMapLegend = function() {

var legend = ui.Panel({
  style: {
    position: 'bottom-left',
    padding: '8px 8px',
    backgroundColor: 'ffffff99'
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
return legend.add(legendTitle);
}

exports.createMapLegend = createMapLegend



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

exports.makeRow = makeRow



var createTitle1 = function(title) {

  return ui.Label({
    value: title,
    style: {
      position: 'top-center',
      backgroundColor: 'ffffff70',
      fontWeight: 'bold',
      fontSize: '20px',
      // margin: '0 0 4px 0',
      padding: '0px',
    }
  })
}
exports.createTitle1 = createTitle1


var createTitle2 = function(title) {

  return ui.Label({
    value: title,
    style: {
      position: 'top-center',
      backgroundColor: 'ffffff70',
        // fontWeight: 'light',
      fontSize: '16px',
      // margin: '0 0 4px 0',
      padding: '0px',
    }
  })
}
exports.createTitle2 = createTitle2


var createAndSetMapElements = function(title,legendPalette,NDVInames,size) {
var legend = createMapLegend()
for (var i = 0; i < size; i++) {
  legend.add(makeRow(legendPalette[i], NDVInames[i]));
  }
Map.add(legend);

var title = createTitle(title)
Map.add(title);
}

exports.createAndSetMapElements = createAndSetMapElements



var createAndSetLegend= function(legendPalette,NDVInames,size) {
var legend = createMapLegend()
for (var i = 0; i < size; i++) {
  legend.add(makeRow(legendPalette[i], NDVInames[i]));
  }
Map.add(legend);
}

exports.createAndSetLegend = createAndSetLegend







var update_widgets = function(admAttributeNames, placeHolders, level, imageCollect, admFeatures, panel ) {
  var level = level + 1

  if(level ===2){
  var selectAdm2 = buildAdmAreaWidget(admAttributeNames, placeHolders, level, imageCollect, admFeatures, panel)
  panel.widgets().set(4, selectAdm2);
  }
  else if(level ===3){
      var selectAdm3 = buildAdmAreaWidget(admAttributeNames, placeHolders, level, imageCollect, admFeatures, panel)
      panel.widgets().set(5, selectAdm3);
  }
}


var createAndSetLayer = function(feature, key, adm) {
    var feature = feature.union();
    Map.centerObject(feature)

    var empty = ee.Image().byte();
    var outline = empty.paint({
    featureCollection: feature,
    color: 1,
    width: 2
    });

    var layer = ui.Map.Layer(outline, {palette: '202020'}, adm+key, true, 0.9 );
    Map.layers().set(2, layer);

    // Map.addLayer(outline, {palette: 'FF0000'}, 'edges');
}

exports.createAndSetLayer = createAndSetLayer



var buildAdmAreaWidget = function(admAttributeNames, placeHolders, level, imageCollects, admFeatures, panel ) {

var index = level -1
var admAttributeName = admAttributeNames[index]
var placeHolder = placeHolders[index]

var admAreaNames = admFeatures.aggregate_array(admAttributeName).distinct().sort().getInfo()


var zoomToAdm1 = function(key) {
    var feature = admFeatures.filter(ee.Filter.eq(admAttributeName, key))
    update_widgets(admAttributeNames, placeHolders, level, imageCollects, feature, panel );
    createAndSetLayer(feature, key, "Governorate: ")
    if(imageCollects.length >= 1){
    var chart = chartSeries("NDVI",feature,imageCollects[0],ee.Reducer.mean(),false,false)
    panel.widgets().set(6, chart);
    }
    if(imageCollects.length >= 2 ){
    var chart = chartSeries("Water (m²)",feature,imageCollects[1],ee.Reducer.sum(),true,false)
    panel.widgets().set(7, chart);
    }
    if(imageCollects.length === 3 ){
    var chart = chartSeries("Precipitation (mm)",feature,imageCollects[2],ee.Reducer.mean(),false,true)
    panel.widgets().set(8, chart);
    }

  }


var zoomToAdm2 = function(key) {
  var feature = admFeatures.filter(ee.Filter.eq(admAttributeName, key))
    update_widgets(admAttributeNames, placeHolders, level, imageCollects, feature, panel );
    createAndSetLayer(feature, key, "District: ")
    if(imageCollects.length >= 1){
    var chart = chartSeries("NDVI",feature,imageCollects[0],ee.Reducer.mean(),false,false)
    panel.widgets().set(6, chart);
    }
    if(imageCollects.length >= 2 ){
    var chart = chartSeries("Water (m²)",feature,imageCollects[1],ee.Reducer.sum(),true,false)
    panel.widgets().set(7, chart);
    }
    if(imageCollects.length === 3 ){
    var chart = chartSeries("Precipitation (mm)",feature,imageCollects[2],ee.Reducer.mean(),false,true)
    panel.widgets().set(8, chart);
    }
}


var zoomToAdm3 = function(key) {
  var feature = admFeatures.filter(ee.Filter.eq(admAttributeName, key))
    createAndSetLayer(feature, key, "Sub-district: ")
     if(imageCollects.length >= 1){
    var chart = chartSeries("NDVI",feature,imageCollects[0],ee.Reducer.mean(),false,false)
    panel.widgets().set(6, chart);
    }
    if(imageCollects.length >= 2 ){
    var chart = chartSeries("Water (m²)",feature,imageCollects[1],ee.Reducer.sum(),true,false)
    panel.widgets().set(7, chart);
    }
    if(imageCollects.length === 3 ){
    var chart = chartSeries("Precipitation (mm)",feature,imageCollects[2],ee.Reducer.mean(),false,true)
    panel.widgets().set(8, chart);
    }
}


if( level==1){
  return ui.Select({
  items: admAreaNames,
  placeholder: placeHolder,
  onChange: zoomToAdm1
});
}
else if( level ==2){
    return ui.Select({
  items: admAreaNames,
  placeholder: placeHolder,
  onChange: zoomToAdm2
});
}
else if( level ==3){
    return ui.Select({
  items: admAreaNames,
  placeholder: placeHolder,
  onChange: zoomToAdm3
});
}

}

exports.buildAdmAreaWidget = buildAdmAreaWidget




var clearGeometry =  function(drawingTools) {
  if (drawingTools.layers().length() >= 1) {
var drawingLayers = drawingTools.layers();
  drawingLayers.get(0).geometries().remove(drawingLayers.get(0).geometries().get(0));
  }
// var layers = drawingTools.layers();
//   layers.get(0).geometries().remove(layers.get(0).geometries().get(0));
}


var drawPolygon = function (drawingTools) {
  drawingTools.setShape('polygon');
  drawingTools.draw();
  clearGeometry(drawingTools);
}


exports.clearGeometry = clearGeometry
exports.drawPolygon = drawPolygon



var getMapScale = function() {
  var mapScale = Map.getScale();
  if(mapScale > 600)
  {var scale = 500}
  else if(mapScale > 300 && mapScale < 600)
    {var scale = 300}
  else if (mapScale > 100 && mapScale < 300)
    {var scale = 100}
  else if (mapScale > 50 && mapScale < 100)
    {var scale = 50}
  else
    {scale =10}

  return scale;
  // var scale = mapScale > 300 ? mapScale * 2 : 5000;
}


var chartNdviGeometry = function(varString, panel, drawingTools,imageCollect) {
  var aoi = drawingTools.layers().get(0).getEeObject();
  drawingTools.setShape(null);
  // var chart = chartSeries(varString,aoi,imageCollect)
  // panel.widgets().set(6, chart);
  // drawPolygon(drawingTools)
}

var configureDrawingTools = function(drawingTools){
drawingTools.setShown(false);

var dummyGeo = ui.Map.GeometryLayer({geometries: null, name: 'geometry', color: 'ffffff'});
drawingTools.layers().add(dummyGeo)
}

exports.configureDrawingTools = configureDrawingTools
exports.getMapScale = getMapScale
