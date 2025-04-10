const margins ={
    top: 100, right: 100, bottom: 60, left: 80
};

// todo: fix aspect ratio(wider graph, not too tall so the spike are not too sharp on the graph), fix axes dissapearing

const width = 900;
const height = 800;
const tickCount = 20;
const tooltipPadding = 5;
const tooltipOffset = 20

const graphWidth = width - margins.right - margins.left;
const graphHeight = height - margins.top - margins.bottom;

let graphNames = [
    'default_physics_timer_recordings_cubes.csv', 
    'jolt_physics_timer_recordings_cubes.csv', 
    'default_physics_timer_recordings_spheres.csv', 
    'jolt_physics_timer_recordings_spheres.csv'
]

let g_columnIndex = 0;
let g_objectCount = 0;
let g_physicsEngine = null;
let currentGraphIndex = 0;

let sortedColumnNames = []

let xScaling = d3.scaleLinear();
let yScaling = d3.scaleLinear();

const lineGenerator = d3.line()
    .x(function(_, index) { 
        // print(`lineGenerator: index: ${index}, result: ${xScaling(index)}`);
        return xScaling(index)})
    .y(function(d) { return yScaling(d[g_columnIndex])})

let currentData = null;
let xAxisGroup = null;
let currentPath = null;

let brush = d3.brushX()
.extent([[0,0],[graphWidth, graphHeight]])
.on('end', updateGraph)

// Add svg anchor to page
var svg = d3.select("#chart-container")
.append('svg')
.attr('width', width)
.attr('height', height)
.append('g')
.attr('transform', `translate(${margins.left}, ${margins.top})`);

let tooltip = null;
const tooltipCircleSize = 5;

function printNodeType(name, obj) {
    print(`${name} type is ${obj.node().nodeName}`)
}

function getCurrentGraphName() {
    return graphNames[currentGraphIndex];
}

function updateGraph(event) {
    // print(`event ${event}`)
    var extents = event.selection;

    // If event was triggered by code instead of user interaction
    // then just return.
    if (!event.sourceEvent) {
        return;
    }

    if (!extents) {
        print('no extents')
        // reset graph to default extents
        xScaling.domain([0,  currentData.length])
    } else {
        print(`extents are ${extents}`)
        print(`inverted extents are: ${xScaling.invert(extents[0])}, 
            ${xScaling.invert(extents[1])}`)
        // Use the beginning and end pixelX values to establish a new domain.
        xScaling.domain([
            xScaling.invert(extents[0]),
            xScaling.invert(extents[1])]
        )
        // hide brush
        svg.select('.brush').call(brush.move, null)
    }

    // Redraws axis smoothly
    xAxisGroup.transition().duration(1000)
        .call(d3.axisBottom(xScaling).ticks(tickCount))


        // ???
    print(`xScaling domain is ${xScaling.domain()}`)
    const visibleData = currentData.filter((_, index) => {
        // print(`visible data d is ${d}`)
        return index >= xScaling.domain()[0] && index <= xScaling.domain()[1]
    });
    
    print(`visibleData is ${visibleData}`)
    
    // The bounds don't necesarrily start at zero, but the new indices created will so shift them
    // over to the beginning of the new domain so we don't fly off the graph.
    lineGenerator.x((_, index) => 
        { 
            // print(`update: index is ${index}, result is ${index + xScaling(xScaling.domain()[0] + index)}`)
            return xScaling(xScaling.domain()[0] + index); 
        });

    currentPath
        .datum(visibleData)
        .transition().duration(1000)
        .attr('d', lineGenerator)
}

function pointerLeavesGraph() {
    // don't display tooltip if mouse not within graph
    tooltip.style('display', 'none');
    svg.selectAll('circle')
        .attr('r', 0)
}

function print(message){
    console.log(message);
}

function addYAxisLabel(group, innerHeight, label) {
    group.append('text')
    .attr('class', 'axis-label')
          .attr('x',  -innerHeight / 4)
          .attr('y', -45)
          .attr("font-size","34px")
          .attr('fill', 'gray')
          .attr('transform', 'rotate(-90)')
          .text(label);
  }
  
  function addXAxisLabel(group, innerWidth, label) {
    group.append('text')
          .attr('class', 'axis-label')
          .attr('y', 45)
          .attr('x', innerWidth / 2)
          .attr('fill', 'gray')
          .attr("font-size","34px")
          .text(label);
  }

