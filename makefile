all:
	ZXPSignCmd -sign "KalleWheel/" KalleWheel.zxp myCert.p12 $(pw) -tsa http://timestamp.digicert.com/

old:
	ZXPSignCmd -sign "KalleWheel/" KalleWheel.zxp myCert.p12 $(pw) -tsa https://timestamp.geotrust.com/tsa

clean:
	rm KalleWheel.zxp