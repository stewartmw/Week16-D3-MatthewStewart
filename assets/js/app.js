var svgWidth = document.getElementById('container').offsetWidth * 0.65;
var svgHeight = window.innerHeight * 0.6;

var margin = {
    top: svgHeight * 0.1,
    bottom: svgHeight * 0.2,
    right: svgWidth * 0.1,
    left: svgWidth * 0.2
};

var height = svgHeight - margin.top - margin.bottom;
var width = svgWidth - margin.left - margin.right;

// Append SVG element
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("height", svgHeight)
    .attr("width", svgWidth)

// Append group element
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initialize axis choices
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

// Function for updating x-scale var upon click on axis label
function xScale(stateData, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(stateData, d => d[chosenXAxis]) * 0.9, d3.max(stateData, d => d[chosenXAxis]) * 1.1])
        .range([0, width]);

    return xLinearScale;
}

// Function for updating y-scale var upon click on axis label
function yScale(stateData, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(stateData, d => d[chosenYAxis]) * 1.1])
        .range([height, 0]);

    return yLinearScale;
}

// Function for updating xAxis var upon click on axis label

function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// Function for updating yAxis var upon click on axis label

function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

// Function for updating circles group with transition to new circles

function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
}

// Function for adding text labels to circles

function renderCirclesText(statesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    statesGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]));

    return statesGroup;
}

// Function for updating circles text with new tooltip

function updateToolTip(chosenXAxis, chosenYAxis, statesGroup) {
    if (chosenXAxis == "poverty") {
        var xLabel = "In Poverty (%): ";
    } else if (chosenXAxis == "age") {
        var xLabel = "Age (Median): ";
    } else {
        var xLabel = "Household Income (Median): ";
    };

    if (chosenYAxis == "healthcare") {
        var yLabel = "Lacks Healthcare (%): ";
    } else if (chosenYAxis == "smokes") {
        var yLabel = "Smokes (%): ";
    } else {
        var yLabel = "Obese (%): ";
    };

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([50, -125])
        .html(d => {
            return (`<strong>${d.state}<strong><hr>${xLabel} ${d[chosenXAxis]}<strong><hr>${yLabel} ${d[chosenYAxis]}`);
        });

    statesGroup.call(toolTip);

    statesGroup.on("mouseover", function (data) {
        toolTip.show(data, this);
    })
        .on("mouseout", function (data) {
            toolTip.hide(data);
        });

    return statesGroup;
}

// Read CSV
d3.csv("./assets/data/data.csv").then(function (stateData) {

    // parse data
    stateData.forEach(function (data) {

        Object.keys(data).forEach(key => {
            if (key != 'id' && key != 'state' && key != 'abbr') {
                data[key] = +data[key];
            };
        });
    });

    // create scales
    var xLinearScale = xScale(stateData, chosenXAxis);

    var yLinearScale = yScale(stateData, chosenYAxis);

    // var yLinearScale = d3.scaleLinear()
    //     .domain([0, d3.max(stateData, d => d.healthcare) * 1.1])
    //     .range([height, 0]);

    // create axes
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append axes
    var xAxis = chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    var yAxis = chartGroup.append("g")
        .call(leftAxis);

    // append circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(stateData)
        .enter()
        .append("circle")
        .classed("stateCircle", true)
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", document.getElementById('scatter').offsetWidth * 0.013)
        .attr("opacity", "0.8")
        .attr("stroke-width", "1")

    // append state abbreviations
    var statesGroup = chartGroup.selectAll("text.stateText")
        .data(stateData)
        .enter()
        .append("text")
        .classed("stateText", true)
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .attr("alignment-baseline", "middle")
        .style("font-size", document.getElementById('container').offsetWidth * 0.01)
        .text(d => d.abbr);

    // Create group for 3 x-axis labels
    var xLabelsGroup = chartGroup.append('g')
        .attr('transform', `translate(${width / 2},
                    ${height + margin.top * 0.5})`);

    var povertyLabel = xLabelsGroup.append('text')
        .attr('x', 0)
        .attr('y', 20)
        .attr('value', 'poverty')
        .classed('active', true)
        .text('In Poverty (%)');

    var ageLabel = xLabelsGroup.append('text')
        .attr('x', 0)
        .attr('y', 40)
        .attr('value', 'age')
        .classed('inactive', true)
        .text('Age (Median)');

    var incomeLabel = xLabelsGroup.append('text')
        .attr('x', 0)
        .attr('y', 60)
        .attr('value', 'income')
        .classed('inactive', true)
        .text('Income (Median)');

    // Create group for 3 y-axis labels
    var yLabelsGroup = chartGroup.append('g')
        .attr('transform', `translate(${0 - document.getElementById("container").offsetWidth * .03},
                ${height / 2})`);

    var obeseLabel = yLabelsGroup.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', 0)
        .attr('y', -40)
        .attr('value', 'obesity')
        .classed('active', true)
        .text('Obesity (%)');

    var smokesLabel = yLabelsGroup.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', 0)
        .attr('y', -20)
        .attr('value', 'smokes')
        .classed('inactive', true)
        .text('Smokes (%)');

    var healthcareLabel = yLabelsGroup.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', 0)
        .attr('y', 0)
        .attr('value', 'healthcare')
        .classed('inactive', true)
        .text('Lacks Healthcare (%)');

    // Step 1: Initialize Tooltip
    statesGroup = updateToolTip(chosenXAxis, chosenYAxis, statesGroup);

    xLabelsGroup.selectAll('text')
        .on('click', function () {
            var value = d3.select(this).attr('value');
            if (value != chosenXAxis) {
                chosenXAxis = value;
                xLinearScale = xScale(stateData, chosenXAxis);
                xAxis = renderXAxis(xLinearScale, xAxis);
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                statesGroup = renderCirclesText(statesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                statesGroup = updateToolTip(chosenXAxis, chosenYAxis, statesGroup);
                if (chosenXAxis == "poverty") {
                    povertyLabel
                        .classed('active', true)
                        .classed('inactive', false);
                    ageLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    incomeLabel
                        .classed('active', false)
                        .classed('inactive', true);
                } else if (chosenXAxis == "age") {
                    povertyLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    ageLabel
                        .classed('active', true)
                        .classed('inactive', false);
                    incomeLabel
                        .classed('active', false)
                        .classed('inactive', true);
                } else {
                    povertyLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    ageLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    incomeLabel
                        .classed('active', true)
                        .classed('inactive', false);
                }
            }
        });

    yLabelsGroup.selectAll('text')
        .on('click', function () {
            var value = d3.select(this).attr('value');
            if (value != chosenYAxis) {
                chosenYAxis = value;
                yLinearScale = yScale(stateData, chosenYAxis);
                yAxis = renderYAxis(yLinearScale, yAxis);
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                statesGroup = renderCirclesText(statesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                statesGroup = updateToolTip(chosenXAxis, chosenYAxis, statesGroup);
                if (chosenYAxis == "obesity") {
                    obeseLabel
                        .classed('active', true)
                        .classed('inactive', false);
                    smokesLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    healthcareLabel
                        .classed('active', false)
                        .classed('inactive', true);
                } else if (chosenYAxis == "smokes") {
                    obeseLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    smokesLabel
                        .classed('active', true)
                        .classed('inactive', false);
                    healthcareLabel
                        .classed('active', false)
                        .classed('inactive', true);
                } else {
                    obeseLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    smokesLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    healthcareLabel
                        .classed('active', true)
                        .classed('inactive', false);
                }
            }
        });
});
