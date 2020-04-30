function getHue(x, y) {
	var theta = Math.atan2(y,-x) + Math.PI;
	return theta;
};

function getSaturation01(x, y) {
	return (Math.sqrt(Math.pow(x,2) + Math.pow(y,2)));
};

function GamutMask (maskCanvas) {
    this.maskCanvas = maskCanvas;
    this.vertices = [];
    this.useMask = true;
    this.editingMask = false;
    this.selectedIndex = -1;
}

GamutMask.prototype.addVertex = function(x, y) {
	this.vertices.push([x,y]);
};

GamutMask.prototype.removeVertex = function(i) {
	this.vertices.pop(i);
};

GamutMask.prototype.isInside = function(x, y) {
    if (!this.useMask) {
        return true;
    }
    // https://github.com/substack/point-in-polygon
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
    
    var inside = false;
    for (var i = 0, j = this.vertices.length - 1; i < this.vertices.length; j = i++) {
        var xi = this.vertices[i][0], yi = this.vertices[i][1];
        var xj = this.vertices[j][0], yj = this.vertices[j][1];
        
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    
    return inside;
};

function project(x0, y0, x1, y1, x, y) {
    var p = new KVec2(x, y);
    var p0 = new KVec2(x0, y0);
    var p1 = new KVec2(x1, y1);

    var v = p1.sub(p0);
    var a = p.sub(p0);
    var vn = v.normalized();
    var pcomp = a.dot(vn);
    var ap = vn.mul(pcomp);
    var app = a.sub(ap);
    var ppdist = app.norm();

    var pfin = p0.add(ap);

    var pdist = ap.norm();
    var vdist = v.norm();
    var inside = true;
    if (pdist > vdist || pcomp < 0) {
        inside = false;
    }
    
    return {x : pfin.x, y : pfin.y, dist : ppdist, inside : inside};
}

GamutMask.prototype.project = function(x, y) {
    if (this.isInside(x, y)) {
        return [x, y];
    }
    
    // First edge is from last vertex to fist
    var xProj = x, yProj = y;
    var x0 = this.vertices[this.vertices.length-1][0], y0 = this.vertices[this.vertices.length-1][1];
    var x1 = this.vertices[0][0], y1 = this.vertices[0][1];
    var minDist = 2;
    proj = project(x0, y0, x1, y1, x, y);
    if (proj.inside) {
        xProj = proj.x;
        yProj = proj.y;
        minDist = proj.dist;
    }
    
    // Other edges
    for (var i = 0; i < this.vertices.length - 1; i++) {
        var x0 = this.vertices[i][0], y0 = this.vertices[i][1];
        var x1 = this.vertices[i+1][0], y1 = this.vertices[i+1][1];
        var proj = project(x0, y0, x1, y1, x, y);
        if (proj.dist < minDist && proj.inside) {
            xProj = proj.x;
            yProj = proj.y;
            minDist = proj.dist;
        }
    }

    // Vertices
    for (var i = 0; i < this.vertices.length; i++) {
        var dx = x - this.vertices[i][0];
        var dy = y - this.vertices[i][1];
        var vertDist = Math.sqrt(dx * dx + dy * dy);
        if (vertDist < minDist) {
            minDist = vertDist;
            xProj = this.vertices[i][0];
            yProj = this.vertices[i][1];
        }
    }
 
    return [xProj, yProj];
}

GamutMask.prototype.moveVertices = function(x, y) {
    borderSize = 20;
    var norm = Math.sqrt(Math.pow(x,2) + Math.pow(y,2)) + borderSize/270;
    if (norm > 1) {
        x = x / norm;
        y = y / norm;
    }

    if (this.selectedIndex != -1) {
        this.vertices[this.selectedIndex][0] = x;
        this.vertices[this.selectedIndex][1] = y;
    }
};

GamutMask.prototype.updateSelectedIndex = function(x, y, offset) {
    var index = -1;
    var minDist = 1;
    for (var i = 0; i < this.vertices.length; i++) {
        var dotX = this.vertices[i][0];
        var dotY = this.vertices[i][1];
        var dist = Math.sqrt(Math.pow(x - dotX,2) + Math.pow(y - dotY,2));
        if (dist <= minDist && dist <= offset) {
            minDist = dist;
            index = i;            
        }
    }
    this.selectedIndex = index;
};

GamutMask.prototype.drawMask = function() {
    var context = this.maskCanvas.getContext("2d");
    
    var width  = this.maskCanvas.width;
    var height = this.maskCanvas.height;
    
    var centerX = width / 2;
    var centerY = height / 2;
    var lineWidth = 2;
    var radius = Math.min(width/2, height/2) - lineWidth;
    
    // Fill the mask
    context.clearRect(0, 0, width, height);

    if (!this.useMask) {
        return;
    }
    context.globalCompositeOperation = 'xor';
    context.fillStyle = "black";
    //context.fillRect(0, 0, width, height);
    context.beginPath();
    context.arc(centerX, centerY, radius - lineWidth/2, 0, 2 * Math.PI, false);
    context.fill();
    // Set xor operation
    // Draw the shape you want to take out

    context.fillStyle = "black";
    context.beginPath();
    x = (this.vertices[0][0] + 1) * radius;
    y = (this.vertices[0][1] + 1) * radius;
    context.moveTo(x, y);
    for (var index = 1; index < this.vertices.length; index++) {
        x = (this.vertices[index][0] + 1) * radius;
        y = (this.vertices[index][1] + 1) * radius;
        context.lineTo(x, y);
    }
    context.closePath();
    context.fill();
};

GamutMask.prototype.serialize = function() {
    var dict = {};
    dict["vertices"] = this.vertices;
    dict["useMask"] = this.useMask;
    return JSON.stringify(dict);
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

ColorGlyph.prototype.setColorLAB = function(l, a, b) {
    var LCH = chroma.lab(l, a, b).lch();
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

function CanvasState(background, foreground, maskCanvas, sliderBackground, blendSliderBackground) {
    this.background = background;
    this.foreground = foreground;
    this.sliderBackground = sliderBackground;
    this.blendSliderBackground = blendSliderBackground;
    this.colorGlyphs = [];
    this.backgroundColorGlyph = new ColorGlyph(0,0,0);
    this.borderSize = 20;
    this.mouseDown = false;
    this.mouseOver = false;
    this.selectedIndex = -1; // Only the clicked index
    
    this.GamutMask = new GamutMask(maskCanvas);
    this.GamutMask.addVertex(-0.5,-0.5);
    this.GamutMask.addVertex(0.5,-0.5);
    this.GamutMask.addVertex(0.5,0.5);
    this.GamutMask.addVertex(-0.5,0.5);
    this.GamutMask.useMask = false;

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

CanvasState.prototype.getForegroundColorGlyph = function() {
    return this.colorGlyphs[this.getActiveColorIndex()];
}

CanvasState.prototype.addColorRadioButtons = function(element) {
    for (var i = 0; i < this.colorGlyphs.length; i++) {
        var radioButton = document.createElement("input");
        radioButton.type = "radio";
        radioButton.class = "colorRadioButton";
        radioButton.name = "color";
        radioButton.id = "radio" + i.toString();
        radioButton.onchange = radioButtonChanged;
        radioButton.value = i.toString();
        radioButton.checked = true;
        element.appendChild(radioButton);
        
        var label = document.createElement("label");
        label.setAttribute('for', "radio" + i.toString());
        
        var span = document.createElement("span");
        span.setAttribute('data-tippy-content', "color " + (i + 1).toString());
        label.appendChild(span);
        
        element.appendChild(label);
    }
    document.getElementById("radio0").checked = true;
    this.getForegroundColorGlyph().visible = true;
};

CanvasState.prototype.drawBackground = function() {
    var lightness = this.getForegroundColorGlyph().z;
    
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
    var lightness = this.getForegroundColorGlyph().z;
    
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
            var colorGlyph = this.getForegroundColorGlyph();
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

CanvasState.prototype.blendColors = function(c1, c2, t) {
    var a0 = (1 - t) * c1.lab()[0];
    var a1 = (1 - t) * c1.lab()[1];
    var a2 = (1 - t) * c1.lab()[2];
    var b0 = t * c2.lab()[0];
    var b1 = t * c2.lab()[1];
    var b2 = t * c2.lab()[2];
    interpColor = chroma.lab(a0 + b0, a1 + b1, a2 + b2);
    return interpColor;
}

CanvasState.prototype.drawBlendSliderBackground = function() {
    var context = this.blendSliderBackground.getContext("2d");
    
    var width  = this.blendSliderBackground.width;
    var height = this.blendSliderBackground.height;
    
    var centerX = width / 2;
    var centerY = height / 2;
    var lineWidth = 2;
    var radius = Math.min(width/2, height/2) - lineWidth;

    var foregroundColor = this.getForegroundColorGlyph().getColor();
    
    var imageData = context.createImageData(width, height);
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
            var index = 4 * (x + y * width);
            var t = x / width;
            interpColor = this.blendColors(foregroundColor, this.backgroundColorGlyph.getColor(), t);
            
            //var colorGlyph = this.getForegroundColorGlyph();
            //var color = chroma.lch(
            //    x / width * 100,
            //    getSaturation01(colorGlyph.x, colorGlyph.y) * 100,
            //    getHue(colorGlyph.x, colorGlyph.y) / (2 * Math.PI) * 360).rgb();
            imageData.data[index + 0] = interpColor.rgb()[0];
            imageData.data[index + 1] = interpColor.rgb()[1];
            imageData.data[index + 2] = interpColor.rgb()[2];
            imageData.data[index + 3] = 255;
        }
    }
    context.putImageData(imageData, 0, 0);
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
    if (this.getForegroundColorGlyph().z >= 50)
        paintColor = '#000000';
    else
        paintColor = '#FFFFFF';
    context.strokeStyle = paintColor;
    context.lineWidth = 4;
    
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
    if (this.getForegroundColorGlyph().z >= 50)
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
    if (this.getForegroundColorGlyph().z >= 50)
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


CanvasState.prototype.drawBlendLine = function() {
    var canvas = this.foreground;
    var context = canvas.getContext("2d");
    var width  = canvas.width;
    var height = canvas.height;
    var radius = Math.min(width/2, height/2);
    
    var paintColor;
    if (this.getForegroundColorGlyph().z >= 50)
        paintColor = '#000000';
    else
        paintColor = '#FFFFFF';
    context.strokeStyle = paintColor;
    context.lineWidth = 2;
    
    if (this.getForegroundColorGlyph().drawLightTraceLines && this.getForegroundColorGlyph().visible){
        context.setLineDash([5]);
        context.beginPath();
        var lineFromX = (this.backgroundColorGlyph.x + 1) * radius;
        var lineFromY = (this.backgroundColorGlyph.y + 1) * radius;
        var lineToX = (this.getForegroundColorGlyph().x + 1) * radius;
        var lineToY = (this.getForegroundColorGlyph().y + 1) * radius;
    
        context.moveTo(lineFromX, lineFromY);
        context.lineTo(lineToX, lineToY);
        context.stroke();
        context.setLineDash([]);
    }
};

CanvasState.prototype.drawBlendGlyph = function(blendValue) {

    if (this.getForegroundColorGlyph().drawLightTraceLines && this.getForegroundColorGlyph().visible){
            
        var canvas = this.foreground;
        var context = canvas.getContext("2d");
        var width  = canvas.width;
        var height = canvas.height;
        var radius = Math.min(width/2, height/2);
        
        var borderColor;
        if (this.getForegroundColorGlyph().z >= 50) 
            borderColor = '#000000';
        else
            borderColor = '#FFFFFF';
        
        var dotSize = 10;

        var g0 = this.getForegroundColorGlyph();
        var g1 = this.backgroundColorGlyph;
        var a0 = 1 - blendValue;
        var a1 = blendValue;
        
        blendColorGlyph = new ColorGlyph();
        blendColorGlyph.x = g0.x * a0 + g1.x * a1;
        blendColorGlyph.y = g0.y * a0 + g1.y * a1;
        blendColorGlyph.z = g0.z * a0 + g1.z * a1; 

        var color = blendColorGlyph.getColor();

        context.lineWidth = 2;
        dotSize = 7;
    
        context.fillStyle = color.hex();
        context.strokeStyle = borderColor;
        
        context.beginPath();
        context.arc((blendColorGlyph.x + 1) * radius,(blendColorGlyph.y + 1) * radius, dotSize, 0, 2 * Math.PI, false);
        context.fill();
        context.stroke();
    }
}

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
    if (this.getForegroundColorGlyph().z >= 50) 
        borderColor = '#000000';
    else
        borderColor = '#FFFFFF';
    
    // Draw the border
    context.beginPath();
    context.arc(centerX, centerY, radius - lineWidth/2, 0, 2 * Math.PI, false);
    context.lineWidth = lineWidth;
    context.strokeStyle = '#858585';
    context.stroke();
    
    var activeColor = this.getActiveColorIndex();   
    var dotSize = 10; 
    for (var i = 0; i < this.colorGlyphs.length; i++) {
        var color = this.colorGlyphs[i].getColor();
        if (this.colorGlyphs[i].visible) {
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
                context.lineTo(xPos - dotSize, yPos - dotSize); // Last two wraps around
                context.lineTo(xPos + dotSize, yPos - dotSize); // Last two wraps around
                //context.closePath(); // closePath() somehow makes the fill not work
                context.fill();
                context.stroke();
            }
            // Change color of radio button
            var span = document.getElementById("radio" + i).nextSibling.firstChild;
            span.style.backgroundColor = color.hex();
            span.style.backgroundImage = "none";
        }
        else {
            var span = document.getElementById("radio" + i).nextSibling.firstChild;
            var color2 = color;
            lab = color2.lab(); 
            lab[0] -= 15;
            color2 = chroma.lab(lab[0], lab[1], lab[2]);
            span.style.backgroundImage = "radial-gradient(" + color.hex() + " 50%, " + color2.hex() + " 50%)";
            span.style.backgroundSize = "4px 4px";
        }
        // Draw background color glyph
        dotSize = 12;
        context.fillStyle = this.backgroundColorGlyph.getColor().hex();
        context.beginPath();

        var xPos = (this.backgroundColorGlyph.x + 1) * radius;
        var yPos = (this.backgroundColorGlyph.y + 1) * radius;
        context.moveTo(Math.cos(0 * Math.PI / 2) * dotSize + xPos, Math.sin(0 * Math.PI / 2) * dotSize + yPos);
        context.lineTo(Math.cos(1 * Math.PI / 2) * dotSize + xPos, Math.sin(1 * Math.PI / 2) * dotSize + yPos);
        context.lineTo(Math.cos(2 * Math.PI / 2) * dotSize + xPos, Math.sin(2 * Math.PI / 2) * dotSize + yPos);
        context.lineTo(Math.cos(3 * Math.PI / 2) * dotSize + xPos, Math.sin(3 * Math.PI / 2) * dotSize + yPos);
        context.lineTo(Math.cos(4 * Math.PI / 2) * dotSize + xPos, Math.sin(4 * Math.PI / 2) * dotSize + yPos); // Last two wraps around
        context.lineTo(Math.cos(5 * Math.PI / 2) * dotSize + xPos, Math.sin(5 * Math.PI / 2) * dotSize + yPos); // Last two wraps around
        //context.closePath(); // closePath() somehow makes the fill not work
        context.fill();
        context.stroke();

        //context.arc((this.backgroundColor.lab()[1] + 1) * radius,(this.backgroundColor.lab()[2] + 1) * radius, dotSize, 0, 2 * Math.PI, false);
        //context.fill();
        //context.stroke();


        // Set color of indicators
        var color = this.getForegroundColorGlyph().getColor();
        var foregroundColorDisplay = document.getElementById("foregroundColorDisplay");
        foregroundColorDisplay.style.backgroundColor = color.hex();
        foregroundColorDisplay.style.backgroundImage = "none";

        var color = this.backgroundColorGlyph.getColor();
        var foregroundColorDisplay = document.getElementById("backgroundColorDisplay");
        foregroundColorDisplay.style.backgroundColor = color.hex();
        foregroundColorDisplay.style.backgroundImage = "none";
    }
};

CanvasState.prototype.drawVerticesAndEdges = function() {
    if (!this.GamutMask.useMask || !this.GamutMask.editingMask) {
        return;
    }
    var canvas = this.foreground;
    var context = canvas.getContext("2d");
    context.globalCompositeOperation = 'source-over';
    var width  = canvas.width;
    var height = canvas.height;
    var radius = Math.min(width/2, height/2);
    

    // Edges
    var x = this.GamutMask.vertices[0][0], y = this.GamutMask.vertices[0][1];
    var xPos = (x + 1) * radius, yPos = (y + 1) * radius;

    context.fillStyle = 'grey';
    context.strokeStyle = 'white';
    context.setLineDash([5]);
    context.beginPath();
    context.moveTo(xPos, yPos);
    for (var i = 0; i < this.GamutMask.vertices.length; i++) {
        var x = this.GamutMask.vertices[i][0], y = this.GamutMask.vertices[i][1];
        var xPos = (x + 1) * radius, yPos = (y + 1) * radius;
        context.lineTo(xPos, yPos);
    }
    context.closePath();
    context.stroke();
    context.setLineDash([]);

    // Vertices
    var dotSize = 10; 
    for (var i = 0; i < this.GamutMask.vertices.length; i++) {
        context.lineWidth = 5;
        
        
        context.beginPath();
        context.arc((this.GamutMask.vertices[i][0] + 1) * radius,(this.GamutMask.vertices[i][1] + 1) * radius, dotSize, 0, 2 * Math.PI, false);
        context.fill();
        context.stroke();
    }
}

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

    if (this.GamutMask.useMask && this.GamutMask.editingMask)
    {
        this.GamutMask.moveVertices(x, y);
        this.GamutMask.drawMask();
        return;
    }
    
    var norm = Math.sqrt(Math.pow(x,2) + Math.pow(y,2)) + this.borderSize/270;
    if (norm > 1) {
        x = x / norm;
        y = y / norm;
    }
    
    if (this.selectedIndex != -1) {
        var posProj = this.GamutMask.project(x, y);
        this.colorGlyphs[this.selectedIndex].x = posProj[0];
        this.colorGlyphs[this.selectedIndex].y = posProj[1];
    }
};

CanvasState.prototype.updateSelectedIndex = function(x, y, offset) {
    this.selectedIndex = 0;
    return;
    var index = -1;
    var minDist = 1;
    for (var i = 0; i < this.colorGlyphs.length; i++) {
        if (this.colorGlyphs[i].visible) {
            var dotX = this.colorGlyphs[i].x;
            var dotY = this.colorGlyphs[i].y;
            var dist = Math.sqrt(Math.pow(x - dotX,2) + Math.pow(y - dotY,2));
            if (dist <= minDist && dist <= offset) {
                // Do not pick the locked ones unless there are only locked
                // ones to pick.
                if (!this.colorGlyphs[i].locked || index == -1) {
                    minDist = dist;
                    index = i;
                }                
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

CanvasState.prototype.serialize = function() {
    var colors = [];
    for (var i = 0; i < this.colorGlyphs.length; i++) {
        var color = {};
        color["l"] = this.colorGlyphs[i].getColor().lab()[0];
        color["a"] = this.colorGlyphs[i].getColor().lab()[1];
        color["b"] = this.colorGlyphs[i].getColor().lab()[2];
        colors.push(color);
    }
    return JSON.stringify(colors);
};