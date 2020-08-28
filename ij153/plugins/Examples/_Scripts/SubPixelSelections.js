// This script demonstrates how to create an overlay
// consisting of sub-pixel resolution selections.
// It requires ImageJ 1.46b or later.

  imp = IJ.openImage("http://imagej.nih.gov/ij/images/blobs.gif");
  IJ.setMinAndMax(imp, 15, 225);
  overlay = new Overlay();
  line = new Line(81.5, 119.5, 87.5, 118.5);
  add(line);
  oval = new OvalRoi(79.5, 111, 8.2, 6.2);
  add(oval);
  rect = new Roi(79.5, 111, 8.2, 6.2, 1);
  add(rect);
  font = new Font("SanSerif", Font.PLAIN, 1);
  text = new TextRoi(82.3, 113.3, "center", font);
  add(text);
  ellipse = new EllipseRoi(85.5, 107.5, 91.5, 111.5, 0.40);
  add(ellipse);
  arrow = new Arrow(81.8, 108.4, 83.5, 112.5);
  arrow.setHeadSize(1.2);
  arrow.setStyle(Arrow.NOTCHED);
  add(arrow);
  font = new Font("SanSerif", Font.PLAIN, 1);
  text = new TextRoi(78.6, 107.2, "(83.5,112.5)", font);
  add(text);
  x = [77.5,78,80];
  y = [114.3,118.5,119.7];
  curve = new PolygonRoi(new FloatPolygon(x,y),Roi.POLYLINE);
  curve.fitSpline();
  add(curve);
  x = [89.7,88.5,91.5];
  y = [113,117.5,117.5];
  curve = new PolygonRoi(new FloatPolygon(x,y),Roi.POLYGON);
  add(curve);
  imp.setOverlay(overlay);
  imp.show();
  imp.setRoi(78, 108, 12, 12);
  IJ.run(imp, "To Selection", "");
  imp.killRoi();

  function add(roi) {
     roi.setStrokeWidth(0.1);
     roi.setStrokeColor(Color.red);
     overlay.add(roi);
  }
