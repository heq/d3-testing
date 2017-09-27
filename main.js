var jsonData = [
    {
        date: "2017-01-01",
        value: 8
    },
    {
        date: "2017-01-02",
        value: 2
    },
    {
        date: "2017-01-03",
        value: 3
    },
    {
        date: "2017-01-04",
        value: 0
    },
    {
        date: "2017-01-05",
        value: 4
    },
    {
        date: "2017-01-06",
        value: 6
    },
    {
        date: "2017-01-07",
        value: 6
    },
    {
        date: "2017-01-08",
        value: 1
    },
    {
        date: "2017-01-09",
        value: 2
    },
];
var formatDate = d3.timeParse("%Y-%m-%d");
var bisectDate = d3.bisector(function(d) { return d.date; }).left;
var margin = {top: 20, right: 20, bottom: 60, left: 50};
var width = window.innerWidth - margin.left - margin.right;
var height = window.innerHeight - margin.top - margin.bottom;

// Set ranges
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// Define the line
var lineGenerator = d3.line()
    .x(function(item) { return x(item.date); })
    .y(function(item) { return y(item.value); })
    //.curve(d3.curveBasis);
    .curve(d3.curveLinear);

var svg = d3.select("#graph").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Format data
var n = jsonData.length;
for (var i = 0; i < n; i++) {
    var item = jsonData[i];
    item.date = formatDate(item.date);
    item.value = parseInt(item.value);
}

// Scale the range of the data
x.domain(
    d3.extent(jsonData, function(item) {
        return item.date;
    })
);
y.domain(
    [0, d3.max(jsonData, function(item) {
        return item.value;
    })]
);

// Add mousemove capturing element to most far back
var focus = svg.append("g")
    .attr("class", "focus")
    .style("display", "none");

svg.append("rect")
    .attr("class", "overlay")
    .attr("width", width)
    .attr("height", height)
    .on("mouseover", function() { focus.style("display", null); })
    .on("mouseout", function() { focus.style("display", "none"); })
    .on("mousemove", mousemove);

// append the x line
focus.append("line")
    .attr("class", "x")
    .style("stroke", "blue")
    .style("stroke-dasharray", "3,3")
    .style("opacity", 0.5)
    .attr("y1", 0)
    .attr("y2", height);

// place the value at the intersection
focus.append("text")
    .attr("class", "y1")
    .style("stroke", "white")
    .style("stroke-width", "3.5px")
    .style("opacity", 0.8)
    .attr("dx", 8)
    .attr("dy", "-.3em");
focus.append("text")
    .attr("class", "y2")
    .attr("dx", 8)
    .attr("dy", "-.3em");

// Add the valueline path
svg.append("path")
    .attr("class", "line")
    .attr("d", lineGenerator(jsonData));
    //.style("stroke-dasharray", ("6, 4"));

function mousemove() {
	var x0 = x.invert(d3.mouse(this)[0]);
    var i = bisectDate(jsonData, x0, 1);
    var d0 = jsonData[i - 1];
    var d1 = jsonData[i];
    var d = x0 - d0.date > d1.date - x0 ? d1 : d0;

	focus.select("text.y2")
	    .attr("transform", "translate(" + x(d.date) + "," + y(d.value) + ")")
	    .text(d.value);

	focus.select(".x")
        .attr("transform", "translate(" + x(d.date) + "," + 0 + ")")
        .attr("y2", height);

    console.log('x ' + x(d.date), 'y ' + y(d.value));
    console.log('y2 ' + (height - y(d.value)));

	// focus.select(".x")
    //     .attr("transform", "translate(" + x(d.date) + "," + y(d.value) + ")")
    //     .attr("y2", height - y(d.value));
}

// Add data dots
svg.selectAll("dot").data(jsonData)
    .enter().append("circle")
    .attr("r", 4)
    .attr("cx", function(item) { return x(item.date); })
    .attr("cy", function(item) { return y(item.value); })
    .on("mouseover", dotHover);

function dotHover(item) {
    console.log('yup')
}

// Add X and Y axis
svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x)
        .tickFormat(d3.timeFormat("%Y-%m-%d"))
    )
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-0.6em")
    .attr("dy", "0.1em")
    .attr("transform", "rotate(-45)");
svg.append("g")
    .call(d3.axisLeft(y));
