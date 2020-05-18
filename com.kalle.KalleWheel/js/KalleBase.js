// http://www.davidebarranca.com/2015/06/html-panel-tips-17-cc2015-survival-guide/
// http://aphall.com/2014/08/cep-mega-guide-en/

function updateLightnessValue() {
      document.getElementById("lightnessValue").value = document.getElementById("lightnessSlider").value;
      colorDirty = true;
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
      resetBlendSlider();
      updateCheckBoxes();
      updateLightnessValue();
}

function increaseLightness() {
      if (!cs.colorGlyphs[cs.getActiveColorIndex()].locked) {
            var l = cs.colorGlyphs[cs.getActiveColorIndex()].z;
            l = Math.floor(Math.round(l) / 10) * 10 + 10;
            l = Math.min(Math.max(l,0),100);
            cs.colorGlyphs[cs.getActiveColorIndex()].z = l;

            updateGUIElements();
            drawCanvas();
            exportForegroundColor();
      }
}

function decreaseLightness() {
      if (!cs.colorGlyphs[cs.getActiveColorIndex()].locked) {
            var l = cs.colorGlyphs[cs.getActiveColorIndex()].z;
            l = Math.ceil(Math.round(l) / 10) * 10 - 10;
            l = Math.min(Math.max(l,0),100);
            cs.colorGlyphs[cs.getActiveColorIndex()].z = l;

            updateGUIElements();
            drawCanvas();
            exportForegroundColor();
      }
}

function increaseBlend() {
      var b = +document.getElementById("blendSlider").value;
      document.getElementById("blendSlider").value = b + 10;
      blendColor();
}

function decreaseBlend() {
      var b = +document.getElementById("blendSlider").value;
      document.getElementById("blendSlider").value = b - 10;
      blendColor();
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
      cs.selectedIndex = cs.getActiveColorIndex();
      exportForegroundColor();
}

function exchangeColors() {
      var labB = cs.backgroundColorGlyph.getColor().lab();
      
      cs.backgroundColorGlyph.x = cs.getForegroundColorGlyph().x;
      cs.backgroundColorGlyph.y = cs.getForegroundColorGlyph().y;
      cs.backgroundColorGlyph.z = cs.getForegroundColorGlyph().z;
      cs.getForegroundColorGlyph().setColorLAB(+labB[0], +labB[1], +labB[2]);

      drawCanvas();
      cs.drawBlendSliderBackground();
      blendColor();
      updateSlider();
      exportColors();
}

function defaultColors() {
      cs.colorGlyphs[cs.getActiveColorIndex()].setColorLAB(100, 0, 0);
      cs.backgroundColorGlyph.setColorLAB(0, 0, 0);
      
      drawCanvas();
      cs.drawBlendSliderBackground();
      blendColor();
      updateSlider();
      exportColors();
}

function exportColor(l, a, b) {
      var js = "setForegroundColorLAB(" + l + "," + a + "," + b + ");";
      csi.evalScript(js);

      var str = cs.serialize();
      var js2 = "saveSwatches(\'" + str + "\');";
      csi.evalScript(js2);
      
      colorDirty = false;
}

function exportColors() {
      var labF = cs.colorGlyphs[cs.getActiveColorIndex()].getColor().lab();
      var labB = cs.backgroundColorGlyph.getColor().lab();

      var js = "setForegroundColorLAB(" + labF[0] + "," + labF[1] + "," + labF[2] + ");";
      csi.evalScript(js);
      var js = "setBackgroundColorLAB(" + labB[0] + "," + labB[1] + "," + labB[2] + ");";
      csi.evalScript(js);

      var str = cs.serialize();
      var js3 = "saveSwatches(\'" + str + "\');";
      csi.evalScript(js3);
      
      colorDirty = false;
}

function exportForegroundColor() {
      //nowExportingColor = true;
      var LAB = cs.colorGlyphs[cs.getActiveColorIndex()].getColor().lab();
      exportColor(LAB[0], LAB[1], LAB[2]);
}

function importForegroundColor() {
      var js = "getForegroundColorLAB();";
      csi.evalScript(js);
      //var js = "getForegroundColorRGB();";
      //csi.evalScript(js);
}

function importBackgroundColor() {
      var js = "getBackgroundColorLAB();";
      csi.evalScript(js);
      //var js = "getForegroundColorRGB();";
      //csi.evalScript(js);
}

function importForegroundColorEvent(e) {
      var str = e.data.toString();
      str = str.substring(2, str.length - 2); // Remove comment wrapping from json
            
      var LAB = JSON.parse(str);
      
      if (!cs.colorGlyphs[cs.getActiveColorIndex()].locked) {
            cs.colorGlyphs[cs.getActiveColorIndex()].setColorLAB(+LAB.l, +LAB.a, +LAB.b);
      }
      updateGUIElements();
      drawCanvas();
}

