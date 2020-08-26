// This macro creates a red-blue color gradient

newImage("Untitled", "RGB black", 2, 1, 1);
setPixel(0,0,0xff0000);
setPixel(1,0,0x0000ff);
run("Size...", "width=250 height=50 interpolation=Bilinear");
