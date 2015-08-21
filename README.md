# KalleWheel
A custom color wheel extension for Adobe Photoshop.
Using CEP to create a color wheel with HTML, JavaScript and CSS.

KalleWheel is an extension currently at the experiment state that is
made to make it easier for digital painters to choose colors in
Photoshop.

Icons made by Freepik from [www.flaticon.com](www.flaticon.com/)

![](doc_images/kallewheel_1.png "KalleWheel")

## Features

### HCL color space

A color choosen KalleWheel is defined by the three components Hue (set by the angle from the center of the wheel), Chroma (similar to saturation, determined by the distance from the center of the wheel), and Lightness (set by the slider).

The HCL color space is directly derived from the CIELab color space which is made to reduce the interference our human perception have with the colors percieved. Comparing to the most common color space used by digital artists (HSB: Hue, Saturation, Brightness) a certain lightness will be percieved equally light (almost) independent on the other two light components. An example of this is when comparing a yellow color to a blue color. Even though the brightness (in HSB color space) is equal, the yellow color will seem brighter due to the way we percieve the colors. In CIELab color space however, a yellow color with a certain lightness will seem roughly as light as a blue color with the same lightness.

![](doc_images/random_colors.png "Comparing random colors of same lightness")

Photoshop actually uses the CIELab colorspace when converting to grayscale, which also has to do with why the grayscale image to the right seems to have more diverse lightness between colors. But looking only at the color versions of the images above it is quite clear that the HCL color space better preserves the lightness of the colors. 

The use of the HCL color space is due to [the javascript library Chroma](https://github.com/gka/chroma.js/) by Gregor Aisch.

### Many colors in the same picker wheel

Photoshops default color picker does not allow the user to have many colors on the same picker and only change one of them at the time. The default picker only changes the active color which can be the background color or the foreground color of Photoshop.

There is a standard extension that comes with Photoshop called Adobe Color-themes (formerly Kuler) which KalleWheel is roughly based on. Adobe color themes lets you define up to five dependent or independent colors. Adobe Color-themes, however, is not made for picking colors for painting but rather to create color themes for graphical applications or similar. I stripped away the things that I did not need from Adome Color-themes and added the things that were more important, for example more color swatches. Currently you can define twelve colors on the wheel at the same time. So far I have never needed this many colors but it is nice to have in case.

![](doc_images/swatches1.png "Photoshop default color picker")
![](doc_images/swatches2.png "Adobe Color-themes")
![](doc_images/swatches3.png "KalleWheel")

### Light source direction indicators

The greatest advantage of having the Hue and Chroma light components on a 2D surface where Hue is directly dependent on the angle and Chroma goes from low in the center of the circle to high for bigger distances; is the possibility to take advantage of the fact that Hue and Chroma are not independent when it comes to the colors of illuminated real world objects. Using the standard Photoshop color picker with Saturation and Brightness orthogonal on a plane and Hue on a slider it is so much harder to transition for example from a pink to a green color by shifting two independent sliders (green and pink are opposite each other on the color wheel). Using the type of color wheel as KalleWheel or Adobe Color-themes are using, this is a much easier task. Just drag the "color dot" from the pink towards the green on the circle; no need to handle two independent controllers.

This was actually the reason I started to paint using the Adobe Color-themes extension and eventually decided to build my own extension.

What is possible in KalleWheel that I have not seen in any other color picker is to define light source colors and then see how different colors are affected (shifted) by these light sources. This is done by displaying lines which are directed in the direction of the light source ([Some theory on this topic can be found here](http://kbladin.se/tools/color_changes.php), this is written before i made KalleWheel). The tool is just made to be used as a guideline but actually helps when picking colors for illuminated objects when painting digitally.

![](doc_images/directions.png "KalleWheel direction indicators")

### Other "improvements" compared to Adobe Color-themes

Here I list some more differences between KalleWheel and Adobe Color-themes, considering KalleWheel is more directly made as a painting tool and not a color theme creator.

* HCL / CIELab color space (mentioned above).
* More color swatches (mentioned above).
* Hide or display direction indicators for colors changed due to colored light sources (mentioned above).
* Removed unnecesary things. There is no need to know the color codes for painting. No need for extra sliders that only take up space.
* Easier to control Lightness. By having one single slider for Lightness and the possibility to see the Lightness-value and change it by clicks the user hopefully gets more control over it. This is important since Lightness is generally the most important of the three color components when it comes to painting to create the illusion of a 3D scene.
* Bigger space for the actual color wheel for higher precision
* Possibility to lock and / or hide colors. Locking colors is useful if they are light source colors which are usually constant in a scene.
* Less lag (at least on my computer) when moving colors around the color wheel surface.
* Changing the Lightness of a color will redraw the entire color wheel with the same lightness. This makes it easier to see what color to change to when shifting the Hue / Chroma.
* Possibility to resize the extension window.

### Current limitations

* Photoshop's internal colors are saved in the RGB format. This sometimes leads to problems due to some color ambiguity that is appearent between RGB and CIELab. Some different CIELab color coordinates yealds the same RGB color coordinates (this happens mostly with high Chroma colors since the RGB color space is just a sub space of the CIELab space).

* I have only been able to test this extension on one computer with one OS in Photoshop CC14 and CC15. I would like to see how it works on other operating systems and other versions of Photoshop but so far it has not been possible to do this.

### Things I would like to add

* Possibility to save and load "scenes" with defined colors
* Maybe a clearer User Inteface design
* [Suggestions?](mailto:kallebladin@gmail.com)