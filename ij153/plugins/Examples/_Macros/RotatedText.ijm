// This macro demonstrates how to add 
// rotated text to an overlay.

  w=500; h=500;
  newImage("Untitled", "8-bit black", w, h, 1);
  setFont("SanSerif", 24)
  setColor("cyan");
  for (angle=0; angle<360; angle+=45)
     Overlay.drawString("Rotated "+angle+" degrees", w/2, h/2, angle);
  Overlay.show;
 
