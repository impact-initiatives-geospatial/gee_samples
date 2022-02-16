/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var imageVisParam = {"opacity":1,"bands":["avg_rad"],"gamma":1};
/***** End of imports. If edited, may not auto-convert in the playground. *****/
/*
Night light analysis application
Contributor: victor.olsen@reach-initiative.org
*/



// Set visualisation parameters
var increase_vis = {"opacity":1,"bands":["avg_rad"],"max":3,"palette":["ffd2d2","b42706"]}
var decrease_vis = {"opacity":1,"bands":["avg_rad"],"min":-3,"max":0,"palette":["3d78ff","d8efff"]};

// var vis = {"opacity":1,
// "bands":["avg_rad_mean"],
// "min": -3,
// "max": 3,
// "palette":["2b3cff","fffaf7","ff1717"]}

// Set initial image selection parameters
var before = '2014'
var after = '2020'

// Listing variables chronologically (ensures that the calculation is always: after - before)
var sorted = ee.List([before, after]).sort()
var before = sorted.getString(0)
var after = sorted.get(1)

//// Setting style parameters
var drawingTools = Map.drawingTools();
drawingTools.setShown(false);

//// Loading Data
// NL Time-Series 2014-2020
var nl = ee.ImageCollection('NOAA/VIIRS/DNB/MONTHLY_V1/VCMSLCFG').select('avg_rad')

print('first nl', nl.filter(ee.Filter.calendarRange(2017, 2017, 'year')).mean())

//// Change Maps
var nl_difference_extractor = function(imageCollection, before, after) {
  var before = imageCollection.filter(ee.Filter.calendarRange(ee.Number(before), before, 'year')).mean().select('avg_rad');
  var after = imageCollection.filter(ee.Filter.calendarRange(after, after, 'year')).mean().select('avg_rad')
  var diff = after.subtract(before)
  return diff
}



//// UI

// Defining drop down buttons

//Image 1  
var select_year_before = ui.Select(['2014', '2015', '2016', '2017', '2018', '2019', '2020'].reverse(), '2014', '2014')

//Image 2
var select_year_after = ui.Select(['2014', '2015', '2016', '2017', '2018', '2019', '2020'].reverse(), '2020', '2020')

var nl_first = ui.Button({
  label: 'First Image',
  onClick: function() {

    // FilterDates
    var start = select_year_before.getValue()
//    print(start)

    // // Map and name mosaick
    // Map.addLayer(nl.filter(ee.Filter.calendarRange(before, before, 'year')).mean().select('avg_rad'));
  }
});

var nl_second = ui.Button({
  label: 'Second Image',
  onClick: function() {
  
    // FilterDates
    var start = select_year_after.getValue()
    // // Map and name mosaick
    // Map.addLayer(nl.filterDate(start, end), '' , select_year_after.getValue()+'-'+select_month_after.getValue());
  }
});




var increase = ui.Button({
  label: 'Increase',
  onClick: function() {

    var before = select_year_before.getValue()
    var after = select_year_after.getValue()
    
    var sorted = ee.List([before, after]).sort();

    var before = sorted.get(0);
    var after = sorted.get(1);

    var change = nl_difference_extractor(nl, before, after)
    
    var change_masked = change.mask(change.gt(0.4))
    
    var vis_param = increase_vis

    var name = 'Increase'

    var layer = ui.Map.Layer(change_masked, vis_param, name)
    
    Map.layers().set(0, layer);
  }
});



var decrease = ui.Button({
  label: 'Decrease',
  onClick: function() {
    
    var input_before_start = select_year_before.getValue()+'-'+select_month_before.getValue()+'-01'
    var input_before_end = select_year_before.getValue()+'-'+select_month_before.getValue()+'-02'
    var input_after_start = select_year_after.getValue()+'-'+select_month_after.getValue()+'-01'
    var input_after_end = select_year_after.getValue()+'-'+select_month_after.getValue()+'-02'
    
    var sorted = ee.List([input_before_start, input_before_end, input_after_start, input_after_end]).sort();

    var before_start = sorted.get(0);
    var before_end = sorted.get(1);
    var after_start = sorted.get(2);
    var after_end = sorted.get(3);
    
    var change = nl_difference_extractor(nl, before_start, before_end, after_start, after_end)
    
    var change_masked = change.mask(change.lt(-0.4))
    
    var vis_param = decrease_vis
    
    var name = 'Decrease'
    
    var layer = ui.Map.Layer(change_masked, vis_param, name)
    Map.layers().set(1, layer);
  }
});


////////////// Charting

var chart_collect = nl

var chart_series = function(geo) {return ui.Chart.image.series(chart_collect, geo, ee.Reducer.mean(), 3000)
      .setOptions({
        title: 'Night Light 2014-2021',
        vAxis: {title: 'Light Intensity'},
        lineWidth: 1,
        pointSize: 3,
        maxPixels: 1000000000,
        bestEffort: true
      });
}

// Create an empty panel in which to arrange widgets
// var panel = ui.Panel({style: {width: '400px', backgroundColor:'ffffff50'}})

