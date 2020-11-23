/* eslint-disable no-undef, no-unused-vars */

// homework 3
// Laurie Van Bogaert
// First select points to form a polygon
// then press "Find an ear" to find a ear in the polygon
// To triangulate the polygon either press the button "Find an ear" multiple time
// or the button "Triangulate" to triangulate the polygon in one time.
// press reset to choose a new polygon

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.isSelected = false;
  }
  clone() {
    return new Point(this.x, this.y);
  }
}
class Triangle {
  constructor(pt1, pt2, pt3) {
    this.pt1 = pt1;
    this.pt2 = pt2;
    this.pt3 = pt3;
  }
}
class Edge {
  constructor(pt1, pt2) {
    this.start = pt1;
    this.end = pt2;
  }
  intersect(edge2) {
    //return true if this edgede and edge2 intersect
    let a1 = orientation(this.start, this.end, edge2.start);
    let a2 = orientation(this.start, this.end, edge2.end);
    if (a1 !== ALIGNED && a2 !== ALIGNED && a1 !== a2) {
      let b1 = orientation(edge2.start, edge2.end, this.start);
      let b2 = orientation(edge2.start, edge2.end, this.end);
      if (b1 !== ALIGNED && b2 !== ALIGNED && b1 !== b2) {
        return true;
      }
    }
    return false;
  }
}
class Polygon {
  constructor() {
    this.vertices = [];
    this.edges = [];
  }
  addNewVertice(pt) {
    var ok = true;
    if (this.vertices.length > 0) {
      if (
        this.vertices[this.vertices.length - 1].x === pt.x &&
        this.vertices[this.vertices.length - 1].y === pt.y
      ) {
        ok = false;
      }
      if (this.vertices.length > 1) {
        if (
          this.vertices[this.vertices.length - 2].x === pt.x &&
          this.vertices[this.vertices.length - 2].y === pt.y
        ) {
          ok = false;
        }
        if (
          determinant(
            this.vertices[this.vertices.length - 2],
            this.vertices[this.vertices.length - 1],
            pt
          ) === 0
        ) {
          ok = false;
        }
      }
    }
    if (this.vertices.length > 0 && ok) {
      this.addEdge(this.vertices[this.vertices.length - 1], pt);
    }
    if (ok) {
      this.vertices.push(pt);
    }
    //console.log(this.vertices.length);
  }
  addEdge(pt1, pt2) {
    //this.edges.push([pt1, pt2]);
    this.edges.push(new Edge(pt1, pt2));
  }
  draw() {
    //console.log("a");
    for (let i = 0; i < this.vertices.length; i++) {
      //console.log("a");
      if (this.vertices[i].isSelected) {
        fill("orange");
      } else {
        fill("green");
      }

      ellipse(this.vertices[i].x, this.vertices[i].y, pointSize, pointSize);
      text(str(i), this.vertices[i].x, this.vertices[i].y);
    }
    for (let i = 0; i < this.edges.length; i++) {
      line(
        this.edges[i].start.x,
        this.edges[i].start.y,
        this.edges[i].end.x,
        this.edges[i].end.y
      );
    }
  }
  clone() {
    //make a clone of the polygon
    var poly = new Polygon();
    for (let i = 0; i < this.vertices.length; i++) {
      poly.addNewVertice(this.vertices[i].clone());
    }
    poly.addEdge(poly.vertices[0], poly.vertices[poly.vertices.length - 1]);
    return poly;
  }
  checkSelfIntersect() {
    for (let i = 0; i < this.edges.length; i++) {
      for (let j = 0; j < this.edges.length; j++) {
        if (i !== j) {
          let check = this.edges[i].intersect(this.edges[j]);
          if (check) {
            return true;
          }
        }
      }
    }
    return false;
  }
}

/*
function findMinX() {
  var minPt = points[0];
  for (i = 0; i < points.length; i++) {
    if (points[i].x < minPt.x) {
      minPt = points[i];
      minXPtId = i;
    }
  }
  return minPt;
}
*/

//var points = []; //list of pts
//var pointsOk = []; //list of already processed pts
//var triangles = []; //list of triangles
var noClick = false;
var selectedPoint = null;
//var computeTri = false;
//var minXPt = null;
//var minXPtId = null;
//some constants
const LEFT = "LEFT";
const ALIGNED = "ALIGNED";
const RIGHT = "RIGHT";

