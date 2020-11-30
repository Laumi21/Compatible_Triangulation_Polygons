/* eslint-disable no-undef, no-unused-vars */

// Project
// Laurie Van Bogaert
//

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.id = null;
    this.polyId = null;
    //this.poly2Id = null;
    this.isSelected = false;
  }
  clone() {
    let clo = new Point(this.x, this.y);
    clo.polyId = this.polyId;
    clo.id = this.id;
    return clo;
  }
}
class Triangle {
  constructor(pt1, pt2, pt3) {
    this.pt1 = pt1;
    this.pt2 = pt2;
    this.pt3 = pt3;
    this.edges = [];
    this.edges.push(new Edge(pt1, pt2));
    this.edges.push(new Edge(pt2, pt3));
    this.edges.push(new Edge(pt3, pt1));
  }
  clone() {
    let a = this.pt1.clone();
    let b = this.pt2.clone();
    let c = this.pt3.clone();
    return new Triangle(a, b, c);
  }
  IsLeftTurn() {
    let ori = orientation(this.pt1, this.pt2, this.pt3);
    //console.log(ori);
    return ori === RIGHT ? false : true;
  }
  contain(pt) {
    let or1 = orientation(this.pt1, this.pt2, pt);
    let or2 = orientation(this.pt2, this.pt3, pt);
    let or3 = orientation(this.pt3, this.pt1, pt);
    if (or1 === LEFT && or2 === LEFT && or3 === LEFT) {
      return true;
    } else {
      return false;
    }
  }
  containOneOf(ptList) {
    console.log("a");
    for (let i = 0; i < ptList.length; i++) {
      let res = this.contain(ptList[i]);
      if (res) {
        return true;
      }
    }
    console.log("nothing");
    return false;
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
  clone() {
    let clo = new Edge(this.start.clone(), this.end.clone());
    return clo;
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
    var clo = new Polygon();
    var vert = copyList(this.vertices);
    clo.vertices = vert;
    clo.edges.length = this.edges.length;
    for (let i = 0; i < this.edges.length; i++) {
      let st = this.edges[i].start.id;
      let en = this.edges[i].end.id;
      clo.edges[i] = new Edge(vert[st], vert[en]);
      //console.log(newE.length);
    }
    //console.log(clo.edges.length);
    //console.log(clo.edges);
    //poly.edges = newE;
    return clo;
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
  checkIntersection(e) {
    for (let j = 0; j < this.edges.length; j++) {
      let check = e.intersect(this.edges[j]);
      if (check) {
        return true;
      }
    }
    return false;
  }
  makeLeftTurn() {
    //check if the polygon follow right turn convention or left turn
    //if it is right turn, the list is reversed to get a left turn

    let id = this.findMinX();
    //console.log("ahhh");
    let leftId = id - 1 < 0 ? this.vertices.length + (id - 1) : id - 1;
    let rightId =
      id + 1 > this.vertices.length - 1
        ? id + 1 - this.vertices.length
        : id + 1;
    //left-most point is always convex.
    var orient = orientation(
      this.vertices[leftId],
      this.vertices[id],
      this.vertices[rightId]
    );
    if (orient === RIGHT) {
      this.vertices.reverse();
      this.edges.reverse();
      for (let j = 0; j < this.edges.length; j++) {
        let temp = this.edges[j].start;
        this.edges[j].start = this.edges[j].end;
        this.edges[j].end = temp;
      }
    }
  }
  findMinX() {
    let minPt = this.vertices[0];
    let minXPtId = 0;
    for (let i = 0; i < this.vertices.length; i++) {
      if (this.vertices[i].x < minPt.x) {
        minPt = this.vertices[i];
        minXPtId = i;
      }
    }
    //console.log("min:" + str(minXPtId));
    return minXPtId;
  }
  remove(tri) {
    for (let i = 0; i < tri.edges.length; i++) {
      let id = -1;
      for (let j = 0; j < this.edges.length; j++) {
        if (
          (this.edges[j].start.x === tri.edges[i].start.x &&
            this.edges[j].end.x === tri.edges[i].end.x &&
            this.edges[j].start.y === tri.edges[i].start.y &&
            this.edges[j].end.y === tri.edges[i].end.y) ||
          (this.edges[j].start.x === tri.edges[i].end.x &&
            this.edges[j].end.x === tri.edges[i].start.x &&
            this.edges[j].start.y === tri.edges[i].end.y &&
            this.edges[j].end.y === tri.edges[i].start.y)
        ) {
          id = j;
          break;
        }
      }
      //console.log("test2");
      if (id === -1) {
        //this.edges.push(tri.edges[i]);
        //invert edge sense
        this.edges.push(new Edge(this.vertices[tri.edges[i].end.id],this.vertices[tri.edges[i].start.id]));
        console.log(tri.edges[i]);
        console.log("add");
      } else {
        this.edges.splice(id, 1);
        //console.log("remove");
        console.log("remove (" + str(this.edges.length) + " left)");
      }
    }
    this.checkPoints([tri.pt1, tri.pt2, tri.pt3]);
  }
  checkPoints(points) {
    for (let i = 0; i < points.length; i++) {
      let found = false;
      for (let j = 0; j < this.edges.length; j++) {
        if (
          (points[i].x === this.edges[j].start.x &&
            points[i].y === this.edges[j].start.y) ||
          (points[i].x === this.edges[j].end.x &&
            points[i].y === this.edges[j].end.y)
        ) {
          console.log("pt found");
          found = true;
          break;
        }
      }
      if (!found) {
        //console.log("must remove");
        let id = -1;
        for (let j = 0; j < this.vertices.length; j++) {
          if (
            points[i].x === this.vertices[j].x &&
            points[i].y === this.vertices[j].y
          ) {
            id = j;
            break;
          }
        }
        if (id !== -1) {
          this.vertices.splice(id, 1);
        }
      }
    }
    this.identifyVertices();
  }
  identifyVertices() {
    for (let i = 0; i < this.vertices.length; i++) {
      this.vertices[i].id = i;
    }
  }
}
function findCompatibleTriangulation(triangles, poly) {
  let ab = poly.edges[0];
  if (triangles.length > poly1.edges) {
    return null;
  }
  for (let i = 0; i < poly.vertices.length; i++) {
    let c = poly.vertices[i];
    console.log("turn: " + str(i));
    if (c !== ab.start && c !== ab.end) {
      let abc = new Triangle(ab.start, ab.end, c);
      //console.log(abc);
      if (abc.IsLeftTurn()) {
        let interac1 = poly1.checkIntersection(new Edge(ab.start, c));
        let interbc1 = poly1.checkIntersection(new Edge(ab.end, c));
        let inside = abc.containOneOf(poly1.vertices);
        //TODO checks for poly2
        if (!interac1 && !interbc1 && !inside) {
          let newTriangles = copyList(triangles);
          newTriangles.push(abc);
          //console.log("zzz");
          console.log("clonage");
          console.log(poly);
          let newPoly = poly.clone();
          console.log(newPoly);
          newPoly.remove(abc);
          //console.log("zzza");
          if (newPoly.vertices.length !== 0) {
            //newTriangles = findCompatibleTriangulation(newTriangles, newPoly);
            if (newTriangles !== null) {
              polyCheck = newPoly;
              return newTriangles;
            }
          } else {
            polyCheck = newPoly;
            return newTriangles;
          }
        }
      }
    }
  }
  return null;
}
function copyList(li) {
  let newLi = [];
  for (let i = 0; i < li.length; i++) {
    newLi.push(li[i].clone());
  }
  return newLi;
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
var polyCheck = null;
var liTri = [];
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
    poly1.addEdge( poly1.vertices[poly1.vertices.length - 1],poly1.vertices[0]);
    let check = poly1.checkSelfIntersect();
    for (let i = 0; i < poly1.vertices.length; i++) {
      poly1.vertices[i].polyId = i;
    }
    poly1.identifyVertices();
    if (check) {
      errorMessage = "The polygon must be a simple polygon. Please reset.";
    } else {
      //no intersection
      errorMessage = "";
      poly1.makeLeftTurn();
      poly2 = poly1.clone();
      phase += 1;
    }
  } else if (phase === 1) {
    let check = poly2.checkSelfIntersect();
    if (check) {
      errorMessage = "The polygon 2 must be a simple polygon.";
    } else {
      errorMessage = "";
      poly2.makeLeftTurn();
      phase += 1;
    }
  }
  if (phase > 1) {
    if (polyCheck === null) {
      polyCheck = poly1.clone();
    }
    errorMessage = "";
    //console.log("neh");
    liTri = findCompatibleTriangulation(liTri, polyCheck);
    console.log("done");
    console.log(liTri);
    console.log(polyCheck);
  }
}
function reset() {
  //clear the arrays for the reset
  noClick = true;
  polyCheck = null;
  phase = 0;
  poly1.vertices.length = 0;
  poly1.edges.length = 0;
  liTri = [];
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
    //polyCheck.draw();
    stroke("red");
    for (let i = 0; i < liTri.length; i++) {
      line(liTri[i].pt1.x, liTri[i].pt1.y, liTri[i].pt2.x, liTri[i].pt2.y);
      line(liTri[i].pt2.x, liTri[i].pt2.y, liTri[i].pt3.x, liTri[i].pt3.y);
      line(liTri[i].pt3.x, liTri[i].pt3.y, liTri[i].pt1.x, liTri[i].pt1.y);
    }
    stroke("black");
    polyCheck.draw();
  }
}

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
