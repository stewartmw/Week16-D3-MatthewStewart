// The code for the chart is wrapped inside a function that
// automatically resizes the chart
function makeResponsive() {

    // if the SVG area isn't empty when the browser loads,
    // remove it and replace it with a resized version of the chart
    var svgArea = d3.select("body").select("svg");

    // clear svg is not empty
    if (!svgArea.empty()) {
        svgArea.remove();
    };

    // SVG wrapper dimensions are determined by the current width and
    // height of the browser window.
    // var svgWidth = window.innerWidth * 0.6;
    var svgWidth = document.getElementById('container').offsetWidth * 0.65
    var svgHeight = window.innerHeight * 0.5;

    var margin = {
        top: 50,
        bottom: 50,
        right: 50,
        left: 100
    };

    var height = svgHeight - margin.top - margin.bottom;
    var width = svgWidth - margin.left - margin.right;

    // Append SVG element
    var svg = d3
        .select("#scatter")
        .append("svg")
        .attr("height", svgHeight)
        .attr("width", svgWidth);

    // Append group element
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Read CSV
    d3.csv("./assets/data/data.csv")
        .then(function (stateData) {

            // parse data
            stateData.forEach(function (data) {

                Object.keys(data).forEach(key => {
                    if (key != 'id' && key != 'state' && key != 'abbr') {
                        data[key] = +data[key];
                    };
                });
            });

            // create scales
            var xLinearScale = d3.scaleLinear()
                .domain([d3.min(stateData, d => d.poverty) - 1, d3.max(stateData, d => d.poverty) + 1])
                .range([0, width]);

            var yLinearScale = d3.scaleLinear()
                .domain([0, d3.max(stateData, d => d.healthcare) + 2])
                .range([height, 0]);

            // create axes
            var xAxis = d3.axisBottom(xLinearScale);
            var yAxis = d3.axisLeft(yLinearScale);

            // append axes
            chartGroup.append("g")
                .classed("chart", true)
                .attr("transform", `translate(0, ${height})`)
                .call(xAxis);

            chartGroup.append("g")
                .call(yAxis);

            // append circles
            var circlesGroup = chartGroup.selectAll("circle")
                .data(stateData)
                .enter()
                .append("circle")
                .classed("stateCircle", true)
                .attr("cx", d => xLinearScale(d.poverty))
                .attr("cy", d => yLinearScale(d.healthcare))
                .attr("r", document.getElementById('scatter').offsetWidth * 0.013)
                // .attr("fill", "rgb(165, 213, 239)")
                .attr("opacity", "0.8")
                .attr("stroke-width", "1")
            // .attr("stroke", "black");

            // append state abbreviations
            var statesGroup = chartGroup.selectAll("text")
                .data(stateData)
                .enter()
                .append("text")
                .classed("stateText", true)
                .attr("dx", d => xLinearScale(d.poverty))
                .attr("dy", d => yLinearScale(d.healthcare))
                .attr("alignment-baseline", "middle")
                .style("font-size", document.getElementById('container').offsetWidth * 0.01)
                .text(d => d.abbr);

            console.log(stateData);

            chartGroup.append('text')
                .classed("aText", true)
                .attr('transform', `translate(${width / 2},
                    ${height + document.getElementById("container").offsetWidth * .04})`)
                .attr("fill", "black")
                .text("In Poverty (%)");

            chartGroup.append('text')
                .attr('transform', 'rotate(-90)')
                .attr('y', 0 - document.getElementById("container").offsetWidth * .03)
                .attr('x', 0 - (height / 2))
                .classed('aText', true)
                .text('Lacks Healthcare (%)');
            // .classed("aText", true)
            // .attr('transform', 'rotate(90)')
            // .attr('transform', `translate(${height / 2},
            //     ${height + document.getElementById("container").offsetWidth * .04})`)
            // .text("Lacks Healthcare (%)")


            // Step 1: Initialize Tooltip
            var toolTip = d3.tip()
                .attr("class", "d3-tip")
                .offset([80, -60])
                .html(d => {
                    return (`<strong>${d.state}<strong><hr>Poverty: ${d.poverty}%<strong><hr>Healthcare: ${d.healthcare}%`);
                    // return (`<strong>${dateFormatter(d.date)}<strong><hr>${d.medals}
                    // medal(s) won`);
                });

            // Step 2: Create the tooltip in chartGroup.
            chartGroup.call(toolTip);

            // Step 3: Create "mouseover" event listener to display tooltip
            statesGroup.on("mouseover", function (d) {
                toolTip.show(d, this);
            })
                // Step 4: Create "mouseout" event listener to hide tooltip
                .on("mouseout", function (d) {
                    toolTip.hide(d);
                });
        });
}

// When the browser loads, makeResponsive() is called.
makeResponsive();

// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);
