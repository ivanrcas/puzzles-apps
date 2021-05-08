var w, h, g, el, ratio, my = {};

function numberscrollMain(mode) {
  this.version = '0.792';
  this.mode = typeof mode !== 'undefined' ? mode : 'int';



  w = 850;
  h = 230;

  var s = "";
  //s += '<div style="position:relative;">';
  s += '<div style=" background-image: url(fondo.png); position:relative; width:' + w + 'px; min-height:' + h + 'px; border: none; border-radius: 10px; background-color: #bcfdcf; margin:auto; display:block; box-shadow: 1px 3px 12px 4px rgba(0,0,0,0.29);">';
  s += '<canvas id="canvasId" style="position: absolute; width:' + w + 'px; height:' + h + 'px; left: 5px; border: none;"></canvas>';

  //s += '<input id="clearBtn" onclick="clearMarks()" type="button" style="z-index:2; position:absolute; left:5px; bottom:5px;" value="clear"  class="togglebtn" />';

  //s += '<input id="fullBtn" onclick="toggleFullScreen()" type="button" style="z-index:2; position:absolute; left:5px; bottom:5px;" value="full screen"  class="togglebtn" />';

  s += '<button id="reset" style="position: absolute; right:20px; bottom: 11px; color: #000aae; font-size: 14px; user-select: none;" class="togglebtn"  onclick="reset()" >Restaurar Escala</button>';
  //s += '<button id="zoom" style="position: absolute; right:2px; top: 2px; color: #000aae; font-size: 14px; user-select: none;" class="togglebtn"  onclick="toggleZoomIn()" >Zoom In</button>';

  s += '<div id="keycount" style="font: bold 12px Arial; color: black; position:absolute; right:5px; bottom:3px;"></div>';

  s += '<div id="copyrt" style="font: 10px Arial; color: #6600cc; position:absolute; left:5px; bottom:3px;"></div>';
  s += '</div>';

  document.write(s);

  el = document.getElementById('canvasId');
  //el.style.border = "1px solid black";
  ratio = 2;
  el.width = w * ratio;
  el.height = h * ratio;
  el.style.width = w + "px";
  el.style.height = h + "px";
  g = el.getContext("2d");
  g.setTransform(ratio, 0, 0, ratio, 0, 0);
  g.shadowColor = '#999';
  g.shadowBlur = 60;
  g.shadowOffsetX = 15;
  g.shadowOffsetY = 15;


  this.zoomInQ = true;
  my.marksQ = true
  my.marks = [];
  //document.getElementById('clearBtn').style.visibility = 'hidden';

  my.t0 = 0;

  lt = 50;
  wd = 740;
  my.currX = w / 2;

  yLn = 70;

  mouseDownQ = false;
  shiftQ = false;

  window.addEventListener("keydown", onKey, false);

  el.addEventListener("mousemove", onmouseMove, false);
  el.addEventListener("mousedown", onMouseDown, false);
  el.addEventListener("mouseup", function (ev) {
    mouseDownQ = false;
    shiftQ = ev.shiftKey;
  }, false);
  el.addEventListener('touchstart', ontouchstart, false);
  el.addEventListener('touchmove', ontouchmove, false);
  el.addEventListener("mousewheel", onMouseWheel, false);

  coords = new CoordsFull(wd, 200, '-1', '-10,', '11', '10', true);

  tickSparseness = 0.04;

  currFrame = 0;
  maxFrames = 10000; // safety

  my.zoomCount = 0;
  my.moveCount = 0;

  keyCount = 0;




  redraw();

  animate();
}

function reset() {
  coords = new CoordsFull(wd, 200, '-1', '-10,', '11', '10', true);

  keyCount = 0;
  my.marks = [];

  redraw();
}

function animate() {
  //currFrame += 1;
  //if (currFrame > maxFrames) return;

  var edge = 60
  //console.log("animate", 0, edge, my.currX, w-edge, w);

  if (mouseDownQ) {
    if (my.currX < edge || my.currX > w - edge) {
      var speed = 1;
      if (my.currX < edge) {
        speed = -(edge - my.currX) * 0.0006;
        coords.moveRel(speed);
      } else {
        speed = (my.currX - (w - edge)) * 0.0006;
        coords.moveRel(speed);
      }
      redraw();
    } else {
      //if (my.shiftQ || !this.zoomInQ) {
      //	my.zoomCount = 2;
      //} else {
      //	my.zoomCount = -2;
      //}
    }
  }

  // now do zoom or move, but just one each "animate" cycle
  if (my.zoomCount > 0) {
    my.zoomCount--;
    doZoom(1);
  }
  if (my.zoomCount < 0) {
    my.zoomCount++;
    doZoom(-1);
  }
  if (my.moveCount > 0) {
    my.moveCount--;
    doMove(1);
  }
  if (my.moveCount < 0) {
    my.moveCount++;
    doMove(-1);
  }

  requestAnimationFrame(animate);
}

function onKey(ev) {
  keyCount++;

  var keyCode = ev.keyCode;

  switch (keyCode) {
    case 38: // Up Arrow
    case 104: // Num 8
    case 87: // w
      //zoomingQ = true;
      my.zoomCount = -4;
      countQ = true;
      ev.preventDefault()
      break;
    case 40: // Down Arrow
    case 98: // Num 2
    case 83: // s
      //zoomingQ = true;
      my.zoomCount = 4;
      countQ = true;
      ev.preventDefault()
      break;
    case 37: // Left Arrow
    case 100: // Num 4
    case 65: // a
      my.moveCount = -4;
      countQ = true;
      ev.preventDefault()
      break;
    case 39: // Right Arrow
    case 102: // Num 6
    case 68: // d
      my.moveCount = 4;
      countQ = true;
      ev.preventDefault()
      break;
    case 16: // shift key
      break;
    default:
      console.log("key", keyCode);
      keyCount--; // dont count invalid keys

  }
  my.shiftQ = ev.shiftKey

  //if (keyCode == 9 || keyCode == 13 || keyCode == 32) { // tab (9), enter (13) or space (32)
  //
  //}

}

function doZoom(dirn) {

  // relative mouse position
  var rel = (my.currX - lt) / wd;
  rel = Math.max(Math.min(rel, 1), 0);
  //console.log("doZoom", dirn, my.currX, rel);

  if (dirn > 0) {
    coords.scale(1.02, rel);
  } else {
    coords.scale(0.98, rel);
  }

  my.t0 = performance.now();
  //console.log("doZoom my.t0", performance.now() - my.t0);
  redraw();
  //console.log("doZoom t9", performance.now() - my.t0);

}

function doMove(dirn) {

  //console.log("doMove", dirn);
  if (dirn > 0) {
    coords.moveRel(0.015);
  } else {
    coords.moveRel(-0.015);
  }

  my.t0 = performance.now();
  //console.log("doMove my.t0", performance.now() - my.t0);
  redraw();
  //console.log("doMove t9", performance.now() - my.t0);
}

//function go( x ) {
//	//console.log("go",x);
//
//	g.clearRect(0, 0, el.width, el.height);
//	redraw(x);
//	//drawFullLine(x);
//	drawTicksReal();
//
//}

function getTicks() {

  var majorTick = coords.xTickInterval(tickSparseness, true);
  var minorTick = coords.xTickInterval(tickSparseness, false);

  var minorTickEvery = majorTick.div(minorTick, 0).getNumber();

  //console.log("t3",performance.now()-my.t0);

  var majorNum = majorTick;
  var minorNum = majorNum.div(new Num(minorTickEvery.toString()), 30);
  //	console.log("t3a",performance.now()-my.t0);

  // curNum = (xStt/majorNum	- 1) * majorNum
  var curNum = coords.xStt;
  curNum = curNum.div(majorNum, 0);
  //	console.log("t3b",performance.now()-my.t0);
  curNum = curNum.sub(new Num("1"));
  //	console.log("t3c",performance.now()-my.t0);
  curNum = curNum.mult(majorNum);

  //	console.log("t4",performance.now()-my.t0);

  // is there room to fit label
  var gap = num2pix(minorNum) - num2pix(new Num("0"));
  var textWd = majorNum.add(minorNum).fmt().length * 9;
  //if (textWd < gap)
  var labelQ = (textWd < gap);
  //console.log("gap=", gap, textWd, majorNum.add(minorNum).fmt(), labelQ);

  //labelQ = true;

  var ticks = [];

  //	console.log("coords",coords.xStt, coords.xEnd, curNum);
  //console.log("t5",performance.now()-my.t0);

  var tickCount = 0;
  while (curNum.compare(coords.xEnd) <= 0 && tickCount < 100) {

    tickCount++; // to stop too many ticks if it goes wild

    var tick = curNum.clone();

    for (var minorTickNo = 0; minorTickNo < minorTickEvery; minorTickNo++, tick = tick.add(minorNum)) {

      //console.log("t=" + minorTickNo, tick.fmt(), tick.compare(coords.xStt));

      if (tick.compare(coords.xStt) < 0)
        continue;
      if (tick.compare(coords.xEnd) > 0)
        continue;

      var tickPx = num2pix(tick);
      //console.log("t=" + minorTickNo, tickPx);

      ticks.push([minorTickNo == 0, minorTickNo, tickPx, tick.fmt(10)]);

    }

    curNum = curNum.add(majorNum);
  }

  //console.log("ticks",ticks);
  return ticks;
}

