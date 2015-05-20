
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
      cs.clearForeground();
      cs.drawCross(0,0);
      cs.drawLightTraceLines();
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
            cs.drawColorGlyphs();
      }
      updateSlider();
      updateCheckBoxes();
      updateColor();            
}

function updateColor() {
      var l = +document.getElementById("lightnessSlider").value;
      cs.colorGlyphs[cs.getActiveColorIndex()].z = l;
      drawCanvas();
}

function updateSlider() {
      var z = cs.colorGlyphs[cs.getActiveColorIndex()].z;
      document.getElementById("lightnessSlider").value = z;
}

function updateCheckBoxes() {
      document.getElementById("lockedCheckBox").checked = cs.colorGlyphs[cs.getActiveColorIndex()].locked;
      document.getElementById("lightSourceCheckBox").checked = cs.colorGlyphs[cs.getActiveColorIndex()].isLightSource;
}

function toggleLock() {
      cs.colorGlyphs[cs.getActiveColorIndex()].locked = document.getElementById("lockedCheckBox").checked;
      cs.clearForeground();
      cs.drawCross(0,0);
      cs.drawLightTraceLines();
      cs.drawColorGlyphs();
}

function toggleLightSource() {
      cs.colorGlyphs[cs.getActiveColorIndex()].isLightSource = document.getElementById("lightSourceCheckBox").checked;
      cs.clearForeground();
      cs.drawCross(0,0);
      cs.drawLightTraceLines();
      cs.drawColorGlyphs();
}


var cs = new CanvasState(document.getElementById("wheelCanvas"), document.getElementById("dotsCanvas"));
cs.addColor(0,0);
cs.addColor(0,0);
cs.addColor(0,0);
cs.addColor(0,0);
cs.addColor(0,0);
cs.addColor(0,0);
cs.addColorRadioButtons(document.getElementById("colorButtons"));

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
