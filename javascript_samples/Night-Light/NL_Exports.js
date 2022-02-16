/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var imageVisParam = {"opacity":1,"bands":["avg_rad"],"gamma":1},
    table = ee.FeatureCollection("users/reachyemengis/DTM_YEM_Lahj_Footprint"),
    admin3 = ee.FeatureCollection("users/reachyemengis/Admin3_2019"),
    admin2 = ee.FeatureCollection("users/reachyemengis/Admin2_2019");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
var geometry7 = ee.Geometry.Polygon(
        [[[46.9119613306696, 16.013503528051547],
          [47.0822494166071, 15.997662866208561],
          [47.45853115488835, 16.14282179048184],
          [47.89798427988835, 16.29841945103095],
          [48.1314437525446, 16.530267612555676],
          [48.27151943613835, 16.34322981112524],
          [48.2687728541071, 16.20349312109521],
          [48.3676498072321, 16.148098297684474],
          [48.6148421900446, 16.140183484133207],
          [48.8345687525446, 16.198218093220095],
          [49.00211025645085, 16.395934725836522],
          [49.17789150645085, 16.422281837712045],
          [49.60016269111314, 16.928669833000978],
          [49.62488192939439, 17.296167517359876],
          [49.72101230048814, 17.432480811818053],
          [49.78251630401873, 18.078538481426648],
          [49.77976972198748, 18.73526155762293],
          [49.06840497589373, 18.667620779416538],
          [48.140483383898975, 18.18727629937226],
          [47.956462387805225, 17.986239698568635],
          [47.560954575305225, 17.434178900823824],
          [47.442851547961475, 17.12262528578823],
          [47.159953598742725, 16.965068095073867],
          [46.973186020617725, 16.95718675407423],
          [46.967692856555225, 16.36778887175694],
          [46.761699204211475, 16.15421566482851]]])

Map.addLayer(geometry7, '', 'mask-area')

Map.addLayer(admin2, '', 'admin2', false)
Map.addLayer(admin3, '', 'admin3', false)

var increase_vis = {"opacity":1,"bands":["avg_rad"],"max":3,"palette":["ffd2d2","b42706"]}
var decrease_vis = {"opacity":1,"bands":["avg_rad"],"min":-3,"max":0,"palette":["3d78ff","d8efff"]};


// Map.setControlVisibility({
//   layerList: 'True', 
//   zoomControl: 'False',
//   fullscreenControl: 'False',
//   drawingToolsControl: 'False'})


var before_start = '2014-01-01' // select_year_before.getValue()+'-'+select_month_before.getValue()+'-01'
//select_year_before.getValue()+'-'+select_month_before.getValue()+'-02'
var after_start = '2020-01-01' //select_year_after.getValue()+'-'+select_month_after.getValue()+'-01'
var before_end = '2014-01-02'
var after_end = '2020-01-02' //select_year_after.getValue()+'-'+select_month_after.getValue()+'-02'

var sorted = ee.List([before_start, before_end, after_start, after_end]).sort()

var before_start = sorted.getString(0)
var before_end = sorted.get(1)
var after_start = sorted.get(1)
var after_end = sorted.get(2)

// print(before_start)
// print(before_end)
// print(after_start)
// print(after_end)




//// Setting style parameters
var drawingTools = Map.drawingTools();
drawingTools.setShown(false);

//var aoi = geometry
 
var vis = {"opacity":1,
"bands":["avg_rad_mean"],
"min": -3, //-203.69401303407443,
"max": 3, //317.39858635822003,
"palette":["2b3cff","fffaf7","ff1717"]}


//// Loading Data
var GHSL = ee.ImageCollection('JRC/GHSL/P2016/SMOD_POP_GLOBE_V1').filter(ee.Filter.date('2015-01-01', '2015-12-31'));

var build_up_area = GHSL.select('smod_code');
var geometry_mask = ee.Image.constant(0).clip(geometry7).mask().not()
var build_up_area = build_up_area.first().mask(geometry_mask).unmask(0)
var mask = build_up_area.neq(0)





// GHSL

//var build_up_area_mask = build_up_area.gt(0)








Map.addLayer(mask, '', 'build_up_area_mask')

// NL Time-Series 2014-2020
var nl = ee.ImageCollection('NOAA/VIIRS/DNB/MONTHLY_V1/VCMSLCFG').select('avg_rad').filter(ee.Filter.date('2017-01-01', '2021-07-25'))



var nl_urban = nl.map(function(image) {
  return image.mask(mask) //.clip(admin0.first())

})




//print(nl_urban)



//// Making mask based on GHSL
// var geometry_mask = ee.Image.constant(0).clip(aoi).mask().not()
// var build_up_area = build_up_area.first().mask(geometry_mask).unmask(0)
// var mask = build_up_area.neq(0)


//print(nl)

