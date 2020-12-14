/* eslint-disable no-undef, no-unused-vars */

// Project
// Laurie Van Bogaert
// Compatible triangulations of simple polygons

class Point {
  constructor(x, y) {
    // class to represent a point
    this.x = x;
    this.y = y;
    this.id = null;
    this.polyId = null;
    this.isSelected = false;
  }
  clone() {
    //methode to duplicate points
    let clo = new Point(this.x, this.y);
    clo.polyId = this.polyId;
    clo.id = this.id;
    return clo;
  }
}
class Triangle {
  //Class to represent a triangle that will be part of a triangulation
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
    //method to duplicate a triangle
    let a = this.pt1.clone();
    let b = this.pt2.clone();
    let c = this.pt3.clone();
    return new Triangle(a, b, c);
  }
  IsLeftTurn() {
    //Check if the triangle is left turn or not
    let ori = orientation(this.pt1, this.pt2, this.pt3);
    return ori === RIGHT ? false : true;
  }
  contain(pt) {
    //return true if a point is inside a triangle
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
    //return true if a pt of the list is inside the triangle
    for (let i = 0; i < ptList.length; i++) {
      let res = this.contain(ptList[i]);
      if (res) {
        return true;
      }
    }
    return false;
  }
}
class Edge {
  //class that represent an edge
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
    //method to duplicate an edge
    let clo = new Edge(this.start.clone(), this.end.clone());
    return clo;
  }
}
class Polygon {
  //class that represent a polygon
  constructor() {
    this.vertices = [];
    this.edges = [];
  }
  addNewVertice(pt) {
    //method to add a vertice into the polygon (and add edges with the last inserted vertices)
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
  }
  addEdge(pt1, pt2) {
    //method to add an edge
    this.edges.push(new Edge(pt1, pt2));
  }
  draw() {
    //method to draw the polygon
    for (let i = 0; i < this.vertices.length; i++) {
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
    }

    return clo;
  }
  checkSelfIntersect() {
    //check that there is no intersections between the edges
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
    //check that the edge e does not intersect any edge of this polygon
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
    //find the vertex with the minimum x coordinate
    let minPt = this.vertices[0];
    let minXPtId = 0;
    for (let i = 0; i < this.vertices.length; i++) {
      if (this.vertices[i].x < minPt.x) {
        minPt = this.vertices[i];
        minXPtId = i;
      }
    }
    return minXPtId;
  }
  remove(tri) {
    //remove the triangle tri from the polygon
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

      if (id === -1) {
        this.edges.push(
          new Edge(
            this.vertices[tri.edges[i].end.id],
            this.vertices[tri.edges[i].start.id]
          )
        );
      } else {
        this.edges.splice(id, 1);
      }
    }
    this.checkPoints([tri.pt1, tri.pt2, tri.pt3]);
  }
  checkPoints(points) {
    //check that there is no unused vertex in the list points. If one is found it is removed.
    for (let i = 0; i < points.length; i++) {
      let found = false;
      for (let j = 0; j < this.edges.length; j++) {
        if (
          (points[i].x === this.edges[j].start.x &&
            points[i].y === this.edges[j].start.y) ||
          (points[i].x === this.edges[j].end.x &&
            points[i].y === this.edges[j].end.y)
        ) {
          found = true;
          break;
        }
      }
      if (!found) {
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
    //update id attribute of the vertices
    for (let i = 0; i < this.vertices.length; i++) {
      this.vertices[i].id = i;
    }
  }
  shiftVertices() {
    //the ith vertice become i+1th and the nth vertex becamo vertex 0.
    let nVert = this.vertices.pop();
    this.vertices.unshift(nVert);
    this.identifyVertices();
  }
}
function findCompatibleTriangulation(triangles, poly) {
  //recursive algorithm to find a compatible triangulation
  let ab = poly.edges[0];
  if (triangles.length > poly1.edges) {
    return null;
  }
  for (let i = 0; i < poly.vertices.length; i++) {
    let c = poly.vertices[i];

    if (c !== ab.start && c !== ab.end) {
      let abc = new Triangle(ab.start, ab.end, c);
      let abc2 = new Triangle(
        poly2.vertices[ab.start.polyId],
        poly2.vertices[ab.end.polyId],
        poly2.vertices[c.polyId]
      );

      if (abc.IsLeftTurn() && abc2.IsLeftTurn()) {
        let interac0 = poly.checkIntersection(new Edge(ab.start, c));
        let interbc0 = poly.checkIntersection(new Edge(ab.end, c));
        //let interac1 = poly1.checkIntersection(new Edge(ab.start, c));
        //let interbc1 = poly1.checkIntersection(new Edge(ab.end, c));
        //let interac2 = poly2.checkIntersection(new Edge(abc2.pt1, abc2.pt3));
        //blet interbc2 = poly2.checkIntersection(new Edge(abc2.pt2, abc2.pt3));
        let interac02 = checkInterBoundariesPoly2(new Edge(abc2.pt1, abc2.pt3),poly);
        let interbc02 = checkInterBoundariesPoly2(new Edge(abc2.pt2, abc2.pt3),poly);
        let inside = abc.containOneOf(poly1.vertices);
        let inside2 = abc2.containOneOf(poly2.vertices);

        if (
          //!interac1 &&
          //!interbc1 &&
          !inside &&
          !inside2 &&
          !interac0 &&
          !interbc0 &&
          //!interac2 &&
          //!interbc2 &&
          !interac02 &&
          !interbc02
        ) {
          let newTriangles = copyList(triangles);
          newTriangles.push(abc);

          let newPoly = poly.clone();

          newPoly.remove(abc);

          if (newPoly.vertices.length !== 0) {
            newTriangles = findCompatibleTriangulation(newTriangles, newPoly);
            if (newTriangles !== null) {
              return newTriangles;
            }
          } else {
            console.log("done");
            polyCheck = newPoly;
            return newTriangles;
          }
        }
      }
    }
  }
  return null;
}


function checkInterBoundariesPoly2(e,poly) {
  //check that the edge e does not intersect any edge of the poly algorithm transposed to the second polygon
  for (let j = 0; j < poly.edges.length; j++) {
    let eP2 = new Edge(poly2.vertices[poly.edges[j].start.polyId],poly2.vertices[poly.edges[j].end.polyId])
    let check = e.intersect(eP2);
    if (check) {
      return true;
    }
  }
  return false;
}

function copyList(li) {
  let newLi = [];
  for (let i = 0; i < li.length; i++) {
    newLi.push(li[i].clone());
  }
  return newLi;
}

//global variables and constants
var noClick = false;
var selectedPoint = null;

const LEFT = "LEFT";
const ALIGNED = "ALIGNED";
const RIGHT = "RIGHT";

const INSIDE = "INSIDE";
const OUTSIDE = "OUTSIDE";

var poly1 = new Polygon();
var poly2;
var time = 0;
var polyCheck = null;
var liTri = [];
var liCol = null;
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
  fill("black");
  textSize(40);
}

