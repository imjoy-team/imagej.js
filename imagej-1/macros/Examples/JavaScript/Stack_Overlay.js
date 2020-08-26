// This script demonstrates the use of the roi.setPosition()
// and IJ.pad() methods by adding an overlay to a stack.

  img = IJ.openImage("http://imagej.nih.gov/ij/images/bat-cochlea-volume.zip");
  IJ.setThreshold(img, 255, 255);
  font = new Font("SansSerif", Font.PLAIN, 18);
  overlay = new Overlay();
  n = img.getStackSize();
  for (i=1; i<=n; i++) {
     img.setSlice(i);
     roi = ThresholdToSelection.run(img);
     roi.setPosition(i);
     roi.setStrokeColor(Color.red);
     roi.setStrokeWidth(2);
     overlay.add(roi);
     roi = new TextRoi(5, 5, IJ.pad(i,3), font);
     roi.setStrokeColor(Color.white);
     roi.setPosition(i);
     overlay.add(roi);
  }
  img.setOverlay(overlay);
  IJ.resetThreshold(img);
  img.show();
  IJ.run(img, "Set... ", "zoom=200");
  IJ.run(img, "Animation Options...", "speed=7");
  IJ.doCommand(img, "Start Animation [\\]");


