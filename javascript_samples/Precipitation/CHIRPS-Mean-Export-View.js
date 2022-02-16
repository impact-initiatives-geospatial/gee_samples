/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var geometry = 
    /* color: #d63000 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[22.192199939436946, 13.103180650532428],
          [22.192199939436946, 2.714968639537447],
          [37.26544212693695, 2.714968639537447],
          [37.26544212693695, 13.103180650532428]]], null, false);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
/*
Description: Exporting multiple mean precipitaiton composites.
Contributor: victor.olsen@reach-initiative.org
*/

var CHIRPS = ee.ImageCollection('UCSB-CHG/CHIRPS/DAILY')
                  .filter(ee.Filter.date('2016-01-01', '2019-12-31')).select('precipitation');




// Composite producer
var composite_producer = function(imageCollection, start, end) {
  
  var time_period = imageCollection.filter(ee.Filter.date(start, end));

  var composite = time_period.reduce(ee.Reducer.mean())
  
  return composite
}


var start = '2015-04-01'
var end = '2016-10-30'
var chirps_2015_2016 = composite_producer(CHIRPS, start, end)

var start = '2016-04-01'
var end = '2017-10-30'
var chirps_2016_2017 = composite_producer(CHIRPS, start, end)

var start = '2017-04-01'
var end = '2018-10-30'
var chirps_2017_2018 = composite_producer(CHIRPS, start, end)

var start = '2018-04-01'
var end = '2019-10-30'
var chirps_2018_2019 = composite_producer(CHIRPS, start, end)


// Visualizing mean composites
var precipitationVis = {
  min: 1.0,
  max: 17.0,
  palette: ['001137', '0aab1e', 'e7eb05', 'ff4a2d', 'e90000'],
};


Map.addLayer(chirps_2016_2017, precipitationVis, 'chirps_2016_2017');
Map.addLayer(chirps_2017_2018, precipitationVis, 'chirps_2017_2018');

// Export 
Export.image.toDrive({
  image: chirps_2015_2016.clip(geometry),
  description: 'chirps_2015_2016',
  scale: 5000,
  region: geometry,
  maxPixels: 2000000000000
});

// Export 
Export.image.toDrive({
  image: chirps_2016_2017.clip(geometry),
  description: 'chirps_2016_2017',
  scale: 5000,
  region: geometry,
  maxPixels: 2000000000000
});

// Export 
Export.image.toDrive({
  image: chirps_2017_2018.clip(geometry),
  description: 'chirps_2017_2018',
  scale: 5000,
  region: geometry,
  maxPixels: 2000000000000
});

// Export 
Export.image.toDrive({
  image: chirps_2018_2019.clip(geometry),
  description: 'chirps_2018_2019',
  scale: 5000,
  region: geometry,
  maxPixels: 2000000000000
});




