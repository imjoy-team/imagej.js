// This macro demonstrates how to use the ROI Manager to display 
// graphics and text in a non-destructive image overlay.
// JavaScript version: http://rsb.info.nih.gov/ij/macros/js/CreateOverlay.js

  requires("1.43h");
  run("Blobs (25K)");
  setBatchMode(true);
  roiManager("reset");
  setFont("Sanserif", 24);
  makeText("This is an overlay", 30, 10);
   roiManager("Add", "red");
  roiManager("Set Fill Color", "#88000000"); // argb, alpha=0.53
  makePolygon(12,77,80,53,126,73,205,56,247,128,181,103,117,94,29,126);
  run("Fit Spline");
  roiManager("Add");
  roiManager("Select", 1);
  roiManager("Set Fill Color", "#880000ff");
  makeOval(90, 110, 90, 90);
  roiManager("Add", "yellow", 10);
  makeLine(38,176,71,220,174,238,237,197);
  run("Fit Spline");
  roiManager("Add", "green", 10);
  run("Select None");
  roiManager("Show All without labels");
  wait(3000);
  roiManager("Select", 2);
  roiManager("Set Color", "#ff00ff"); // rgb (magenta)
  roiManager("Set Line Width", 15);
  run("Select None");
  roiManager("Deselect");
  wait(2000);
  setOption("Show All", false);
  wait(2000);
  setOption("Show All", true);
