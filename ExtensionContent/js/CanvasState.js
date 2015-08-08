function getHue(x, y) {
	var theta = Math.atan2(y,-x) + Math.PI;
	return theta;
};

function getSaturation01(x, y) {
	return (Math.sqrt(Math.pow(x,2) + Math.pow(y,2)));
};

function ColorGlyph (x, y, index) {
    this.x = x;
    this.y = y;
    this.z = 50;
    this.locked = false;
    this.isLightSource = false;
    this.drawLightTraceLines = false;
    this.visible = false;
    this.index = index;
}

ColorGlyph.prototype.getColor = function() {
	return chroma.lch(
                    this.z,
                    getSaturation01(this.x, this.y) * 100,
                    getHue(this.x, this.y) / (2 * Math.PI) * 360);
};

ColorGlyph.prototype.setColor = function(r, g, b) {
    var LCH = chroma.rgb(r, g, b).lch();
    this.x = LCH[1] / 100 * Math.cos(LCH[2] / 360 * (2 * Math.PI));
    this.y = - LCH[1] / 100 * Math.sin(LCH[2] / 360 * (2 * Math.PI));
    this.z = LCH[0];
    
    var norm = Math.sqrt(Math.pow(this.x,2) + Math.pow(this.y,2)) + 20/270; // 20 = bordersize hardcoded...
    if (norm > 1) {
        this.x = this.x / norm;
        this.y = this.y / norm;
        //alert("Warning: Color normalized!");
    }
};

ColorGlyph.prototype.setColorLCH = function(l, c, h) {
    var LCH = chroma.lch(l, c, h).lch();
    this.x = LCH[1] / 100 * Math.cos(LCH[2] / 360 * (2 * Math.PI));
    this.y = - LCH[1] / 100 * Math.sin(LCH[2] / 360 * (2 * Math.PI));
    this.z = LCH[0];
    
    var norm = Math.sqrt(Math.pow(this.x,2) + Math.pow(this.y,2)) + 20/270; // 20 = bordersize hardcoded...
    if (norm > 1) {
        this.x = this.x / norm;
        this.y = this.y / norm;
        //alert("Warning: Color normalized!");
    }
};

function CanvasState(background, foreground, sliderBackground) {
    this.background = background;
    this.foreground = foreground;
    this.sliderBackground = sliderBackground;
    this.colorGlyphs = [];
    this.borderSize = 20;
    this.mouseDown = false;
    this.selectedIndex = -1; // Only the clicked index
    
    //fixes a problem where double clicking causes text to get selected on the canvas
    background.addEventListener('selectstart', function(e) { e.preventDefault(); return false; }, false);
    foreground.addEventListener('selectstart', function(e) { e.preventDefault(); return false; }, false);
}

CanvasState.prototype.addColor = function(x, y) {
	this.colorGlyphs.push(new ColorGlyph(x, y, this.colorGlyphs.length));
};

CanvasState.prototype.getActiveColorIndex = function() {
    return document.getElementById("colorButtons").elements["color"].value;
};

CanvasState.prototype.addColorRadioButtons = function(element) {
    for (var i = 0; i < this.colorGlyphs.length; i++) {
        var radioButton = document.createElement("input");
        radioButton.type = "radio";
        radioButton.name = "color";
        radioButton.id = "radio" + i.toString();
        radioButton.onchange = radioButtonChanged;
        radioButton.value = i.toString();
        radioButton.checked = true;
        element.appendChild(radioButton);
        
        var label = document.createElement("label");
        label.setAttribute('for', "radio" + i.toString());
        
        var span = document.createElement("span");
        label.appendChild(span);
        
        element.appendChild(label);
    }
    document.getElementById("radio0").checked = true;
    this.colorGlyphs[this.getActiveColorIndex()].visible = true;
};

CanvasState.prototype.drawBackground = function() {
    var lightness = this.colorGlyphs[this.getActiveColorIndex()].z;
    
    var context = this.background.getContext("2d");
    
    var width  = this.background.width;
    var height = this.background.height;
    
    var centerX = width / 2;
    var centerY = height / 2;
    var lineWidth = 2;
    var radius = Math.min(width/2, height/2) - lineWidth;
    
    var imageData = context.createImageData(width, height);
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
            if ((Math.sqrt(Math.pow((x - centerX + 0.5) / radius,2) + Math.pow((y - centerY + 0.5) / radius,2))) < 1) {
                var index = 4 * (x + y * width);
                var color = chroma.lch(
                    lightness,
                    getSaturation01(x / radius - 1, y / radius - 1) * 100,
                    getHue(x / radius - 1, y / radius - 1) / (2 * Math.PI) * 360).rgb();
                imageData.data[index + 0] = color[0];
                imageData.data[index + 1] = color[1];
                imageData.data[index + 2] = color[2];
                imageData.data[index + 3] = 255;
            }
        }
    }
    context.putImageData(imageData, 0, 0);
};