function redraw() {
  g.clearRect(0, 0, el.width, el.height);
  drawNumLine();

  // document.getElementById('keycount').innerHTML = 'keys: ' + keyCount;
}

function drawNumLine() {

  var ticks = getTicks();

  g.textAlign = 'center';
  g.lineWidth = 1;

  var minV = Infinity;
  var maxV = -Infinity;
  var zeroPx = -999;

  for (var i = 0; i < ticks.length; i++) {
    var tick = ticks[i];
    console.log(tick);

    var majorQ = tick[0];
    var vStr = tick[3];
    var v = Number(vStr);
    var xp = lt + tick[2];

    if (v > maxV) maxV = v;
    if (v < minV) minV = v;

    g.font = '15px Arial';
    var clr = 'black';
    if (v < 0) clr = 'red';
    if (v == 0) {
      zeroPx = xp; // found a zero
      g.font = '22px Arial';
      clr = 'black';
    }
    if (v > 0) clr = 'blue';

    g.strokeStyle = clr;
    g.fillStyle = clr;

    // up/down labels
    var txtY = 35;
    if (vStr.length > 5) {
      // strip off trailing zeros
      var lastChr = vStr.replace(/0+$/, '').slice(-1); // .replace(/0+$/,'') remove trailing zeros, so 123000 becomes 123
      var evenQ = Number(lastChr) % 2 == 0;
      if (!evenQ) {
        txtY = 55;
      }
    }

    var tickHt = 1;
    if (majorQ) {
      g.lineWidth = 2;
      tickHt = 12;
      if (v % 1 == 0) {
        g.fillText(vStr, xp, yLn + txtY);
      }
    } else {
      g.lineWidth = 1;
      tickHt = 8;
    }

    g.beginPath();
    g.moveTo(xp, yLn - tickHt);
    g.lineTo(xp, yLn + tickHt);
    g.stroke();

    v += 1;
  }

  if (zeroPx == -999) { // didn't find a zero position, may be below or above
    if (maxV < 0) zeroPx = w;
    if (minV > 0) zeroPx = -1;
  }
  //console.log("",minV,maxV,zeroPx);

  var lnStt = lt - 25;
  var lnEnd = lt + wd + 25;

  // from stt to 0
  if (zeroPx > lnStt) {
    g.strokeStyle = 'red';
    //g.lineWidth = 2;
    //g.beginPath();
    //g.moveTo(lnStt, yLn);
    //g.lineTo(Math.min(zeroPx, lnEnd), yLn);
    //g.stroke();
    g.drawPipe(lnStt + 10, yLn, Math.min(zeroPx, lnEnd - 10), yLn, g.strokeStyle);
  }

  // from 0 to end
  if (zeroPx < lnEnd) {
    g.strokeStyle = 'blue';
    //g.lineWidth = 2;
    //g.beginPath();
    //g.moveTo(Math.max(zeroPx, lnStt), yLn);
    //g.lineTo(lnEnd, yLn);
    //g.stroke();
    g.drawPipe(Math.max(zeroPx, lnStt + 10), yLn, lnEnd - 10, yLn, g.strokeStyle);
  }

  // left arrow
  g.fillStyle = zeroPx > lnStt ? 'red' : 'blue';
  g.beginPath();
  g.drawArrow(lt - 35, yLn, 30, 2, 45, 25, Math.PI);
  g.fill();

  // right arrow
  g.fillStyle = zeroPx > lnEnd ? 'red' : 'blue';
  g.beginPath();
  g.drawArrow(lt + wd + 35, yLn, 30, 2, 45, 25, 0);
  g.fill();

  console.log(my.marks);
  // marks
  if (my.marksQ) {
    g.fillStyle = '#aa0';
    g.strokeStyle = g.fillStyle;
    g.font = 'bold 17px Arial';
    g.lineWidth = 2;
    for (i = 0; i < my.marks.length; i++) {

      var mark = my.marks[i];
      var rel = coords.num2Rel(mark[0]);

      if (rel > 0 && rel < 1) {

        var xp = lt + rel * wd;
        if (mark[1] % 1 == 0) {
          g.fillText(parseInt(mark[1]), xp, yLn - 35);


          g.beginPath();
          g.moveTo(xp, yLn);
          g.lineTo(xp, yLn - 30);
          g.stroke();
          //
          g.drawArrow(xp, yLn, 20, 2, 20, 10, 3 * Math.PI / 2);
          g.fill();
        }
      }

    }
  }

}

function num2pix(num) {
  //return ((num - coords.xStt.getNumber()) / (coords.xEnd.getNumber() - coords.xStt.getNumber()) * coords.width);
  return (num.sub(coords.xStt).getNumber() / coords.xEnd.sub(coords.xStt).getNumber() * coords.width);
}

function pix2num(pix) {
  return (coords.xStt.getNumber() + pix / coords.width * (coords.xEnd.getNumber() - coords.xStt.getNumber()));
}

function clearMarks() {
  my.marks = [];
  go();
  document.getElementById('clearBtn').style.visibility = 'hidden';
}


function ontouchstart(ev) {
  var touch = ev.targetTouches[0];
  ev.clientX = touch.clientX;
  ev.clientY = touch.clientY;
  ev.touchQ = true;
  onmouseDown(ev)
}

function ontouchmove(ev) {
  //Assume only one touch/only process one touch even if there's more
  var touch = ev.targetTouches[0];
  ev.clientX = touch.clientX;
  ev.clientY = touch.clientY;
  ev.touchQ = true;
  onmouseMove(ev);

  ev.preventDefault();
}

function ontouchend(ev) {
  el.addEventListener('touchstart', ontouchstart, false);
  window.removeEventListener("touchend", ontouchend, false);
}


function onmouseMove(ev) {

  var bRect = el.getBoundingClientRect();
  var mouseX = (ev.clientX - bRect.left) * (el.width / ratio / bRect.width);
  var mouseY = (ev.clientY - bRect.top) * (el.height / ratio / bRect.height);

  my.currX = mouseX; // keep track of latest mouse pos

  //go(mouseX);  // NB

}

function onMouseDown(ev) {

  var bRect = el.getBoundingClientRect();
  var mouseX = (ev.clientX - bRect.left) * (el.width / ratio / bRect.width);
  var mouseY = (ev.clientY - bRect.top) * (el.height / ratio / bRect.height);

  my.currX = mouseX; // keep track of latest mouse pos

  if (my.currX < 50 || my.currX > w - 50) {
    mouseDownQ = true;

  } else {
    var rel = (my.currX - lt) / wd;
    rel = Math.max(Math.min(rel, 1), 0);

    var xRel = coords.rel2Num(rel);

    // NB: not "full precision" compliant, will not work for zooming in
    var x1dec = Number(xRel.fmt()).toFixed(1);
    var xNew = new Num(x1dec);

    my.marks.push([xNew, x1dec]);
    redraw();

  }
  //go(mouseX);  // NB

}

function onMouseWheel(ev) {

  // cross-browser wheel delta
  var delta = Math.max(-1, Math.min(1, (ev.wheelDelta || -ev.detail)));
  console.log("onMouseWheel", delta);
  my.zoomCount -= delta * 5;
  ev.preventDefault()

  return false;
}

function toggleZoomIn() {
  this.zoomInQ = !this.zoomInQ;
  //var keydiv = document.getElementById('key' + i);
  var div = document.getElementById('zoom');
  if (this.zoomInQ) {
    //keydiv.innerHTML = 'rad';
    div.innerHTML = 'Zoom In';
  } else {
    //keydiv.innerHTML = 'deg';
    div.innerHTML = 'Zoom Out';
  }
}