// //// Change Maps
// var nl_difference_extractor = function(imageCollection, before_start, before_end, after_start, after_end) {
//   var before = imageCollection.filter(ee.Filter.date(before_start, before_end)).select('avg_rad').first();
//   var after = imageCollection.filter(ee.Filter.date(after_start, after_end)).select('avg_rad').first();
//   //var mean_before = before.reduce(ee.Reducer.mean())
//   //var mean_after = after.reduce(ee.Reducer.mean())
//   var diff = after.subtract(before)
//   return diff
// }




// var before_start = '2020-01-01' 
// var before_end = '2020-01-02'
// var after_start = '2020-02-01'
// var after_end = '2020-02-02'

// var sorted = ee.List([before_start, before_end, after_start, after_end]).sort()


var admin_level = admin3


///////// Exporting tables

var admin_collection = nl.map(function(image) {
    return image.reduceRegions({
                    collection: admin_level,          //UPDATE FEATURE COLLECTIONS HERE
                    reducer: ee.Reducer.mean(), 
                    scale: 10,
                    // tileScale: 16
                })
                .filter(ee.Filter.neq('mean', null)) //filter everything that is not null
                .map(function(f) { //f = image
                  // return f.set('imageId', image.id());
                  var date = image.get('system:time_start');
                  var date_format = ee.Date(date).format('YYYY-MM-dd');
                    return f.set('date', date_format)//make new property; das hier später durch Datum ersetzen  
                  });
              })
            .flatten();

print('adm1_collection', admin_collection)

  var rows = admin_collection.distinct('date');
            
  // Join the table to the unique IDs for a collection in which each feature stores a list of all features having a common row ID. 
  var joined = ee.Join.saveAll('matches').apply({ // determines how the join is applied
    primary: rows, //primary feature collection
    secondary: admin_collection,  //secondary feature collection
    condition: ee.Filter.equals({
      leftField: 'date', 
      rightField: 'date'
    })
  });
  
  var flat_table = joined.map(function(row) { 
      // Get the list of all features with a unique row ID.
      var values = ee.List(row.get('matches'))
        // Map a function over the list of dates to return a list of
        // column ID and value. Turn list of ID/value pairs into Dictionary.
        // add dictionary as property.
        .map(function(feature) {
        //OBS: change admin here
          feature = ee.Feature(feature);
          return ee.List([ee.String(feature.get('admin3pcod')), ee.String(feature.get('mean'))]);
        });
      return row.select(['date']).set(ee.Dictionary(values.flatten()))
});

// APPLY FUNCTION - temp profile to csv
// format_function = format_function(filtered_mosaics, 'date', 'ADM2_PCODE')

print(flat_table, "admin_collection finalized")
//print(admin_collection, "admin_collection finalized")


var description = 'admin3_level_nl_mean'
Export.table.toDrive({
  collection: flat_table,
  description: description, 
  fileNamePrefix: description,
  fileFormat: 'CSV'
});







///////// Exporting tables

var admin_collection = nl.map(function(image) {
    return image.reduceRegions({
                    collection: admin_level,          //UPDATE FEATURE COLLECTIONS HERE
                    reducer: ee.Reducer.sum(), 
                    scale: 10,
                    // tileScale: 16
                })
                .filter(ee.Filter.neq('sum', null)) //filter everything that is not null
                .map(function(f) { //f = image
                  // return f.set('imageId', image.id());
                  var date = image.get('system:time_start');
                  var date_format = ee.Date(date).format('YYYY-MM-dd');
                    return f.set('date', date_format)//make new property; das hier später durch Datum ersetzen  
                  });
              })
            .flatten();

print('adm1_collection', admin_collection)

  var rows = admin_collection.distinct('date');
            
  // Join the table to the unique IDs for a collection in which each feature stores a list of all features having a common row ID. 
  var joined = ee.Join.saveAll('matches').apply({ // determines how the join is applied
    primary: rows, //primary feature collection
    secondary: admin_collection,  //secondary feature collection
    condition: ee.Filter.equals({
      leftField: 'date', 
      rightField: 'date'
    })
  });
  
  var flat_table = joined.map(function(row) { 
      // Get the list of all features with a unique row ID.
      var values = ee.List(row.get('matches'))
        // Map a function over the list of dates to return a list of
        // column ID and value. Turn list of ID/value pairs into Dictionary.
        // add dictionary as property.
        .map(function(feature) {
          feature = ee.Feature(feature);
          //OBS: change admin here
          return ee.List([ee.String(feature.get('admin3pcod')), ee.String(feature.get('sum'))]); 
        });
      return row.select(['date']).set(ee.Dictionary(values.flatten()))
});

// APPLY FUNCTION - temp profile to csv
// format_function = format_function(filtered_mosaics, 'date', 'ADM2_PCODE')

print(flat_table, "admin_collection finalized")
//print(admin_collection, "admin_collection finalized")


var description = 'admin3_level_nl_sum'
Export.table.toDrive({
  collection: flat_table,
  description: description, 
  fileNamePrefix: description,
  fileFormat: 'CSV'
});
 
