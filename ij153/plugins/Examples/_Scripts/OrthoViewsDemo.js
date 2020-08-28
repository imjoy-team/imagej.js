// This script demonstrates how to use the getCrossLoc() and
// setCrossLoc() methods of the Orthogonal_Views class.

  IJ.run("Close All");
  imp = IJ.openImage("http://rsb.info.nih.gov/ij/images/t1-head.zip");
  imp.show();
  IJ.run(imp, "Orthogonal Views", "");
  ov = Orthogonal_Views.getInstance();
  IJ.wait(1000);
  loc = ov.getCrossLoc();
  x=loc[0]; y=loc[1]; z=loc[2]; 
  //print(x+", "+y+", "+z);
  width = imp.getWidth();
  height = imp.getHeight();
  depth = imp.getStackSize();
  for (i=0; i<width; i++) {
     ov.setCrossLoc(i, y, z);
     IJ.wait(20);
  }
  ov.setCrossLoc(x, y, z);
  for (i=0; i<height; i++) {
     ov.setCrossLoc(x, i, z);
     IJ.wait(20);
  }
  ov.setCrossLoc(x, y, z);
  for (i=0; i<depth; i++) {
     ov.setCrossLoc(x, y, i);
     IJ.wait(20);
  }
  ov.setCrossLoc(x, y, z);

