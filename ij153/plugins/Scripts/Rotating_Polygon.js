  n =25;
  IJ.resetEscape();
  imp = IJ.openImage("http://imagej.nih.gov/ij/images/lena-std.tif");
  imp.show();
  size = imp.width;
  r = size/2;
  angle = 0;
  twoPi = 2*Math.PI;
  inc = twoPi/n;
  font = new Font("SanSerif", Font.PLAIN, 18);
  text = new TextRoi(5, 5, "Press ESC to stop/start", font);
  text.setStrokeColor(Color.white);
  stopped = false;
  while (true) {
     overlay = new Overlay();
     overlay.add(text);
     for (a1=angle; a1<angle+twoPi; a1+=inc) {
         x1 = r*Math.sin(a1) + r;
         y1 = r*Math.cos(a1) + r;
         for (a2=a1; a2<angle+twoPi; a2+=inc) {
            x2 = r*Math.sin(a2) + r;
            y2 = r*Math.cos(a2) + r;
            line = new Line(x1,y1,x2,y2);
            line.setStrokeColor(Color.cyan);
            line.setStrokeWidth(1)
            overlay.add(line);
         }
      }
      angle += Math.PI/360;
      IJ.wait(40);
      if (!stopped)
         imp.setOverlay(overlay);
      if (IJ.escapePressed()) {
          stopped = !stopped;
          IJ.resetEscape();
      }
      if (imp.getWindow()==null)
         break;
  }
