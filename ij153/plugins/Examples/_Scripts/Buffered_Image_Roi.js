// This script demonstrates how to use the ImageRoi class.

  if (IJ.getVersion()<"1.43j")
     IJ.error("Requires ImageJ 1.43j or later");
  if (WindowManager.getCurrentImage()==null)
     IJ.run("Fluorescent Cells (400K)");
  w = 200;
  h = 200;
  clown = IJ.openImage("http://rsb.info.nih.gov/ij/images/clown.jpg");
  ip = clown.getProcessor();
  ip.setRoi(20, 0, w, h);
  ip = ip.crop();
  img = ip.createImage();
  for (i=0; i<100; i++) {
     draw(w, h, img, i/100);
     IJ.wait(50);
  }
  for (i=100; i>60; i--) {
     draw(w, h, img, i/100);
     IJ.wait(50);
  }
  
  function draw(w, h, img, alpha) {
    bi = new BufferedImage(w, h, BufferedImage.TYPE_INT_ARGB);
    roi = new ImageRoi(100, 100, bi);
    g = bi.getGraphics();
    ac = AlphaComposite.getInstance(AlphaComposite.SRC_OVER, alpha);
    g.setComposite(ac);
    g.drawImage(ip.createImage(), 0, 0, null);
    ac = AlphaComposite.getInstance(AlphaComposite.SRC_OVER, 1.0);
    g.setComposite(ac);
    g.setColor(Color.blue);
    g.fillOval(75,75,50,50);
    g.setColor(Color.green);
    g.drawRect(0,0,w-1,h-1);
    IJ.getImage().setRoi(roi);
 }
