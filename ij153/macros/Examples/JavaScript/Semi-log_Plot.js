// This is an example semi-log plot.
// It requires ImageJ 1.49t or later.

  n = 1000;
  x = new Array(n);
  y = new Array(n);
  y2 = new Array(n);
  y3 = new Array(n);
  for (i=0; i<n; i++) {
     v = 0.1+i*0.1;
     x[i] = v;
     y[i] = v;
     y2[i] = v*v;
     y3[i] = v*v*v;
  }
  plot = new Plot("Semi-log Plot","X Axis","Y Axis");
  plot.setLogScaleX();
  plot.setLimits(0.1, n/10, 0.1, n/10);
  plot.setSize(500, 500);
  plot.setLineWidth(2);
  plot.setColor("blue");
  plot.add("line", x, y);
  plot.setColor("green");
  plot.add("line", x, y2);
  plot.setColor("red");
  plot.add("line", x, y3);
  plot.addLegend("y = x\ty = x^2\ty = x^3");
  plot.show();
