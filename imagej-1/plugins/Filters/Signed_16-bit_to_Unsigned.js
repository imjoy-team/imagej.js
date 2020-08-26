// This script implements the Plugins>Filters>Signed 16-bit
// to Unsigned command, which converts signed 16-bit 
// images and stacks to unsigned.

  imp = IJ.getImage();
  stack = imp.getStack();
  if (stack.isVirtual())
     IJ.error("Non-virtual stack required");
  cal = imp.getCalibration();
  if (!cal.isSigned16Bit())
     IJ.error("Signed 16-bit image required");
  cal.disableDensityCalibration();
  ip = imp.getProcessor();
  min = ip.getMin();
  max = ip.getMax();
  stats = new StackStatistics(imp);
  minv = stats.min;
  for (i=1; i<=stack.getSize(); i++) {
     ip = stack.getProcessor(i);
     ip.add(-minv);
  }
  imp.setStack(stack);
  ip = imp.getProcessor();
  ip.setMinAndMax(min-minv, max-minv);
  imp.updateAndDraw();
