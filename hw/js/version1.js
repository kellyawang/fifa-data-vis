
// SVG drawing area

var margin = {top: 40, right: 40, bottom: 60, left: 60};

var width = 700 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var scale_padding = 30

//Create scale functions
// var xScale = d3.scaleBand()
// 	.rangeRound([scale_padding, width - scale_padding])
// 	.paddingInner(0.1);

var xScale = d3.scaleTime()
    .range([scale_padding, width - scale_padding]);

var yScale = d3.scaleLinear()
    .range([height - scale_padding, scale_padding]);

// Define the axes
var xAxis = d3.axisBottom(xScale)
var yAxis = d3.axisLeft(yScale)

// Date parser
var formatDate = d3.timeFormat("%Y");
var parseDate = d3.timeParse("%Y");

// $("#time-filter-form").submit(function(e) { updateVisualization() })

// Draw initial svgs
setup();

// Initialize data
loadData();

// FIFA world cup
var data;

var lineGenerator = d3.line()
    .curve(d3.curveMonotoneX) //curveNatural, curveBasis, curveMonotoneX
    .x(function(d) { return xScale(d.YEAR); })
    .y(function(d) { return yScale(d.GOALS); });



//create svgs
function setup() {
    var chartGroup = d3.select("#chart-area").append("g").attr("id", "chart-group")
    var svg = chartGroup.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("id", "chart-svg")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g").attr("id", "line-group")
    svg.append("g").attr("id", "point-group")
    svg.append("g").attr("id", "x-axis-group")
    svg.append("g").attr("id", "y-axis-group")

    // svg.append("g").attr("class", "focus")
    // 	.style("display", "none");
    //Set form listener
//	d3.select(".time-form-submit").on("submit", (d, i) => { testSubmit() });

}

// Load CSV file
function loadData() {
    d3.csv("data/fifa-world-cup.csv", function(error, csv) {

        csv.forEach(function(d){
            // Convert string to 'date object'
            d.YEAR = parseDate(d.YEAR);

            // Convert numeric values to 'numbers'
            d.TEAMS = +d.TEAMS;
            d.MATCHES = +d.MATCHES;
            d.GOALS = +d.GOALS;
            d.AVERAGE_GOALS = +d.AVERAGE_GOALS;
            d.AVERAGE_ATTENDANCE = +d.AVERAGE_ATTENDANCE;
        });

        // Store csv data in global variable
        data = csv;

        console.log(data)

        //draw axes for the first time
        xScale.domain([d3.min(data, d => d.YEAR), d3.max(data, d => d.YEAR)])
        yScale.domain([d3.min(data, d => d.GOALS), d3.max(data, d => d.GOALS)]);
        let xAxisGroup = d3.select("#x-axis-group")
        let yAxisGroup = d3.select("#y-axis-group")

        xAxisGroup.attr("class", "axis x-axis")
            .attr("transform", `translate(0, ${height})`)
            .call(xAxis)

        yAxisGroup.attr("class", "axis y-axis")
            .call(yAxis);


        drawLine();

        // Draw the visualization for the first time
        updateVisualization();
    });
}

function drawLine() {
    var svg = d3.select("#chart-svg")
    var line = svg.append("g").append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", lineGenerator)
}

function testSubmit() {
    console.log("testing submit button")
    let timeFrom = d3.select("#time-period-from").property("value");
    let timeTo = d3.select("#time-period-to").property("value");
    console.log("testSubmit timeFrom:" + timeFrom + ". timeTo:" + timeTo + ".")

    let filteredData = data.filter(function(d) {
        console.log(formatDate(d.YEAR))
        if (formatDate(d.YEAR) >= timeFrom && formatDate(d.YEAR) <= timeTo) {
            console.log("Year that passed the test:" + formatDate(d.YEAR) + ".")
        }
        return formatDate(d.YEAR) >= timeFrom && formatDate(d.YEAR) <= timeTo
    })
    console.log(filteredData)
}

