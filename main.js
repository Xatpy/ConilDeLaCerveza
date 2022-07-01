console.log("start");

var allMarkers = [];
var markersA = [];
var markersB = [];

const file = "conil.csv";
$.get(file, function (csvString) {
  var data = Papa.parse(csvString, {
    header: true,
    dynamicTyping: true,
  }).data;

  for (var i in data) {
    var row = data[i];
    if (row.lat && row.lon) {
      const popupHtml = getPopupHtml(row);
      const hasBeerData = popupHtml.includes("<li>");
      var myIcon = L.divIcon({
        className: hasBeerData ? "my-div-icon-beer" : "my-div-icon-question",
        html: hasBeerData ? "🍺" : "📍",
      });

      var marker = L.marker([row.lat, row.lon], {
        icon: myIcon,
      }).bindPopup(popupHtml);

      if (hasBeerData) {
        if (popupHtml.includes("Cruzcampo")) {
          markersA.push(marker);
        } else {
          markersB.push(marker);
        }
      } else {
        allMarkers.push(marker);
      }

      marker.on("mouseover", function (e) {
        this.openPopup();
      });
      marker.on("mouseout", function (e) {
        this.closePopup();
      });
      //}).bindPopup(row.Bar);

      //markers.addLayer(marker);
      //map.addLayer(marker);
    }
  }
  debugger;
  let baseGroup = L.layerGroup(allMarkers);
  let groupA = L.layerGroup(markersA);
  let groupB = L.layerGroup(markersB);

  //map.addLayer(markers);

  var OpenStreetMap_Mapnik_tileLayer = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }
  );
  var tileLayer = { BaseLayer: OpenStreetMap_Mapnik_tileLayer };

  var map = L.map("map", {
    center: [36.2779, -6.0882],
    zoom: 13, // EDIT from 1 to 18 -- decrease to zoom out, increase to zoom in
    minZoom: 11,
    scrollWheelZoom: true,
    tap: false,
    layers: [tileLayer["BaseLayer"], baseGroup, groupA, groupB], //ch
  });

  var overlayMaps = {
    Mahou: groupA,
    Cruzcampo: groupB,
    "?": baseGroup,
  };

  var controlLayers = L.control
    .layers(tileLayer, overlayMaps, {
      position: "bottomright",
      collapsed: false,
    })
    .addTo(map);

  //.addTo(map);
  //controlLayers.addBaseLayer(OpenStreetMap_Mapnik, "OpenStreetMap_Mapnik");

  var Stamen_Watercolor = L.tileLayer(
    "https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}",
    {
      attribution:
        'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      subdomains: "abcd",
      minZoom: 1,
      maxZoom: 16,
      ext: "jpg",
    }
  );
  controlLayers.addBaseLayer(Stamen_Watercolor, "Stamen_Watercolor");

  var Stadia_AlidadeSmoothDark = L.tileLayer(
    "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
    {
      maxZoom: 20,
      attribution:
        '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
    }
  );
  controlLayers.addBaseLayer(
    Stadia_AlidadeSmoothDark,
    "Stadia_AlidadeSmoothDark"
  );

  function getPopupHtml(row) {
    let popupHtml = `<h3 style="text-align: center">${row.Bar}</h3>`;
    if (row.cervezas && row.cervezas !== "-") {
      try {
        popupHtml += "<ul>";
        const listCervezas = JSON.parse(row.cervezas);
        for (cerv in listCervezas) {
          popupHtml += `<li>${cerv}: ${listCervezas[cerv]} €</li>`;
        }
        popupHtml += "</ul>";
      } catch {
        console.error(`Error parsing ${row.Bar} with field: ${row.cervezas}`);
      }
    }
    return popupHtml;
  }

  map.attributionControl.setPrefix(
    'View <a href="https://github.com/HandsOnDataViz/leaflet-map-csv" target="_blank">code on GitHub</a>'
  );
});

//add the groups of markers to layerGroups