function Point(x, y) {
  this.x = x;
  this.y = y;
}
Point.prototype.set = function (x, y) {
  this.x = x;
  this.y = y;
};

CanvasRenderingContext2D.prototype.drawArrow = function (x0, y0, totLen, shaftHt, headLen, headHt, angle, sweep, invertQ) {
  // NB!!! angle used to be in degrees, now in radians
  var g = this;

  // angle: 0 points right, Math.PI points left
  //console.log("drawArrow=" + totLen, headLen, headHt, angle);
  var pts = [[0, 0], [-headLen, -headHt / 2], [-headLen + sweep, -shaftHt / 2], [-totLen, -shaftHt / 2], [-totLen, shaftHt / 2], [-headLen + sweep, shaftHt / 2], [-headLen, headHt / 2], [0, 0]];

  if (invertQ) {
    pts.push([0, -headHt / 2], [-totLen, -headHt / 2], [-totLen, headHt / 2], [0, headHt / 2]);
  }
  for (var i = 0; i < pts.length; i++) {
    //var cosa = Math.cos(-angle * Math.PI / 180.);
    //var sina = Math.sin(-angle * Math.PI / 180.);
    var cosa = Math.cos(-angle);
    var sina = Math.sin(-angle);
    var xPos = pts[i][0] * cosa + pts[i][1] * sina;
    var yPos = pts[i][0] * sina - pts[i][1] * cosa;
    if (i == 0) {
      g.moveTo(x0 + xPos, y0 + yPos);
    } else {
      g.lineTo(x0 + xPos, y0 + yPos);
    }
  }

};

function CoordsFull(width, height, xStt, yStt, xEnd, yEnd, uniScaleQ) {
  /**/

  this.maxDigits = 30;

  //this.xScale = new Num('0');
  //this.yScale = new Num('0');

  /**/

  this.width = width;
  this.height = height;
  this.xStt = new Num(xStt.toString());
  this.yStt = new Num(yStt.toString());
  this.xEnd = new Num(xEnd.toString());
  this.yEnd = new Num(yEnd.toString());
  this.uniScaleQ = uniScaleQ;

  this.calcScale();
}

CoordsFull.prototype.setCoords = function (xStt, yStt, xEnd, yEnd, uniScaleQ) {
  this.xStt = new Num(xStt.toString());
  this.yStt = new Num(yStt.toString());
  this.xEnd = new Num(xEnd.toString());
  this.yEnd = new Num(yEnd.toString());
  this.uniScaleQ = uniScaleQ;
  calcScale();
};

CoordsFull.prototype.update = function () {
  calcScale();
};

CoordsFull.prototype.rel2Num = function (rel) {
  var relNum = new Num(rel.toString());
  return this.xStt.add(this.xEnd.sub(this.xStt).mult(relNum)); // xStt + (xEnd-xStt)*rel;
};

CoordsFull.prototype.num2Rel = function (num) {
  // if less than xStt rel=0
  // if more than xEnd rel=1
  // rel = (xEnd-n)/(xEnd-xStt)
  var x0 = this.xStt.getNumber();
  var xv = num.getNumber();
  var x1 = this.xEnd.getNumber();
  return (xv - x0) / (x1 - x0);
};

CoordsFull.prototype.scale = function (factor, mid) {

  var factNum = new Num((factor - 1).toString());
  var loNum = new Num((0 - mid).toString());
  var hiNum = new Num((1 - mid).toString());

  var rangeNum = this.xEnd.sub(this.xStt);
  this.xStt = this.xStt.add(rangeNum.mult(factNum).mult(loNum));
  this.xEnd = this.xEnd.add(rangeNum.mult(factNum).mult(hiNum));

  // many multiplications can lead to runaway number of digits
  this.trimDigits();

  //console.log("xStt,xEnd",mid, this.xStt.fmt(), this.xEnd.fmt() );

  this.calcScale();
};

CoordsFull.prototype.moveRel = function (val) {

  var moveNum = this.xEnd.sub(this.xStt).mult(new Num(val.toString()));
  //console.log("moveRel=" + moveNum.fmt());
  this.xStt = this.xStt.add(moveNum);
  this.xEnd = this.xEnd.add(moveNum);
  this.trimDigits();

  this.calcScale();
};

CoordsFull.prototype.trimDigits = function () {

  this.xStt.trimDigits(this.maxDigits);
  this.xEnd.trimDigits(this.maxDigits);

  this.yStt.trimDigits(this.maxDigits);
  this.yEnd.trimDigits(this.maxDigits);

};

/*
 function move(val) {
 xStt += val;
 xEnd += val;
 calcScale();
 }
 function newCenter(x, y) {
 var xMid = xStt + x*xScale;
 var xhalfspan = (xEnd-xStt)/2;
 xStt = xMid - xhalfspan;
 xEnd = xMid + xhalfspan;
 var yMid = yEnd - y*yScale;
 var yhalfspan = (yEnd-yStt)/2;
 yStt = yMid - yhalfspan;
 yEnd = yMid + yhalfspan;
 calcScale();
 }
 function fitToPts(pts, borderFactor = 1) {

 for (var i = 0; i < pts.length; i++) {
 var pt = pts[i];
 console.log("pt=" + pt.x, pt.y);
 if (i == 0) {
 xStt = pt.x;
 xEnd = pt.x;
 yStt = pt.y;
 yEnd = pt.y;
 } else {
 xStt = Math.min(xStt, pt.x);
 xEnd = Math.max(xEnd, pt.x);
 yStt = Math.min(yStt, pt.y);
 yEnd = Math.max(yEnd, pt.y);
 }

 }
 //console.log("before factor=" + xStt, yStt, xEnd, yEnd);

 var xMid = (xStt + xEnd)/2;
 var xhalfspan = borderFactor * (xEnd-xStt)/2;
 xStt = xMid - xhalfspan;
 xEnd = xMid + xhalfspan;
 var yMid = (yStt + yEnd)/2;
 var yhalfspan = borderFactor * (yEnd-yStt)/2;
 yStt = yMid - yhalfspan;
 yEnd = yMid + yhalfspan;
 //console.log("after factor=" + xStt, yStt, xEnd, yEnd);

 calcScale();
 }
 */
CoordsFull.prototype.calcScale = function () {

  //console.log("calcScale: ",xStt,yStt,xEnd,yEnd);
  /*
   if (xLogQ) {
   if (xStt <= 0) xStt = 1;
   if (xEnd <= 0) xEnd = 1;
   }
   if (yLogQ) {
   if (yStt <= 0) yStt = 1;
   if (yEnd <= 0) yEnd = 1;
   }
   */
  //console.log("xStt,xEnd=" + xStt.fmt(), xEnd.fmt());

  //console.log("");

  var temp = new Num();
  if (this.xStt.compare(this.xEnd) > 0) {
    temp = this.xStt;
    this.xStt = this.xEnd;
    this.xEnd = temp;
  }

  var xSpan = this.xEnd.sub(this.xStt);
  if (xSpan.compare(new Num("0")) <= 0) xSpan.setNum("0.1");
  xScale = xSpan.div(new Num(this.width.toString()), 10);
  //xLogScale = (Math.log(xEnd) - Math.log(xStt) ) / width;

  //	console.log("xStt,xEnd,xScale=" + this.xStt.fmt(), this.xEnd.fmt(), this.xScale.fmt());

  //if (this.yStt.compare(this.yEnd) > 0) {
  //	temp = this.yStt;
  //	this.yStt = this.yEnd;
  //	this.yEnd = temp;
  //}
  //
  //var ySpan = this.yEnd.sub(this.yStt);
  //if (ySpan.compare(new Num("0")) <= 0)
  //	ySpan.setNum("0.1");
  //yScale = ySpan.div(new Num(this.height.toString()), 30);
  ////yLogScale = (Math.log(yEnd) - Math.log(yStt) ) / height;

  //console.log("xScale=" + xScale);
  /*
   if (uniScaleQ && !xLogQ && !yLogQ) {
   var newScale = Math.max(xScale,yScale);

   xScale = newScale;
   xSpan = xScale*width;
   var xMid = (xStt+xEnd)/2;
   xStt = xMid - xSpan/2;
   xEnd = xMid + xSpan/2;
   //console.log("xEnd=" + xEnd);

   yScale = newScale;
   ySpan = yScale*height;
   var yMid = (yStt+yEnd)/2;
   yStt = yMid - ySpan/2;
   yEnd = yMid + ySpan/2;
   //console.log("yEnd=" + yEnd);
   }*/
};

