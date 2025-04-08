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

// Add svg anchor to page
var svg = d3.select("#my_dataviz")
    .append('svg')
        .attr('width', graphWidth)
        .attr('height', graphHeight)
    .append('g')
        .attr('transform', `translate(margins.top, margins.left)`);

// default_physics_timer_recordings_cubes.csv
d3.csv('default_physics_timer_recordings_cubes.csv')