CanvasState.prototype.drawSliderBackground = function() {
    var lightness = this.colorGlyphs[this.getActiveColorIndex()].z;
    
    var context = this.sliderBackground.getContext("2d");
    
    var width  = this.sliderBackground.width;
    var height = this.sliderBackground.height;
    
    var centerX = width / 2;
    var centerY = height / 2;
    var lineWidth = 2;
    var radius = Math.min(width/2, height/2) - lineWidth;
    
    var imageData = context.createImageData(width, height);
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
            var index = 4 * (x + y * width);
            var colorGlyph = this.colorGlyphs[this.getActiveColorIndex()];
            var color = chroma.lch(
                x / width * 100,
                getSaturation01(colorGlyph.x, colorGlyph.y) * 100,
                getHue(colorGlyph.x, colorGlyph.y) / (2 * Math.PI) * 360).rgb();
            imageData.data[index + 0] = color[0];
            imageData.data[index + 1] = color[1];
            imageData.data[index + 2] = color[2];
            imageData.data[index + 3] = 255;
        }
    }
    context.putImageData(imageData, 0, 0);
    //document.getElementById("lightnessSlider").style.backgroundImage = " url('" + this.sliderBackground.toDataURL() + "')";
};

CanvasState.prototype.clearForeground = function() {
    this.foreground.getContext("2d").clearRect(0, 0, this.foreground.width, this.foreground.height);
};

CanvasState.prototype.drawCross = function(x,y) {
    var canvas = this.foreground;
    var context = canvas.getContext("2d");
    var width  = canvas.width;
    var height = canvas.height;
    var radius = Math.min(width/2, height/2);
    
    var crossSize = 10;
        
    var paintColor;
    if (this.colorGlyphs[this.getActiveColorIndex()].z >= 50)
        paintColor = '#000000';
    else
        paintColor = '#FFFFFF';
    context.strokeStyle = paintColor;
    context.lineWidth = 2;
    
    context.beginPath();
    context.moveTo(-crossSize + (x + 1) * radius,-crossSize + (y + 1) * radius);
    context.lineTo(crossSize + (x + 1) * radius,crossSize + (y + 1) * radius);
    context.moveTo(crossSize + (x + 1) * radius,-crossSize + (y + 1) * radius);
    context.lineTo(-crossSize + (x + 1) * radius,crossSize + (y + 1) * radius);
    context.closePath();
    context.stroke();
};

CanvasState.prototype.drawLightTraceLines = function() {
    var canvas = this.foreground;
    var context = canvas.getContext("2d");
    var width  = canvas.width;
    var height = canvas.height;
    var radius = Math.min(width/2, height/2);
    
    var centerX = width / 2;
    var centerY = height / 2;
    
    var paintColor;
    if (this.colorGlyphs[this.getActiveColorIndex()].z >= 50)
        paintColor = '#000000';
    else
        paintColor = '#FFFFFF';
    context.strokeStyle = paintColor;
    context.lineWidth = 2;
    
    for (var i = 0; i < this.colorGlyphs.length; i++) {
        if (this.colorGlyphs[i].isLightSource && this.colorGlyphs[i].visible){
            context.beginPath();
            context.moveTo(centerX, centerY);
            context.lineTo((this.colorGlyphs[i].x + 1) * radius,(this.colorGlyphs[i].y + 1) * radius);
            context.closePath();
            context.stroke();
        }
    }
};

CanvasState.prototype.drawExternalLightTraceLines = function() {
    var canvas = this.foreground;
    var context = canvas.getContext("2d");
    var width  = canvas.width;
    var height = canvas.height;
    var radius = Math.min(width/2, height/2);
    
    var paintColor;
    if (this.colorGlyphs[this.getActiveColorIndex()].z >= 50)
        paintColor = '#000000';
    else
        paintColor = '#FFFFFF';
    context.strokeStyle = paintColor;
    context.lineWidth = 2;
    
    for (var i = 0; i < this.colorGlyphs.length; i++) {
        if (this.colorGlyphs[i].drawLightTraceLines && this.colorGlyphs[i].visible){
            for (var j = 0; j < this.colorGlyphs.length; j++) {
                if (this.colorGlyphs[j].isLightSource){
                    context.beginPath();
                    context.moveTo((this.colorGlyphs[i].x + 1) * radius, (this.colorGlyphs[i].y + 1) * radius);
                    var lineToX = this.colorGlyphs[i].x + this.colorGlyphs[j].x;
                    var lineToY = this.colorGlyphs[i].y + this.colorGlyphs[j].y;
                    
                    var norm = Math.sqrt(Math.pow(lineToX,2) + Math.pow(lineToY,2)) + this.borderSize/270;
                    if (norm > 1) {
                        lineToX = lineToX / norm;
                        lineToY = lineToY / norm;
                    }
                    
                    context.lineTo((lineToX + 1) * radius, (lineToY + 1) * radius);
                    context.closePath();
                    context.stroke();
                }
            }
        }
    }
};

