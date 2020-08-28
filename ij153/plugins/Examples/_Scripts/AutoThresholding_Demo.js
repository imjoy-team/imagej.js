// This script demonstrates how to use the
// ImageProcessor.setAutoThreshold(String)
// method that was added in ImageJ 1.42p.

  IJ.run("M51 Galaxy (177K, 16-bits)");
  img = IJ.getImage();
  ip = img.getProcessor();
  title = img.getTitle();
  methods = AutoThresholder.getMethods();
  for (i=0; i<methods.length; i++) {
     IJ.showProgress(i, methods.length);
     IJ.showStatus((i+1)+"/"+methods.length+": "+methods[i]);
     ip.setAutoThreshold(methods[i]+" dark");
     img.updateAndDraw();
     lower = ip.getMinThreshold();
     upper = ip.getMaxThreshold();
     img.setTitle(methods[i]+": "+lower+"-"+upper);
     IJ.wait(2000);
  }
  img.setTitle(title);
