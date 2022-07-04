let dataCsv = null;
var map = null;
var markers = [];
var markersLayer = new L.LayerGroup();

var filterCruzcampo = document.getElementById("filterCruzcampo");
var filterMahou = document.getElementById("filterMahou");
var filterEstrellaGalicia = document.getElementById("filterEstrellaGalicia");
var filterEsparte = document.getElementById("filterEsparte");

var filterUnknown = document.getElementById("filterUnknown");

// var allMarkers = [];
// var markersCruzcampo = [];
// var markersMahou = [];
// var markersEsparte = [];
// var markersAguila = [];

const file = "./data/conil.csv";
$.get(file, function (csvString) {
  var data = Papa.parse(csvString, {
    header: true,
    dynamicTyping: true,
  }).data;

  dataCsv = data;

  updateMap(dataCsv);
});

const updateMap = (data) => {
  const isCruzcampoEnabled = filterCruzcampo.checked;
  const isMahouEnabled = filterMahou.checked;
  const isEstrellaGaliciaEnabled = filterEstrellaGalicia.checked;
  const isEsparteEnabled = filterEsparte.checked;
  const isUnknownEnabled = filterUnknown.checked;

  for (var i in data) {
    var row = data[i];
    if (row.lat && row.lon) {
      let shouldAddToMap = false;

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

        // if (hasBeerData) {
        //   if (popupHtml.includes("Cruzcampo")) {
        //     markersCruzcampo.push(marker);
        //   }
        //   if (popupHtml.includes("Mahou")) {
        //     markersMahou.push(marker);
        //   }
        //   if (popupHtml.includes("Esparte")) {
        //     markersEsparte.push(marker);
        //   }
        //   if (popupHtml.includes("Aguila")) {
        //     markersAguila.push(marker);
        //   }
        // } else {
        //   allMarkers.push(marker);
        // }
        if (hasBeerData) {
          if (isCruzcampoEnabled && popupHtml.includes("Cruzcampo")) {
            shouldAddToMap = true;
          }
          if (isMahouEnabled && popupHtml.includes("Mahou")) {
            shouldAddToMap = true;
          }
          if (isEsparteEnabled && popupHtml.includes("Esparte")) {
            shouldAddToMap = true;
          }
          if (
            isEstrellaGaliciaEnabled &&
            popupHtml.includes("Estrella Galicia")
          ) {
            shouldAddToMap = true;
          }
        } else {
          shouldAddToMap = isUnknownEnabled;
        }

        if (shouldAddToMap) {
          markersLayer.addLayer(marker);
        }
      }

      const enableDesktopMouseEvents = false;
      if (enableDesktopMouseEvents) {
        marker.on("mouseover", function (e) {
          this.openPopup();
        });
        marker.on("mouseout", function (e) {
          this.closePopup();
        });
      }

      //markers.addLayer(marker);
      //map.addLayer(marker);
    }
  }

  // let baseGroup = L.layerGroup(allMarkers);
  // let groupCruzcampo = L.layerGroup(markersCruzcampo);
  // let groupMahou = L.layerGroup(markersMahou);
  // let groupEsparte = L.layerGroup(markersEsparte);
  // let groupAguila = L.layerGroup(markersAguila);

  var Esri_WorldStreetMap = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    {
      attribution:
        "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012",
    }
  );
  //controlLayers.addBaseLayer(Esri_WorldStreetMap, "Esri_WorldStreetMap");
  var tileLayer = { BaseLayer: Esri_WorldStreetMap };

  // map = L.map("map", {
  //   center: [36.3, -6.1],
  //   zoom: 13, // EDIT from 1 to 18 -- decrease to zoom out, increase to zoom in
  //   minZoom: 11,
  //   scrollWheelZoom: true,
  //   tap: false,
  //   layers: [
  //     tileLayer["BaseLayer"],
  //     //   baseGroup,
  //     //   groupCruzcampo,
  //     //   groupMahou,
  //     //   groupEsparte,
  //     //   groupAguila,
  //   ],
  // });

  if (map === null) {
    map = L.map("map", {
      center: [36.3, -6.1],
      zoom: 13, // EDIT from 1 to 18 -- decrease to zoom out, increase to zoom in
      minZoom: 11,
      scrollWheelZoom: true,
      tap: false,
    });
    Esri_WorldStreetMap.addTo(map);

    markersLayer.addTo(map);
  }

  // var overlayMaps = {
  //   Mahou: groupCruzcampo,
  //   Cruzcampo: groupMahou,
  //   Esparte: groupEsparte,
  //   Aguila: groupAguila,
  //   "?": baseGroup,
  // };

  // var controlLayers = L.control
  //   .layers(tileLayer, overlayMaps, {
  //     position: "topright",
  //     collapsed: true,
  //   })
  //   .addTo(map);

  // var Stadia_AlidadeSmoothDark = L.tileLayer(
  //   "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
  //   {
  //     maxZoom: 20,
  //     attribution:
  //       '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
  //   }
  // );
  // controlLayers.addBaseLayer(
  //   Stadia_AlidadeSmoothDark,
  //   "Stadia_AlidadeSmoothDark"
  // );

  // var Stadia_AlidadeSmooth = L.tileLayer(
  //   "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png",
  //   {
  //     maxZoom: 20,
  //     attribution:
  //       '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
  //   }
  // );
  // controlLayers.addBaseLayer(Stadia_AlidadeSmooth, "Stadia_AlidadeSmooth");

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
};

const updateFilters = () => {
  console.log("foooo");
  markersLayer.clearLayers();
  updateMap(dataCsv);
};

//add the groups of markers to layerGroups
