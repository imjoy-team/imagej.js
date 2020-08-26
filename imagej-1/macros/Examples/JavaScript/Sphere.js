  t0 = System.currentTimeMillis();
  size = 512;
  ip = new FloatProcessor(size,size);
  for (y=0; y<size; y++) {
     IJ.showProgress(y,size-1);
     for (x=0; x<size; x++) {
        dx=x-size/2; dy=y-size/2;
        d = Math.sqrt(dx*dx+dy*dy);
        ip.setf(x,y,-d);
     }
  }
  time = (System.currentTimeMillis()-t0)/1000+" seconds";
  img = new ImagePlus(time,ip);
  IJ.run(img,"Red/Green","");
  img.show();
