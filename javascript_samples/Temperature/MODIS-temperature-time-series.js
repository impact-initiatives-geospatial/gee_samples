// You need to read the geometry and named it as admin0 first 

var modis = ee.ImageCollection('MODIS/006/MOD11A2');

var start = ee.Date('2015-01-01');
var end = ee.Date('2021-12-31');

print(end)

var modLSTday  = modis
.select('LST_Day_1km')
.filterDate(start,end)
//.filter(ee.Filter.calendarRange(1,10,'month'));


//FUNCTION::Scale to Kelvin and convert to Celsius, set image acquisition time.
var modLSTc = modLSTday.map(function(img) {
  return img
  .multiply(0.02)
  .subtract(273.15)
  .copyProperties(img, ['system:time_start']);
});

// Chart time series of LST for Iraq 
var ts1 = ui.Chart.image.series({
  imageCollection: modLSTc,
  region: admin0,
  reducer: ee.Reducer.mean(),
  scale: 1000,
  xProperty: 'system:time_start'})
.setOptions({
  title: 'LST 2015 Time Series',
  vAxis: {title: 'LST Celsius'}});
print(ts1);