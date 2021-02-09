let S;
let t=0;
let dt=0.1;

let staticStartEnd = false;
let gridSize = 1.1;
let wallPercentage = .25
let cols = 100;
let canvasSize = 800;
let rows = cols;
let w, h;

let nosolution = false;
let done = false;
let start;
let end;
let openSet = [];
let closedSet = [];
let path = [];

let grid = new Array(cols);
let custom = [
    // ["","","","","","","","","","","",],
    // ["","","","|","X","","","","","","",],
    // ["","","","|","|","|","|","|","","","",],
    // ["","","","","","","","","","","",],
    // ["","","","","","","","O","","","",],
    // ["","","","","","","","","","","",],
]

function Spot(i,j,wall){
    this.i = i;
    this.j = j;
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.parent = undefined;
    this.neighbors = [];

    if(wall!==undefined){
        this.wall = wall;
    }else{
        this.wall = false;

        if(random(1) < wallPercentage){
            this.wall = true;
        }
    }
    

    this.show = function(col){
        fill(col);
        // stroke(0)
        noStroke()

        if(this.wall){
            fill(color("#2f2f2f"));
        }
        rect(this.i * w / gridSize, this.j * h / gridSize, w / gridSize, h / gridSize);
    }

    this.addNeighbors = function(grid){
        let i = this.i;
        let j = this.j;

        if(i < cols - 1){
            this.neighbors.push(grid[i+1][j]);
        }

        if(i > 0){
            this.neighbors.push(grid[i-1][j]);
        }

        if(j < rows -1){
            this.neighbors.push(grid[i][j+1]);
        }

        if(j > 0){
            this.neighbors.push(grid[i][j-1]);
        }

        // Diagonals
        if(i>0 && j > 0){
            try {
                if(!grid[i-1][j].wall && !grid[i][j-1].wall){
                    this.neighbors.push(grid[i-1][j-1]); // up left
                }
            } catch (error) {
                
            }
           
        }

        if(i < cols-1 && j>0){
            try {
                if(!grid[i][j-1].wall && !grid[i+1][j].wall){
                    this.neighbors.push(grid[i+1][j-1]); // up right
                }
            } catch (error) {
                
            }
        }

        if(i > 0 && j < rows - 1){
            try {
                if(!grid[i-1][j].wall && !grid[i][j+1].wall){
                    this.neighbors.push(grid[i-1][j+1]); // down left
    
                }
            } catch (error) {
            }
           
        }

        if(i < cols - 1 && j < rows -1 ){
            try {
                if(!grid[i+1][j].wall && !grid[i][j+1].wall){
                    this.neighbors.push(grid[i+1][j+1]); // down right
                }
            } catch (error) {
                
            }
        }

    }
}

function setup() {
    S=1;
    createCanvas(canvasSize, canvasSize);

    w = width / cols;
    h = height / rows;

    if(custom.length > 0){
        customGrid();
    }else{
        randomGrid();
    }

    for(let i =0;i< cols;i++){
        for(let j =0;j< rows;j++){
            grid[i][j].addNeighbors(grid)
        }
    }

    let location;
    if(staticStartEnd){
        location = {
            start: {
                x: 0,
                y: 0
            },
            end: {
                x: cols-1,
                y: rows-1
            }
        }
    }else{
        location = {
            start: {
                x: Math.round(random(cols)),
                y: Math.round(random(rows))
            },
            end:{
                x: Math.round(random(cols)),
                y: Math.round(random(rows))
            }
        }
    
        if(location.end.x >= cols){
            location.end.x -= 1;
        }
    
        if(location.end.y >= cols){
            location.end.y -= 1;
        }
    
        if(location.start.y >= cols){
            location.start.y -= 1;
        }
    
        if(location.start.x >= cols){
            location.start.x -= 1;
        }
    }
   

    try {
        start = grid[location.start.x][location.start.y];
        end = grid[location.end.x][location.end.y];
        start.wall = false;
        end.wall = false;
    } catch (error) {
        console.log('test')
    }

    openSet.push(start);
}

