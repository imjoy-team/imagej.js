// This macro is an example that shows how to process
// an image in batch mode and then display the result.

  setBatchMode(true);
  run("Clown (14K)");
  makeRectangle(104, 72, 150, 159);
  run("Fill");
  run("Select None");
  run("Rotate... ", "angle=15 interpolation=Bilinear");
  run("Smooth");
  run("Find Edges");
  run("Add...", "value=25");
  run("Gaussian Blur...", "radius=2");
  run("Median...", "radius=1");
  run("Unsharp Mask...", "gaussian=2 mask=0.60");
  setBatchMode(false); // displays the image
