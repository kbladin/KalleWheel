
function radioButtonChanged() {
      drawCanvas();
      updateSlider();
      exportForegroundColor();
}

function exportForegroundColor() {
      /*
      var form = document.getElementById("colorButtons");
      
      var RGB = cs.colorGlyphs[form.elements["color"].value].color.rgb();
      var js = "setForegroundColorRGB(" + RGB[0] + "," + RGB[1] + "," + RGB[2] + ");";
      var csInterface = new CSInterface();
      csInterface.evalScript(js);
      */
}
      
function mouseDown(e) {
      var mouse = cs.getMouse(e);
      cs.updateSelectedIndex(mouse.x, mouse.y, 0.1);
      cs.mouseDown = true;
      moveDots(e);
}

function mouseUp(e) {
      cs.mouseDown = false;
      exportForegroundColor();
}
      
function drawCanvas() {
      cs.drawBackground();
      cs.clearForeground();
      cs.drawCross(0,0);
      cs.drawColorGlyphs();
}

function moveDots(e) {
      var mouse = cs.getMouse(e);
      if (cs.positionOverDots(mouse.x, mouse.y, 0.1)) {
            cs.foreground.style.cursor="crosshair";
      }
      else {
            cs.foreground.style.cursor="default";
      }
      if (cs.mouseDown) {
            cs.moveDots(e);
            cs.clearForeground();
            cs.drawCross(0,0);
            cs.drawColorGlyphs();
      }
      updateColor();
}

function updateColor() {
      var index = cs.getActiveColorIndex();
      var x = cs.colorGlyphs[index].x;
      var y = cs.colorGlyphs[index].y;
      
      var l = +document.getElementById("lightnessSlider").value;
      var c = cs.getSaturation01(x, y) * 100;
      var h = cs.getHue(x, y) / (2 * Math.PI) * 360;
      cs.colors[cs.getActiveColorIndex()] = new chroma.lch(l,c,h);
      drawCanvas();
}

function updateSlider() {
      var lch = cs.colors[cs.getActiveColorIndex()].lch();
      document.getElementById("lightnessSlider").value = lch[0];
}

var cs = new CanvasState(document.getElementById("wheelCanvas"), document.getElementById("dotsCanvas"));
cs.addColor(0,0);
cs.addColor(0,0);
cs.addColor(0,0);
cs.addColorRadioButtons(document.getElementById("colorButtons"));

drawCanvas();


