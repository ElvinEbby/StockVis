// **** Example of how to create padding and spacing for trellis plot****
const svg = d3.select('svg');

// Hand code the svg dimensions, you can also use +svg.attr('width') or +svg.attr('height')
const svgWidth = Number(svg.attr('width'));
const svgHeight = Number(svg.attr('height'));

// Define a padding object
// This will space out the trellis subplots
const padding = { t: 20, r: 20, b: 60, l: 60 };

// Compute the dimensions of the trellis plots, assuming a 2x2 layout matrix.
const trellisWidth = svgWidth / 2 - padding.l - padding.r;
const trellisHeight = svgHeight / 2 - padding.t - padding.b;

// As an example for how to layout elements with our variables
// Lets create .background rects for the trellis plots
svg.selectAll('.background')
    .data(['A', 'B', 'C', 'D']) // dummy data
    .enter()
    .append('rect') // Append 4 rectangles
    .attr('class', 'background')
    .attr('width', trellisWidth) // Use our trellis dimensions
    .attr('height', trellisHeight)
    .attr('transform', function (d, i) {
        // Position based on the matrix array indices.
        // i = 1 for column 1, row 0)
        const tx = (i % 2) * (trellisWidth + padding.l + padding.r) + padding.l;
        const ty = Math.floor(i / 2) * (trellisHeight + padding.t + padding.b) + padding.t;
        return `translate(${tx}, ${ty})`;
    });

const parseDate = d3.timeParse("%Y-%m-%d");
const colorScale = d3.scaleOrdinal(
    ["AAPL", "GOOGL", "META", "MSFT"],
    [
        "rgba(0,122,255,1)",  // Blue for AAPL
        "rgba(40,205,65,1)",  // Green for GOOGL
        "rgba(175,82,222,1)", // Purple for META
        "rgba(255,149,0,1)"   // Orange for MSFT
    ]
);


// **** How to properly load data ****

d3.csv('stock_prices.csv').then(function(dataset) {
// **** Your JavaScript code goes here ****
    // Iterate through each data point
    dataset.forEach(function(d) {
        d.date = parseDate(d.date);
        d.price = parseFloat(d.price.slice(1)); 
    });
    const nestedData = d3.group(dataset, d => d.company);

    const dateExtent = d3.extent(dataset, d => d.date);
    const priceMax = d3.max(dataset, d => d.price);

    const xScale = d3.scaleTime()
        .domain(dateExtent)
        .range([0, trellisWidth]);

    const yScale = d3.scaleLinear()
        .domain([0, priceMax])
        .range([trellisHeight, 0]);

    const areaGenerator = d3.area()
        .x(d => xScale(d.date))
        .y0(trellisHeight)
        .y1(d => yScale(d.price));

    const trellisG = svg.selectAll('.trellis')
        .data(nestedData)
        .enter()
        .append('g')
        .attr('class', 'trellis')
        .attr('fill', d => colorScale(d[0]))
        .attr('transform', function (d, i) {
            // Position each trellis group based on index
            const tx = (i % 2) * (trellisWidth + padding.l + padding.r) + padding.l;
            const ty = Math.floor(i / 2) * (trellisHeight + padding.t + padding.b) + padding.t;
            return `translate(${tx}, ${ty})`;
        });

    trellisG.append('path')
        .attr('class', 'area-plot')
        .datum(d => d[1])
        .attr('d', areaGenerator)
        .attr('opacity', 1);

    trellisG.append('text')
        .attr('class', 'company-label')
        .attr('x', trellisWidth / 2)
        .attr('y', trellisHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', d => colorScale(d[0]))
        .text(d => d[0]);

    trellisG.append('text')
        .attr('class', 'x axis-label')
        .attr('x', trellisWidth / 2)
        .attr('y', trellisHeight + 34)
        .attr('text-anchor', 'middle')
        .attr('fill', 'black')
        .text('Date (by Month)');

    trellisG.append('text')
        .attr('class', 'y axis-label')
        .attr('x', -trellisHeight / 2)
        .attr('y', 360 - trellisWidth) // 30 away
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .attr('fill', 'black')
        .text('Stock Price (USD)');  



    // Create grid lines
    const xGrid = d3.axisTop(xScale)
        .tickSize(-trellisHeight, 0, 0)
        .tickFormat('');

    const yGrid = d3.axisLeft(yScale)
        .tickSize(-trellisWidth, 0, 0)
        .tickFormat('');

    trellisG.append('g')
        .attr('class', 'x grid')
        .call(xGrid);
    trellisG.append('g')
        .attr('class', 'y grid')
        .call(yGrid);
    
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);
    trellisG.append('g')
        .attr('class', 'x axis')
        .attr('transform', `translate(0, ${trellisHeight})`) // Move it to the bottom
        .call(xAxis);
    
    trellisG.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

});

// Remember code outside of the data callback function will run before the data loads