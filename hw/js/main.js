// Jumbotron
var jumboHeight = $('.jumbotron').outerHeight();
function parallax(){
	var scrolled = $(window).scrollTop();
	$('.bg').css('height', (jumboHeight - scrolled) + 'px');
}

$(window).scroll(function(e){
	parallax();
});

// SVG drawing area
var margin = {top: 40, right: 40, bottom: 60, left: 60};

var width = 700 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom;

var scale_padding = 30
var axis_margin = 15

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


// Draw initial svgs
setup();

// Initialize data
loadData();

// FIFA world cup
var data;

var lineGenerator = d3.line()
	.curve(d3.curveMonotoneX)
	.x(function(d) { return xScale(d.YEAR); })
	.y(function(d) { return yScale(d.GOALS); });

var labelMap = {
	EDITION: "Edition",
	YEAR: "Year",
	LOCATION: "Location",
	WINNER: "Winner",
	TEAMS: "Teams",
	MATCHES: "Matches",
	GOALS: "Goals",
	AVERAGE_GOALS: "Average Goals",
	AVERAGE_ATTENDANCE: "Average Attendance"
}

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

		// Label the axes
		d3.select("#chart-svg").append("text")
			.attr("class", "x-axis axis-label")
			.attr("x", width - scale_padding - 5)
			.attr("y", height - axis_margin)
			.text(labelMap.YEAR)

		d3.select("#chart-svg").append("text")
			.attr("class", "y-axis axis-label")
			.style("text-anchor", "end")
			.attr("transform", `rotate(270, ${axis_margin}, ${height/2})`)
			.attr("x", width/4 + scale_padding)
			.attr("y", width/3 + 5)
			.text(labelMap.GOALS)

		drawLine();

		// Draw the visualization for the first time
		updateVisualization();
	});
}

function drawLine() {
	var line = d3.select("#line-group").append("path")
		.datum(data)
		.attr("class", "line")
		.attr("d", lineGenerator)
}

// Render visualization
function updateVisualization() {
	var t = d3.transition().duration(800);

	let selector = d3.select("#ranking-type").property("value");
	let timeFrom = d3.select("#time-period-from").property("value")
	let timeTo = d3.select("#time-period-to").property("value")

	timeFrom = timeFrom ? timeFrom : "1930"
	timeTo = timeTo ? timeTo : "2014"

	let filteredData = data.filter(d => {
		return formatDate(d.YEAR) >= timeFrom && formatDate(d.YEAR) <= timeTo
	})

	console.log(filteredData)

	// update the y scale
	console.log(`min value: ${d3.min(filteredData, d => d[selector])}, max value: ${d3.max(filteredData, d => d[selector])}`)
	xScale.domain([d3.min(filteredData, d => d.YEAR), d3.max(filteredData, d => d.YEAR)])
	yScale.domain([d3.min(filteredData, d => d[selector]), d3.max(filteredData, d => d[selector])]);
	// Update the line generator
	lineGenerator.y(function(d) { return yScale(d[selector]) });

	// Update line
	d3.select(".line").datum(filteredData)
		.transition(t)
		.attr("d", lineGenerator)

	var svg = d3.select("#chart-svg")
	let pointsGroup = d3.select("#point-group")
		.selectAll("circle")
		.data(filteredData)

	pointsGroup.exit().remove()

	var tip = d3.tip()
		.attr("class", "d3-tip")
		.offset([-10,0])
		.html(function(d) {
			let selector = d3.select("#ranking-type").property("value")
			return `<span class="tooltip-title">${d.LOCATION} ${formatDate(d.YEAR)}:</span> ${d[selector]}`;
		});

	// draw axes
	svg.select(".x-axis").transition(t)
		.call(xAxis)
	svg.select(".y-axis").transition(t)
		.call(yAxis)

	// update axis label
	var ylabel = svg.select(".y-axis.axis-label")
	ylabel.exit().remove()

	ylabel.enter()
		.append("text")
		// .attr("class", "y-axis axis-label")
		// .style("text-anchor", "middle")
		.merge(ylabel)
		.transition(t)
		.text(labelMap[selector])

	svg.call(tip);

	pointsGroup.enter()
		.append("circle")
		.attr("r", 5)
		.attr("cx", d => xScale(d.YEAR))
		.attr("cy", d => yScale(d[selector]))
		.attr("class", "tooltip-circle")
		.on("mouseover", function(d) {
			tip.show(d)
			hoverEffectOn(this)
		})
		.on("mouseout", function(d) {
			tip.hide(d)
			hoverEffectOff(this)
		})
		.on("click", function(d) { console.log("clicked!");showEdition(d) })
		.merge(pointsGroup)
		.transition(t)
		.attr("cx", d => xScale(d.YEAR))
		.attr("cy", d => yScale(d[selector]))

}

// Show details for a specific FIFA World Cup
function showEdition(d){

	// select container elements
	var $detailsContainer = $("#detail-area");

	// build header elements
	var header = `<h3>${d.EDITION}</h3>`

	// build a table to hold detailed info
	var $table = $('<table class="mx-auto">');
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
		.style("fill", "#4541ff");
}

function hoverEffectOff(object) {
	d3.select(object)
		.transition()
		.duration(100)
		.style("fill", "white");
}