function importBackgroundColorEvent(e) {
      var str = e.data.toString();
      str = str.substring(2, str.length - 2); // Remove comment wrapping from json
            
      var LAB = JSON.parse(str);
      
      cs.backgroundColorGlyph.setColorLAB(+LAB.l, +LAB.a, +LAB.b);

      updateGUIElements();
      drawCanvas();
}

function importSwatches(e) {
      var str = e.data.toString();
      str = str.substring(2, str.length - 2); // Remove comment wrapping from json
      
      var colors = JSON.parse(str);
      for (let index = 0; index < colors.length; index++) {
            var LAB = colors[index];
            cs.colorGlyphs[index].setColorLAB(+LAB.l, +LAB.a, +LAB.b);
      }
      updateGUIElements();
      drawCanvas();
}

function writeGamutMask(event) {

}

function unGuardedImportColorsPsEvent(event) {
      importForegroundColor();
      importBackgroundColor();
}

function importColorsPsEvent(event) {
      if (!cs.mouseOver) {
            importForegroundColor();
            importBackgroundColor();
      }
}

function mouseDown(e) {
      var mouse = cs.getMouse(e);
      cs.GamutMask.updateSelectedIndex(mouse.x, mouse.y, 0.1);
      cs.mouseDown = true;
      moveDots(e);
      drawCanvas();      
}

function mouseUp(e) {
      cs.mouseDown = false;
      if (colorDirty) {
            exportForegroundColor();
      }
}

function mouseEnter(e) {
      cs.mouseOver = true;
}

function mouseExit(e) {
      cs.mouseOver = false;
}

function redrawForeground() {
      cs.clearForeground();
      if (displayOriginMenuItem_isChecked) {
            cs.drawCross(0,0);
      }
      cs.drawLightTraceLines();
      cs.drawExternalLightTraceLines();
      cs.drawBlendLine();
      cs.drawColorGlyphs();
}

function drawCanvas() {
      cs.drawBackground();
      cs.GamutMask.drawMask();
      cs.drawSliderBackground();
      cs.drawBlendSliderBackground();
      redrawForeground();
      cs.drawVerticesAndEdges();
}

function moveDots(e) {
      cs.foreground.style.cursor="cell";

      if (cs.mouseDown) {
            if (!cs.colorGlyphs[cs.getActiveColorIndex()].locked) {
                  cs.moveDots(e);

                  updateSlider();
                  resetBlendSlider();
                  updateCheckBoxes();
                  updateColorHC();
                  cs.drawVerticesAndEdges();
            }
      }
}

function updateColor() {
      var l = +document.getElementById("lightnessSlider").value;
      cs.colorGlyphs[cs.getActiveColorIndex()].z = l;
      resetBlendSlider();
      updateLightnessValue();
      drawCanvas();
      exportForegroundColor();
}

function exportBlendColor() {
      var b = +document.getElementById("blendSlider").value;
      var color = cs.blendColors(cs.getForegroundColorGlyph().getColor(), cs.backgroundColorGlyph.getColor(), b / 100);
      var LAB = color.lab();
      redrawForeground();
      cs.drawBlendGlyph(b / 100);
      exportColor(LAB[0], LAB[1], LAB[2]);
}

function blendColor() {
      var b = +document.getElementById("blendSlider").value;
      var color = cs.blendColors(cs.getForegroundColorGlyph().getColor(), cs.backgroundColorGlyph.getColor(), b / 100);
      var LAB = color.lab();
      redrawForeground();
      cs.drawBlendGlyph(b / 100);
}

function updateColorHC() {
      var l = +document.getElementById("lightnessSlider").value;
      cs.colorGlyphs[cs.getActiveColorIndex()].z = l;
      updateLightnessValue();
      
      cs.drawSliderBackground();
      cs.drawBlendSliderBackground();
      redrawForeground();
}

function updateSlider() {
      var z = cs.colorGlyphs[cs.getActiveColorIndex()].z;
      document.getElementById("lightnessSlider").value = z;
}

