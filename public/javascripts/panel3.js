function getPanel3Height() {
  //start with panel3 html height
  rtn = parseInt($("#panel3").css("height"));

  //reduce by padding in .css
  rtn -= parseInt($("#panel3").css("padding")) * 2;

  //reduce by text height if there's no table, else reduce by table height
  if ($("#popupInfo").css("height") != "0px") {
    rtn -= parseInt($("#popupInfo").css("height"));
  } else {
    rtn -= parseInt($("#popupInfo").children().css("height"));
    rtn -= parseInt($("#leaflet").css("height"));
  };

  return rtn;
};



function panel3Resize() {
  pos = {};
  pos.top = ($(window).height()*(1-panelHeight));

  if ($('#header').height()) {
    pos.top -= $('#header').height();
  };

  //hardcoded based on orig height of the elem
  pos.top += 50;

  pos.width = $(window).width() * (1-panelWidth);

  pos.height = ($(window).height()*(panelHeight)) - 27;

  $("#panel3").css({
    top: pos.top,
    width: pos.width,
    height: pos.height
  });

  //set up svg bounds with padding for panel3 graph
  d3.select("#panel3").select("svg")
    .attr("width", "100%")
    .attr("height", getPanel3Height())
};



function panel3GetWidthScale() {
  var width = parseInt($("#panel3 svg").css("width"))

  return d3.scaleBand()
    .range([0, width])
    .padding(0)
    .domain(panel3Data.map(function(d) {
      return d.name;
    }))
};



function panel3GetHeightScale() {
  return d3.scaleLinear()
    .domain([0, d3.max(panel3Data, function(d) {
      return d.value
    })])
    .range([getPanel3Height(), 0]);
};



/* @getAttr(d3object, oject)
  - constructor for reused attributes for d3 graph. All updates to common
    atrributes are stored in this single function for rapid updating
  - the attributes object should be an array of strings that match d3
    attributes
*/
function getAttr(path, attributes) {
  var height = getPanel3Height()

  var widthScale = panel3GetWidthScale();
  var heightScale = panel3GetHeightScale();

  for (key in attributes) {
    switch (attributes[key]) {
      case "width":
        path.attr("width", widthScale.bandwidth())
        break;
      case "height":
        path.attr("height", function(d) {
          return height - heightScale(d.value);
        })
        break;
      case "x":
        path.attr("x", function(d) {
          return widthScale(d.name);
        })
        break;
      case "y":
        path.attr("y", function(d) {
          return heightScale(d.value);
        })
        break;
    };
  };
};



/* @panel3ParseData(array)
  - take full .csv dataset (an array of JSON objects) and reduces the list to
    just the name and score (given the current radio button selected)
  - sorts the new reduced list in descending order given the req of the graph
*/
function panel3ParseData(rawData) {
  var keyPhrase = "score$" + getCheckedRadio();

  //parse needed data from rawData
  rtn = [];
  for (i in rawData) {
    rtn.push({name: rawData[i].name, value: rawData[i][keyPhrase]});
  };

  //sort data in descending order
  rtn.sort(function(x, y) {
    return d3.descending(x.value, y.value);
  });

  return rtn;
};



//Ran first and once to get proper sizing
//  (uses dataset, but assumes values of 0)
async function initPanel3() {
  var rawData = await getData();

  panel3Data = panel3ParseData(rawData);
  var heightScale = panel3GetHeightScale();

  d3.select("#panel3")
    .select("svg")
      .selectAll("rect")
        .data(panel3Data)
        .enter()
        .append("rect")
          .attr("id", function(d, i) {
            return "id" + i;
          })
          .call(this.getAttr, ["x", "width", "height"])
          .attr("y", function(d) {
            //assume no value until user prompt
            return heightScale(0);
          })
          .attr("fill", "#EFEFEF")
          .attr("stroke", "#D0CFD4")
};



/* @plotPanel3()
  - redisplay graph with new data based on radio button score selected and
    current button selected
  - uses a motion tween with 800ms to resize rectangles
*/
async function plotPanel3() {
  var rawData = await getData();
  panel3Data = panel3ParseData(rawData);

  d3.select("#panel3")
    .select("svg")
      .selectAll("rect")
        .data(panel3Data)
        .transition()
        .duration(800)
          .call(this.getAttr, ["x", "y", "width", "height"])
};



/* @plotPanel3Resize()
  - ran on screen resize, moves graph to stay within the bounds of #panel3
    svg element. No delay or transiton for plot resize
*/
function plotPanel3Resize() {
  d3.select("#panel3")
    .select("svg")
      .selectAll("rect")
          .call(this.getAttr, ["x", "y", "width", "height"])
};
