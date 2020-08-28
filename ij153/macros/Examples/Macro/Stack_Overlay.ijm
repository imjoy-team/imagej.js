// This macro demonstrates the use of the Overlay.setPosition()
// and IJ.pad() functions by adding an overlay to a stack.

  setBatchMode(true);
  open("http://imagej.nih.gov/ij/images/bat-cochlea-volume.zip");
  setThreshold(255, 255);
  setFont("SansSerif", 18);
  setColor("white");
  for (i=1; i<=nSlices; i++) {
     setSlice(i);
     run("Create Selection");
     run("Add Selection...", "stroke=red width=2");
     Overlay.setPosition(i);
     Overlay.drawString(IJ.pad(i,3), 5, 23);
     Overlay.setPosition(i);
  }
  run("Select None");
  resetThreshold;
  setBatchMode(false);
  run("Set... ", "zoom=200");
  run("Animation Options...", "speed=7");
  doCommand("Start Animation [\\]");




