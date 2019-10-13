// SVG drawing area

var margin = {top: 40, right: 10, bottom: 60, left: 60};

var width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var svg = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var barGroup = svg.append("g")
var xAxisGroup = svg.append("g")
var yAxisGroup = svg.append("g")

var scale_padding = 30;

// Scales
var x = d3.scaleBand()
    .rangeRound([scale_padding, width - scale_padding])
	.paddingInner(0.1);

var y = d3.scaleLinear()
    .range([height - scale_padding, scale_padding]);

// Define the axes
var xAxis = d3.axisBottom(x)
var yAxis = d3.axisLeft(y)


// Initialize data
loadData();

// Create a 'data' property under the window object
// to store the coffee chain data
Object.defineProperty(window, 'data', {
	// data getter
	get: function() { return _data; },
	// data setter
	set: function(value) {
		_data = value;
		// update the visualization each time the data property is set by using the equal sign (e.g. data = [])
		updateVisualization()
	}
});


// Load CSV file
function loadData() {
	d3.csv("data/coffee-house-chains.csv", function(error, csv) {

		csv.forEach(function(d){
			d.revenue = +d.revenue;
			d.stores = +d.stores;
		});

		// Store csv data in global variable
		data = csv;
		// updateVisualization gets automatically called within the data = csv call;
		// basically(whenever the data is set to a value using = operator);
		// see the definition above: Object.defineProperty(window, 'data', { ...

		// Draw the initial graph
		// let sortedData = data.sort(function(a, b) { return b.stores - a.stores; });
		// x.domain(data.map(function(d) { return d.company; }));
		// y.domain([d3.min(data, d => d.stores), d3.max(data, d => d.stores)]);
		xAxisGroup.attr("class", "axis x-axis")
			.attr("transform", `translate(0, ${height})`)
			.call(xAxis)

		yAxisGroup.attr("class", "axis y-axis")
			.call(yAxis);
		// let bars = barGroup.selectAll("rect")
		// 	.data(data)
		// 	.enter()
		// 	.append("rect")
		// 	.attr("class", "bar")
		// 	.attr("fill", "#C8AB90")
		// 	.attr("x", d => { return x(d.company); })
		// 	.attr("y", d => { return y(d.stores); })
		// 	.attr("width", x.bandwidth())
		// 	.attr("height", d => { return height - y(d.stores); });
	});
}


// Render visualization - put anything here that relies on dynamic data
function updateVisualization() {
  	console.log(data);

	let selector = d3.select("#ranking-type").property("value");

	let sortedData = data.sort(function(a, b) { return b[selector] - a[selector]; });
	x.domain(data.map(function(d) { return d.company; }));
	y.domain([d3.min(data, d => d[selector]), d3.max(data, d => d[selector])]);

	let bars = barGroup.selectAll("rect")
		.data(data);

	xAxisGroup.exit().remove()
	yAxisGroup.exit().remove()
	bars.exit().remove()

	xAxisGroup.transition().duration(2000)
		.call(xAxis)

	yAxisGroup.transition().duration(2000)
		.call(yAxis)

	let barsEnter = bars.enter()
		// .data(data)
		.append("rect")
		.attr("class", "bar")
		.attr("fill", "#C8AB90")
		.attr("x", d => { return x(d.company); })
		.attr("y", d => { return y(d.stores); })
		.attr("width", x.bandwidth())
		.attr("height", d => { return height - y(d.stores); });

	bars.merge(barsEnter)
			.transition().duration(1000)
			.attr("x", d => { return x(d.company); })
			.attr("y", d => { return y(d[selector]); })
			.attr("width", x.bandwidth())
			.attr("height", d => { return height - y(d[selector]); });

}

