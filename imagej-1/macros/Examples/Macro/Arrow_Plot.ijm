// This macro demonstrates how to plot a field of 
// arrows and combined it with other plot objects.

  requires("1.49t");
  gridSize = 20;
  n = gridSize*gridSize;
  increment = 1.0/(gridSize-1);
  xS = newArray(n);
  yS = newArray(n);
  xE = newArray(n);
  yE = newArray(n);
  i = 0;
  for (y=0; y<=1.000001; y+=increment) {
    for (x=0; x<=1.000001; x+=increment) {
      xS[i] = x;
      yS[i] = y;
      dx = (0.45+0.45*sin(2*PI*y))/gridSize;
      dy = 0.9*cos(2*PI*x+0.75*PI*y)/gridSize;
      xE[i] = x + dx;
      yE[i] = y + dy;
      i++;
    }
  }
  Plot.create("Arrow Field Plot","X Axis","Y Axis");
  Plot.setColor("green");
  Plot.setColor("blue");
  Plot.drawVectors(xS, yS, xE, yE);
  xLine = newArray(-1, 2);
  yLine = newArray(0.75, 0.75);
  Plot.setColor("red");
  Plot.add("line", xLine, yLine);
  Plot.setColor("black"); //legend frame
  Plot.setLegend("x component vanishes here", "top-left");
  Plot.show();
