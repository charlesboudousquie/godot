const margins ={
    top: 30, right: 30, bottom: 60, left: 80
};

const width = 900;
const height = 600;
const tickCount = 20;
const tooltipPadding = 5;

const graphWidth = width - margins.right - margins.left;
const graphHeight = height - margins.top - margins.bottom;


let g_columnIndex = 0;

let sortedColumns = []

let xScaling = d3.scaleLinear();
let yScaling = d3.scaleLinear();

let currentData = null;

// Add svg anchor to page
var svg = d3.select("#chart-container")
    .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${margins.left}, ${margins.top})`);
        
let tooltip = svg.append('g');

function pointerLeavesGraph() {
    // don't display tooltip if mouse not within graph
    tooltip.style('display', 'none');
}

svg.on('pointerleave', pointerLeavesGraph())
.on('pointerenter pointermove', mouseMoved)

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

// tooltip code if from https://www.youtube.com/watch?v=uyPYxx-WGxc&list=PLdJuTVexUXU1CW9IduXFtS2vjQcDAOgz7&index=3

// function createCircleTooltip() {
//     return svg.append('circle')
//     .attr('r', 0)
//     .attr('fill', 'steelblue')
//     .attr('stroke', 'white')
//     .attr('opacity', .7)
//     .style('pointer-events', 'none');
// }

function mouseMoved(event) {
        // Get mouse x and y
        const [mouseX, _] = d3.pointer(event);

        print(`mouseX is ${mouseX} with type ${typeof mouseX}`)

        // Translate from pixel range to domain range(physics ticks)
        const tickValue = Math.round(xScaling.invert(mouseX));
        print(`tick value is ${tickValue}`)

        // get milliseconds
        const datum = currentData[tickValue][g_columnIndex];

        const newX= xScaling(tickValue);
        const newY = yScaling(datum);

        // print(`newX and newY: ${newX}, ${newY}`)
       
        // get rid of display attribute thus allowing it to draw by default
        tooltip.style('display', null)
        tooltip.attr('transform', `translate(${newX}, ${newY})`);
        // Raise tooltip to top of screen z axis
        tooltip.raise()

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
                  .attr('x', 0)
                  //   .attr('y', )
                  .attr('font-weight', 'bold')
                  .text(d => d);

                  return text;
            })

        // Get bounding box for text.
        const boundingBox = text.node().getBBox();
        print(`bound box is ${boundingBox.width}, ${boundingBox.height}`)
        tooltip.selectAll('rect')
            .data([null])
            .join('rect')
                .attr('x', boundingBox.x - tooltipPadding)
                .attr('y', boundingBox.y - tooltipPadding)
                .attr('width', boundingBox.width + tooltipPadding * 2)
                .attr('height', boundingBox.height + tooltipPadding * 2)
                .attr('fill', 'white')
                // .attr('fill', 'none')
                .attr('stroke', 'black')
                // Lower text box behind the actual text
                .lower()
}

function render(data) {

    // for now maximum is for one column
    print(data)
    print(data[0])

    // print(`graph height ${graphHeight}`)
    // print(`graph width ${graphWidth}`)
    
    const xMax = data.length;
    // print(`max x is ${xMax}`)
    
    // create x axis aka ticks
    // const xScaling = d3.scaleLinear()
    xScaling
    .domain([0, xMax])
    .range([0, graphWidth])
    
    // append x axis
    let xAxisGroup = svg.append('g')
        .attr('transform', `translate(0, ${graphHeight})`)
        .call(d3.axisBottom(xScaling).ticks(tickCount))
    addXAxisLabel(xAxisGroup, graphWidth, "Ticks")

    
    const yMax = d3.max(data, row => Math.max(...row))
    print(`max y is ${yMax}`)
    
    // create y axis aka milliseconds
    // const yScaling = d3.scaleLinear()
    yScaling
        .domain([0, yMax])
        .range([graphHeight, 0])

    let yAxisGroup = svg.append('g')
        .call(d3.axisLeft(yScaling));
    addYAxisLabel(yAxisGroup, graphHeight, "Milliseconds")

    
    const lineGenerator = d3.line()
    .x(function(d, index) { 
        return xScaling(index)})
    .y(function(d) { 
        return yScaling(d[0])})

    // const tooltip = d3.select('body')
    // .append('div')
    // .attr('class', 'tooltip');

    // let circleTooltip = createCircleTooltip();

    // const listenerRectangle = svg.append('rect')
    // .attr('width', width)
    // .attr('height', height);

    svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 1.5)
        .attr('d', lineGenerator)
}

function getSortedColumnNames(data) {
     // get the column names by getting keys stored in first row of data
     let columns = Object.keys(data[0]);

     // sort by numerical order
     // sorting strings like: "num objects 729"
     columns.sort(function(first, second){
        //  print(`first is ${first}`)
        //  print(`second is ${second}`)
 
         // match() returns an array containing, the string, the index, the input, and the length of the matches found. We only need index 0.
 
         var firstCounter = +first.match(/\d+/)[0];
         var secondCounter = +second.match(/\d+/)[0];
         return firstCounter - secondCounter;
     });
 
     print(`columns are ${columns}`)
     
     sortedColumns = columns
 
     print(`sorted columns are ${sortedColumns}`)
}

// default_physics_timer_recordings_cubes.csv
d3.csv('default_physics_timer_recordings_cubes.csv')
.then(data => {
    getSortedColumnNames(data);

        // print(`data length ${data.length}`)
        // print(`sorted columns before loop ${sortedColumns}`)
         for (var i = 0; i < data.length; i++) {
            const oldRow = data[i];
            // print('old row is')
            // print(oldRow)
            let newRow = []
            sortedColumns.forEach(col => {
                // print(typeof col)
                 newRow.push(+oldRow[col]);
            });

            data[i] = newRow;
            // print(`new row is`)
            // print(newRow)
            // print(`data[i] is: ${data[i]}`)
         }
        
         currentData = data;
         render(data);
  });
