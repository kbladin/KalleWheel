all:
	ZXPSignCmd -sign "ExtensionContent/" KalleWheel.zxp myCert.p12 $(pw) -tsa http://timestamp.digicert.com/

old:
	ZXPSignCmd -sign "ExtensionContent/" KalleWheel.zxp myCert.p12 $(pw) -tsa https://timestamp.geotrust.com/tsa

clean:
	rm KalleWheel.zxp