function next() {
  //change of the state of the program
  noClick = true;
  if (phase === 0 && poly1.vertices.length > 2) {
    poly1.addEdge(poly1.vertices[poly1.vertices.length - 1], poly1.vertices[0]);
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
    poly2.identifyVertices();
  }
  if (phase === 2) {
    if (polyCheck === null) {
      polyCheck = poly1.clone();
    }
    errorMessage = "";
    for (let i = 0; i < poly1.vertices.length - 1; i++) {
      liTri = findCompatibleTriangulation(liTri, polyCheck);
      if (liTri === null && i < poly1.vertices.length - 2) {
        polyCheck = poly1.clone();
        poly2.shiftVertices();
        liTri = [];
      } else {
        break;
      }
    }
    //liTri = findCompatibleTriangulation(liTri, polyCheck);
    //console.log(polyCheck.edges.length);
    if (liTri === null) {
      console.log("Echec");
      errorMessage = "Compatible triangulation not found. Please reset";
    } else if (polyCheck.edges.length === 0) {
      liCol = createColorList(liTri);
      phase += 1;
    }
  }
}
function reset() {
  //clear the arrays for the reset
  noClick = true;
  polyCheck = null;
  phase = 0;
  time = 0;
  poly1.vertices.length = 0;
  poly1.edges.length = 0;
  liTri = [];
  liCol = null;
  errorMessage = "";
}

