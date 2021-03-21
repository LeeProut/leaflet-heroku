// selected All Earthquakes from the last 30 days from the USGS GeoJSON feed 
// this data is updated every minute
var geoJson = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"

// techtonic plate geoJson data
var techPlates = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"


// define map layers
var lightMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/light-v10",
      accessToken: API_key
    });

var satMap =  L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/satellite-v9",
      accessToken: API_key
    }); 

var outdoorsMap =  L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/outdoors-v9",
      accessToken: API_key
    });     

// Create a new map, centering over Topeka, Kansas to show the entire U.S.
var myMap = L.map("map", {
  center: [
    39.06263402134599, -95.72554190670454
  ],
  zoom: 3.5,
  layers: [lightMap]
});    
    
// Define a baseMaps object to hold base layers
var baseMaps = {
    "Light Map": lightMap,
    "Sat Map": satMap,
    "Outdoors Map": outdoorsMap,
};

// define variables for layer groups for earthquakes and techtonic plates
var quakesLayer = L.layerGroup();
var platesLayer = L.layerGroup();

// Define an overlayMaps object to hold layers for earthquakes and techtonic plates
var overlayMaps = {
  Earthquakes: quakesLayer,
  Plates: platesLayer
}

// add control for layers that is always visible (no collapse)
L.control.layers(baseMaps, overlayMaps, {
    collapsed: false,
}).addTo(myMap);

// d3 for fetching earthquake geoJson data
    d3.json(geoJson).then(data => {
        console.log(data);
        var earthquakes = data.features;
        console.log(earthquakes);
    
      // color scheme from Color Brewer: https://colorbrewer2.org/#type=sequential&scheme=YlGnBu&n=7
      function fillCircleColor(mag) {
          switch (true) {
          case mag > 5: 
            return "#0c2c84";
          case mag > 4: 
            return "#1d91c0";
          case mag > 3: 
            return "#41b6c4";
          case mag > 2:
            return "#7fcdbb";
          case mag > 1: 
            return "#c7e9b4";
          case mag > 0: 
            return "#F4A460";        
        }
      }; 
      // functions to multiply the magnitude to render circles larger for visibility  
      function markerSize(mag) {
        return mag * 4;
      };
        // geoJson earthquake data for rendering circles according to earthquake magnitude
        L.geoJSON(data, {
          pointToLayer: function (feature, latlng) {        
            return L.circleMarker(latlng, {
              radius: markerSize(feature.properties.mag),
              color: fillCircleColor(feature.properties.mag), 
              fillColor: fillCircleColor(feature.properties.mag),
              fillOpacity: 0.75 
            });
          },
          
          //onEachFeature for popup with data from geoJson features 
          onEachFeature: function(feature, layer) {
            layer.bindPopup(`
            <h3>${feature.properties.place}</h3>
            <h5>Magnitude: ${feature.properties.mag}</h5>
            `);
          }
        }).addTo(quakesLayer);
          quakesLayer.addTo(myMap);

     // add legend to map
    // https://leafletjs.com/examples/choropleth/
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {
      
      var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2, 3, 4, 5],
        labels = ["<b>Magnitude</b>"];

      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
          labels.push('<i style="background:' + fillCircleColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+'));
      }
      div.innerHTML = labels.join("<br>");

      return div;
    };

// add legend to map 
    legend.addTo(myMap);
//closing D3
  });

// bring in techtonic plate data   
  d3.json(techPlates).then(plateData => {
    console.log(plateData);
    // geoJSON techtonic plate data for rendering faultlines
    // using fillOpacity: 0 fixed the orange cast over map
    L.geoJSON(plateData.features, {
      style: {
        color: "orange",
        fillOpacity: 0,
      }
    }).addTo(platesLayer);
    platesLayer.addTo(myMap);   

// closing D3    
  });