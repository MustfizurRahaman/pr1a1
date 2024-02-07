// Initialize the map
var map = L.map('map').setView([37.0902, -95.7129], 5);

// Add a basemap
var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);



// Load and add the counties GeoJSON layer with popups
var countiesGeojsonURL = 'https://raw.githubusercontent.com/MustfizurRahaman/hospital_data/main/counties.geojson';
$.getJSON(countiesGeojsonURL, function(data) {
    L.geoJson(data, {
        style: function(feature) {
            return {
                color: "black",
                weight: 1,
                opacity: 0.5,
                fillColor: "#a2d4ec",
                fillOpacity: 0
            };
        },
        onEachFeature: function(feature, layer) {
            var popupContent = '<b>County Name:</b> ' + feature.properties.NAME +
                                '<br><b>State ID:</b> ' + feature.properties.STATEFP +
                                '<br><b>Land Area:</b> ' + feature.properties.ALAND + ' square meters' +
                                '<br><b>Water Area:</b> ' + feature.properties.AWATER + ' square meters';
            layer.bindPopup(popupContent);
        }
    }).addTo(map);
});



// Add the transportation layer
var roadGeojsonURL = 'https://raw.githubusercontent.com/MustfizurRahaman/project_1_data/main/roads.geojson';
$.getJSON(roadGeojsonURL, function(data) {
    L.geoJson(data, {
        style: function(feature) {
            return {
                color: "black",
                weight: 2,
                opacity: 0.5,
                fillColor: "#a2d4ec",
                fillOpacity: 0
            };
        },
        onEachFeature: function(feature, layer) {
            var popupContent = '<b>Name:</b> ' + feature.properties.NAME ;
            layer.bindPopup(popupContent);
        }
    }).addTo(map);
});


// Hsospital popup content
// Function to create popup content based on feature properties
function createPopupContent(feature) {
    return '<b>Name:</b> ' + feature.properties.NAME +
           '<br><b>Address:</b> ' + feature.properties.ADDRESS +
           '<br><b>City:</b> ' + feature.properties.CITY +
           '<br><b>State:</b> ' + feature.properties.STATE +
           '<br><b>ZIP:</b> ' + feature.properties.ZIP +
           '<br><b>Telephone:</b> ' + feature.properties.TELEPHONE +
           '<br><b>Type:</b> ' + feature.properties.TYPE +
           '<br><b>Status:</b> ' + feature.properties.STATUS +
           '<br><b>Website:</b> <a href="' + feature.properties.WEBSITE + '" target="_blank">' + feature.properties.WEBSITE + '</a>';
}



// Define a custom icon for hospital markers
var hospitalIcon = L.icon({
    iconUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwPB2yzqbJOhEXN1pF3LUbqyBd5nYbNTcjuX5fsl4G4_POy7bxXVLp5kmTHVHNbqlpvWs&usqp=CAU',
    iconSize: [8, 8],
    iconAnchor: [10, 10],
    popupAnchor: [0, -24]
});


// Load and add the hospital GeoJSON layer with popups
var hospitalLayer = L.featureGroup().addTo(map);
var geojsonURL = 'https://raw.githubusercontent.com/MustfizurRahaman/hospital_data/main/Hospitals.geojson';
$.getJSON(geojsonURL, function(data) {
    L.geoJson(data, {
        pointToLayer: function(feature, latlng) {
            var marker = L.marker(latlng, {icon: hospitalIcon});
            marker.bindPopup(createPopupContent(feature));
            return marker;
        }
    }).addTo(map);
});



// Search feature function to search by counties 
function searchFeature() {
    var searchValue = document.getElementById('searchInput').value.toLowerCase();
    var matchedFeatures = L.featureGroup();

    // Clear previous search results
    matchedFeatures.clearLayers();

    // Check if the search box is empty and reset the map view
    if (searchValue === "") {
        map.eachLayer(function(layer) {
            
        });
        map.setView([37.0902, -95.7129], 5); // Reset the map view to the original state
        return; // Exit the function if the search box is empty
    }

    // Fetch the updated counties GeoJSON data
    $.getJSON(countiesGeojsonURL, function(data) {
        var features = data.features.filter(function(feature) {
            // Focus search on county name property
            return feature.properties.NAME && feature.properties.NAME.toLowerCase().includes(searchValue);
        });

        if (features.length > 0) {
            // Add matched features to a temporary feature group to calculate bounds and zoom
            var geoJsonLayer = L.geoJson(features, {
                style: function(feature) {
                    return {
                        color: "black",
                        weight: 1,
                        opacity: 0.5,
                        fillColor: "#a2d4ec",
                        fillOpacity: 0.75
                    };
                },
                onEachFeature: function(feature, layer) {
                    var popupContent = '<b>County Name:</b> ' + feature.properties.NAME +
                                       '<br><b>State ID:</b> ' + feature.properties.STATEFP +
                                       '<br><b>Land Area:</b> ' + feature.properties.ALAND + ' square meters' +
                                       '<br><b>Water Area:</b> ' + feature.properties.AWATER + ' square meters';
                    layer.bindPopup(popupContent);
                    matchedFeatures.addLayer(layer); // Add layer to the matchedFeatures featureGroup
                }
            });
            matchedFeatures.addTo(map);
            map.fitBounds(matchedFeatures.getBounds()); // Zoom to the bounds of the matched features
        } else {
            alert("No counties found with that name.");
        }
    });
}


// Custom control for search functionality
var customControl = L.Control.extend({
    options: {
        position: 'topright' // You can change the position of the search bar if needed
    },

    onAdd: function(map) {
        var container = L.DomUtil.create('div', 'search-control');
        
        // define the search box
        container.innerHTML = '<input type="text" id="searchInput" placeholder="Search by county" style="display:block;">';


        // Bind the searchFeature function to the 'input' event of the search box
        container.querySelector('#searchInput').oninput = searchFeature;

        // Prevent click events from being propagated to the map
        L.DomEvent.disableClickPropagation(container);

        
        L.DomEvent.disableScrollPropagation(container);

        return container;
    }
});

// Add the custom control to the map
map.addControl(new customControl());


// legend 
// Define the Legend Control
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend');
    div.style.backgroundColor = 'white'; // Set background to white
    div.style.padding = '10px'; // Add some padding inside the box
    div.style.border = '1px solid #ccc'; // A light border for the legend box
    div.innerHTML += '<h4>Legend</h4>';
    // Hospital Icon
    div.innerHTML += '<i style="background: url(https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjeRJDmNFaNnRLAmV4Gww5mmD_EeH5jViPwL9MgjCi8g&s); background-repeat: no-repeat; background-size: contain; width: 24px; height: 24px; display: inline-block; margin-right: 5px; vertical-align: middle;"></i> USA Counties <br>';
    // USA Primary Roads Line
    div.innerHTML += '<i style="background: black; width: 30px; height: 2px; display: inline-block; margin-right: 5px; vertical-align: middle;"></i> USA Primary Roads<br>';
    // USA Counties Polygon Icon
    div.innerHTML += '<i style="background: url(https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwPB2yzqbJOhEXN1pF3LUbqyBd5nYbNTcjuX5fsl4G4_POy7bxXVLp5kmTHVHNbqlpvWs&usqp=CAU); background-repeat: no-repeat; background-size: contain; width: 24px; height: 24px; display: inline-block; margin-right: 5px; vertical-align: middle;"></i> Hospitals <br>';

    return div;
};

// Add the Legend to the Map
legend.addTo(map);

// saint louis button 
document.getElementById('zoomToStLouis').addEventListener('click', function() {
    map.setView([38.6270, -90.1994], 10); 
});
