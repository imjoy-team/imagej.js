// This script demonstrates how to add rotated text
// to an overlay. It requires ImageJ 1.48q or later.

  w=500, h=500;
  imp = IJ.createImage("Untitled", "8-bit black", w, h, 1);
  font = new Font("SanSerif", Font.PLAIN, 24);
  overlay = new Overlay();
  for (angle=0; angle<360; angle+=45) {
     roi = new TextRoi("Rotated "+angle+" degrees", w/2, h/2, font);
     roi.setStrokeColor(Color.cyan);
     roi.setAngle(angle);
     overlay.add(roi);
  }
  imp.setOverlay(overlay);
  imp.show();