function customGrid(){
    for(let i =0;i< custom.length;i++){
        grid[i] = new Array(rows)
    }

    for(let i=0;i<custom.length;i++){
        let g = custom[i];
        for(let j=0;j<custom[i].length;j++){
            let isWall = false;
            if(g[j] === "|"){
                isWall = true;
            }

            grid[i][j] = new Spot(i,j, isWall)

        }
    }

    cols = custom.length;
    rows = custom[0].length;
}

function randomGrid(){
    for(let i =0;i< cols;i++){
        grid[i] = new Array(rows)
    }

    for(let i =0;i< cols;i++){
        for(let j =0;j< rows;j++){
            grid[i][j] = new Spot(i,j);
        }
    }

    
}
  
function draw() {
    let current;
    if(openSet.length > 0){
        // keep searching
        let lowestIndex = 0;
        for(let i = 0;i<openSet.length;i++){
            if(openSet[i].f < openSet[lowestIndex].f){
                lowestIndex = i;
            }
        }

        current = openSet[lowestIndex]

        if(current === end){
            console.log("DONE!");
            S = 0
            done = true;
            noLoop();
        }

        removeFromArray(openSet, current)
        closedSet.push(current);

        let neighbors = current.neighbors;

        for(let i =0; i< neighbors.length;i++){
            let neighbor = neighbors[i];

            try {
                if(!closedSet.includes(neighbor) && !neighbor.wall){
                    let tempG = current.g + 1;
    
                    let newPath = false;
                    if(openSet.includes(neighbor)){
                        if(tempG < neighbor.g){
                            neighbor.g = tempG;
                            newPath = true;
                        }
                    }else{
                        neighbor.g = tempG;
                        newPath = true;
                        openSet.push(neighbor);
                    }
    
                    if(newPath){
                        neighbor.h = heuristic(neighbor, end);
                        neighbor.f = neighbor.g + neighbor.h;
                        neighbor.parent = current;
                    }
                }
            } catch (error) {
                console.log("error", error)
            }
            

        }
    }else{
        nosolution = true;
    }

    background(color("#e8e8e8"));

    for(let i = 0; i< cols; i++){
        for(let j = 0; j<rows; j++){
            grid[i][j].show(color("#fff"));
        }
    }

    for(let i = 0; i< closedSet.length; i++){
       closedSet[i].show(color("#fffdc9"));
    }

    for(let i = 0; i< openSet.length; i++){
        openSet[i].show(color("#95ff6a"));
     }

    end.show(color("#ffaeae"));
    start.show(color("#aedaff"))


     if(!nosolution){
        path = [];
        let temp = current;
        path.push(temp);
        while(temp.parent){
            path.push(temp.parent);
            temp = temp.parent;
        }
     }
     

    //  for(let i = 0; i< path.length; i++){
    //    path[i].show(color("blue"))
    //  }

    if(done || nosolution){
        textSize(20)
        fill(color("#000"))
        text(nosolution?"No solution":"Found shortest path",10 ,canvasSize - 20);
        noLoop();
       // return;
    }


    if (S===1){
        t=t+dt;
    }
    textSize(20)
    fill(color("#000"))
    text(t.toFixed(2),canvasSize / 2,canvasSize - 20);

    noFill();
    stroke(255, 0, 200);
    strokeWeight(w/5)

  


     beginShape();
     for(let i =0;i<path.length;i++){
         vertex((path[i].i * w + w/2) / gridSize, (path[i].j * h + h/2) / gridSize);
     }
     endShape();






    
}

function heuristic(a,b){
    //dist is P5 function
    // return dist(a.i, a.j, b.i, b.j); // slower
    return abs(a.i-b.i) + abs(a.j-b.j); // faster
}

function removeFromArray(arr, elm){
    for(let i = arr.length-1; i>=0;i--){
        if(arr[i] == elm){
            arr.splice(i,1);
        }
    }
}