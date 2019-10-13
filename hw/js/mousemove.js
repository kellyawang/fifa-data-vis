function mousemove(xScale, yScale, selector, focus) {
    var bisectDate = d3.bisector(function(d) { return d.date; }).left;

    // var focus = d3.select(".focus")
    var x0 = xScale.invert(d3.mouse(this)[0]),
        i = bisectDate(data, x0, 1),
        d0 = data[i - 1],
        d1 = data[i],
        d = x0 - d0.date > d1.date - x0 ? d1 : d0;

    // focus.select("circle.y")
    //     .attr("transform",
    //         "translate(" + xScale(d.YEAR) + "," +
    //         yScale(d[selector]) + ")");

    focus.select("text.y1")
        .attr("transform",
            "translate(" + xScale(d.YEAR) + "," +
            yScale(d[selector]) + ")")
        .text(d[selector]);

    focus.select("text.y2")
        .attr("transform",
            "translate(" + xScale(d.YEAR) + "," +
            yScale(d[selector]) + ")")
        .text(d[selector]);

    focus.select("text.y3")
        .attr("transform",
            "translate(" + xScale(d.YEAR) + "," +
            yScale(d[selector]) + ")")
        .text(formatDate(d.YEAR));

    focus.select("text.y4")
        .attr("transform",
            `translate(${xScale(d.YEAR)},
                ${yScale(d[selector])})`)
        .text(formatDate(d.YEAR));

    // focus.select(".x")
    //     .attr("transform",
    //         `translate(${xScale(d.YEAR)},
    //             ${yScale(d[selector])})`)
    //     .attr("y2", height - scale_padding - yScale(d[selector]));
    //
    // focus.select(".y")
    //     .attr("transform",
    //         `translate(${(width) * -1},
    //             ${yScale(d[selector])})`)
    //     .attr("x2", width + width - scale_padding);
}