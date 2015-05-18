/*
$._ext_PHXS={
    run : function() {
    

        var appName;	    
	    appName = "Hello Photoshop";	    
        alert(appName);

        
        return appName;
    },
};
*/

function setForegroundColorRGB(r, g, b) {
    var RGB = new RGBColor();
    RGB.red = r;
    RGB.green = g;
    RGB.blue = b;
    
    var sColor = new SolidColor();
    sColor.rgb = RGB;
    
    app.foregroundColor = sColor;
    
    //app.togglePalettes();    app.togglePalettes();
};