//callback function for charting NDVI series
Map.onClick(function(coords) {  // var location = 'lon: ' + coords.lon.toFixed(2) + ' ' +'lat: ' + coords.lat.toFixed(2);
  // var coords_label = "Coordinates: " + location
  // panel.widgets().set(1, ui.Label(coords_label));
    //drawPolygon()
    var point = ee.Geometry.Point(coords.lon, coords.lat);
    var chart = chart_series(point)
    chart.style().set({width: '100%', height: '200px', backgroundColor: '00000010', position:"bottom-right" })
    panel2.widgets().remove(time_series)
    panel2.widgets().set(0, chart);
  // Map.add( chart);
});

//ui.root.add(panel);








///////////////////// Setting up panel /////////////////////

// // Creating Panel to hold the widgets
// var panel4 = ui.Panel('', 'flow', {width: '300px'});
// panel4.style().set({
//   width: '380px',
//   position: 'top-left',
//   padding: '4px',
//   height: '300px'
// });
// Map.add(panel4);



var panel = ui.Panel([], 'flow', {width: '380px', position:'top-left'})
panel.style().set({position: 'top-left'})
//Map.add(panel);

ui.root.widgets().add(panel);



// Creating Panel to hold the widgets
var panel2 = ui.Panel();
panel2.style().set({
  width: '800px',
  //height: '500px',
  position: 'bottom-right'
});
Map.add(panel2);



//// Text

var textbox = ui.Textbox({
  placeholder: 'Format: 2014-01',
  onChange: function(text) {
    print('So what you are saying is ' + text + '?');
  }
});

var textbox2 = ui.Textbox({
  placeholder: 'Ex 2021-01',
  onChange: function(text) {
    print('So what you are saying is ' + text + '?');
  }
});

var before = ui.Label({value:'First image', 
style: {
    position: 'bottom-center',
    backgroundColor: 'ffffff99',
    fontWeight: 'bold',
    fontSize: '14px',
    // margin: '0 0 4px 0',
    padding: '2px',
    whiteSpace: 'pre'}})
    
var after = ui.Label({value:'Second image', 
style: {
    position: 'bottom-center',
    backgroundColor: 'ffffff99',
    fontWeight: 'bold',
    fontSize: '14px',
    // margin: '0 0 4px 0',
    padding: '2px',
    whiteSpace: 'pre'}});
    
var textbox3 = ui.Label({value:'Change Maps', 
style: {
    position: 'bottom-center',
    backgroundColor: 'ffffff99',
    fontWeight: 'bold',
    fontSize: '14px',
    // margin: '0 0 4px 0',
    padding: '2px',
    whiteSpace: 'pre'}});
    
var textbox4 = ui.Label({value:'Intensity Maps', 
style: {
    position: 'bottom-center',
    backgroundColor: 'ffffff99',
    fontWeight: 'bold',
    fontSize: '14px',
    // margin: '0 0 4px 0',
    padding: '2px',
    whiteSpace: 'pre'}});
    
var title = ui.Label({value:'Night Light Analysis', 
style: {
    position: 'bottom-center',
    backgroundColor: 'ffffff99',
    fontWeight: 'bold',
    fontSize: '25px',
    // margin: '0 0 4px 0',
    padding: '2px',
    whiteSpace: 'pre'}});
    
var method = ui.Label({value:
'Analyse where night light has increased \n' +
'or decreased between two time-periods \n\n'+
'Process:\n' +
'1. Select a first image/date (year and month)\n'+
'2. Select an second image/date (year and month)\n'+
'3. Compute Increase or Decrease maps\n'+
'4. Produce Night Light Intensity maps for both periods\n' +
'6. Chart a time-series by clicking on the map',

style: {
    position: 'bottom-center',
    backgroundColor: 'ffffff99',
    //fontWeight: 'bold',
    fontSize: '14px',
    // margin: '0 0 4px 0',
    padding: '2px',
    whiteSpace: 'pre'}});
    
var description = ui.Label({
value:'This is where the tool will be described in detail \n'+
'This is where the tool will be described in detail \n'+
'This is where the tool will be described in detail \n'+
'This is where the tool will be described in detail \n', 
style: {
    position: 'bottom-center',
    backgroundColor: 'ffffff99',
      // fontWeight: 'light',
    fontSize: '9px',
    // margin: '0 0 4px 0',
    padding: '2px',
    whiteSpace: 'pre'}})


var time_series = ui.Label({value:'Click on the Map to Chart a Night Light Time-Series', 
style: {
    position: 'bottom-center',
    backgroundColor: 'ffffff99',
    fontWeight: 'bold',
    fontSize: '14px',
    // margin: '0 0 4px 0',
    padding: '2px',
    whiteSpace: 'pre'}})


//panel.widgets().set(1, slider1);
//panel.widgets().set(2, slider2);

//panel.widgets().set(4, nl_year);
//panel.widgets().set(5, nl_month);

panel.widgets().set(1, title);
panel.widgets().set(2, method);
panel.widgets().set(7, before);
panel.widgets().set(8, select_year_before);

panel.widgets().set(10, after);
panel.widgets().set(11, select_year_after);

panel.widgets().set(11, textbox3);
panel.widgets().set(19, increase);
panel.widgets().set(19, decrease); 
panel.widgets().set(20, textbox4);
panel.widgets().set(21, nl_first);
panel.widgets().set(22, nl_second);
//panel.widgets().set(25, description)
panel2.widgets().set(25, time_series)

//panel.widgets().set(21, select)
//Map.add(slider1.setValue(end));

Map.setCenter(45.26490,15.39012, 6)

Map.setOptions('TERRAIN',{} ,  ['HYBRID', "TERRAIN"]);