const INSIDE = "INSIDE";
const OUTSIDE = "OUTSIDE";

var poly1 = new Polygon();
var poly2;
var errorMessage = "";
var phase = 0;
var pointSize = 10;

function setup() {
  //create the buttons
  createCanvas(windowWidth, windowHeight);
  //create a reset button to reset the selection
  button = createButton("Reset");
  button.position(30, 75);
  button.mousePressed(reset);
  button2 = createButton("Next");
  button2.position(30, 95);
  button2.mousePressed(next);
  //button3 = createButton("Triangulate");
  //button3.position(30, 115);
  //button3.mousePressed(triangulate);
  fill("black");
  textSize(40);
}

function next() {
  noClick = true;
  if (phase === 0 && poly1.vertices.length > 2) {
    //TODO some check
    poly1.addEdge(poly1.vertices[0], poly1.vertices[poly1.vertices.length - 1]);
    let check = poly1.checkSelfIntersect();
    if (check) {
      errorMessage = "The polygon must be a simple polygon. Please reset.";
    } else {
      //no intersection
      errorMessage = "";
      poly2 = poly1.clone();
      phase += 1;
    }
  } else if (phase === 1) {
    let check = poly2.checkSelfIntersect();
    if (check) {
      errorMessage = "The polygon 2 must be a simple polygon.";
    } else {
      errorMessage = "";
      phase += 1;
    }
  }
}
function reset() {
  //clear the arrays for the reset
  noClick = true;
  phase = 0;
  poly1.vertices.length = 0;
  poly1.edges.length = 0;
  errorMessage = "";
  //var poly1 = new Polygon();
}

