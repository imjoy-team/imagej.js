// This script demonstrates how to use the ip.draw(Roi), 
// ip.fill(Roi) and ip.fillOutside(Roi) methods.

   if (IJ.getVersion()<"1.42l")
      IJ.error("Requires ImageJ 1.42l or later");
   IJ.run("Clown (14K)");
   IJ.makeOval(91, 41, 151, 108);
   imp = IJ.getImage();
   roi = imp.getRoi();
   ip = imp.getProcessor();
   ip.snapshot();
   ip.setColor(Color.blue);
   ip.setLineWidth(10);
   ip.draw(roi);
   imp.updateAndDraw();
   IJ.wait(2000);
   ip.reset();
   ip.fill(roi);
   imp.updateAndDraw();
   IJ.wait(2000);
   ip.reset();
   ip.fillOutside(roi);
   imp.updateAndDraw();