/*
 function toXPix(val) {
 if (xLogQ) {
 return (Math.log(val) - Math.log(xStt)) / xLogScale;
 } else {
 return((val-xStt) / xScale);
 }
 }
 function toYPix(val) {
 if (yLogQ) {
 return (Math.log(yEnd) - Math.log(val)) / yLogScale;
 } else {
 return((yEnd - val) / yScale);
 }
 }
 */

CoordsFull.prototype.toXVal = function (pix) {
  return (xStt.add(xScale.mult(new Num(pix.toString())))).getNumber();
};
CoordsFull.prototype.toXNum = function (pix) {
  return (xStt.add(xScale.mult(new Num(pix.toString()))));
};

/*
 function toYVal(pix) {
 return(yEnd - pix * yScale);
 }

 function nearestXPix(pix, decimals=0) {
 return ( toXPix( Maths.round( toXVal(pix) , decimals) ) );
 }
 function nearestYPix(pix, decimals=0) {
 return ( toYPix( Maths.round( toYVal(pix) , decimals) ) );
 }
 function nearestXVal(pix, decimals = 0) {
 return ( Maths.round( toXVal(pix) , decimals) );
 }
 function nearestYVal(pix, decimals=0) {
 return ( Maths.round( toYVal(pix) , decimals) );
 }
 */

CoordsFull.prototype.xTickInterval = function (tickSparseness, majorQ) { // tickSparseness=0.3
  return this.tickInterval(this.xEnd.sub(this.xStt).mult(new Num(tickSparseness.toString())), majorQ);
};
CoordsFull.prototype.yTickInterval = function (tickSparseness, majorQ) {
  return this.tickInterval(this.yEnd.sub(this.yStt).mult(new Num(tickSparseness.toString())), majorQ);
};
CoordsFull.prototype.tickInterval = function (span, majorQ) {

  var mantissa = span.getSci()[0]; // between 1.0 and 9.9

  var intervals = [[7, 10, 1], [3, 1, 1], [2, 1, 0.5], [1, 1, 0.1]]; // example: [6, 5, 1] when above 6 major interval=5, minor interval=1

  for (var i = 0; i < intervals.length; i++) {
    var interval = intervals[i];
    if (mantissa >= interval[0] || i == intervals.length - 1) {
      //console.log("tickInterval",mantissa,interval);
      break;
    }
  }

  if (majorQ) {
    result = interval[1];
  } else {
    result = interval[2];
  }

  //console.log("tickInterval=" + interval);
  var num = new Num(result.toString());
  num = num.mult10(span.getSci()[1] + 1); // give back power of 10

  return num;
};

/*****************************/

function Num(s, base) {
  s = typeof s !== 'undefined' ? s : '';
  base = typeof base !== 'undefined' ? base : 10;

  //console.log("Num",s,base);
  // var numStr = "";
  this.sign = 1;
  this.digits = "";
  this.dec = 0;

  this.MAXDEC = 20;
  // var fullFactorial2N;

  this.baseDigits = "0123456789ABCDEFGHJKLMNP"; // up to base 24. Note: I and O are skipped to avoid confusion with the digits 1 and 0

  this.setNum(s, base);

}
Num.prototype.setNum = function (s, base) {
  base = typeof base !== 'undefined' ? base : 10;
  //console.log("setNum",s,base);
  if (s == 0) {
    this.digits = '0';
    //console.log("setNum is zero",this);
    return;
  }
  if (base == 10) {

    var digits = s;

    // if negative, remember this, and remove minus
    if (digits.charAt(0) == "-") {
      this.sign = -1;
      digits = digits.substring(1);
    } else {
      this.sign = 1;
    }

    // is this e+25 or e-5 style?
    var eVal = 0;
    var ePos = digits.indexOf("e");
    if (ePos >= 0) {
      //console.log("e digits=" + ePos, eVal, dec, digits);
      eVal = (digits.substr(ePos + 1)) >> 0; // cut off the "e" part
      digits = digits.substr(0, ePos);
      //console.log("e Fixed=" + ePos, eVal, dec, digits);
    }

    // work out where decimal place is (if any)
    this.dec = digits.length - (digits.indexOf(".") + 1);
    if (this.dec == digits.length) {
      this.dec = 0;
    }
    this.dec -= eVal; // now move decimal by "e" value (may be just zero)

    // now remove decimal
    digits = digits.split(".").join("");
    digits = digits.replace(/^0+/, ''); // trim left zeros

    if (digits.length == 0) { // it is zero
      //digits = "0";
      this.sign = 1;
      //dec = 0;
    } else {
      // remove invalid digits
      var s1 = "";
      for (var i = 0; i < digits.length; i++) {
        var digit = digits.charAt(i);
        if (this.baseDigits.indexOf(digit) >= 0) {
          s1 += digit;
        }
      }
      digits = s1;
    }

    this.digits = digits;
  } else {
    this.setFromBase(s, base);
  }
  //console.log("setNum",s,base,this);

  //if (ePos >= 0){
  //console.log("digits=" + digits + ", dec=" + dec);
  //}
};
Num.prototype.setFromBase = function (numStr, base) {

  // first do some cleanup to get just the digits
  var srcSign = "";
  if (numStr.charAt(0) == "-") {
    srcSign = "-";
    numStr = numStr.substring(1);
  }
  var baseDec = numStr.length - (numStr.indexOf(".") + 1);
  if (baseDec == numStr.length) {
    baseDec = 0;
  }
  numStr = numStr.split(".").join(""); // now remove decimal
  numStr = numStr.replace(/^0+/, ''); // trim left zeros

  if (numStr.length == 0) { // it is zero
    this.setNum("0");
  } else {

    // now we have just the digits, do base conversion, then divide by base^decimals
    var i = 0;
    var len = numStr.length;
    var baseStr = base.toString();

    var digit = this.baseDigits.indexOf(numStr.charAt(i++).toUpperCase()).toString();
    var result = digit;

    while (i < len) {
      digit = this.baseDigits.indexOf(numStr.charAt(i++).toUpperCase()).toString();
      result = this.fullMultiply(result, baseStr);
      result = this.fullAdd(result, digit);
    }

    // now handle decimal
    if (baseDec > 0) {

      var divBy = this.fullPower(baseStr, baseDec);
      //console.log("=" + "<move dec=" + baseDec + "," + divBy + ">");
      result = this.fullDivide(result, divBy, this.MAXDEC);

    }
    //console.log("=" + "<result=" + result + ">");

    this.setNum(srcSign + result);
  }

};

Num.prototype.toBase = function (base, places) {

  //console.log("toBase",base, places, this);
  //return 'a';

  var parts = this.splitWholeFrac();
  var s = this.fullBaseWhole(parts[0], base);
  //console.log("toBase=" + parts);
  if (parts[1].length > 0) {
    s += "." + this.fullBaseFrac(parts[1], base, places);
  }
  if (this.sign == -1) {
    if (s != "0") {
      s = "-" + s;
    }
  }

  return s;
};
Num.prototype.getNumber = function () {
  return Number(this.fmt(10, 0));
};

Num.prototype.mult10 = function (n) {
  // multiply by 10 by moving decimal place
  var xNew = this.clone();
  xNew.dec = xNew.dec - n;
  if (xNew.dec < 0) {
    xNew.digits = xNew.digits + "0".repeat(-xNew.dec);
    xNew.dec = 0;
  }
  return xNew;
};
Num.prototype.clone = function () {
  var ansNum = new Num();
  ansNum.digits = this.digits;
  ansNum.dec = this.dec;
  ansNum.sign = this.sign;
  return ansNum;
};

Num.prototype.mult = function (num) {
  return this.multNums(this, num);
};
Num.prototype.fullMultiply = function (x, y) {
  //console.log("x,y=" + x,y);
  return this.multNums(new Num(x), new Num(y)).fmt();
};
Num.prototype.multNums = function (xNum, yNum) {
  //console.log("multNums",xNum,yNum);
  var N1 = xNum.digits;
  var N2 = yNum.digits;
  // multiply the pure digits
  var ans = "0";
  for (var i = N1.length - 1; i >= 0; i--) {
    //console.log("multNums",i,ans);
    ans = this.fullAdd(ans, (this.fullMultiply1(N2, N1.charAt(i)) + "0".repeat(N1.length - i - 1)));
    //console.log("multNums",i,ans);
  }
  //console.log("multNums ans",ans);
  var ansNum = new Num(ans);
  ansNum.dec = xNum.dec + yNum.dec;
  ansNum.sign = xNum.sign * yNum.sign;

  //console.log("multNums ansNum",ansNum);

  return ansNum;
};