function createColorList(li) {
  let colLi = [];
  for (let l = 0; l < li.length; l++) {
    let col = [
      Math.round(255 * Math.random()),
      Math.round(255 * Math.random()),
      Math.round(255 * Math.random())
    ];
    colLi.push(col);
  }
  return colLi;
}

function getText() {
  //get the text that correspond to the state
  if (phase === 0) {
    return (
      "Please click to build the polygon 1 ( " +
      poly1.vertices.length +
      " point(s) selected)"
    );
  } else if (phase === 1) {
    return "Drag and drop points to build the polygon 2 ";
  } else if (phase === 2) {
    return "The compatible triangulatrion is being computed";
  } else if (phase === 3) {
    return "Resulting animation";
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
  } else if (phase === 2 && liTri !== null) {
    //polyCheck.draw();
    stroke("red");
    for (let i = 0; i < liTri.length; i++) {
      line(liTri[i].pt1.x, liTri[i].pt1.y, liTri[i].pt2.x, liTri[i].pt2.y);
      line(liTri[i].pt2.x, liTri[i].pt2.y, liTri[i].pt3.x, liTri[i].pt3.y);
      line(liTri[i].pt3.x, liTri[i].pt3.y, liTri[i].pt1.x, liTri[i].pt1.y);
    }
    stroke("black");
    polyCheck.draw();
  } else if (phase === 3) {
    animation();
  }
}

function animation() {
  //draw the animation for the last state
  time += 1;
  let epsi = 0.5 * (sin(0.02 * time) + 1);

  stroke("red");
  for (let i = 0; i < liTri.length; i++) {
    let x1 =
      epsi * liTri[i].pt1.x +
      (1 - epsi) * poly2.vertices[liTri[i].pt1.polyId].x;
    let x2 =
      epsi * liTri[i].pt2.x +
      (1 - epsi) * poly2.vertices[liTri[i].pt2.polyId].x;
    let x3 =
      epsi * liTri[i].pt3.x +
      (1 - epsi) * poly2.vertices[liTri[i].pt3.polyId].x;
    let y1 =
      epsi * liTri[i].pt1.y +
      (1 - epsi) * poly2.vertices[liTri[i].pt1.polyId].y;
    let y2 =
      epsi * liTri[i].pt2.y +
      (1 - epsi) * poly2.vertices[liTri[i].pt2.polyId].y;
    let y3 =
      epsi * liTri[i].pt3.y +
      (1 - epsi) * poly2.vertices[liTri[i].pt3.polyId].y;
    fill(liCol[i]);
    triangle(x1, y1, x2, y2, x3, y3);
    line(x1, y1, x2, y2);
    line(x2, y2, x3, y3);
    line(x3, y3, x1, y1);
  }
  fill("green");
  stroke("black");
  for (let i = 0; i < poly1.vertices.length; i++) {
    let x = epsi * poly1.vertices[i].x + (1 - epsi) * poly2.vertices[i].x;
    let y = epsi * poly1.vertices[i].y + (1 - epsi) * poly2.vertices[i].y;
    ellipse(x, y, pointSize, pointSize);
    text(str(i), x, y);
  }
  for (let i = 0; i < poly1.edges.length; i++) {
    let poly2pt1Id = poly1.edges[i].start.polyId;
    let poly2pt2Id = poly1.edges[i].end.polyId;
    let x1 =
      epsi * poly1.edges[i].start.x + (1 - epsi) * poly2.vertices[poly2pt1Id].x;
    let y1 =
      epsi * poly1.edges[i].start.y + (1 - epsi) * poly2.vertices[poly2pt1Id].y;
    let x2 =
      epsi * poly1.edges[i].end.x + (1 - epsi) * poly2.vertices[poly2pt2Id].x;
    let y2 =
      epsi * poly1.edges[i].end.y + (1 - epsi) * poly2.vertices[poly2pt2Id].y;
    line(x1, y1, x2, y2);
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
  //function to find which point is selected
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
  //function to call when mouse is released
  if (!noClick && selectedPoint !== null) {
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
  }
}
