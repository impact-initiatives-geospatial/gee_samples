/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var geometry = /* color: #d63000 */ee.Geometry.Polygon(
        [[[37.79593528221176, 36.27445357809122],
          [37.79593528221176, 35.68770179471936],
          [38.66385520408676, 35.68770179471936],
          [38.66385520408676, 36.27445357809122]]], null, false);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
/*
Description: CHIRPS Exports for the Syria Agri App
Contributor: Pedro, Esther, Reem and Victor (REACH Yemen and Syria)
*/


// Select administrative area
var baseRepo = "users/reachsyriagee/"
var syrAdm3  = ee.FeatureCollection(baseRepo + "Admin_Areas/syr_adm3"); 

// Select time frame 
var start = ee.Date('2017-01-01');
var end = ee.Date('2021-11-15');

// Select CHIRPS data 
var CHIRPS = ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY")
                .filterDate(start,end)
                .map(function(image) {
                return image.clip(syrAdm3)
                })
print(CHIRPS)

var dates = CHIRPS.toList(CHIRPS.size()).map(function(img){
    return ee.Image(img).date().format()
  })
  
console.log(dates.getInfo());

// Functions to aggregate CHIRPS on a monhtly basis
function make_date_range_monthly(start,end){
  var n_months = end.difference(start,'month').round().subtract(1);
  var range = ee.List.sequence(0,n_months,1); 
  var make_datelist = function (n) {
    return start.advance(n,'month')
  };
  return range.map(make_datelist);
}


function composite_monthly(imgCol, date_range){
  return ee.ImageCollection.fromImages(
      date_range.map(function (date) {
        date = ee.Date(date)
        imgCol = imgCol.filterDate(date, date.advance(1,'month'))
       
        return imgCol.sum()
                     .set('year', date.get('year'))
                    .set('month', date.get('month'))
                    .set('system:time_start', date)
                    .float()
      }))
}

// Make date range 
var date_range_monthly = make_date_range_monthly(start,end)

print('date_range_monthly',date_range_monthly)

// Make CHIRPS mosaics (monthly composites)
var CHIRPS_mosaics = composite_monthly(CHIRPS, date_range_monthly)//.select(["precipitation"],["Precipitation"])
print(CHIRPS_mosaics)

print(CHIRPS_mosaics.select(["precipitation"],["Precipitation"]))

// Export CHIRPS mosaics
var listOfImages = CHIRPS_mosaics.toList(CHIRPS_mosaics.size())
var len = listOfImages.size();

var month = 0;
var year = 2017
var bool;

len.evaluate(function(l) {
  for (var i=0; i < l; i++) {
    month +=1

    var img = ee.Image(listOfImages.get(i)); 

    var name = 'Syria_CHIRPS_'+ year + '_' + month
   
    Export.image.toAsset({
  description: name,
  image:img,
  assetId: 'SY_CHIRPS/'+name,
  scale: 100,
  region: syrAdm3.geometry(),
  maxPixels: 2000000000000
})
    
    
    bool = (i+1) % 12 === 0
    if (bool) {month = 0; year += 1}
  } 
});




