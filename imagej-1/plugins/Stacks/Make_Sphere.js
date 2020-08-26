// Creates a sphere with a radius of 100 in
// the center of a 400x400x400 volume and
// smooths it using a radius 50 Guassian blur.

  n = 400;
  imp = IJ.createImage("Sphere", "8-bit Black", n, n, n);
  stack = imp.getStack();
  stack.drawSphere(n/4, n/2, n/2, n/2);
  r = n/8;
  IJ.run(imp, "Gaussian Blur 3D...", "x="+r+" y="+r+" z="+r);
  imp.show();
  imp.setSlice(n/2);
  //imp.setRoi(new Line(0, n/2, n, n/2));
  //IJ.run(imp, "Plot Profile", "");
