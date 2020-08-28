// This script demonstrates how to use an overlay to display
// graphics and text non-destructively on an image.

  img = IJ.openImage("http://imagej.nih.gov/ij/images/blobs.gif");

  // run particle analyzer to outline blobs in overlay
  IJ.setAutoThreshold(img, "Default");
  IJ.run(img, "Analyze Particles...", "size=500 show=[Overlay Outlines] ignore");
  IJ.resetThreshold(img);
  IJ.run(img, "Overlay Options...", "stroke=red width=2 apply");
  overlay = img.getOverlay();
  overlay.drawLabels(false);

  // text
  font = new Font("SanSerif", Font.PLAIN, 28);
  roi = new TextRoi(10, 5, "This is an overlay", font);
  roi.setStrokeColor(Color.yellow);
  roi.setFillColor(new Color(0.0,0.0,0.0,0.4));
  overlay.add(roi);

  // filled polygon
  x = [45,109,126,155,145,105,49];
  y = [71,51,69,71,101,95,105];
  roi = new PolygonRoi["(int[],int[],int,int)"](x, y, x.length, Roi.POLYGON);
  roi.fitSpline();
  roi.setFillColor(new Color(0.0,0.0,1.0,0.3));
  overlay.add(roi);

  // yellow circle 
  roi = new OvalRoi(114,142,44,44);
  roi.setStrokeColor(Color.yellow);
  roi.setStrokeWidth(3);
  overlay.add(roi);

  // cyan arrow 
  roi = new Arrow(237,63,141,156);
  roi.setStrokeColor(Color.cyan);
  roi.setStrokeWidth(5);
  overlay.add(roi);

  // green line
  x = [17,68,148,225];
  y = [213,170,233,179];
  roi = new PolygonRoi["(int[],int[],int,int)"](x, y, x.length, Roi.POLYLINE);
  roi.fitSpline();
  roi.setStrokeColor(Color.green);
  roi.setStrokeWidth(4);
  img.setRoi(roi);
  overlay.add(roi);

  img.setOverlay(overlay);
  img.show();
  IJ.run(img, "Set... ", "zoom=200");
  IJ.wait(1500);
  img.setHideOverlay(true);
  IJ.wait(1500);
  img.setHideOverlay(false);


