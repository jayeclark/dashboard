/************************
*** DECLARE VARIABLES ***
************************/

const markerRad = 10;
//const width = 800;
//const height = 400;
const locHost = "http://localhost:3000/";



/***************
*** GET DATA ***
***************/

// import .csv
function postAjax(url, data, callback) {
  $.ajax({
    type: "POST",
    data: JSON.stringify(data),
    url: url,
  }).done((data)=> {
    callback(null, data);
  }).fail((jqXHR, textStatus, errorThrown)=> {
    callback(jqXHR, null);
  });
};



function getData() {
  if (!getData.promise) {
    getData.promise = new Promise((resolve, reject) => {
      postAjax(locHost + "getData", {}, (err, cb)=> {
        if (err) {
          console.log("Error: " + err.statusText);
          console.log(err)
          reject(err);
          return;
        };

        resolve(cb.data);
      });
    });
  };
  return getData.promise;
};



/*****************
*** CREATE MAP ***
*****************/

var map = getMap();
mark = populateMarkers(map);



function getMap() {
  map = L.map('map');

  map.setView([38, -100], 4);

  mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';

  L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; ' + mapLink + ' Contributors',
        maxZoom: 18,
      }).addTo(map);

  return map;
};



async function populateMarkers(map) {
  data = await getData();

  // add marker
  mark = [];

  for (i in data) {
    mark[i] = addMarker(map, data[i].name, data[i].lat, data[i].lng, data[i].score);

    //attach array number to JSON object
    mark[i].id = i;
  };

  return mark;
};



function addMarker(map, name, lat, lng, score) {
  options = {
    radius: markerRad,
    stroke: true,
    color: "black",
    opacity: 1,
    fill: true,
    fillColor: "blue",
    fillOpacity: 0.8,
  };

  var mark = L.circleMarker([lat, lng], options).bindTooltip(name, {direction: 'left'}).addTo(map);

  mark.on("click", ()=> {
    //this is where hooks into .d3 should be made
    updateGraph(mark.id);
  });

  mark.on("mouseover", ()=> {
    mark.setRadius(20);
  });

  mark.on("mouseout ", ()=> {
    mark.setRadius(markerRad);
  });

  mark.bindPopup(score);
  mark.name = name;
  return(mark);
};


//set up alerts
map.on("click", onMapClick);

function onMapClick(e) {
  console.log("You clicked the map at " + e.latlng);
};






// TEMP:

var cities = [];
var citiesOverlay = L.d3SvgOverlay(function(sel,proj){

  //var minLogPop = Math.log2(d3.min(cities,function(d){return d.population;}));
  var citiesUpd = sel.selectAll('circle').data(cities);
  citiesUpd.enter()
    .append('circle')
    .attr('r',5)
    .attr('cx',function(d){return proj.latLngToLayerPoint(d.latLng).x;})
    .attr('cy',function(d){return proj.latLngToLayerPoint(d.latLng).y;})
    .attr('stroke','black')
    .attr('stroke-width',1)
    .attr('fill',function(d){return (d.place == 'city') ? "red" : "blue";});
});

d3.csv("swiss-cities.csv").then(function(data){
  console.log(data)
  cities = data.map(function(d){
    d.latLng = [+d.lat,+d.lng];
    return d;
  });
  citiesOverlay.addTo(map);
});









/*********************
*** CREATE BARPLOT ***
*********************/

var margin = {
  top: 15,
  right: 25,
  bottom: 20,
  left: 60
};

var width = 800 - margin.left - margin.right;
var height = 400 - margin.top - margin.bottom;

const barplot = new Barplot(width, height, margin);

plotData();

async function plotData() {
  data = await getData();

  //only return the first datapoint to populate the graph
  dataArray = reduceData(data[0]);

  barplot.plot(barplot.canvas, dataArray);
};



//updateGraph() is called when a leaflet marker is clicked

async function updateGraph(id) {
  data = await getData();

  dataArray = reduceData(data[id]);

  barplot.updatePlot(barplot.canvas, dataArray);
};



/* @reduceData(object)
  - provide JSON object, removes data not used in graph visualization (i.e name
    and coordinates) and returns an array ready for d3 to use.
*/
function reduceData(data) {

  rtn = [];
  for (key in data) {
    if (matches(key, ["name","lat","lng","score"]) == false) {
      rtn.push({"name": key, "value": data[key]})
    };
  };
  return rtn;
};



/* @matches(string, object)
  - if any item in the array 'search' is the key string, return true, else false
*/

function matches(key, search) {
  for (i in search) {
    if (key == search[i]) {
      return true;
    };
  };
  return false;
};



async function getMaxScore() {
  maxScore = 0;
  data = await getData();

  for (rec in data) {
    for (key in data[rec]) {
      if (matches(key, ["name","lat","lng","score"]) == false) {
        if (data[rec][key] > maxScore) {
            dataArray.push({"name": key, "value": data[rec][key]})
        };
      };
    };
  };
  console.log(maxScore);
  return maxScore;
};