function createTooltipCircle() {
    svg.append('circle')
        .attr('r', 0)
        .attr('fill', 'steelblue')
        .attr('stroke', 'white')
        .attr('stroke-width', 1)
        .attr('opacity', .7)
}

function mouseMoved(event) {
        // Get mouse x and y
        const [mouseX, _] = d3.pointer(event);

        // print(`mouseX is ${mouseX} with type ${typeof mouseX}`)

        // Translate from pixel range to domain range(physics ticks)
        let tickValue = Math.round(xScaling.invert(mouseX));

        tickValue = Math.min(currentData.length - 1, tickValue) 
        tickValue = Math.max(tickValue, 0)

        // print(`tick value is ${tickValue}`)

        // get milliseconds
        // print(typeof g_columnIndex)
        const datum = currentData[tickValue][g_columnIndex];

        const newX= xScaling(tickValue);
        const newY = yScaling(datum);

        // print(`newX and newY: ${newX}, ${newY}`)
       
        // get rid of display attribute thus allowing it to draw by default
        tooltip.style('display', null)
        tooltip.attr('transform', `translate(${newX}, ${newY})`);
        // Raise tooltip to top of screen z axis
        tooltip.raise()

        svg.selectAll('circle')
          .attr('r', tooltipCircleSize)
          .attr('cx', newX)
          .attr('cy', newY)

        // Add text to rectangle
        const text = tooltip.selectAll('text')
            .data([,])
            .join('text')
            .call(function(text) {
                // <tspan> is essentially subtext within a text element.
                text.selectAll('tspan')
                // set the ascii text, has to be enclosed in an array or else each character will be given its own tspan!!!
                .data([`Tick: ${tickValue}, Milliseconds: ${datum}`])
                .join('tspan')
                  .attr('x', tooltipOffset)
                  //   .attr('y', )
                  .attr('font-weight', 'bold')
                  .text(d => d)
                  .style('padding', '5px');

                  return text;
            })

        // Get bounding box for text.
        const boundingBox = text.node().getBBox();
        // print(`bound box is ${boundingBox.width}, ${boundingBox.height}`)
        tooltip.selectAll('rect')
            .data([null])
            .join('rect')
                .attr('x', boundingBox.x - tooltipPadding)
                .attr('y', boundingBox.y - tooltipPadding)
                .attr('width', boundingBox.width + tooltipPadding * 2)
                .attr('height', boundingBox.height + tooltipPadding * 2)
                .attr('fill', 'white')
                .attr('stroke', 'black')
                // Lower text box behind the actual text
                .lower()
}

