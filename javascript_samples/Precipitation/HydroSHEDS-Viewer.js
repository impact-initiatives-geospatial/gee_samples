/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var geometry = 
    /* color: #d63000 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[38.4532921733607, 36.09907834136503],
          [38.4532921733607, 29.76083391584448],
          [49.7911827983607, 29.76083391584448],
          [49.7911827983607, 36.09907834136503]]], null, false);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
/*
Decription: Viewing hydrosheds
Contributor: victor.olsen@reach-initiative.org
*/

var dataset = ee.FeatureCollection("WWF/HydroSHEDS/v1/Basins/hybas_3")
                .filterBounds(geometry);

var iraq_shed = dataset.filter(ee.Filter.eq('HYBAS_ID', 2030073570))

Map.addLayer(dataset, '', "Basins");
Map.addLayer(iraq_shed, '', "iraq_shed");

