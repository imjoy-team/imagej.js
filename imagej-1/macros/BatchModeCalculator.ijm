// This macro demonstrates how to use
// the Image Calculator in batch mode.

  setBatchMode(true);
  run("Clown (14K)");
  img1 = getTitle();
  run("Lena (68K)");
  img2 = getTitle();
  run("Image Calculator...", 
      "image1=&img1 operation=Average image2=&img2 create");
  run("Rename...", "title=Sum");
  setBatchMode(false);
