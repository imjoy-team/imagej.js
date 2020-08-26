  img = IJ.openImage("http://imagej.nih.gov/ij/images/blobs.gif");
  img.setRoi(new Line(56,64,90,15));
  pp = new ProfilePlot(img);
  y1 = pp.getProfile();
  n = y1.length;
  x = new Array(n);
  for (i=0; i<n; i++) x[i]=i;
  fitter = new CurveFitter(x, y1);
  fitter.doFit(CurveFitter.GAUSSIAN, false);
  y2 = new Array(n);
  params = fitter.getParams();
  for (i=0; i<n; i++) y2[i]=fitter.f(params,i);
  plot = new Plot("Example Plot", "Distance in Pixels", "Intensity");
  plot.setColor("red", "red");
  plot.add("circle", x, y1);
  plot.setColor("black");
  plot.setLineWidth(2);
  plot.add("line", x, y2);
  plot.addLegend("Data Points\nGaussian Fit");
  plot.show();
  


