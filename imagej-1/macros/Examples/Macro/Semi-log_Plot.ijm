// This macro demonstrates how to draw a semi-log plot.
// http://en.wikipedia.org/wiki/Log-log_plot

  requires("1.49t");
  n = 1000;
  x = newArray(n);
  y = newArray(n);
  y2 = newArray(n);
  y3 = newArray(n);
  for (i=0; i<n; i++) {
     v = 0.1+i*0.1;
     x[i] = v;
     y[i] = v;
     y2[i] = v*v;
     y3[i] = v*v*v;
  }
  Plot.create("Log-log Plot","X Axis","Y Axis");
  Plot.setLogScaleX();
  Plot.setLimits(0.1, n/10, 0.1, n/10);
  Plot.setFrameSize(500, 500);
  Plot.setLineWidth(2);
  Plot.setColor("blue");
  Plot.add("line", x, y);
  Plot.setColor("green");
  Plot.add("line", x, y2);
  Plot.setColor("red");
  Plot.add("line", x, y3);
  Plot.setFontSize(16);
  Plot.setLegend("y = x\ty = x^2\ty = x^3");
  Plot.show();
