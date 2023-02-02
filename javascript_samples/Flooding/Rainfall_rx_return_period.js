
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////// R A I N F A L L   I N T E N S I T Y  ///////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// https://code.earthengine.google.com/9ce0de673e6df70dfe765bd42a6198f7
// https://sheltercluster.s3.eu-central-1.amazonaws.com/public/docs/reach_yem_methodologynote_watershedrunoff_20072020.pdf
//.......................................Annual Max Precipitaiton



// Create clipping function
var clipper = function(image){
  return image.clip(table);
};
// DATA
var precip = ee.ImageCollection('UCSB-CHG/CHIRPS/DAILY')
  .map(clipper)
  .select('precipitation');
var years = ee.List.sequence(1984,2019);

// Group by year, and then reduce within groups by max();
// the result is an ImageCollection with one image for each
// year.

var byYear = ee.ImageCollection.fromImages(
      years.map(function(y) {
        return precip.filter(ee.Filter.calendarRange(y, y, 'year'))
                    .filterBounds(table)  
                    .select('precipitation').max()
                    .set('year', y);
}));

//print("Yearly images",byYear);

////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////GEV PARAMETER ESTIMATION//////////////////////////////////////

//Transform the image collection in array
var array = byYear.toArray();
var numCollection = byYear.size();
print ('collection size', numCollection)

//Label array axes
var axes = { image:0, band:1 };
var sort = array.arraySlice(axes.band, 0, 1);  // select bands from index 0 to 1 (rain Intensity)
var sorted = array.arraySort(sort);

//Transform the sorted array into a set of images, each one with 2 bands, the first with pixels in ascending order, 
//the second with the rank
var list = ee.List.sequence(0,numCollection.subtract(1));
var iter_function = function(num){
  var counter = ee.Number(num).int();
  var constant = ee.Image(counter);
  var values = sorted.arraySlice(axes.image, counter, counter.add(1));
  var img = values.arrayProject([axes.band]).arrayFlatten([['precipitation']]).addBands(constant.add(1).set("system:id",counter));
  
  return img.toFloat();
}
//Transform the single sorted images into an image collection and plot them
var out = list.map(iter_function);
print('list',out);
var sortedCollection = ee.ImageCollection(out);
//print('collection', sortedCollection);
Map.addLayer(sortedCollection, {}, 'collection');

//////////////////Probability Weighted Moments Equations////////////////////////////////

var dividend = ee.Image(numCollection); //Total number of images in the collection

//Calculate the M100 wighted moment
var M100 = sortedCollection.select('precipitation').reduce(ee.Reducer.sum()).divide(dividend);
//print('M100', M100);
//Map.addLayer(M100, {}, 'M100');

//Calculate M110 weighted moment
 var f_M110_img = function(rank, rain){
   var res = function(img){
    var c = img.select(rank).subtract(1)
    return img.select(rain).multiply(c);
 }
 return res;
 };
 var M110_img = sortedCollection.map(f_M110_img('constant', 'precipitation'));
 var M110 = M110_img.reduce(ee.Reducer.sum()).divide(dividend.expression(
   '(n-1)*n',{
     'n': dividend
   }));
 //print('M110', M110_img)
//Map.addLayer(M110, {}, 'M110');

//Calculate M120 weighted moment.

var f_M120_img = function(rank, rain){
  var res = function (img){
    var exp =img.expression(
      'I*((c-1)*(c-2))',{
      'I': img.select(rain),
      'c': img.select(rank)
    })
   return exp;
}
return res;
}

var M120_img = sortedCollection.map(f_M120_img('constant', 'precipitation'));
var M120 = M120_img.reduce(ee.Reducer.sum()).divide(dividend.expression(
  '(n-2)*(n-1)*n',{
    'n': dividend
  }));
//print ('M120', M120_img);
//Map.addLayer(M120, {}, 'M120');

//Calculate M130 weighted moment.

var f_M130_img = function(rank, rain){
  var res = function(img){
  var exp = img.expression(
    'I*((c-1)*(c-2)*(c-3))',{
    'I': img.select(rain),
    'c': img.select(rank)
    })
   return exp;
  };
  return res;
}
var M130_img = sortedCollection.map(f_M130_img('constant', 'precipitation'));
var M130 = M130_img.reduce(ee.Reducer.sum()).divide(dividend.expression(
  '(n-3)*(n-2)*(n-1)*n',{
    'n': dividend
  }));
//print('M130', M130);
//Map.addLayer(M130, {}, 'M130')

////////////////////////L-MOMENT EQUATIONS///////////////////////////////////////////

var L1 = M100;
var L2 = M110.multiply(2).subtract(M100);
var L3 = M120.multiply(6).subtract(M110.multiply(6)).add(M100);
var L4 = M130.multiply(20).subtract((M120).multiply(30)).add(M110.multiply(12)).subtract(M100);

var tau2 = L2.divide(L1);
var tau3 = L3.divide(L2);
var tau4 = L4.divide(L2);

/////////////////////GEV PARAMETERS/////////////////////////////////////////////////
//Shape parameters calculation (k)
var c = ee.Image(2).divide(tau3.add(3)).subtract(ee.Image(2).log().divide(ee.Image(3).log()));
var k = c.multiply(7.8590).add(c.pow(2).multiply(2.9554));

//Scale parameter calculation (alpha)
var gamma = k.add(1).gamma();
var alpha = L2.multiply(k).divide(gamma.multiply(k.expression(
  '1-2**(-k)',{
    'k': k
  })));

//Location parameter calculation (xi)
var xi = L1.subtract(alpha.multiply(gamma.expression(
  '1-g',{
    'g': gamma
  })).divide(k));
 // Map.addLayer(xi,{},'x')
  ////////////////////////////////GEV////////////////////////////////////////////////
  //GEV function of Maximum precipitation for T-return period
var Treturn = function(t){
   var core = ee.Image(t).expression(
     '(t-1)/t',{
       't': t
     }).log10().multiply(ee.Image(-1)).pow(k);
     // Map.addLayer(core, {}, 'core')
    var returnt = xi.add(alpha.divide(k).multiply(core.expression(
      '1-c',{
        'c': core
      })));
      return returnt;
  }
//Calculation of maximum precipitation for a 10-year return period
var return10 = Treturn(ee.Image(10));
Map.addLayer(return10, {}, '10-year return');

var return20 = Treturn(ee.Image(20));
//Map.addLayer(return20, {}, '20-year return');

var return50 = Treturn(ee.Image(50));
//Map.addLayer(return50, {}, '50-year return');


//Export to Drive 10-year return period
Export.image.toDrive({
  image: return10,
  description: '10yearReturnRainIntensity',
  scale: 60,
  region: table.geometry().bounds(),
  maxPixels: 4e9
});

//Export to Drive 20-year return period
Export.image.toDrive({
  image: return20,
  description: '20yearReturnRainIntensity',
  scale: 5000,
  region: table.geometry().bounds(),
});

//Export to Drive 50-year return period
Export.image.toDrive({
  image: return50,
  description: '50yearReturnRainIntensity',
  scale: 5000,
  region: table.geometry().bounds(),
});