Num.prototype.fullMultiply1 = function (x, y1) {
  // multiply full number by just a single digit
  var carry = "0";
  var ans = "";
  for (var i = x.length - 1; i > (-1); i--) {
    //var product = parseInt(x.charAt(i)) * parseInt(y1) + parseInt(carry);
    var product = ((x.charAt(i)) >> 0) * (y1 >> 0) + (carry >> 0);
    var prodStr = product.toString();
    if (product < 10) {
      prodStr = "0" + prodStr;
    }
    carry = prodStr.charAt(0);
    ans = prodStr.charAt(1) + ans;
  }
  if (carry != "0") {
    ans = carry + ans;
  }
  //console.log("fullMultiply1",x, y1,ans);
  return ans;
};
Num.prototype.fullMultiplyInt = function (x, y) {
  // karatsuba-style
  // not very effective in factorials, 255! took 990ms vs 399ms for standard fullMultiply
  // but factorials are an extreme "unbvalanced" case, so this may be better for normal multiples.
  //console.log("fullMultiplyInt x,y=" + x,y);
  //if (doQuit())
  //	return ("");

  var xLen = x.length;
  var yLen = y.length;

  if (xLen == 0) return "0";
  if (yLen == 0) return "0";

  if (xLen + yLen <= 9) { // can it be done with integer arithmetic?
    return (parseInt(x) * parseInt(y)).toString();
  }

  var maxLen = Math.max(xLen, yLen);
  // make split next higher power of 2
  //var pow2 = Math.ceil(Math.log(maxLen / 2) / Math.LN2);
  //var split = Math.pow(2, pow2);

  //
  var split = Math.ceil(maxLen / 2);

  //console.log("split=" + split, pow2);
  //console.log("split=" + split);

  if (xLen < yLen) {
    var temp = x; // swap so we know that y is smaller
    x = y;
    y = temp;

    var tInt = xLen;
    xLen = yLen;
    yLen = tInt;
  }

  var xSplit = xLen - split;
  var x0;
  var x1;
  //if (xSplit <= 0){  // won't be <= 0, as x has larger or equal length (see above)
  //	x0 = x;
  //	x1 = "";
  //} else {
  x0 = x.substr(xSplit, split);
  x1 = x.substr(0, xSplit);
  //}

  //console.log("x0,x1=" + x0,x1);

  var ySplit = yLen - split;

  var y0;
  var y1;
  var ans = "0";
  if (ySplit <= 0) {
    //y0 = y;
    //y1 = "";

    var w2 = this.fullMultiplyInt(x0, y);
    var w1 = this.fullMultiplyInt(x1, y);
    w1 = w1 + '0'.repeat(split);

    ans = this.fullAdd(w1, w2);
    //console.log("x,y,ans=" + x,y,ans);
  } else {
    y0 = y.substr(ySplit, split);
    y1 = y.substr(0, ySplit);

    //console.log("y0,y1=" + y0,y1);

    var z0 = this.fullMultiplyInt(x1, y1);
    var z2 = this.fullMultiplyInt(x0, y0);
    var z1 = this.fullMultiplyInt(this.fullAdd(x1, x0), this.fullAdd(y1, y0));
    z1 = this.fullSubtract(z1, z2);
    z1 = this.fullSubtract(z1, z0);

    z0 = z0 + '0'.repeat(split * 2);
    z1 = z1 + '0'.repeat(split);

    ans = this.fullAdd(this.fullAdd(z0, z1), z2);
  }

  //console.log("z0,z1,z2,ans=" + z0,z1,z2,ans);
  //var x1

  return ans;

};
Num.prototype.abs = function () {
  var ansNum = this.clone();
  ansNum.sign = 1;
  return ansNum;
};

Num.prototype.fullAdd = function (x, y) {
  //console.log("fullAdd",x,y);
  return this.addNums(new Num(x), new Num(y)).fmt(10);
};
Num.prototype.add = function (num) {
  return this.addNums(this, num);
};

Num.prototype.addNums = function (xNum, yNum) {
  //console.log("addNums",xNum,yNum);
  var ansNum = new Num();

  if (xNum.sign * yNum.sign == -1) {
    ansNum = this.subNums(xNum.abs(), yNum.abs());
    if (xNum.sign == -1) {
      // flip sign
      ansNum.sign *= -1;
    }
    return ansNum;
  }

  // line up decimals (right pad)
  var maxdec = Math.max(xNum.dec, yNum.dec);
  var xdig = xNum.digits + "0".repeat(maxdec - xNum.dec);
  var ydig = yNum.digits + "0".repeat(maxdec - yNum.dec);

  // now left pad
  var maxlen = Math.max(xdig.length, ydig.length);
  xdig = "0".repeat(maxlen - xdig.length) + xdig;
  ydig = "0".repeat(maxlen - ydig.length) + ydig;

  // perform digit-by-digit addition
  var ans = "";
  var carry = 0;
  for (var i = xdig.length - 1; i >= 0; i--) {
    //var temp = parseInt(xdig.charAt(i)) + parseInt(ydig.charAt(i)) + carry;
    var temp = ((xdig.charAt(i)) >> 0) + ((ydig.charAt(i)) >> 0) + carry;
    if ((temp >= 0) && (temp < 20)) {
      if (temp > 9) {
        carry = 1;
        ans = temp - 10 + ans;
      } else {
        carry = 0;
        ans = temp + ans;
      }
    }
  }
  if (carry == 1) {
    ans = "1" + ans;
  }

  ansNum.setNum(ans);
  ansNum.sign = xNum.sign;
  ansNum.dec = maxdec;
  return ansNum;

};
Num.prototype.fullPower = function (x, n) {
  //return divNums(new Num(x), new Num(y)).fmt();
  return this.expNums(new Num(x), n).fmt();
};

Num.prototype.expNums = function (xNum, nInt) {
  //n = Math.floor(n);
  /*
   var ans = "1";
   var t:Num = new Num("1");
   for (var i = 0; i < n; i++){
   //ans = fullMultiply(ans, x);
   t.fullMultiplyMe(x);
   }
   //return ans;
   */
  var n = nInt;

  var b2pow = 0;

  while ((n & 1) == 0) {
    b2pow++;
    n >>= 1;
  }

  var x = xNum.digits;
  var r = x;
  //var ansx = x;

  while ((n >>= 1) > 0) {
    //x = x.multiply(x);
    x = this.fullMultiply(x, x);
    if ((n & 1) != 0) {
      //r = r.multiply(x);
      r = this.fullMultiply(r, x);
    }
  }

  while (b2pow-- > 0) {
    //r = r.multiply(r);
    r = this.fullMultiply(r, r);
  }

  //console.log("r=" + r);
  //console.log("xNum.dec=" + xNum.dec);
  var ansNum = new Num(r);
  ansNum.dec = xNum.dec * nInt;
  return ansNum;
};
Num.prototype.div = function (num, decimals) {
  //console.log("div=" + this.fmt(), num.fmt());
  return this.divNums(this, num, decimals);
};

Num.prototype.fullDivide = function (x, y, decimals) {
  //return divNums(new Num(x), new Num(y)).fmt();
  return this.divNums(new Num(x), new Num(y), decimals).fmt();
};

