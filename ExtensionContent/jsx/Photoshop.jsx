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

function getForegroundColorRGB() {
    var json = "{\"r\":\"" + app.foregroundColor.rgb.red +
             "\", \"g\":\"" + app.foregroundColor.rgb.green +
             "\", \"b\":\"" + app.foregroundColor.rgb.blue + "\"}";
    json = '/*' + json + '*/'; // Wrap the JSON
    sendEvent("colorImported", json);
};


var xLib;
try {
	xLib = new ExternalObject("lib:\PlugPlugExternalObject");
} catch(e) { alert("Missing ExternalObject: "+e); }
 
// send an event from the tool VM
function sendEvent(type, dataObject) {
	if (xLib) {
		var eventObj = new CSXSEvent();
		eventObj.type = type;
		eventObj.data = dataObject;
		eventObj.dispatch();
	}
}