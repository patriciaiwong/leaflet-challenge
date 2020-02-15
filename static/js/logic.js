var queryURLquakes = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
var queryURLplates = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"

var color0 = "thistle";
var color1 = "blue";
var color2 = "red";
var color3 = "MidnightBlue";
var color4 = "Blue";
var color5 = "tomato";
var legend = L.control();

d3.json(queryURLquakes, function(data) {
    loadPlates(data.features);
});

function loadPlates(earthquakeData) {
    d3.json(queryURLplates, function(data) {
        createFeatures(earthquakeData, data.features);
    });    
}

function createFeatures(earthquakeData, plateData) {

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function handleFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }

    function getGeoJsonMarkerOptions(feature) {
        color = color5;
        if (feature.properties.mag <= 1) {
            color = color1;
        } else if (feature.properties.mag <= 2) {
            color = color2;
        } else if (feature.properties.mag <= 3) {
            color = color3;
        } else if (feature.properties.mag <= 4) {
            color = color4;
        }

        return {
            radius: feature.properties.mag * 5,
            fillColor: color,
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };
    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the handleFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, getGeoJsonMarkerOptions(feature));
        },  
        onEachFeature: handleFeature
    });
    
    var plates = L.geoJSON(plateData, {
    style: function (feature) {
        var latlngs = (feature.geometry.coordinates);
        return L.polyline(latlngs, {color: 'red'});
        }
    });

    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes, plates);
}

function createMap(earthquakes, plates) {

    // Define basemap layers
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGl0dGxlc3Rkb2xsIiwiYSI6ImNqZHdnbTBzYTQ3bXUyeG80ZTQ3dWJtNjIifQ.uvSL6xgyBBXQSJ1Yopx9gA");

    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGl0dGxlc3Rkb2xsIiwiYSI6ImNqZHdnbTBzYTQ3bXUyeG80ZTQ3dWJtNjIifQ.uvSL6xgyBBXQSJ1Yopx9gA");
    
    var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibGl0dGxlc3Rkb2xsIiwiYSI6ImNqZHdnbTBzYTQ3bXUyeG80ZTQ3dWJtNjIifQ.uvSL6xgyBBXQSJ1Yopx9gA");

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Street Map": streetmap,
        "Dark Map": darkmap,
        "Satellite": satellitemap
    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        Plates: plates,
        Earthquakes: earthquakes
    };

    // Create our map, giving it the darkmap, earthquakes, and plates layers to display on load
    var myMap = L.map("map", {
        center: [34.052235, -119.243683],
        zoom: 4.5,
        layers: [streetmap, plates, earthquakes]
    });

    var legend = L.control({position: 'bottomright'});

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control
        .layers(baseMaps, overlayMaps, {
            collapsed: false
        }).addTo(myMap);
    
    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend'),
            grades = [color0, color1, color2, color3, color4, color5],
            labels = ["0-1", "1-2","2-3", "3-4", "4-5", "5+"]
        
            // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + grades[i] + '"></i> ' + labels[i] + '<br>';
        }
        
        return div;
    };
        
    legend.addTo(myMap);    
}