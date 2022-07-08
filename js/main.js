let dataCsv = null;
var map = null;
var markers = [];
var markersLayer = new L.LayerGroup();

let listBeers = [];

let filtersElem = {};

const createUtilitySelectionDiv = () => {
  debugger;
  const divSelectAll = document.createElement("div");
  divSelectAll.classList.add("filterBrand2222");
  const inputElement = document.createElement("input");
  inputElement.id = "selectAll";
  inputElement.type = "checkbox";
  //filtersElem[beer] = inputElement;

  const labelElement = document.createElement("label");
  labelElement.setAttribute("for", "selectAll");
  labelElement.innerHTML = "Seleccionar todos";

  divSelectAll.appendChild(inputElement);
  divSelectAll.appendChild(labelElement);

  const divUnselectAll = document.createElement("div");
  divUnselectAll.classList.add("filterBrand2222");
  const inputUnselectElement = document.createElement("input");
  inputUnselectElement.id = "unselectAll";
  inputUnselectElement.type = "checkbox";
  //filtersElem[beer] = inputUnselectElement;

  const labelUnselect = document.createElement("label");
  labelUnselect.setAttribute("for", "selectAll");
  labelUnselect.innerHTML = "Eliminar seleccion";

  divUnselectAll.appendChild(inputUnselectElement);
  divUnselectAll.appendChild(labelUnselect);

  const divUtility = document.createElement("div");
  divUtility.classList.add("filterBrand2222");
  divUtility.appendChild(divSelectAll);
  divUtility.appendChild(divUnselectAll);
};

const createFilterDiv = (beer, customLabel = "") => {
  const div = document.createElement("div");
  div.classList.add("filterBrand");

  const inputElement = document.createElement("input");
  inputElement.id = beer;
  inputElement.type = "checkbox";
  inputElement.checked = !customLabel;
  filtersElem[beer] = inputElement;

  const labelElement = document.createElement("label");
  labelElement.setAttribute("for", beer);
  labelElement.innerHTML = customLabel ? customLabel : beer;

  div.appendChild(inputElement);
  div.appendChild(labelElement);
  return div;
};

const createDynamicFiltersFieldSet = (listBeers) => {
  const anchorElement = document.getElementById("dynamicFieldSet");
  for (beer of listBeers) {
    anchorElement.appendChild(createFilterDiv(beer));
  }
  anchorElement.appendChild(createFilterDiv("Unknown", "❓"));

  //anchorElement.append(createUtilitySelectionDiv());
};

const isValidCervezasRow = (field) => {
  return field !== "-" && field !== ".";
};

const getListOfDifferentBeers = (data) => {
  let listBeers = [];
  for (row of data) {
    if (row.cervezas && isValidCervezasRow(row.cervezas)) {
      console.log(row + " ---> " + row.cervezas);
      const availableBeersInBar = Object.getOwnPropertyNames(
        JSON.parse(row.cervezas)
      );
      for (beer of availableBeersInBar) {
        if (!listBeers.includes(beer)) {
          listBeers.push(beer);
        }
      }
    }
  }
  return listBeers;
};

const file = "./data/conil.csv";
const response = fetch(file)
  .then((response) => response.text())
  .then((v) => {
    var data = Papa.parse(v, {
      header: true,
      dynamicTyping: true,
    }).data;

    dataCsv = data;

    listBeers = getListOfDifferentBeers(data);
    listBeers.sort();
    createDynamicFiltersFieldSet(listBeers);

    updateMap(dataCsv);
  })
  .catch((err) => console.log(err));

const updateMap = (data) => {
  filtersElem[beer];

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

        if (hasBeerData) {
          for (beer of listBeers) {
            const isFilterEnabled = filtersElem[beer].checked;
            if (isFilterEnabled && popupHtml.includes(beer)) {
              shouldAddToMap = true;
            }
          }
        } else {
          shouldAddToMap = filtersElem["Unknown"].checked;
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

  var Esri_WorldStreetMap = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    {
      attribution:
        "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012",
    }
  );
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
  markersLayer.clearLayers();
  updateMap(dataCsv);
};
