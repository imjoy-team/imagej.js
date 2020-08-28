// This macro demonstrates how to display graphics
// and text in a non-destructive image overlay.

  run("Blobs (25K)");

  // run particle analyzer to outline blobs in overlay
  setAutoThreshold("Default");
  run("Analyze Particles...", "size=500 show=[Overlay Outlines] ignore");
  run("Overlay Options...", "stroke=red width=2 apply");
  Overlay.drawLabels(false);
  resetThreshold;

  // text
  setFont("Sanserif", 24);
  makeText("This is an overlay", 30, 10);
  Roi.setStrokeColor("yellow");
  Overlay.addSelection("", 0, "#55000000"); // black, alpha=0.33

  // filled polygon
  makePolygon(45,71,109,51,126,69,155,71,145,101,105,95,49,105);
  run("Fit Spline");
  Overlay.addSelection("", 0, "#440000ff"); // blue, alpha=0.27

  // yellow circle
  makeOval(114, 142, 44, 44);
  Overlay.addSelection("yellow", 3);
  
  // cyan arrow 
  makeArrow(237, 63, 141, 156, "filled");
  Overlay.addSelection("cyan", 5);


  // green line
  makeLine(17,213,68,170,148,233,225,179);
  run("Fit Spline");
  Overlay.addSelection("green", 4);

  run("Select None");
  run("Set... ", "zoom=200");
  wait(1500);
  Overlay.hide;
  wait(1500);
  Overlay.show;
 

