var allMarkers = [];
var markersCruzcampo = [];
var markersMahou = [];
var markersEsparte = [];

const file = "./data/conil.csv";
$.get(file, function (csvString) {
  var data = Papa.parse(csvString, {
    header: true,
    dynamicTyping: true,
  }).data;

  for (var i in data) {
    var row = data[i];
    if (row.lat && row.lon) {
      const popupHtml = getPopupHtml(row);
      if (popupHtml) {
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
            markersCruzcampo.push(marker);
          }
          if (popupHtml.includes("Mahou")) {
            markersMahou.push(marker);
          }
          if (popupHtml.includes("Esparte")) {
            markersEsparte.push(marker);
          }
        } else {
          allMarkers.push(marker);
        }
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

  let baseGroup = L.layerGroup(allMarkers);
  let groupCruzcampo = L.layerGroup(markersCruzcampo);
  let groupMahou = L.layerGroup(markersMahou);
  let groupEsparte = L.layerGroup(markersEsparte);

  // var OpenStreetMap_Mapnik_tileLayer = L.tileLayer(
  //   "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  //   {
  //     maxZoom: 19,
  //     attribution:
  //       '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  //   }
  // );
  // var tileLayer = { BaseLayer: OpenStreetMap_Mapnik_tileLayer };

  var Esri_WorldStreetMap = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    {
      attribution:
        "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012",
    }
  );
  //controlLayers.addBaseLayer(Esri_WorldStreetMap, "Esri_WorldStreetMap");
  var tileLayer = { BaseLayer: Esri_WorldStreetMap };

  var map = L.map("map", {
    center: [36.3, -6.1],
    zoom: 13, // EDIT from 1 to 18 -- decrease to zoom out, increase to zoom in
    minZoom: 11,
    scrollWheelZoom: true,
    tap: false,
    layers: [
      tileLayer["BaseLayer"],
      baseGroup,
      groupCruzcampo,
      groupMahou,
      groupEsparte,
    ], //ch
  });

  var overlayMaps = {
    Mahou: groupCruzcampo,
    Cruzcampo: groupMahou,
    Esparte: groupEsparte,
    "?": baseGroup,
  };

  var controlLayers = L.control
    .layers(tileLayer, overlayMaps, {
      position: "topright",
      collapsed: true,
    })
    .addTo(map);
  //.addTo(map);
  //controlLayers.addBaseLayer(OpenStreetMap_Mapnik, "OpenStreetMap_Mapnik");

  // var Stamen_Watercolor = L.tileLayer(
  //   "https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}",
  //   {
  //     attribution:
  //       'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  //     subdomains: "abcd",
  //     minZoom: 1,
  //     maxZoom: 16,
  //     ext: "jpg",
  //   }
  // );
  // controlLayers.addBaseLayer(Stamen_Watercolor, "Stamen_Watercolor");

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

  var Stadia_AlidadeSmooth = L.tileLayer(
    "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png",
    {
      maxZoom: 20,
      attribution:
        '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
    }
  );
  controlLayers.addBaseLayer(Stadia_AlidadeSmooth, "Stadia_AlidadeSmooth");

  function getPopupHtml(row) {
    let popupHtml = `<h3 style="text-align: center">${row.Bar}</h3>`;
    if (row.cervezas) {
      const cervezas = row.cervezas;
      if (cervezas === ".") {
        return null;
      } else if (cervezas !== "-") {
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
    }
    return popupHtml;
  }

  map.attributionControl.setPrefix(
    'View <a href="https://github.com/HandsOnDataViz/leaflet-map-csv" target="_blank">code on GitHub</a>'
  );
});

//add the groups of markers to layerGroups
