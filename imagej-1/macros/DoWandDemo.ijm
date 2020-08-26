// This macro demonstrates how to use the setkeyDown() and 
// doWand()  functions  to create composite selections.

  run("Blobs (25K)");

  // create composite selection of 4 objects
  setThreshold(125, 248);
  doWand(72, 43);
  setKeyDown("shift");
  doWand(98, 77);
  setKeyDown("shift");
  doWand(105, 114);
  setKeyDown("shift");
  doWand(131, 89);
  run("Invert"); wait(2000); run("Invert");
  wait(2000);
  
  // delete 2 of the objects
  setKeyDown("alt");
  doWand(98, 77);
  setKeyDown("alt");
  doWand(105, 114);
  run("Invert"); wait(1000); run("Invert");