// Render visualization
function updateVisualization() {
    var t = d3.transition().duration(800);

    let selector = d3.select("#ranking-type").property("value");
    let timeFrom = d3.select("#time-period-from").property("value")
    let timeTo = d3.select("#time-period-to").property("value")

    timeFrom = timeFrom ? timeFrom : "1930"
    timeTo = timeTo ? timeTo : "2014"

    console.log("updateVis timeFrom:" + timeFrom + ". timeTo:" + timeTo + ".")

    let filteredData = data.filter(function(d) {
        // if (formatDate(d.YEAR) >= timeFrom && formatDate(d.YEAR) <= timeTo) {
        // console.log("Year that passed the test:" + formatDate(d.YEAR) + ".")
        // }
        return formatDate(d.YEAR) >= timeFrom && formatDate(d.YEAR) <= timeTo
    })

    console.log(filteredData)

    // update the y scale
    console.log(`min value: ${d3.min(filteredData, d => d[selector])}, max value: ${d3.max(filteredData, d => d[selector])}`)
    xScale.domain([d3.min(filteredData, d => d.YEAR), d3.max(filteredData, d => d.YEAR)])
    yScale.domain([d3.min(filteredData, d => d[selector]), d3.max(filteredData, d => d[selector])]);
    // Update the line generator
    lineGenerator.y(function(d) {
        console.log("updating line generator")
        return yScale(d[selector]);
    });

    // // Update line
    // d3.select("#line-group").datum(filteredData)
    // 	.transition(t)
    // 	.attr("d", lineGenerator)
    console.log("right before line update")
    var selection = d3.select(".line")
        .datum(filteredData)
        .transition(t)
        .attr("d", lineGenerator)


    var svg = d3.select("#chart-svg")
    // var focus = svg.select(".focus")
    let pointsGroup = d3.select("#point-group")
        .selectAll("circle")
        .data(filteredData)

    pointsGroup.exit().remove()

    svg.select(".x-axis").transition(t)
        .call(xAxis)
    svg.select(".y-axis").transition(t)
        .call(yAxis)

    pointsGroup.enter()
        .append("circle")
        .attr("r", 5)
        .attr("cx", d => xScale(d.YEAR))
        .attr("cy", d => yScale(d[selector]))
        .attr("class", "tooltip-circle")
        .merge(pointsGroup)
        .transition(t)
        .attr("cx", d => xScale(d.YEAR))
        .attr("cy", d => yScale(d[selector]))


    // appendTooltips(focus)
}


// Show details for a specific FIFA World Cup
function showEdition(d){

    // select container elements
    var $detailsContainer = $("#detail-area");

    // build image and header elements
    // var $img = $('<img>').attr('src', `data/img/${d.image}`).attr('alt', "");
    var header = `<h3>${d.EDITION}</h3>`

    // build a table to hold detailed info
    var $table = $('<table>');
    var $tbody = $table.append('<tbody />').children('tbody');
    $tbody.append('<tr />').children('tr:last')
        .append("<td>Winner</td>")
        .append(`<td>${d.WINNER}</td>`);

    $tbody.append('<tr />').children('tr:last')
        .append("<td>Goals</td>")
        .append(`<td>${d.GOALS}</td>`);

    $tbody.append('<tr />').children('tr:last')
        .append("<td>Average Goals</td>")
        .append(`<td>${d.AVERAGE_GOALS}</td>`);

    $tbody.append('<tr />').children('tr:last')
        .append("<td>Matches</td>")
        .append(`<td>${d.MATCHES}</td>`);

    $tbody.append('<tr />').children('tr:last')
        .append("<td>Teams</td>")
        .append(`<td>${d.TEAMS}</td>`);

    $tbody.append('<tr />').children('tr:last')
        .append("<td>Average Attendance</td>")
        .append(`<td>${d.AVERAGE_ATTENDANCE}</td>`);

    // udpate the DOM
    $detailsContainer.html(header)
        .append($table)

}

function hoverEffectOn(object) {
    d3.select(object)
        .transition()
        .duration(100)
        .style("fill", "green");
}

function hoverEffectOff(object) {
    d3.select(object)
        .transition()
        .duration(100)
        .style("fill", "white");
}