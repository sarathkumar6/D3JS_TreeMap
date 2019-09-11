var projectName = "tree-map";
localStorage.setItem('example_project', 'D3: Tree Map');

const MOVIES_DATA_SET = {
        TITLE: "Movie Sales",
        DESCRIPTION: "Top 100 Highest Grossing Movies Grouped By Genre",
        FILE_PATH: "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json"
},
      urlParams = new URLSearchParams(window.location.search);

document.getElementById("title").innerHTML = MOVIES_DATA_SET.TITLE;
document.getElementById("description").innerHTML = MOVIES_DATA_SET.DESCRIPTION;

// Define body
let body = d3.select("body");

// Define the div for the tooltip
let tooltip = body.append("div")
                .attr("class", "tooltip")
                .attr("id", "tooltip")
                .style("opacity", 0);

// Define tree map on svg/canvas
let svg = d3.select("#tree-map"),
width = +svg.attr("width"),
height = +svg.attr("height");

let fader = (color) => d3.interpolateRgb(color, "#fff")(0.2),
color = d3.scaleOrdinal(d3.schemeCategory20.map(fader)),
format = d3.format(",d");

let treemap = d3.treemap()
                .size([width, height])
                .paddingInner(1);

d3.json(MOVIES_DATA_SET.FILE_PATH, (error, data) => {

  if (error) throw error;

  let root = d3.hierarchy(data)
                .eachBefore((d) => {
                    d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name;
                })
                .sum((d) => d.value)
                .sort((a, b) => b.height - a.height || b.value - a.value);

  treemap(root);

  var cell = svg.selectAll("g")
                .data(root.leaves())
                .enter().append("g")
                .attr("class", "group")
                .attr("transform", (d) => "translate(" + d.x0 + "," + d.y0 + ")");

  var tile = cell.append("rect")
                .attr("id", (d) => d.data.id)
                .attr("class", "tile")
                .attr("width", (d) => d.x1 - d.x0)
                .attr("height", (d) => d.y1 - d.y0)
                .attr("data-name", (d) => d.data.name)
                .attr("data-category", (d) => d.data.category)
                .attr("data-value", (d) => d.data.value)
                .attr("fill", (d) =>color(d.data.category))
                .on("mousemove", (d) => {
                    tooltip.style("opacity", .9);
                    tooltip.html('Name: ' + d.data.name + '<br>Category: ' +
                                 d.data.category + '<br>Value: ' + d.data.value
                                )
                        .attr("data-value", d.data.value)
                        .style("left", d3.event.pageX + 10 + "px")
                        .style("top", d3.event.pageY - 28 + "px");
                })
                .on("mouseout", (d) => {tooltip.style("opacity", 0);});
    cell
      .append("text")
      .attr('class', 'tile-text')
      .selectAll("tspan")
      .data((d) => d.data.name.split(/(?=[A-Z][^A-Z])/g))
      .enter().append("tspan")
      .attr("x", 4)
      .attr("y", (d, i) => 13 + i * 10)
      .text((d) => d);
    var categories = root.leaves().map((nodes) => nodes.data.category);
    let legend = d3.select("#legend"),
        legendWidth = +legend.attr("width");  
    categories = categories.filter((category, index, self) => self.indexOf(category) === index);
    const MOVIES_LEGEND_CONSTANTS = {
          LEGEND_OFFSET: 10,
          LEGEND_RECT_SIZE: 15,
          LEGEND_H_SPACING: 150,
          LEGEND_V_SPACING: 10,
          LEGEND_TEXT_X_OFFSET: 3,
          LEGEND_TEXT_Y_OFFSET: -2
      },
          legendElemsPerRow = Math.floor(legendWidth / MOVIES_LEGEND_CONSTANTS.LEGEND_H_SPACING),
          legendElem = legend
                        .append("g")
                        .attr("transform", "translate(60," + MOVIES_LEGEND_CONSTANTS.LEGEND_OFFSET + ")")
                        .selectAll("g")
                        .data(categories)
                        .enter().append("g")
                        .attr("transform", function (d, i) {
                            return 'translate(' + i % legendElemsPerRow * MOVIES_LEGEND_CONSTANTS.LEGEND_H_SPACING + ',' + (
                                Math.floor(i / legendElemsPerRow) * MOVIES_LEGEND_CONSTANTS.LEGEND_RECT_SIZE + MOVIES_LEGEND_CONSTANTS.LEGEND_V_SPACING * Math.floor(i / legendElemsPerRow)) + ')';
                        });

    legendElem
        .append("rect")
        .attr('width', MOVIES_LEGEND_CONSTANTS.LEGEND_RECT_SIZE)
        .attr('height', MOVIES_LEGEND_CONSTANTS.LEGEND_RECT_SIZE)
        .attr('class', 'legend-item')
        .attr('fill', (d) => color(d));
    
    legendElem
        .append("text")
        .attr('x', MOVIES_LEGEND_CONSTANTS.LEGEND_RECT_SIZE + MOVIES_LEGEND_CONSTANTS.LEGEND_TEXT_X_OFFSET)
        .attr('y', MOVIES_LEGEND_CONSTANTS.LEGEND_RECT_SIZE + MOVIES_LEGEND_CONSTANTS.LEGEND_TEXT_Y_OFFSET)
        .text((d) => d);
});