function getText() {
  if (phase === 0) {
    return (
      "Please click to build the polygon 1 ( " +
      poly1.vertices.length +
      " point(s) selected)"
    );
  } else if (phase === 1) {
    return "Drag and drop points to build the polygon 2 ";
  } else {
    return "TODO";
  }
}
function draw() {
  //draw the polygons, points, ...
  background(200);
  stroke("black");
  fill("black");
  textSize(18);

  text(getText(), 30, 20);
  stroke("red");
  fill("red");
  text(errorMessage, 30, 50);
  stroke("black");
  fill("black");
  if (phase === 0) {
    poly1.draw();
  } else if (phase === 1) {
    poly2.draw();
  } else if (phase === 2) {
    poly1.draw();
  }

  /*
  if (computeTri) {
    text('press "Find an ear" to find a ear in the polygon', 30, 20);
    text(
      'To triangulate the polygon either press the button "Find an ear" multiple time',
      30,
      40
    );
    text('or the button "Triangulate" one time.', 30, 60);
  } else {
    text(
      "Please click to select the polygon ( " +
        points.length +
        " point(s) selected)",
      30,
      50
    );
  }*/

  /*
  for (i = 0; i < points.length; i++) {
    if (points[i] === minXPt) {
      fill("orange"); //get color
    } else {
      fill("green"); //get color
    }
    ellipse(points[i].x, points[i].y, 10, 10);
    text(str(i), points[i].x, points[i].y);
    //trace the line for the triangle
    if (i < points.length - 1) {
      line(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y); //trace lines
    }
    if (i === points.length - 1) {
      line(
        points[0].x,
        points[0].y,
        points[points.length - 1].x,
        points[points.length - 1].y
      ); //trace lines
    }
  }
  fill("black");
  stroke("red");
  for (i in triangles) {
    var tri = triangles[i];
    line(tri.pt1.x, tri.pt1.y, tri.pt2.x, tri.pt2.y); //trace lines
    line(tri.pt3.x, tri.pt3.y, tri.pt2.x, tri.pt2.y); //trace lines
    line(tri.pt1.x, tri.pt1.y, tri.pt3.x, tri.pt3.y); //trace lines
  }
  for (i in pointsOk) {
    fill("grey");
    ellipse(pointsOk[i].x, pointsOk[i].y, 10, 10);
  }
  */
}
/*
function triangulate() {
  //call findAnEar multiple time until the polygon is triangulated
  while (points.length > 0) {
    findAnEar();
  }
}
function findAnEar() {
  //find an ear, create a triangle and remove the point from the list of points
  if (!computeTri) {
    checkLeftTurn();
  }
  computeTri = true;
  for (i = 0; i < points.length; i++) {
    var central = points[i];
    var previous = getPt(i - 1, points);
    var next = getPt(i + 1, points);
    var testOk = checkEar(i);
    if (testOk) {
      triangles.push(new Triangle(previous, central, next));
      pointsOk.push(central);
      points.splice(i, 1);
      console.log(points.length);
      if (points.length === 3) {
        triangles.push(new Triangle(points[0], points[1], points[2]));
        pointsOk.push(points[0]);
        pointsOk.push(points[1]);
        pointsOk.push(points[2]);
        points.length = 0;
        console.log("last Triangle");
      }
      break;
    }
  }
}
function checkEar(n) {
  //check if the point at position n is an ear
  var previous = getPt(n - 1, points);
  var next = getPt(n + 1, points);
  var central = points[n];
  var earOrient = orientation(previous, next, central);
  if (earOrient === LEFT) {
    console.log("bad orient");
    return false;
  }
  for (j = 0; j < points.length; j++) {
    if (
      j !== getCorrectedId(n - 1, points) &&
      j !== getCorrectedId(n + 1, points) &&
      j !== n
    ) {
      console.log("j: " + str(j) + " n: " + str(n));
      //var test = orientation(previous, next, points[j]);
      var test = testInside(previous, central, next, points[j]);
      if (test === INSIDE) {
        return false;
      }
    }
  }
  return true;
}
function testInside(one, two, three, four) {
  //the point will be inside if the orientation determinant are all left or right
  var first = determinant(one, two, four);
  var second = determinant(two, three, four);
  var third = determinant(three, one, four);
  if (first * second >= 0 && second * third >= 0 && third * first >= 0) {
    return INSIDE;
  } else {
    return OUTSIDE;
  }
}
function getCorrectedId(id, liste) {
  //get corrected id for the list (it cannot be smaller than 0 or larger than the list size)
  var len = liste.length;
  if (id < 0) {
    return len + id;
  } else if (id >= len) {
    return id - len;
  } else {
    return id;
  }
}
function getPt(id, liste) {
  //get corrected pt for the list (the indice cannot be smaller than 0 or larger than the list size)
  var len = liste.length;
  if (id < 0) {
    return liste[len + id];
  } else if (id >= len) {
    return liste[id - len];
  } else {
    return liste[id];
  }
}
*/
function orientation(a, b, c) {
  //return the orientation of the 3 points (left, aligned or right)
  var det = determinant(a, b, c);
  if (det > 0) {
    return RIGHT;
  } else if (det === 0) {
    return ALIGNED;
  } else {
    return LEFT;
  }
}
/*

function checkLeftTurn() {
  //check if the polygon follow right turn convention or left turn
  //if it is right turn, the list is reversed to get a left turn
  var leftMin = getPt(minXPtId - 1, points);
  var rightMin = getPt(minXPtId + 1, points);
  //left-most point is always convex.
  var orient = orientation(leftMin, minXPt, rightMin);
  if (orient === RIGHT) {
    points.reverse();
  }
}
*/
function determinant(a, b, c) {
  //calculate the orientation determinant
  det = b.x * c.y - a.x * c.y + a.x * b.y - b.y * c.x + a.y * c.x - a.y * b.x;
  return det;
}

// This Redraws the Canvas when resized
windowResized = function () {
  resizeCanvas(windowWidth, windowHeight);
};

function selectPoint(x, y) {
  for (let i = 0; i < poly2.vertices.length; i++) {
    if (
      abs(poly2.vertices[i].x - x) <= pointSize &&
      abs(poly2.vertices[i].y - y) <= pointSize
    ) {
      poly2.vertices[i].isSelected = true;
      selectedPoint = poly2.vertices[i];
      break;
    }
  }
}
function mouseReleased() {
  if (!noClick && selectPoint !== null) {
    selectedPoint.isSelected = false;
    selectedPoint.x = mouseX;
    selectedPoint.y = mouseY;
    selectedPoint = null;
  }
}
function mousePressed() {
  //deal with click of the mouse
  if (noClick) {
    noClick = false;
  } else {
    if (phase === 0) {
      poly1.addNewVertice(new Point(mouseX, mouseY));
    } else if (phase === 1) {
      selectPoint(mouseX, mouseY);
    }
    //points.push(new Point(mouseX, mouseY));
    //minXPt = findMinX();
  }
}
