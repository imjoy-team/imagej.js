// This macro demonstrates how to fit a 
// polynomial to a set of data points.

  // Create 25 coordinate pairs
  n = 25;
  xpoints = newArray(n);
  ypoints = newArray(n);
  xmin = -2;
  xmax = 2;
  xinc = (xmax-xmin)/(n-1);
  x = xmin;
  for (i=0; i<n; i++) {
      xpoints[i] = x+random/6;
      ypoints[i] = x*x+random/6;
      x += xinc;
  }

  // Fit a 3rd degree polynomial
  Fit.doFit("3rd Degree Polynomial", xpoints, ypoints);
  Fit.plot;
