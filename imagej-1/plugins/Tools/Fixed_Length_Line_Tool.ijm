// Fixed Length Line Tool
// This ImageJ tool macro allows for drawing a line with a given
// fixed length or maximum length.
// One can also draw a line centered at the point where the
// mouse button was pressed.
// Hold the shift key to constrain the direction.
//
// Authors: Michael Schmid & Wayne Rasband, 2015-Oct-04

var desiredLength = 250; //in scaled units
var isMaxlength = false; //not fixed, only maximum line length
var isCentered = false;

macro "Fixed Length Line Tool - C037L2ae4L2be5C888L083eB10Lc1f7" {
    leftClick = 16;
    shift = 1;
    getPixelSize(unit, pixelWidth, pixelHeight);
    getCursorLoc(x0, y0, z, flags);
    lastX = x0;
    lastY = y0;
    while (true) {
          getCursorLoc(x, y, z, flags);
          if (flags&leftClick == 0) exit();
          if (x==lastX && y==lastY)       //no change, don't update live profile etc.
                wait(10);
          else {
                lastX = x;
                lastY = y;
                dx = (x - x0);
                dy = (y - y0);
                if (flags&shift != 0) {
                      angle = atan2(y - y0, x - x0);
                      angle = PI/4*round(4*angle/PI);
                      len = maxOf(abs(dx), abs(dy));
                      dx = len*cos(angle);
                      dy = len*sin(angle);
                }
                dxs = dx * pixelWidth;       //in scaled units
                dys = dy * pixelHeight;
                length = sqrt(dxs*dxs + dys*dys);
                if (isCentered)
                      length = 2*length;
                enlageFactor = desiredLength/length;
                if (isMaxlength && enlageFactor > 1)
                      enlageFactor = 1;
                if (isCentered) {
                      xS = x0 - dx*enlageFactor;
                      yS = y0 - dy*enlageFactor;
                } else {
                      xS = x0;
                      yS = y0;
                }
                x = x0 + dx*enlageFactor;
                y = y0 + dy*enlageFactor;
                makeLine(xS, yS, x, y);
          }
    }
}

macro "Fixed Length Line Tool Options" {
    getPixelSize(unit, pixelWidth, pixelHeight);
    if (unit=="pixel") unit="pixels";
    Dialog.create("Fixed Length Line Tool Options");
    Dialog.addNumber("Desired line length", desiredLength, 2, 10, unit);
    Dialog.addCheckbox("This length is maximum", isMaxlength);
    Dialog.addCheckbox("Centered", isCentered);
    Dialog.addMessage("Hold <shift> key to constrain directions");
    Dialog.show();
    desiredLength = Dialog.getNumber();
    isMaxlength = Dialog.getCheckbox();
    isCentered = Dialog.getCheckbox();
}
