// This macro demonstrates how to use the
// getDirectory() function.

  print("home: " + getDirectory("home"));
  print("startup: " + getDirectory("startup"));
  //print("current: " + getDirectory("current"));
  print("plugins: " + getDirectory("plugins"))
  print("macros: " + getDirectory("macros"));
  print("image: " + getDirectory("image"));
  print("temp: " + getDirectory("temp"));
  print("user selected: " + getDirectory("Select a Directory"));
  
  // Open an image in the "images" folder in the users home directory.
  // The "/" path separator works on all platforms, including Windows.
  // It is always added to the end of paths returned by getDirectory().
  dir = getDirectory("home") + "images/";
  open(dir+"Blobs.tif");
  
  // Open a lookup table in the "luts" folder in the ImageJ folder.
  open(getDirectory("startup") + "luts/cool.lut");

