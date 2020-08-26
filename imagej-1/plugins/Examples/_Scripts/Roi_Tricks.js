// This script demonstrates various ways to display an ROI

  IJ.run("Blobs (25K)");
  img = IJ.getImage();
  roi = new Roi(50,50,150,150);
  img.setRoi(roi);
  show(img, "Default ROI");

  roi.setStrokeWidth(8);
  show(img, "Wide Outline");

  roi.setStrokeColor(Color.red);
  show(img, "Red Outline");

  roi.setStrokeWidth(15);
  roi.setStrokeColor(new Color(1.0,0.0,0.0,0.4));
  show(img, "Transparent Outline");

  roi.setFillColor(Color.blue);
  show(img, "Blue Filled");

  roi.setFillColor(new Color(0.0,0.0,1.0,0.25));
  show(img, "Transparent Blue");

  function show(img, name) {
     img.setTitle(name);
     img.draw();
     IJ.wait(3000);
  }
   
