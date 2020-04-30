function sendEvent(type) {
    new ExternalObject("lib:\PlugPlugExternalObject"); // The next line fails unless this is called
    var event = new CSXSEvent();
    event.type = type;
    event.dispatch();
}

sendEvent("KalleWheelEvent_DecreaseLightness");