Num.prototype.divNums = function (xNum, yNum, decimals) {
  // example: 15/5: 15,5,4 decimals
  //console.log("divNums a",performance.now()-my.t0);
  decimals = typeof decimals !== 'undefined' ? decimals : this.MAXDEC;
  //console.log("divNums",xNum, yNum, decimals);
  //console.log("divNums=(" + xNum.fmt() + "/" + yNum.fmt() + ", " + decimals + ")");
  //console.log("divNums=(" + xNum.dbg() + "/" + yNum.dbg() + ", " + decimals + ")");
  //console.log("signs stt=" + xNum.sign , yNum.sign);

  if (xNum.digits.length == 0) { // is x=0 ?
    return new Num("0");
  }
  if (yNum.digits.length == 0) { // is y=0 ?
    return new Num("0"); // NB should be "Undefined"!!!
  }

  var xDec = xNum.mult10(decimals); // add 0s to match decimals in answer example: xDec goes from 15 to 150000

  // line up decimals (right pad)
  var fullDec = Math.max(xDec.dec, yNum.dec);
  var xdig = xDec.digits + "0".repeat(fullDec - xDec.dec);
  var ydig = yNum.digits + "0".repeat(fullDec - yNum.dec);

  //	console.log("divNums fullDec", fullDec, xdig, ydig);	// example: 0, 150000, 5

  // now left pad
  xdig = xdig.replace(/^0+/, ''); // no leading zeros
  if (this.compareDigits(xdig, "0") == 0) { // is x=0 ?
    return new Num("0");
  }
  ydig = ydig.replace(/^0+/, ''); // no leading zeros
  if (this.compareDigits(ydig, "0") == 0) { // is y=0 ?
    return new Num("0"); // NB should be "Undefined"!!!
  }

  //	console.log("divNums b",performance.now()-my.t0);

  // faster to have 0-9 times y already figured out
  var timestable = [];
  timestable.push("0");
  timestable.push(ydig);

  var tdig = ydig;
  for (var i = 2; i < 10; i++) {
    tdig = this.fullAdd(tdig, ydig);
    //timestable.push( this.fullMultiply(ydig, i.toString()) );
    timestable.push(tdig);
  }
  //console.log("divNums timestable", timestable); // ["0", "5", "10", "15", "20", "25", "30", "35", "40", "45"]

  //	console.log("divNums c",performance.now()-my.t0);

  // Set up variables
  var ans = "0";
  var xNew = xdig;
  var n = 0;
  while (this.compareDigits(xNew, ydig) >= 0) {
    //console.log("big loop", xNew, ydig, ans);
    // keep adding digits from x until y is larger
    var col = 1;
    while (this.compareDigits(xNew.substring(0, col), ydig) < 0) {
      col++;
    }
    var xCurr = xNew.substring(0, col);
    //console.log("xCurr=" + xCurr);
    // now work backwards from 9 until y is smaller        NB: try a binary search
    var mult = 9;
    while (this.compareDigits(timestable[mult], xCurr) > 0) {
      mult--;
    }
    //console.log("mult=" + mult);
    var fullmult = mult + "" + "0".repeat(xNew.length - xCurr.length);
    //console.log("fullmult", fullmult);

    ans = this.fullAdd(ans, fullmult); // answer so far
    xNew = this.fullSubtract(xNew, this.fullMultiply(ydig, fullmult)); // what is left to subtract from

    if (n++ > 100) {
      // stop runaway code
      console.log("runaway code divNums");
      break;
    }
  }
  //_root.DebugText.text += ",rem(" + x + ", " + y + ", " + ans + ")";
  var ansNum = new Num(ans);
  ansNum.dec = decimals;
  //ansDivNum.dec = xDivNum.dec + yDivNum.dec;
  //console.log("signs end=" + xNum.sign , yNum.sign);
  ansNum.sign = xNum.sign * yNum.sign;

  //ans = ansNum.fmt();
  //if (remQ){
  //	var rem = xNum.sub( yNum.mult(ansNum) ).fmt();
  //	if (rem != "0")
  //		ans += " R " + rem;
  //}
  //console.log("divNums ans=" + ansNum.fmt());
  //console.log("divNums z",performance.now()-my.t0);

  return ansNum;
};
Num.prototype.sub = function (num) {
  return this.subNums(this, num);
};

Num.prototype.fullSubtract = function (x, y) {
  return this.subNums(new Num(x), new Num(y)).fmt();
};

Num.prototype.subNums = function (xNum, yNum) {
  var ansNum = new Num();
  if (xNum.sign * yNum.sign == -1) {
    ansNum = xNum.abs().add(yNum.abs());
    if (xNum.sign == -1) {
      //ans = "-" + ans;
      // flip sign ?????
      ansNum.sign *= -1;
    }
    return ansNum;
  }
  // line up decimals (right pad)
  var maxdec = Math.max(xNum.dec, yNum.dec);
  var xdig = xNum.digits + "0".repeat(maxdec - xNum.dec);
  var ydig = yNum.digits + "0".repeat(maxdec - yNum.dec);
  // now left pad
  var maxlen = Math.max(xdig.length, ydig.length);
  xdig = "0".repeat(maxlen - xdig.length) + xdig;
  ydig = "0".repeat(maxlen - ydig.length) + ydig;
  var sign = this.compareDigits(xdig, ydig);
  if (sign == 0) {
    return new Num("0");
  }
  if (sign == -1) {
    // x is less than y, reverse positions and note a negative
    var temp = xdig;
    xdig = ydig;
    ydig = temp;
  }
  // Perform the digit-by-digit subtraction
  var ans = "";
  var isborrow = 0;
  for (var i = xdig.length - 1; i >= 0; i--) {
    // because it's a number, perform the subtraction and append it to Difference
    var xPiece = (xdig.charAt(i)) >> 0;
    var yPiece = (ydig.charAt(i)) >> 0;
    if (isborrow == 1) {
      isborrow = 0;
      xPiece = xPiece - 1;
    }
    if (xPiece < 0) {
      xPiece = 9;
      isborrow = 1;
    }
    if (xPiece < yPiece) {
      xPiece = xPiece + 10;
      isborrow = 1;
    }
    ans = (xPiece - yPiece) + ans;
  }
  ansNum.setNum(ans);
  ansNum.sign = sign * xNum.sign;
  ansNum.dec = maxdec;
  return ansNum;
};

