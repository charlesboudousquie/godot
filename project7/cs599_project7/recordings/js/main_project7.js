const margins ={
    top: 30, right: 30, bottom: 30, left: 40
};

const width = 900;
const height = 600;

const graphWidth = width - margins.right - margins.left;
const graphHeight = height - margins.top - margins.bottom;

function print(message){
    console.log(message);
}

let sortedColumns = []

// Add svg anchor to page
var svg = d3.select("#chart-container")
    .append('svg')
        .attr('width', width)
        .attr('height', height)
    .append('g')
        .attr('transform', `translate(${margins.left}, ${margins.top})`);

function render(data) {

    // for now maximum is for one column
    print(data)
    print(data[0])

    print(`graph height ${graphHeight}`)
    print(`graph width ${graphWidth}`)
    
    const xMax = data.length;
    print(`max x is ${xMax}`)
    
    // create x axis aka ticks
    const xScaling = d3.scaleLinear()
    .domain([0, xMax])
    .range([0, graphWidth])
    
    // append x axis
    svg.append('g')
        .attr('transform', `translate(0, ${graphHeight})`)
        .call(d3.axisBottom(xScaling).ticks(40))

    
    const yMax = d3.max(data, row => Math.max(...row))
    print(`max y is ${yMax}`)
    
    // create y axis aka milliseconds
    const yScaling = d3.scaleLinear()
        .domain([0, yMax])
        .range([graphHeight, 0])

    svg.append('g')
        .call(d3.axisLeft(yScaling));

    
    const lineGenerator = d3.line()
    .x(function(d, index) { 
        // print(`for x, d[0] is ${d[0]}`)
        return xScaling(index)})
    .y(function(d) { 
        // print(`for y, d[0] is ${d[0]}`)
        return yScaling(d[0])})

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
        
         render(data);

  });
