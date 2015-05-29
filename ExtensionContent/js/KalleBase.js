function updateLightnessValue() {
      document.getElementById("lightnessValue").value = document.getElementById("lightnessSlider").value;
}

function textInputValue() {
      var newVal;
      if (  document.getElementById("lightnessValue").value == ""){
            return;
      }
      else if (document.getElementById("lightnessValue").value < 0)
            newVal = 0;
      else if (document.getElementById("lightnessValue").value > 100)
            newVal = 100;
      else
            newVal = document.getElementById("lightnessValue").value;
      document.getElementById("lightnessSlider").value = newVal;
      updateColor();
}

function radioButtonChanged() {
      drawCanvas();
      updateSlider();
      updateCheckBoxes();
      //exportForegroundColor();
}

function exportForegroundColor() {      
      var RGB = cs.colorGlyphs[cs.getActiveColorIndex()].getColor().rgb();
      var js = "setForegroundColorRGB(" + RGB[0] + "," + RGB[1] + "," + RGB[2] + ");";
      csi.evalScript(js);
}

function importForegroundColor() {
      var js = "getForegroundColorRGB();";
      csi.evalScript(js);
}

function importForegroundColorEvent(e) {
      var str = e.data;
      str = str.substring(1, str.length - 1); // Remove wrapping [ ] from json
      var RGB = JSON.parse(str);
      
      if (!cs.colorGlyphs[cs.getActiveColorIndex()].locked) {
            cs.colorGlyphs[cs.getActiveColorIndex()].setColor(+RGB.r, +RGB.g, +RGB.b);
      }
      updateSlider();
      updateCheckBoxes();
      drawCanvas();
}

function mouseDown(e) {
      var mouse = cs.getMouse(e);
      cs.updateSelectedIndex(mouse.x, mouse.y, 0.1);
      cs.mouseDown = true;
      moveDots(e);            
}

function mouseUp(e) {
      cs.mouseDown = false;
      //exportForegroundColor();
}
      
function drawCanvas() {
      cs.drawBackground();
      cs.drawSliderBackground();
      cs.clearForeground();
      cs.drawCross(0,0);
      cs.drawLightTraceLines();
      cs.drawExternalLightTraceLines();
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
            if (!cs.colorGlyphs[cs.getActiveColorIndex()].locked) {
                  cs.moveDots(e);
            }
            cs.clearForeground();
            cs.drawCross(0,0);
            cs.drawLightTraceLines();
            cs.drawExternalLightTraceLines();
            cs.drawColorGlyphs();
      }
      updateSlider();
      updateCheckBoxes();
      updateColor();            
}

function updateColor() {
      var l = +document.getElementById("lightnessSlider").value;
      cs.colorGlyphs[cs.getActiveColorIndex()].z = l;
      updateLightnessValue();
      drawCanvas();
}

function updateSlider() {
      var z = cs.colorGlyphs[cs.getActiveColorIndex()].z;
      document.getElementById("lightnessSlider").value = z;
}

function updateCheckBoxes() {
      document.getElementById("traceLinesCheckBox").checked = cs.colorGlyphs[cs.getActiveColorIndex()].drawLightTraceLines;
      document.getElementById("lockedCheckBox").checked = cs.colorGlyphs[cs.getActiveColorIndex()].locked;
      document.getElementById("lightSourceCheckBox").checked = cs.colorGlyphs[cs.getActiveColorIndex()].isLightSource;
}

function toggleDrawTraceLines() {
      cs.colorGlyphs[cs.getActiveColorIndex()].drawLightTraceLines = document.getElementById("traceLinesCheckBox").checked;
      cs.clearForeground();
      cs.drawCross(0,0);
      cs.drawLightTraceLines();
      cs.drawExternalLightTraceLines();
      cs.drawColorGlyphs();
}

function toggleLock() {
      cs.colorGlyphs[cs.getActiveColorIndex()].locked = document.getElementById("lockedCheckBox").checked;
      cs.clearForeground();
      cs.drawCross(0,0);
      cs.drawLightTraceLines();
      cs.drawExternalLightTraceLines();
      cs.drawColorGlyphs();
}

function toggleLightSource() {
      cs.colorGlyphs[cs.getActiveColorIndex()].isLightSource = document.getElementById("lightSourceCheckBox").checked;
      cs.clearForeground();
      cs.drawCross(0,0);
      cs.drawLightTraceLines();
      cs.drawExternalLightTraceLines();
      cs.drawColorGlyphs();
}


var cs = new CanvasState(document.getElementById("wheelCanvas"), document.getElementById("dotsCanvas"), document.getElementById("sliderBackgroundCanvas"));
for (var i = 0; i < 12; i++) {
      cs.addColor(0,0);
}


cs.addColorRadioButtons(document.getElementById("colorButtons"));

updateColor();
drawCanvas();


var csi = new CSInterface();
csi.addEventListener( "foo.bar", importForegroundColorEvent);


/*
var event = new CSEvent("com.adobe.PhotoshopRegisterEvent", "APPLICATION");
event.extensionId = "com.example.KalleWheel.extension1";//csi.getExtensionID();
//event.appId = csi.getApplicationID();
event.data = "1668247673"; //Copy event
csi.dispatchEvent(event);
csi.addEventListener("PhotoshopCallback", function(e) {
		alert("event: " + e.data);
	});
*/
