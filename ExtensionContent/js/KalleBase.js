// http://www.davidebarranca.com/2015/06/html-panel-tips-17-cc2015-survival-guide/
// http://aphall.com/2014/08/cep-mega-guide-en/

function updateLightnessValue() {
      document.getElementById("lightnessValue").value = document.getElementById("lightnessSlider").value;
}

function outputMessage(msg) {
      var theDiv = document.getElementById("outputMessage");
      theDiv.innerHTML = msg;
      theDiv.style.color = "red";
      theDiv.style.transitionDuration = "5s";
      
      theDiv.style.color = "transparent";
}

function updateGUIElements() {
      updateSlider();
      updateCheckBoxes();
      updateLightnessValue();
}

function increaseLightness() {
      if (!cs.colorGlyphs[cs.getActiveColorIndex()].locked) {
            var l = cs.colorGlyphs[cs.getActiveColorIndex()].z;
            l = Math.floor(Math.round(l) / 10) * 10 + 10;
            l = Math.min(Math.max(l,0),100);
            cs.colorGlyphs[cs.getActiveColorIndex()].z = l;
      }
      updateGUIElements();
      drawCanvas();
}

function decreaseLightness() {
      if (!cs.colorGlyphs[cs.getActiveColorIndex()].locked) {
            var l = cs.colorGlyphs[cs.getActiveColorIndex()].z;
            l = Math.ceil(Math.round(l) / 10) * 10 - 10;
            l = Math.min(Math.max(l,0),100);
            cs.colorGlyphs[cs.getActiveColorIndex()].z = l;
      }
      updateGUIElements();
      drawCanvas();
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
      cs.colorGlyphs[cs.getActiveColorIndex()].visible = true;
      drawCanvas();
      updateGUIElements();
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
      var str = e.data.toString();
      str = str.substring(2, str.length - 2); // Remove comment wrapping from json
            
      var RGB = JSON.parse(str);
      
      if (!cs.colorGlyphs[cs.getActiveColorIndex()].locked) {
            cs.colorGlyphs[cs.getActiveColorIndex()].setColor(+RGB.r, +RGB.g, +RGB.b);
      }
      updateGUIElements();
      drawCanvas();
}

function mouseDown(e) {
      var mouse = cs.getMouse(e);
      cs.updateSelectedIndex(mouse.x, mouse.y, 0.1);
      cs.mouseDown = true;
      moveDots(e);
      drawCanvas();      
}

function mouseUp(e) {
      cs.mouseDown = false;
      //exportForegroundColor();
}

function redrawForeground() {
      cs.clearForeground();
      cs.drawCross(0,0);
      cs.drawLightTraceLines();
      cs.drawExternalLightTraceLines();
      cs.drawColorGlyphs();
}

function drawCanvas() {
      cs.drawBackground();
      cs.drawSliderBackground();
      redrawForeground();
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
            redrawForeground();
      }
      updateSlider();
      updateCheckBoxes();
      updateColorHC(); 
}

function updateColor() {
      var l = +document.getElementById("lightnessSlider").value;
      cs.colorGlyphs[cs.getActiveColorIndex()].z = l;
      updateLightnessValue();
      drawCanvas();
}

function updateColorHC() {
      var l = +document.getElementById("lightnessSlider").value;
      cs.colorGlyphs[cs.getActiveColorIndex()].z = l;
      updateLightnessValue();
      
      cs.drawSliderBackground();
      redrawForeground();
}

function updateSlider() {
      var z = cs.colorGlyphs[cs.getActiveColorIndex()].z;
      document.getElementById("lightnessSlider").value = z;
}

function updateCheckBoxes() {
      document.getElementById("visibilityCheckBox").checked = cs.colorGlyphs[cs.getActiveColorIndex()].visible;
      document.getElementById("traceLinesCheckBox").checked = cs.colorGlyphs[cs.getActiveColorIndex()].drawLightTraceLines;
      document.getElementById("lockedCheckBox").checked = cs.colorGlyphs[cs.getActiveColorIndex()].locked;
      document.getElementById("lightSourceCheckBox").checked = cs.colorGlyphs[cs.getActiveColorIndex()].isLightSource;
}

function toggleVisibility() {
      cs.colorGlyphs[cs.getActiveColorIndex()].visible = document.getElementById("visibilityCheckBox").checked;
      redrawForeground();
}

function toggleDrawTraceLines() {
      cs.colorGlyphs[cs.getActiveColorIndex()].drawLightTraceLines = document.getElementById("traceLinesCheckBox").checked;
      redrawForeground();
}

function toggleLock() {
      cs.colorGlyphs[cs.getActiveColorIndex()].locked = document.getElementById("lockedCheckBox").checked;
      redrawForeground();
}

function toggleLightSource() {
      cs.colorGlyphs[cs.getActiveColorIndex()].isLightSource = document.getElementById("lightSourceCheckBox").checked;
      redrawForeground();
}


var cs = new CanvasState(document.getElementById("wheelCanvas"), document.getElementById("dotsCanvas"), document.getElementById("sliderBackgroundCanvas"));
for (var i = 0; i < 12; i++) {
      cs.addColor(0,0);
}

cs.addColorRadioButtons(document.getElementById("colorButtons"));

updateColor();
drawCanvas();

var csi = new CSInterface();
csi.addEventListener( "colorImported", importForegroundColorEvent);


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
