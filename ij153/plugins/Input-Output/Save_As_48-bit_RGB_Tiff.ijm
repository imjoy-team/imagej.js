// This macro saves a 3 slice stack as a 48-bit RGB TIFF.
// ImageJ saves such stacks as 48-bit RGB TIFFs only if the
// label of the first slice is "Red". The images in the stack 
// also need to be in the range 0-65535 or other applications
// will not display the exported TIFF correctly.

  if (!(nSlices==3||bitDepth==24))
     exit("3 slice stack or RGB image required");
  setBatchMode(true);
  title = getTitle;
  run("Duplicate...", "title=&title duplicate");
  if (bitDepth==24)
     run("Make Composite");
  run("16-bit");
  Stack.getStatistics(count, mean, min, stackMax, stdDev);
  labels = newArray("Red", "Green", "Blue");
  for (i=0; i<3; i++) {
     setSlice(i+1);
     setMetadata("label", labels[i]);
     getRawStatistics(nPixels, mean, min, max);
     scale = 65535/max * (max/stackMax);
     run("Multiply...", "value=&scale slice");
     setMinAndMax(0, 65535);
  }
  saveAs("tif", "");
