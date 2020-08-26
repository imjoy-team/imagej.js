// This script demonstrates how to display ROIs
// in different colors using a non-destructive overlay.

  n = 50;
  w = 1000, h = 700;
  imp = IJ.createImage("Demo","8-bit Ramp",w,h,1);
  imp.show();
  ran = new Random();
  overlay = new Overlay();
  size = w/10;
  for (i=0; i<n; i++) {
      x = ran.nextFloat()*(w-size);
      y = ran.nextFloat()*(h-size);
      roi = new OvalRoi(x,y,size,size);
      color = new Color(ran.nextFloat(),ran.nextFloat(),ran.nextFloat());
      roi.setStrokeColor(color);
      roi.setStrokeWidth(2);
      overlay.add(roi);
  }
  imp.setOverlay(overlay);
  IJ.wait(2000);
  for (i=0; i<n; i++)
      overlay.get(i).setStrokeWidth(8);
  imp.setOverlay(overlay);

