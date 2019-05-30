class Barplot {
  constructor(width, height, margin) {
    this.width = width;
    this.height = height;
    this.margin = margin;

    this.canvas = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  };

  getColour() {
    return d3.scaleLinear()
      .domain([0, d3.max(dataArray, function(d){
        return d.value;
      })])
      .range(["red","blue"]);
  };

  getWidthScale() {
    return d3.scaleLinear()
      .domain([0, this.max])
      .range([0, width]);
  };

  getHeightScale() {
    return d3.scaleBand()
      .range([height, 0])
      .padding(0.1)
      .domain(dataArray.map(function(d) {
        return d.name;
      }));
  };

  plot(canvas, dataArray) {

    /*dataArray.forEach(function(d) {
      d.value = +d.value;
    });*/

    var colour = this.getColour();

    var widthScale = this.getWidthScale();

    var heightScale = this.getHeightScale();

    canvas.selectAll("rect")
      .data(dataArray)
      .enter()
        .append("rect")
          .attr("name", function(d) {
            return d.name;
          })
          .attr("width", function(d) {
            return widthScale(d.value);
          })
          .attr("height", heightScale.bandwidth())
          .attr("fill", function(d) {
            return colour(d.value)
          })
          .attr("y", function(d) {
            return heightScale(d.name);
          })
          .on("click", function() {
            var barName = d3.select(this).attr("name");
            barplot.click(barName, d3.select(this));
          })
          .on("mouseover", function() {
            var barName = d3.select(this).attr("name");
            barplot.mouseover(barName, d3.select(this));
          })
          .on("mouseout", function() {
            barplot.mouseout();
          });

    // add the x Axis
    canvas.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(widthScale));

    // add the y Axis
    canvas.append("g")
      .call(d3.axisLeft(heightScale));
  };



  updatePlot(canvas, dataArray) {
    var colour = this.getColour();
    var widthScale = this.getWidthScale();

    canvas.selectAll("rect")
      .data(dataArray)
        .transition()
        .duration(800)
        .attr("width", function(d) {
          return widthScale(d.value);
        })
        .attr("fill", function(d) {
          return colour(d.value)
        })
  }



  click(barName, obj) {
    /*
    var radiusScale = d3.scaleLinear()
      .domain([0, d3.max(dataArray, function(d){
        return d.value;
      })])
      .range([scl/4, scl*4]);
    */

    g.selectAll("circle")
      .transition()
      .duration(500)
      /*.attr("r", function(d) {
        return scl+radiusScale(d[barName]);
      });*/

    obj.call(alphaTween, 100, 0.6)

    /*for (i in mark) {
      var rad = radiusScale(Math.round(data[i][barName]))
      mark[i].setStyle({radius: rad})
    };*/
  };



  mouseover(barName, obj) {
    var colour = this.getColour();

    g.selectAll("circle")
      .transition()
      .duration(300)
      .attr("fill", function(d) {
        return colour(d[barName]);
      });


    obj.call(alphaTween, 100, 0.3)

    /*for (i in mark) {
      //change colour based on width of rect
      mark[i].setStyle({fillColor: colour(data[i][barName])})
    };*/
  };



  mouseout() {
    g.selectAll("circle")
      .transition()
      .delay(700)
      .duration(1300)
      .attr("fill", "blue")
      //.call(barplot.mouseout)

    //.attr("r", scl);

    /*for (i in mark) {
      mark[i].setStyle({fillColor: "blue", radius: scl})
    };*/
  };
};

function alphaTween(path, duration, alpha) {
  var dummy = {};
  var col = path.attr("fill")
  console.log(col)

  d3.select(dummy)
    .transition()
    .duration(duration)
    .tween("fill", function() {
      var i = d3.interpolate(col, "transparent");
      i = d3.interpolate(col, i(alpha));
      return function(t) {
        path.attr("fill", i(t));
      };
    })
    .transition()
    .duration(duration*3)
    .tween("fill", function() {
      var i = d3.interpolate("transparent", col);
      i = d3.interpolate(path.attr("fill"), i(100000000));
      return function(t) {
        path.attr("fill", i(t));
      };
    })
}

function tween(path) {
  var dummy = {};

  d3.select(dummy)
    .transition()
    .duration(800)
    .tween("fill", function() {
      var i = d3.interpolateRgb("blue", "red");
      return function(t) {
        path.attr("fill", i(t));
      };
    })
};