function resetBlendSlider() {
      document.getElementById("blendSlider").value = 0;
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

function toggleGamutMask() {
      cs.GamutMask.useMask = document.getElementById("toggleGamutMaskCheckbox").checked;
      cs.GamutMask.editingMask = document.getElementById("editGamutMaskCheckbox").checked;

      document.getElementById("editGamutMaskCheckbox").disabled = !cs.GamutMask.useMask;
      if (!cs.GamutMask.useMask) {
            document.getElementById("editGamutMaskCheckbox").checked = false;
      }

      drawCanvas();

      if (!cs.GamutMask.editingMask) {
            writeGamutMask();
      }
}

// Photoshop event registration need to be dispatched from the jsx side because the
// event id needs to be fetched.
function registerPhotoshopEventEvent(e) {
      var str = e.data.toString();
      str = str.substring(2, str.length - 2); // Remove comment wrapping from json      
      var eventData = JSON.parse(str);
      
      var typeIDSetd = eventData["typeID"];
      var evalScript = eventData["evalScript"];
      
      var event = new CSEvent();
      event.type = "com.adobe.PhotoshopRegisterEvent";
      event.extensionId = "com.kalle.KalleWheel";
      event.scope = "APPLICATION";
      event.data = typeIDSetd.toString();

      function callMe() {
            eval(evalScript);
      }

      csi.dispatchEvent(event);
      csi.addEventListener("PhotoshopCallback", callMe);
}

function readGamutMask(e) {
      var str = e.data.toString();
      str = str.substring(2, str.length - 2); // Remove comment wrapping from json      
      var eventData = JSON.parse(str);

      cs.GamutMask.vertices = eventData["vertices"];
      document.getElementById("toggleGamutMaskCheckbox").checked = eventData["useMask"];
      document.getElementById("editGamutMaskCheckbox").disabled = !eventData["useMask"];
      
      toggleGamutMask();
}

function writeGamutMask() {
      var str = cs.GamutMask.serialize();
      var js = "writeGamutMask(\'" + str + "\');";
      csi.evalScript(js);
}

function openExternalWebsite() {
      cep.util.openURLInDefaultBrowser("http://kbladin.se/tools/kalle_wheel.php");
}

// TODO : Put in data structure that can be saved and loaded
var displayOriginMenuItem_isChecked = true;
function flyoutMenuClickedHandler(event) {
      switch (event.data.menuId) {
            case "displayOriginMenuItem":
                  displayOriginMenuItem_isChecked = !displayOriginMenuItem_isChecked;
                  csi.updatePanelMenuItem("Display origin", true, displayOriginMenuItem_isChecked);
                  drawCanvas();
                  break;
            case "openWebsiteMenuItem":
                  openExternalWebsite();
                  break;
            default:
                  ;
      }
}

// Create canvas
var numColors = 12;
var cs = new CanvasState(
      document.getElementById("wheelCanvas"),
      document.getElementById("dotsCanvas"),
      document.getElementById("maskCanvas"),
      document.getElementById("sliderBackgroundCanvas"),
      document.getElementById("blendSliderBackgroundCanvas"));
for (var i = 0; i < numColors; i++) {
      cs.addColor(0,0);
}

cs.addColorRadioButtons(document.getElementById("colorButtons"));
cs.selectedIndex = 0;

// Tooltips
tippy('[data-tippy-content]', {
      duration: 500,
      delay: [1000, 0],
      followCursor: 'initial',
      inertia: true,
});

tippy('#info', {
      allowHTML: true,
      content: 'KalleWheel is an extension made to make it easier for digital painters to choose colors in Photoshop. For more details, please see <a href=javascript:openExternalWebsite()>the project page</a>.',
      duration: 500,
      inertia: true,
      trigger: 'click',
      interactive: true
});

var flyoutXML = '\
<Menu> \
<MenuItem Id="displayOriginMenuItem" Label="Display origin" Enabled="true" Checked="true"/> \
\
<MenuItem Label="---" /> \
<MenuItem Id="openWebsiteMenuItem" Label="Go to project website" Enabled="true" Checked="false"/> \
\
<MenuItem Label="---" /> \
\
</Menu>';

// CS interface events
var csi = new CSInterface();
csi.setPanelFlyoutMenu(flyoutXML);
csi.addEventListener("com.adobe.csxs.events.flyoutMenuClicked", flyoutMenuClickedHandler);
csi.addEventListener( "colorImported", importForegroundColorEvent);
csi.addEventListener( "backgroundColorImported", importBackgroundColorEvent);
csi.addEventListener( "swatchesImported", importSwatches);
csi.addEventListener( "registerPhotoshopEvent", registerPhotoshopEventEvent);
csi.addEventListener( "readGamutMask", readGamutMask);
csi.evalScript("registerPhotoshopEvent(\"setd\", \"importColorsPsEvent();\");");
csi.evalScript("registerPhotoshopEvent(\"Exch\", \"importColorsPsEvent();\");");
csi.addEventListener(CSInterface.THEME_COLOR_CHANGED_EVENT, onAppThemeColorChanged);
updateThemeWithAppSkinInfo(csi.hostEnvironment.appSkinInfo);

// Events for keyboard shortcuts
csi.addEventListener( "KalleWheelEvent_DecreaseLightness", () => {decreaseLightness();});
csi.addEventListener( "KalleWheelEvent_IncreaseLightness", () => {increaseLightness();});
csi.addEventListener( "KalleWheelEvent_DecreaseBlend", () => {decreaseBlend();});
csi.addEventListener( "KalleWheelEvent_IncreaseBlend", () => {increaseBlend();});

// Update color without exporting
var l = +document.getElementById("lightnessSlider").value;
cs.colorGlyphs[cs.getActiveColorIndex()].z = l;
updateLightnessValue();
drawCanvas();
var colorDirty = false;
csi.evalScript("initialize(" + numColors + ");")