Num.prototype.fmt = function (sigDigits, eStt) {
  sigDigits = typeof sigDigits !== 'undefined' ? sigDigits : 0;
  eStt = typeof eStt !== 'undefined' ? eStt : 0;
  //roundType = typeof roundType !== 'undefined' ? roundType : '5up';
  //sigOrDec = typeof sigOrDec !== 'undefined' ? sigOrDec : 'sig';
  //console.log("fmt",this);

  // build a formatted number from digits, decimal location and sign

  var decWas = this.dec;
  var digitsWas = this.digits;

  if (this.digits.length < sigDigits) {
    this.dec += sigDigits - this.digits.length;
    this.digits += strRepeat("0", sigDigits - this.digits.length);
  }

  // use "s" and "decpos" instead of digits and dec as we want to preserve the original values
  var s = this.digits;
  var decpos = s.length - this.dec;

  var roundQ = false;
  var roundType = "5up";
  if (roundQ) {
    if (this.digits.length > sigDigits) {
      //			console.log("fmt=" + this.digits, sigDigits);

      var cutDigit = "";
      if (sigDigits >= 0) {
        s = this.digits.substr(0, sigDigits);
        cutDigit = this.digits.charAt(sigDigits);
      } else {
        s = "";
        cutDigit = "";
      }

      //	console.log("cutDigit: ", cutDigit);
      //	console.log("s WAS=" + s, cutDigit);

      switch (roundType) {
        case "5up":
          if (cutDigit > "5" || (cutDigit == "5" && this.sign == 1)) {
            s = this.fullAdd(s, "1", 10); // NB
          }
          //		console.log("s 5up=" + s);
          break;

        case "5down":
          if (cutDigit > "5" || (cutDigit == "5" && this.sign == -1)) {
            s = fullAdd(s, "1");
          }
          break;

        case "5away0":
          if (cutDigit >= "5") {
            s = fullAdd(s, "1");
          }
          break;

        case "5to0":
          if (cutDigit > "5") {
            s = fullAdd(s, "1");
          }
          break;

        case "5even":
          if (cutDigit > "5") {
            s = fullAdd(s, "1");
          } else {
            if (cutDigit == "5") {
              if ((parseInt(s.charAt(s.length - 1)) & 1) != 0) {
                s = fullAdd(s, "1");
              }
            }
          }
          break;

        case "5odd":
          if (cutDigit > "5") {
            s = fullAdd(s, "1");
          } else {
            if (cutDigit == "5") {
              if ((parseInt(s.charAt(s.length - 1)) & 1) == 0) {
                s = fullAdd(s, "1");
              }
            }
          }
          break;

        case "floor":
          if (sigDigits < 0) { // asking for a number order(s) of magnitude larger
            decpos -= sigDigits;
            if (this.sign == -1) {
              s = "1";
            } else {
              s = "";
            }
          } else {
            if (this.sign == -1) {
              // but not if -23.0, -23.00, etc
              // take the truncated digits, trim "0"s, if there is nothing left then it is like 23.00
              if (Strings.trimLeft(digits.substr(sigDigits), "0").length != 0) {
                s = fullAdd(s, "1");
              }
            }
          }
          break;

        case "ceiling":
          if (sigDigits < 0) { // asking for a number order(s) of magnitude larger
            decpos -= sigDigits;
            if (this.sign == 1) {
              s = "1";
            } else {
              s = "";
            }
          } else {
            if (this.sign == 1) {
              if (Strings.trimLeft(digits.substr(sigDigits), "0").length != 0) {
                s = fullAdd(s, "1");
              }
            }
          }
          break;
        default:
      }

      //console.log("s IS=" + s + ": ", sigDigits, dec, decpos, digits);
      if (s.length > sigDigits) { // may have overflowed upwards (999=>1000)
        if (sigDigits > 0)
          s = s.substr(0, sigDigits);
        decpos++;
      }
      if (s.length == 0) {
        s = "0";
      } else {
        if (decpos - sigDigits > 0)
          s += "0".repeat(decpos - sigDigits);
      }
    }
  }

  //var eFmtQ = false;
  //console.log("fmt s=" + s,dec,decpos);
  var eVal = decpos - 1;

  if (eStt > 0 && Math.abs(eVal) >= eStt) {

    var s1 = s.substr(0, 1) + "." + s.substr(1);

    //s1 = Strings.trimRight(s1, "0");
    s1 = s1.replace(/0+$/, ''); // todo: check 10, 10., 10.0

    // remove a "." at the end
    if (s1.charAt(s1.length - 1) == ".") {
      s1 = s1.substr(0, s1.length - 1);
    }

    if (eVal > 0) {
      s = s1 + "e+" + eVal;
    } else {
      s = s1 + "e" + eVal;
    }

  } else {

    // add the decimal
    if (decpos < 0) { // decimal is further to the left
      //console.log("fmt=dec to left");
      s = "0." + "0".repeat(-decpos) + s;
      //if (sigDigits>dec)
      //	s += strRepeat("0", sigDigits - dec);
    } else if (decpos == 0) { // decimal is exactly at left
      //console.log("fmt=dec AT left");
      s = "0." + s;
    } else if (decpos > 0) {
      if (this.dec >= 0) { // decimal is inside
        //console.log("fmt=dec inside");
        s = s.substr(0, decpos) + "." + s.substr(decpos, this.dec);
        //if (sigDigits>dec)
        //s += strRepeat("0", sigDigits - dec);
      } else {
        //console.log("fmt=dec to right");
        s = s + "0".repeat(-this.dec) + ".";
      }
    }

    // strip off trailing zeros, if they are after decimal
    if (s.indexOf(".") >= 0) {
      s = s.replace(/0+$/, '');
      //s = Strings.trimRight(s, "0");
    }

    // strip off trailing "."
    if (s.charAt(s.length - 1) == ".") {
      s = s.substring(0, s.length - 1);
    }
  }

  // add the sign
  if (this.sign == -1) {
    if (s != "0") {
      s = "-" + s;
    }
  }

  // restore original data
  this.dec = decWas;
  this.digits = digitsWas;

  return s;
};
Num.prototype.compare = function (yNum) {
  return this.compareNums(this, yNum);
};

Num.prototype.compareNums = function (xNum, yNum) {
  // returns 1 if x>y, 0 if x=y, and -1 if x<y

  // x and y are first aligned and padded to be equal length
  //console.log("compare: " + xNum.dbg() + " to " + yNum.dbg());
  if (xNum.digits.length == 0)
    xNum.sign = 1; // coz it is zero
  if (yNum.digits.length == 0)
    yNum.sign = 1; // coz it is zero
  if (xNum.sign == 1 && yNum.sign == -1) {
    return 1;
  }
  if (xNum.sign == -1 && yNum.sign == 1) {
    return -1;
  }
  // line up decimals (right pad)
  var maxdec = Math.max(xNum.dec, yNum.dec);
  var xdig = xNum.digits + strRepeat("0", maxdec - xNum.dec);
  var ydig = yNum.digits + strRepeat("0", maxdec - yNum.dec);
  // now left pad
  var maxlen = Math.max(xdig.length, ydig.length);
  xdig = strRepeat("0", maxlen - xdig.length) + xdig;
  ydig = strRepeat("0", maxlen - ydig.length) + ydig;
  //console.log("compare: " + xdig + " to " + ydig);
  for (var i = 0; i < xdig.length; i++) {
    if (xdig.charAt(i) < ydig.charAt(i)) {
      return -1 * xNum.sign;
    }
    if (xdig.charAt(i) > ydig.charAt(i)) {
      return 1 * xNum.sign;
    }
  }
  return 0;
};

Num.prototype.compareDigits = function (x, y) {
  // returns 1 if x>y, 0 if x=y, and -1 if x<y
  // ASSUME purely digits, no sign, decimal aligned on the right.
  // example: 2900 vs 12

  if (x.length > y.length) {
    //console.log("compareDigits = 1" , x, y);
    return 1;
  }
  if (x.length < y.length) {
    //console.log("compareDigits = -1" , x, y);
    return -1;
  }
  for (var i = 0; i < x.length; i++) {
    if (x.charAt(i) < y.charAt(i)) {
      //console.log("compareDigits = -1" , x, y);
      return -1;
    }
    if (x.charAt(i) > y.charAt(i)) {
      //console.log("compareDigits = 1" , x, y);
      return 1;
    }
  }
  //console.log("compareDigits = 0" , x, y);
  return 0;
};
Num.prototype.splitWholeFrac = function () {
  var s = this.digits;
  var decpos = s.length - this.dec;

  if (decpos < 0) { // decimal is further to the left
    s = "0".repeat(-decpos) + s;
    decpos = 0;
  }
  if (this.dec < 0) { // decimal is to the right
    s = s + "0".repeat(-this.dec) + ".";
  }

  var wholePart = s.substr(0, decpos);
  var fracPart = s.substr(decpos);
  if (fracPart.replace(/^0+/, '').length == 0) { // trim Left
    fracPart = "";
  } else {
    fracPart = "0." + fracPart;
  }
  return [wholePart, fracPart];
};
Num.prototype.fullBaseWhole = function (d, base) {

  var baseStr = base.toString();

  var dWhole = this.fullDivide(d, baseStr, 0);
  var dRem = this.fullSubtract(d, this.fullMultiply(dWhole, baseStr));

  if (dWhole == "0") {
    return this.baseDigits.charAt(dRem >> 0);
  } else {
    return this.fullBaseWhole(dWhole, base) + this.baseDigits.charAt(dRem >> 0);
  }
};

Num.prototype.fullBaseFrac = function (d, base, places, level) {
  level = typeof level !== 'undefined' ? level : 0;

  var r = this.fullMultiply(d, base.toString());
  var parts = r.split(".");

  //console.log("fullBaseFrac=" + d, r, places, level, parts);
  var wholePart = parts[0];

  if (parts.length == 1 || level >= places - 1) { // places-1 as 1evel starts at 0
    return this.baseDigits.charAt(wholePart >> 0);
  } else {
    var fracPart = "0." + parts[1];
    return this.baseDigits.charAt(wholePart >> 0) + this.fullBaseFrac(fracPart, base, places, level + 1);
  }

};
Num.prototype.getSignStr = function () {
  if (this.sign == -1) {
    return "-";
  } else {
    return "";
  }
};
Num.prototype.getWholeStr = function () {
  // copied from splitWholeFrac(), not optimized
  var s = this.digits;
  var decpos = s.length - this.dec;

  if (decpos < 0) { // decimal is further to the left
    s = "0".repeat(-decpos) + s;
    decpos = 0;
  }
  if (this.dec < 0) { // decimal is to the right
    s = s + "0".repeat(-this.dec) + ".";
  }

  return s.substr(0, decpos);
};
Num.prototype.getDecStr = function () {
  // copied from splitWholeFrac(), not optimized
  var s = this.digits;
  var decpos = s.length - this.dec;

  if (decpos < 0) { // decimal is further to the left
    s = "0".repeat(-decpos) + s;
    decpos = 0;
  }
  if (this.dec < 0) { // decimal is to the right
    s = s + "0".repeat(-this.dec) + ".";
  }

  return s.substr(decpos);
};
Num.prototype.fullProdSeq = function (n0, n1) {
  //console.log("fullProdSeq=" + n0, n1);

  if (n0 == n1) return n1.toString();
  /*
   if (n1 - n0 < 2) {
   console.log("fullProdSeq: integer multiply from " + n0 + " to " + n1);
   var prod = n0;
   for (var i = n0 + 1; i <= n1; i++){
   prod *= i;
   }
   return prod.toString();
   }*/

  var nMid = ((n1 + n0) / 2) << 0;
  return (this.fullMultiplyInt(this.fullProdSeq(n0, nMid), this.fullProdSeq(nMid + 1, n1)));
};
Num.prototype.getSci = function () {
  //console.log("digits=" + digits + "dec=" + dec);
  var len = this.digits.length;

  var s = this.digits.substr(0, 1) + "." + this.digits.substr(1);

  //s = Strings.trimRight(s, "0");
  s = s.replace(/0+$/, ''); // todo: check 10, 10., 10.0

  // remove a "." at the end
  if (s.charAt(s.length - 1) == ".") {
    s = s.substr(0, s.length - 1);
  }

  // add the sign
  if (this.sign == -1) {
    s = "-" + s;
  }

  return [s, len - this.dec - 1];
};

