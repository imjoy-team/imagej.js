// This is a JavaScript version of the Example Plots macros at
//    http://imagej.nih.gov/ij/macros/ExamplePlots.txt
// It requires ImageJ 1.46i or later.

  x = [1, 2, 3, 4];
  y = [20, 10, 30, 20];
  plot = new Plot("", "Plot 1", "X", "Y", x, y);
  plot.show();

 
  y = [0, 0.7, 2.3, 2.8, 1, 0.5];
  plot = new Plot("", "Plot 2 (Simple Plot)", "X", "Y", null, y);
  plot.setFrameSize(500,150);
  plot.setFont(new Font("SansSerif",Font.PLAIN,18));
  plot.setJustification(Plot.CENTER);
  plot.addLabel(0.5, 0.5, "Centered text");
  plot.setJustification(Plot.RIGHT);
  plot.addLabel(0.5, 0.7, "Right justified text");
  plot.setJustification(Plot.LEFT);
  plot.addLabel(0.5, 0.9, "Left justified text");
  plot.show();


  x = [0, 1, 2, 3, 4, 5];
  y = [0, 0.7, 2.3, 2.8, 1, 0.5];
  plot = new Plot("Plot 3 (Fancier Plot)", "X", "Y");
  plot.setFrameSize(500,150);
  plot.setLimits(0, 5, 0, 3);
  plot.setLineWidth(2);
  plot.setColor(Color.lightGray);
  plot.addPoints("", x, y, Plot.LINE);
  plot.setColor(Color.red);
  plot.addPoints("", x, y, Plot.CIRCLE);
  plot.show();


  x = [0.1, 0.25, 0.35, 0.5, 0.61,0.7,0.85,0.89,0.95];
  y = [2,5.6,7.4,9,9.4,8.7,6.3,4.5,1];
  errorBars = [0.8,0.6,0.5,0.4,0.3,0.5,0.6,0.7,0.8];
  plot = new Plot("", "Plot 4 (Error Bars)", "X", "Y", x, y);
  plot.setLimits(0, 1, 0, 10);
  plot.setLineWidth(2);
  plot.addErrorBars("", errorBars);
  plot.show();


  n = 5000;
  x = new Array(n);
  y = new Array(n);
  ran = new Random();
  for (i=0; i<n; i++) {
     x[i] = i+n/3*(ran.nextDouble()-0.5);
     y[i] = i+n/3*(ran.nextDouble()-0.5);
  }
  plot = new Plot("Plot 5 (Scatter Plot)", "X", "Y");
  plot.setLimits(0, n, 0, n);
  plot.addPoints("", x, y, Plot.DOT);
  plot.show();

  IJ.run("Cascade");
  IJ.wait(2000);


  n = 100;
  loops = 100;
  x = new Array(n);
  y = new Array(n);
  for (i=0; i<n; i++) {
    x[i] = i;
    y[i] = 0;
  }
  ran = new Random();
  win = null;
  for (i=0; i<loops; i++) {
     for (j=0; j<n; j++)
        y[j] += ran.nextDouble()-0.5;
     for (j=1; j<n-1; j++)
        y[j] = (y[j-1]+y[j]+y[j+1])/3; // smooth
     plot = new Plot("", "Plot 6 (Animated Plot)", "X", "Y", x, y);
     plot.setLimits(0, n-1, -3, 3);
     plot.setFont(new Font("SansSerif",Font.PLAIN,24));
     plot.setJustification(Plot.CENTER);
     plot.addLabel(0.5, 0.15, "Plot "+(i+1));
     if (i==0)
        win = plot.show();
     else
        win.drawPlot(plot);
     IJ.wait(50);
  }
