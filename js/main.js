let dataCsv = null;
var map = null;
var markers = [];
var markersLayer = new L.LayerGroup();

let listBeers = [];

let filtersElem = {};

const ALL = "TODAS❗️";

const checkIfIsMobile = () => {
  let check = false;
  (function (a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    )
      check = true;
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
};
const isMobile = checkIfIsMobile();

const createFilterDiv = (beer, customLabel = "") => {
  const div = document.createElement("div");
  div.classList.add("filterBrand");

  const inputElement = document.createElement("input");
  inputElement.id = beer;
  inputElement.type = "radio";
  inputElement.name = "radioButtonSelection";
  if (beer === ALL) {
    inputElement.checked = true;
  }
  filtersElem[beer] = inputElement;

  const labelElement = document.createElement("label");
  labelElement.setAttribute("for", beer);
  labelElement.innerHTML = customLabel ? customLabel : beer;

  const addLogo = beer !== ALL && beer !== "Unknown";

  let imgLogo = null;
  if (addLogo) {
    imgLogo = document.createElement("img");
    imgLogo.setAttribute("src", `./images/${beer}.png`);
    imgLogo.className = "beerLogoImg";
  }

  div.appendChild(inputElement);
  if (addLogo) {
    div.appendChild(imgLogo);
  }
  div.appendChild(labelElement);
  return div;
};

const createDynamicFiltersFieldSet = (listBeers) => {
  const anchorElement = document.getElementById("dynamicFieldSet");
  for (beer of listBeers) {
    anchorElement.appendChild(createFilterDiv(beer));
  }
  anchorElement.appendChild(createFilterDiv("Unknown", "❓"));
};

const isValidCervezasRow = (field) => {
  return field !== "-" && field !== ".";
};

const getListOfDifferentBeers = (data) => {
  let listBeers = [];
  for (row of data) {
    if (row.cervezas && isValidCervezasRow(row.cervezas)) {
      //console.log(row + " ---> " + row.cervezas);
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
  listBeers.sort();

  let sortedBeers = [];
  sortedBeers.push(ALL);
  sortedBeers.push(...listBeers);
  return sortedBeers;
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
    createDynamicFiltersFieldSet(listBeers);

    updateMap(dataCsv);
  })
  .catch((err) => console.log(err));

const updateMap = (data) => {
  filtersElem[beer];

  const isAllBeersFilterEnabled = filtersElem[ALL].checked;
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

        if (isAllBeersFilterEnabled) {
          shouldAddToMap = true;
        } else {
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
      zoom: isMobile ? 12 : 13, // EDIT from 1 to 18 -- decrease to zoom out, increase to zoom in
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
            const hasPrice = listCervezas[cerv] > 0;
            popupHtml += `<li>${cerv}${
              hasPrice ? `: ${listCervezas[cerv]} €` : ""
            } </li>`;
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