Num.prototype.fullCombPerm = function (n, r, orderQ, replaceQ) {
  var i = 1;
  var s = "";
  if (orderQ) {
    // Permutations

    if (replaceQ) {
      // Permutations with Repetition
      //console.log("type= Permutations with Repetition");
      //s = Math.pow(n, r).toString();
      s = this.fullPower(n.toString(), r);
    } else {
      // Permutations without Repetition
      //console.log("type= Permutations without Repetition");
      if (r > n) {
        s = "";
      } else {
        s = this.fullProdSeq(n - r + 1, n);
      }
    }

  } else {
    // Combinations

    var tops = [];
    var bots = [];
    if (replaceQ) {
      // Combinations with Repetition
      //console.log("type= Combinations with Repetition");
      if (false) { } else {
        for (i = n; i <= n + r - 1; i++) {
          tops.push(i);
        }
        for (i = 2; i <= r; i++) {
          bots.push(i);
        }

      }
    } else {
      // Combinations without Repetition
      //console.log("type= Combinations without Repetition");
      if (r > n) {
        s = "";
      } else {

        // n! / r!(n-r!)

        if (r < n - r) {
          for (i = n - r + 1; i <= n; i++) {
            tops.push(i);
          }
          for (i = 2; i <= r; i++) {
            bots.push(i);
          }
        } else {
          for (i = n - (n - r) + 1; i <= n; i++) {
            tops.push(i);
          }
          for (i = 2; i <= n - r; i++) {
            bots.push(i);
          }
        }

        /*
         for (i = 2; i <= n; i++){
         tops.push(i);
         }
         */
      }
    }
    //console.log("tops,bots befor=" + tops, bots);
    cancelFrac(tops, bots);
    // there SHOULD be no bots left ...
    //		var stt = Date.now();
    s = "1";
    for (i = 0; i < tops.length; i++) {
      s = this.fullMultiplyInt(s, tops[i].toString());
    }
    //console.log("mults=" + tops.length + " (" + (Date.now() - stt) + ")");

  }
  return s;
};

Num.prototype.trimDigits = function (trimToLen) {
  //trace("trimDigits=" + trimToLen);
  if (this.digits.length > trimToLen) {
    var origLen = this.digits.length;
    this.digits = this.digits.substr(0, trimToLen);
    this.dec -= (origLen - this.digits.length);
  }
};

function strRepeat(chr, count) {
  // just return a string with "chr" repeated "count" times
  var s = "";
  while (count > 0) {
    s += chr;
    count -= 1;
  }
  return s;
}

function toggleFullScreen() {
  if ((document.fullScreenElement && document.fullScreenElement !== null) ||
    (!document.mozFullScreen && !document.webkitIsFullScreen)) {
    if (document.documentElement.requestFullScreen) {
      document.documentElement.requestFullScreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullScreen) {
      document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.cancelFullScreen) {
      document.cancelFullScreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen();
    }
  }
}

CanvasRenderingContext2D.prototype.drawPipe = function (x0, y0, x1, y1, clr) {
  // only works for horizontal or vertical pipes
  //console.log("(x0,y0)=" + x0 + ", " + y0);
  //console.log("(x1,y1)=" + x1 + ", " + y1);

  var g = this;

  //var alpha = [1.00, 0.80, 0.60, 0.40, 0.30, 0.50, 1.00];
  var alpha = [0.8, 0.4, 0.3, 0.2, 0.4, 0.6, 0.80];
  var size = alpha.length;
  for (var i = 0; i < size; i++) {

    for (var j = 0; j < 2; j++) {
      if (j == 0) { // first draw white, then overlay with different alphas
        g.strokeStyle = '#ffffff';
        //g.lineStyle(1, '#ffffff', 1);
      } else {
        g.strokeStyle = hex2rgba(clr, alpha[i]);
        //				g.lineStyle(1, clr, alpha[i]);
      }
      var dist = (size / 2 - 1 / 2 - i) * 0.8;
      g.beginPath();
      if (y0 == y1) {
        //console.log("moveTo=" + x0 + ", " + (y0 - dist));
        g.moveTo(x0, y0 - dist);
        //console.log("lineTo=" + x1 + ", " + (y1 - dist));
        g.lineTo(x1, y1 - dist);
      }
      if (x0 == x1) {
        //console.log("moveTo=" + (x0+dist) + ", " + y0);
        g.moveTo(x0 + dist, y0);
        //console.log("lineTo=" + (x1+dist) + ", " + y1);
        g.lineTo(x1 + dist, y1);
      }
      g.stroke();
    }
  }

};

function hex2rgba(hex, opacity) {
  hex = hex.replace('#', '');
  var r = parseInt(hex.substring(0, 2), 16);
  var g = parseInt(hex.substring(2, 4), 16);
  var b = parseInt(hex.substring(4, 6), 16);

  result = 'rgba(' + r + ',' + g + ',' + b + ',' + opacity + ')';
  return result;
}

/*

 function drawPipeCorner(g:Graphics, x0, y0, fromUDLR, toUDLR, clr) {
 // only works for horizontal or vertical pipes
 //console.log("drawPipeCorner (x0,y0)=" + x0 + ", " + y0);

 var alpha = [1.00, 0.80, 0.60, 0.40, 0.40, 0.20, 0.40, 0.60, 1.00];
 var size = alpha.length;
 var radius = size / 2 - 1 / 2;
 //console.log("size=" + size);
 //console.log("radius=" + radius);
 for (var i = 0; i < size; i++){

 for (var j = 0; j < 2; j++){
 if (j == 0){
 g.lineStyle(1, '#ffffff', 1);
 } else {
 g.lineStyle(1, clr, alpha[i]);
 }
 var dist = size / 2 - 1 / 2 - i;
 switch (fromUDLR + "," + toUDLR){
 case "3,1": //"rd":
 case "0,2": //"ul":
 //drawSector(destShape, x0-radius, y0+radius, (size-i-1), -90, 0, '#ffffff', 1, '#ffffff', false);
 //console.log("rd=" + (x0 - dist) + ", " + (y0 - dist) + ", " + (x0 + radius) + ", ");
 g.moveTo(x0 - radius, y0 - radius + i);
 g.lineTo(x0 + radius - i + 1, y0 - radius + i);

 g.moveTo(x0 + radius - i, y0 - radius + i);
 g.lineTo(x0 + radius - i, y0 + radius + 1);
 break;

 case "3,0": //"ru":
 case "1,2": //"dl":
 g.moveTo(x0 - radius, y0 - radius + i);
 g.lineTo(x0 - radius + i + 1, y0 - radius + i);

 g.moveTo(x0 + radius - i, y0 - radius);
 g.lineTo(x0 + radius - i, y0 + radius - i);
 break;

 case "2,1": //"ld":
 case "0,3": //"ur":
 g.moveTo(x0 + radius, y0 - radius + i);
 g.lineTo(x0 - radius + i, y0 - radius + i);

 g.moveTo(x0 + radius - i, y0 + radius - i);
 g.lineTo(x0 + radius - i, y0 + radius);
 break;

 case "2,0": //"lu":
 case "1,3": //"dr":
 g.moveTo(x0 + radius, y0 - radius + i);
 g.lineTo(x0 + radius - i, y0 - radius + i);

 g.moveTo(x0 + radius - i, y0 - radius);
 g.lineTo(x0 + radius - i, y0 - radius + i);
 break;

 default:

 }
 }

 }

 }
 */