CanvasState.prototype.drawColorGlyphs = function() {
    var canvas = this.foreground;
    var context = canvas.getContext("2d");
    var width  = canvas.width;
    var height = canvas.height;
    var radius = Math.min(width/2, height/2);
    
    var centerX = width / 2;
    var centerY = height / 2;
    
    var lineWidth = this.borderSize;
    var borderColor;
    if (this.colorGlyphs[this.getActiveColorIndex()].z >= 50)
        borderColor = '#000000';
    else
        borderColor = '#FFFFFF';
    
    // Draw the border
    context.beginPath();
    context.arc(centerX, centerY, radius - lineWidth/2, 0, 2 * Math.PI, false);
    context.lineWidth = lineWidth;
    context.strokeStyle = '#444444';
    context.stroke();
    
    var activeColor = this.getActiveColorIndex();    
    for (var i = 0; i < this.colorGlyphs.length; i++) {
        var color = this.colorGlyphs[i].getColor();
        if (this.colorGlyphs[i].visible) {
            var dotSize;
            if (i == activeColor){
                context.lineWidth = 5;
                dotSize = 10;
            }
            else{
                context.lineWidth = 2;
                dotSize = 7;
            }
            
            context.fillStyle = color.hex();
            context.strokeStyle = borderColor;
            
            if (!this.colorGlyphs[i].locked) {
                context.beginPath();
                context.arc((this.colorGlyphs[i].x + 1) * radius,(this.colorGlyphs[i].y + 1) * radius, dotSize, 0, 2 * Math.PI, false);
                context.fill();
                context.stroke();
            } else {
                var xPos = (this.colorGlyphs[i].x + 1) * radius;
                var yPos = (this.colorGlyphs[i].y + 1) * radius;
                context.beginPath();
                context.moveTo(xPos - dotSize, yPos - dotSize);
                context.lineTo(xPos + dotSize, yPos - dotSize);
                context.lineTo(xPos + dotSize, yPos + dotSize);
                context.lineTo(xPos - dotSize, yPos + dotSize);
                context.closePath();
                context.fill();
                context.stroke();
            }
            // Change color of the selected radio button (could be done after the loop on only one)
            var span = document.getElementById("radio" + i).nextSibling.firstChild;
            span.style.backgroundColor = color.hex();
            span.style.backgroundImage = "none";
        }
        else {
            var span = document.getElementById("radio" + i).nextSibling.firstChild;
            span.style.backgroundColor = color.hex();
            span.style.backgroundImage = "url('images/icons/invisible3.svg')";
        }
    }
};

CanvasState.prototype.getMouse = function(e) {
  var element = this.foreground, offsetX = 0, offsetY = 0, mx, my;
  // Compute the total offset
  if (element.offsetParent !== undefined) {
    do {
      offsetX += element.offsetLeft;
      offsetY += element.offsetTop;
    } while ((element = element.offsetParent));
  }

  // Add padding and border style widths to offset
  // Also add the offsets in case there's a position:fixed bar
  offsetX += 0;
  offsetY += 0;

  mx = e.pageX - offsetX;
  my = e.pageY - offsetY;
  
    var canvas = this.foreground;
    
    var width  = canvas.width;
    var height = canvas.height;
    
    var radius = Math.min(width/2, height/2);
  
  // We return a simple javascript object (a hash) with x and y defined
  return {x: (mx / this.background.scrollWidth * width) / radius - 1, y: (my / this.background.scrollHeight * height) / radius - 1 };
};

CanvasState.prototype.moveDots = function(e) {
    var x = this.getMouse(e).x;
    var y = this.getMouse(e).y;
    
    var norm = Math.sqrt(Math.pow(x,2) + Math.pow(y,2)) + this.borderSize/270;
    if (norm > 1) {
        x = x / norm;
        y = y / norm;
    }
    
    if (this.selectedIndex != -1) {
        this.colorGlyphs[this.selectedIndex].x = x;
        this.colorGlyphs[this.selectedIndex].y = y;
    }
};

CanvasState.prototype.updateSelectedIndex = function(x, y, offset) {
    var index = -1;
    var minDist = 1;
    for (var i = 0; i < this.colorGlyphs.length; i++) {
        if (this.colorGlyphs[i].visible) {
            var dotX = this.colorGlyphs[i].x;
            var dotY = this.colorGlyphs[i].y;
            var dist = Math.sqrt(Math.pow(x - dotX,2) + Math.pow(y - dotY,2));
            if (dist < minDist && dist < offset) {
                minDist = dist;
                index = i;
            }
        }
    }
    this.selectedIndex = index;
    
    if (this.selectedIndex != -1) {
        var form = document.getElementById("colorButtons");
        form.elements[this.selectedIndex].checked = true;
    }
};

CanvasState.prototype.positionOverDots = function(x, y, offset) {
    for (var i = 0; i < this.colorGlyphs.length; i++) {
        if (this.colorGlyphs[i].visible) {
            var dotX = this.colorGlyphs[i].x;
            var dotY = this.colorGlyphs[i].y;
            var dist = Math.sqrt(Math.pow(x - dotX,2) + Math.pow(y - dotY,2));
            if (dist < offset) {
                return true;
            }
        }
    }
};
