// Earthquake data link
var earthquakeLink = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Tectonic plates link
var tectLink = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Perform a GET request to the Earthquake Link and send data to new function 
d3.json(earthquakeLink, function(data) {
    getFeatures(data.features);
});

function getFeatures(earthquakeData) {

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  var earthquakes = L.geoJson(earthquakeData, {
    onEachFeature: function (feature, layer){
      layer.bindPopup("<h3>" + feature.properties.place + "<br> Magnitude: " + feature.properties.mag +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    },
    pointToLayer: function (feature, latlng) {
      return new L.circle(latlng,
        {radius: getRadius(feature.properties.mag),
          fillColor: getColor(feature.properties.mag),
          fillOpacity: .7,
          stroke: true,
          weight: .5
      })
    }
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes)
}

function createMap(earthquakes) {

  // Define map layers and Insert own API Key
  var satelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/muditmathur11/cjjxaogzd6v212sqsqkthofvb/tiles/256/{z}/{x}/{y}?access_token=insertownAPIkeyhere");

  var outdoorMap = L.tileLayer("https://api.mapbox.com/styles/v1/muditmathur11/cjicb1nuj07lt2sp7ll8b7370/tiles/256/{z}/{x}/{y}?access_token=insertownAPIkeyhere");

  var lightMap = L.tileLayer("https://api.mapbox.com/styles/v1/muditmathur11/cjjxb96ot6ufo2spkz8wsj0mj/tiles/256/{z}/{x}/{y}?access_token=insertownAPIkeyhere");

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Satellite Map": satelliteMap,
    "Outdoor Map": outdoorMap,
    "Light Map": lightMap
  };

  // Add a tectonic plate layer
  var tectonicPlates = new L.LayerGroup();

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    "Tectonic Plates": tectonicPlates
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [31.7, -7.09],
    zoom: 2.5,
    layers: [lightMap, earthquakes, tectonicPlates]
  });

   // Add Fault lines data
   d3.json(tectLink, function(plateData) {
     // Adding our geoJSON data, along with style information, to the tectonicplates
     // layer.
     L.geoJson(plateData, {
       color: "blue",
       weight: 2
     })
     .addTo(tectonicPlates);
   });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Create legend
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (myMap) {

    var div = L.DomUtil.create('div', 'info legend'),
              grades = [0, 1, 2, 3, 4, 5],
              labels = [];

  // Loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
  };

  legend.addTo(myMap);
}

function getColor(d) {
  return d > 5 ? '#F30' :
  d > 4  ? '#F60' :
  d > 3  ? '#F90' :
  d > 2  ? '#FC0' :
  d > 1   ? '#FF0' :
            '#9F3';
}

function getRadius(value){
  return value*40000
}