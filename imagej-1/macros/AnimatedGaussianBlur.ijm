// Animated Gaussian Blur
//
// Creates a 51 frame stack containing a copy of the current 
// image plus copies blurred using the Gaussian Blur filter
// with the radius varying between 1 and 50.

  if (nImages==0)
     run("Blobs (25K)");
  inc=1; max=50;
  run("Select All");
  run("Copy");
  setBatchMode(true);
  run("Duplicate...", "title=[Animated Gaussian Blur]");
  slice = 0;
  for (radius=inc; radius<=max; radius+=inc) {
     run("Add Slice");
     run("Paste");
     run("Gaussian Blur...", "slice radius="+radius);
     setMetadata("radius="+radius);
     showProgress(radius, max/inc);
  }
  setSlice(1);
  setMetadata("original");
  setBatchMode(false);
  run("Select None");
  doCommand("Start Animation")
