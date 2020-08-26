// This script demonstrates how to use an Overlay to display
// graphics and text non-destructively on an image.

  img = IJ.openImage("http://imagej.nih.gov/ij/images/blobs.gif");
  overlay = new Overlay();
  font = new Font("SanSerif", Font.PLAIN, 28);
  roi = new TextRoi(10, 5, "This is an overlay", font);
  roi.setStrokeColor(Color.yellow);
  roi.setFillColor(new Color(0.0,0.0,0.0,0.5));
  overlay.add(roi);
  roi = new Roi(30,70,200,150);
  roi.setStrokeColor(Color.blue);
  roi.setFillColor(new Color(0.0,0.0,1.0,0.3));
  overlay.add(roi);
  roi = new OvalRoi(60,60,140,140);
  roi.setStrokeColor(Color.green);
  roi.setStrokeWidth(15);
  overlay.add(roi);
  roi = new Line(30,70,230,230);
  roi.setStrokeColor(Color.red);
  roi.setStrokeWidth(18);
  overlay.add(roi);
  x = [18,131,148,242];
  y = [167,104,232,172];
  roi = new PolygonRoi["(int[],int[],int,int)"](x, y, x.length, Roi.POLYLINE);
  roi.fitSpline();
  roi.setStrokeColor(Color.blue);
  roi.setStrokeWidth(12);
  img.setRoi(roi);
  overlay.add(roi);
  img.setOverlay(overlay);
  img.show();
