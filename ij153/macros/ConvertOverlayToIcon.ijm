// This macro converts an overlay or selection in a 16x16 image into
// a tool icon. Type "1" to create a 16x16 image. Type "b" to add a
// selection to the overlay. Type "y" to display the Properties dialog, 
// where you can set the selection's outline or fill colors. Press "2"
// to convert the overlay or selection into a tool icon. Press "3" to
// remove the overlay.

  convertOverlayToIcon();
  exit;

  macro "New Image [1]" {
     newImage("Untitled", "8-bit black", 16, 16, 1);
     run("In [+]");
     run("In [+]");
     run("In [+]");
     run("In [+]");
     run("In [+]");
     run("In [+]");
     run("In [+]");
     run("In [+]");
     run("In [+]");
  }

  macro "Convert [2]" {
     convertOverlayToIcon();
  }

  macro "Remove Overlay [3]" {
     run("Remove Overlay");
  }

  function convertOverlayToIcon() {
     requires("1.48j");
     if (getWidth>17 || getHeight>17)
        exit("Image cannot be larger then 17x17");
     if (Overlay.size==0 && selectionType==-1)
        exit("Overlay or selection required");
     icon = "";
     if (Overlay.size>0) {
        for (i=0; i<Overlay.size; i++) {
           Overlay.activateSelection(i);
           code = convertRoiToCode();
           icon = icon + code;
        }
     } else
         icon = convertRoiToCode();
     showText("macro \"Test Action Tool - "+icon+"\" { }");
  }

  function convertRoiToCode() {
     String.resetBuffer;
     type = Roi.getType;
     Roi.getCoordinates(xpoints, ypoints);
     strokeColor = Roi.getStrokeColor();
     defaultColor = Roi.getDefaultColor();
     if (strokeColor==defaultColor)
        strokeColor = "none";
     fillColor = Roi.getFillColor();
     if (type=="rectangle" || type=="oval") {
        command = "R";
        if (type=="oval") command ="O";
        if (fillColor!="none") {
           color(fillColor);
           if (command =="R")
              command = "F";
           else
              command ="V";
        } if (strokeColor!="none")
           color(strokeColor);
        Roi.getBounds(x, y, w, h);
        String.append(command);
        hex(x); hex(y); hex(w); hex(h);
        return String.buffer;
     }
     if (type=="line") {
        if (strokeColor!="none")
           color(strokeColor);
        String.append("L");
        hex(xpoints[0]);
        hex(ypoints[0]);
        hex(xpoints[1]);
        hex(ypoints[1]);
        return String.buffer;
     }
     if (type=="composite") {
        print("composite selections not supported");
        return "";
     }
     command = "G";
     if (fillColor!="none") {
        color(fillColor);
        command = "H";
     } if (strokeColor!="none")
        color(strokeColor);
     x0 = xpoints[0];
     y0 = ypoints[0];
     String.append(command);
     hex(x0); hex(y0);
     for (i=1; i<xpoints.length; i++) {
        x = xpoints[i];
        y = ypoints[i];
        hex(x); hex(y);
     }
     hex(0); hex(0);
     return String.buffer;
  }

  function hex(n) {
     n = round(n);
     if (n<0) n=0;
     max = maxOf(getWidth,getHeight);
     if (n>max) n=max;
     c = "0";
     if (n<16)
        c = toHex(n);
     else if (n==16)
        c = "g";
     else if (n==17)
        c = "h";
     String.append(c);
  }

  function color(c) {
     r = call("ij.plugin.Colors.getRed", c);
     g = call("ij.plugin.Colors.getGreen", c);
     b = call("ij.plugin.Colors.getBlue", c);
     r=parseInt(r); g=parseInt(g); b=parseInt(b);
     String.append("C");
     hex(floor(r/16)); hex(floor(g/16)); hex(floor(b/16));
  }
 