function render(data) {
    svg.selectAll('*').remove()
    
    createTooltipCircle();

    // recreate brush
    svg.append('g')
    .attr('class', 'brush')
    .call(brush);

    // recreate tooltip
    tooltip = svg.append('g');
    svg.on('pointerleave', pointerLeavesGraph)
    .on('pointerenter pointermove', mouseMoved)

    // "#" if for ids,  "." is for classes in html
    let engineText = 'Physics Engine: ' + g_physicsEngine;
    d3.select('#current-simulation').text(engineText);
    g_objectCount = getNumFromString(sortedColumnNames[g_columnIndex])
    let objectCountText = 'Colliding Objects ' + String(g_objectCount)
    d3.select('#object-count').text(objectCountText)

    let graphName = getCurrentGraphName()
    let objectTypeText = 'Object Type: ';
    objectTypeText += graphName.includes('cubes') ? 'Cubes' : 'Spheres';
    d3.select('#object-type').text(objectTypeText)

    // for now maximum is for one column
    print(data)
    print(data[0])

    // print(`graph height ${graphHeight}`)
    // print(`graph width ${graphWidth}`)
    
    const xMax = data.length;
    // print(`max x is ${xMax}`)
    
    // create x axis aka ticks
    xScaling
    .domain([0, xMax])
    .range([0, graphWidth])
    
    // append x axis, xAxisGroup is of type 'g'
    xAxisGroup = svg.append('g')
        .attr('transform', `translate(0, ${graphHeight})`)
        // axisBottom returns element of type 'g', includes a child 'path' element
        // and multiple tick elements. ticks are of type 'g'.
        .call(d3.axisBottom(xScaling).ticks(tickCount))

    printNodeType('xAxisGroup', xAxisGroup)
    addXAxisLabel(xAxisGroup, graphWidth, "Ticks")
    
    const yMax = d3.max(data, 
        row => row[g_columnIndex]
    )
    print(`max y is ${yMax}`)
    
    // create y axis aka milliseconds
    yScaling
        .domain([0, yMax])
        .range([graphHeight, 0])

    let yAxisGroup = svg.append('g')
        .call(d3.axisLeft(yScaling));
    addYAxisLabel(yAxisGroup, graphHeight, "Milliseconds")

    // reset line generator x domain to start at zero in case 
    // updateGraph changed it.
    lineGenerator.x(function(_, index) { return xScaling(index)})

    // currentPath is of type 'path'
    currentPath = svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 1.5)
        .attr('d', lineGenerator)
    printNodeType('currentPath', currentPath)
}

function getNumFromString(string) {
    return +string.match(/\d+/)[0];
}

function getSortedColumnNames(data) {
     // get the column names by getting keys stored in first row of data
     let columns = Object.keys(data[0]);

     // sort by numerical order
     // sorting strings like: "num objects 729"
     columns.sort(function(first, second){
         // match() returns an array containing, the string, the index, the input, and the length of the matches found. We only need index 0.
         var firstCounter = getNumFromString(first);
         var secondCounter = getNumFromString(second);
        //  print(`first counter is ${firstCounter}`)
        //  print(`second counter is ${secondCounter}`)
         return firstCounter - secondCounter;
     });
 
     print(`columns are ${columns}`)
     
     sortedColumnNames = columns
 
     print(`sorted columns are ${sortedColumnNames}`)
}

function prevGroup() {
    let numColumns = sortedColumnNames.length
    g_columnIndex = (g_columnIndex - 1 + numColumns) % numColumns
    // print(`new column index: ${g_columnIndex}`)
    g_objectCount = getNumFromString(sortedColumnNames[g_columnIndex])
    render(currentData)
}

function nextGroup() {
    g_columnIndex = (g_columnIndex + 1) % sortedColumnNames.length
    // print(`new column index: ${g_columnIndex}`)
    g_objectCount = getNumFromString(sortedColumnNames[g_columnIndex])
    render(currentData)
}

function prevGraph() {
    g_columnIndex = 0;
    currentGraphIndex = (currentGraphIndex - 1 + graphNames.length) % graphNames.length
    // print(`graph index ${currentGraphIndex}`)
    // print(`current graph: ${graphNames[currentGraphIndex]}`)
    loadGraph(getCurrentGraphName())
}

function nextGraph() {
    g_columnIndex = 0;
    currentGraphIndex = (currentGraphIndex + 1) % graphNames.length
    // print(`graph index ${currentGraphIndex}`)
    // print(`current graph: ${graphNames[currentGraphIndex]}`)
    loadGraph(getCurrentGraphName())
}

function loadGraph(graphName) {
d3.csv(graphName)
.then(data => {
    getSortedColumnNames(data);

    g_physicsEngine = graphName.includes('default') ? 'Default' : 'Jolt';

    // print(`data length ${data.length}`)
    // print(`sorted columns before loop ${sortedColumnNames}`)
     for (var i = 0; i < data.length; i++) {
        const oldRow = data[i];
        // print('old row is')
        // print(oldRow)
        let newRow = []
        sortedColumnNames.forEach(col => {
            // print(typeof col)
             newRow.push(+oldRow[col]);
        });
        data[i] = newRow;
        // print(`new row is`)
        // print(newRow)
        // print(`data[i] is: ${data[i]}`)
     }
    
     currentData = data;
     render(currentData);
  });
}

loadGraph(getCurrentGraphName());
