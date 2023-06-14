
// Import and visualize the data by doing the following:
// Using Leaflet, create a map that plots all the earthquakes from your dataset based on their longitude and latitude.
// Your data markers should reflect the magnitude of the earthquake by their size and the depth of the earthquake by color.
// Earthquakes with higher magnitudes should appear larger, and earthquakes with greater depth should appear darker in color.
// Include popups that provide additional information about the earthquake when its associated marker is clicked. (Location, mag, depth, date/time)
// Create a legend that will provide context for your map data.

// Create the base layers.
let street = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
});

let topo = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
  attribution:
    'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
});

// Create a baseMaps object.
let baseMaps = {
  "Street Map": street,
  "Topographic Map": topo,
};
let earthquakes = new L.LayerGroup();
// Create an overlay object to hold our overlay.
let overlayMaps = {
  Earthquakes: earthquakes,
};

// Create our map
let myMap = L.map("map", {
  center: [37.09, -95.71],
  zoom: 5,
  layers: [street],
});

// Create a layer control.
// Pass it our baseMaps and overlayMaps.
// Add the layer control to the map.
L.control
  .layers(baseMaps, overlayMaps, {
    collapsed: false,
  })
  .addTo(myMap);

// All earthquakes past 7 days
// Store our USGS API endpoint as queryUrl.
let queryUrl =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.

  function createFeatures(feature) {
    return {
      fillColor: chooseColor(feature.geometry.coordinates[2]),
      radius: chooseRadius(feature.properties.mag),
      weight: 0.5,
      color: 'red',
      fillOpacity: 0.6
    };
  }
  
//   // Create the color opacity based on earthquake depth.


//   function chooseColor(depth) {
//     if (depth <= 1.0) {
//       return (fillOpacity = 0.1);
//     }
//     if (depth <= 3.0) {
//       return (fillOpacity = 0.2);
//     }
//     if (depth <= 5.0) {
//       return (fillOpacity = 0.4);
//     }
//     if (depth <= 10.0) {
//       return (fillOpacity = 0.5);
//     }
//     if (depth <= 20.0) {
//       return (fillOpacity = 0.8);
//     }
//     if (depth > 20.0) {
//       return (fillOpacity = 1.0);
//     }
//   }

  function chooseColor(depth) {
    if (depth <= 1.0) {
      return (fillColor = '#800026');
    }
    if (depth <= 3.0) {
      return (fillColor = '#BD0026');
    }
    if (depth <= 5.0) {
      return (fillColor = '#E31A1C');
    }
    if (depth <= 10.0) {
      return (fillColor = '#FD8D3C');
    }
    if (depth <= 20.0) {
      return (fillColor = '#FEB24C');
    }
    if (depth > 20.0) {
      return (fillColor = '#FED976');
    }
  }

  // Create the radius size based on earthquake magnitude.
  function chooseRadius(mag) {
    if (mag === 0) {
      return 1;
    }
    return mag * 5;
  }
 
  // Give each feature a popup that describes the maginitude and place and time of the earthquake.
  L.geoJSON(data, {
    onEachFeature: function (feature, layer) {
      layer.bindPopup(
        `<h3>Magnitude: ${feature.properties.mag}</h3><hr><p>${
          feature.properties.place
        }<br>${new Date(feature.properties.time)}</p>`
      );
    },
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },
    style: createFeatures,
  }).addTo(earthquakes);
  earthquakes.addTo(myMap);

});


// Set up the legend.
let legend = L.control({ position: "bottomright" });
legend.onAdd = function () {
  let div = L.DomUtil.create("div", "info legend");
  let limits = [1.0, 3.0, 5.0, 10.0, 20.0];
  let colors = ["#800026", "#BD0026", "#E31A1C", "#FD8D3C", "#FEB24C", "#FED976"];
  let labels = [];

  // Add the minimum and maximum depth range labels.
  let legendInfo =
    "<h1>Earthquake depth</h1>" +
    '<div class="labels">' +
    '<div class="min">' +
    limits[0] +
    "</div>" +
    '<div class="max">' +
    limits[limits.length - 1] +
    "</div>" +
    "</div>";

  div.innerHTML = legendInfo;

  limits.forEach(function (limit, index) {
    labels.push(
      '<li><span class="legend-color" style="background-color: ' +
        colors[index] +
        '"></span>' +
        limit +
        (limits[index + 1] ? "&ndash;" + limits[index + 1] : "+") +
        "</li>"
    );
  });

  div.innerHTML += "<ul>" + labels.join("") + "</ul>";
  return div;
};

// Adding the legend to the map
legend.addTo(myMap);

