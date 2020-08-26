  w = h = 500;
  imp = IJ.createImage("Untitled", "8-bit black", w, h, 1);
  overlay = new Overlay();
  font = new Font("SansSerif", Font.BOLD, 20);
  text = "This script demonstrates how to\n"
     + "add centered and right-justified\n"
     + "text to an overlay.\n"
     + "It requires ImageJ 1.48k or later.";
  roi = new TextRoi(0, 10, w, 100, text, font);
  roi.setStrokeColor(Color.white);
  roi.setJustification(TextRoi.CENTER);
  overlay.add(roi);
  text = "This is one line of right justified text";
  roi = new TextRoi(0, 200, w-10, 25, text, font);
  roi.setJustification(TextRoi.RIGHT);
  overlay.add(roi);
  text = "These are two lines of\nright justified text";
  roi = new TextRoi(0, 250, w-10, 50, text, font);
  roi.setJustification(TextRoi.RIGHT);
  overlay.add(roi);
  imp.setOverlay(overlay);
  text = "This is a line of left-justified test";
  roi = new TextRoi(10, 350, text, font);
  overlay.add(roi);
  imp.setOverlay(overlay);
  imp.show();
