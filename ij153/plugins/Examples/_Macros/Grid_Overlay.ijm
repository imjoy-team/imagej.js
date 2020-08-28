// This macro demonstrates how to use the Image>Overlay>Add Selection
// command to draw a line grid on an image in a non-destructive overlay.

   requires("1.43j");
   color = "red";
   nLines = 20;
   if (nImages==0) run("Boats (356K)");
   run("Remove Overlay");
   width = getWidth;
   height = getHeight;
   tileWidth = width/(nLines+1);
   tileHeight = tileWidth;
   xoff=tileWidth;
   while (true && xoff<width) { // draw vertical lines
      makeLine(xoff, 0, xoff, height);
      run("Add Selection...", "stroke="+color);
      xoff += tileWidth;
   }
   yoff=tileHeight;
   while (true && yoff<height) { // draw horizonal lines
      makeLine(0, yoff, width, yoff);
      run("Add Selection...", "stroke="+color);
      yoff += tileHeight;
   }
   run("Select None");
