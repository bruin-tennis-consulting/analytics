const width = 1200;
const height = 600;

const svg = d3.select("#rally-length svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

const margin = { top: 50, right: 180, bottom: 100, left: 100 }; // adjust as needed

const xScale = d3.scaleBand()
    .range([margin.left, width - margin.right])
    .padding(0.1);

const yScale = d3.scaleLinear()
    .range([height - margin.bottom, margin.top]);

    // Load the data from the JSON file
    d3.json("../../../../data/json/rally_length.json").then(data => {
      // Set the domain for the x and y scales
      xScale.domain(data.map(d => d.combinedScore));
      yScale.domain([0, d3.max(data, d => d.max_rally)]);

      // Add the vertical lines for each game
      svg.selectAll("line")
        .data(data)
        .enter()
        .append("line")
        .attr("x1", d => xScale(d.combinedScore) + xScale.bandwidth() / 2)
        .attr("y1", d => yScale(d.max_rally))
        .attr("x2", d => xScale(d.combinedScore) + xScale.bandwidth() / 2)
        .attr("y2", d => yScale(d.min_rally))
        .attr("stroke", d => d.border_color)
        .attr("stroke-width", 3)
        .attr("stroke-opacity", 0.25)
        .attr("stroke-dasharray", d => (d.linetype === "-" ? "0,0" : "10,5"));

    const medianLine = d3.line()
        .x(d => xScale(d.combinedScore) + xScale.bandwidth() / 2)
        .y(d => yScale(d.median_rally))
        .curve(d3.curveMonotoneX); // Optional: smooth the line a bit

      svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#000") // or any color you want
        .attr("stroke-width", 2)
        .attr("d", medianLine);
      
        svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("x", d => xScale(d.combinedScore) + xScale.bandwidth() / 2)
        .attr("cx", d => xScale(d.combinedScore) + xScale.bandwidth() / 2)
        .attr("cy", d => yScale(d.median_rally))
        .attr("r", 6)
        .attr("fill", d => d.border_color)
        .attr("stroke", d => d.border_color)
        .attr("stroke-width", 2)
        .attr("opacity", 1);

    // Create the x-axis
    const xAxis = svg.append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(xScale).tickFormat(d => {
        const matchingData = data.find(item => item.combinedScore === d);
        return matchingData ? matchingData.xlabel : ''; 
    }));

    // Rotate the x-axis labels
    xAxis.selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-40)")  
        .attr("dx", "-.75em")  
        .attr("dy", ".5em")
        .attr("font-size", "14px"); 

    const yAxis = svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale));

    yAxis.selectAll("text")
        .style("text-anchor", "middle")
        .attr("dx", "-.75em")
        .attr("font-size", "14px");

      // Add the title and labels
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .attr("font-size", "24px")
        .attr("font-weight", "bold")
        .text("Rally Length By Game and Server");

      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - margin.bottom / 2 + 40)
        .attr("text-anchor", "middle")
        .attr("font-size", "20px")
        .text("Score");

      svg.append("text")
        .attr("x", - (height / 2))
        .attr("y", margin.left / 2)     
        .attr("text-anchor", "middle")
        .attr("font-size", "20px")
        .attr("transform", "rotate(-90)")
        .text("Number of Shots");

    // --- Legend ---
    const legend = svg.append("g")
        .attr("class", "legend");

    // Spacing
    const rectPadding = 28;
    const legendPadding = 15;

    // Create legend content group
    const legendContent = legend.append("g");

    // Win
    legendContent.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 20)
        .attr("height", 3)
        .attr("fill", "green");

    legendContent.append("text")
        .attr("x", 30)
        .attr("y", 1.5)
        .attr("dy", ".35em")
        .text("Win");

    // Loss
    legendContent.append("rect")
        .attr("x", 0)
        .attr("y", rectPadding)
        .attr("width", 20)
        .attr("height", 3)
        .attr("fill", "red");

    legendContent.append("text")
        .attr("x", 30)
        .attr("y", rectPadding + 1.5)
        .attr("dy", ".35em")
        .text("Loss");

    // Serve
    legendContent.append("line")
        .attr("x1", 0)
        .attr("y1", rectPadding * 2)
        .attr("x2", 20)
        .attr("y2", rectPadding * 2)
        .attr("stroke", "#000")
        .attr("stroke-width", 2);

    legendContent.append("text")
        .attr("x", 30)
        .attr("y", rectPadding * 2)
        .attr("dy", ".35em")
        .text("Serving");

    // Return
    legendContent.append("line")
        .attr("x1", 0)
        .attr("y1", rectPadding * 3)
        .attr("x2", 20)
        .attr("y2", rectPadding * 3)
        .attr("stroke", "#000")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5");

    legendContent.append("text")
        .attr("x", 30)
        .attr("y", rectPadding * 3)
        .attr("dy", ".35em")
        .text("Returning");


    // --- Compute bounding box ---
    const bbox = legendContent.node().getBBox();
    const legendMargin = 10; // space from SVG edge

    // Add rounded background rectangle
    legend.insert("rect", ":first-child")
        .attr("x", bbox.x - legendPadding)
        .attr("y", bbox.y - legendPadding)
        .attr("width", bbox.width + legendPadding * 2)
        .attr("height", bbox.height + legendPadding * 2)
        .attr("rx", 15)
        .attr("ry", 15)
        .attr("fill", "white")
        .attr("stroke", "#ccc")
        .attr("stroke-width", 2)
        .attr("opacity", 0.95);

    // Move legend safely inside SVG (right aligned)
    legend.attr(
        "transform",
        `translate(${width - bbox.width - legendPadding*2 - legendMargin}, 300)`
);
    });
