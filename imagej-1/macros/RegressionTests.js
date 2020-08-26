  start = System.currentTimeMillis();

  roiManagerTest(true);
  roiManagerTest(false);
  compositeImageTests(true);
  compositeImageTests(false);
  metadataTests();
  thresholdTests();
  bitDepthTests();
  setStackTests(true);
  setStackTests(false);
  particleAnalyzerTests();
  maskTests();

  //print("time="+(System.currentTimeMillis()-start)+"ms");

  function roiManagerTest(headless) {
      msg = "FAIL: roiManagerTest"+(headless?" (headless)":"")+" #";
      imp = IJ.openImage("http://imagej.nih.gov/ij/images/blobs.gif");
      if (!headless) imp.show();
      IJ.setAutoThreshold(imp, "Default");
      IJ.run("Set Measurements...", "area mean redirect=None decimal=3");
      manager = null;
      if (headless) {
         manager = new RoiManager(true);
         ParticleAnalyzer.setRoiManager(manager);
      }
      IJ.run(imp, "Analyze Particles...", "exclude clear add");
      if (manager==null)
         manager = RoiManager.getInstance();
      rois = manager.getRoisAsArray();
      n = rois.length;
      if (n!=46) print(msg+1);
      stats = [];
      for (i=0; i<n; i++) {
          imp.setRoi(rois[i]);
           stats[i] = imp.getStatistics()
      }
      WindowManager.setTempCurrentImage(imp);
      ran = new Random();
      for (i=0; i<500; i++) {
          index = Math.round(ran.nextDouble()*(n-1));
          manager.select(index);
           stats2 = imp.getStatistics();
           //print(i+" "+index+"  "+stats2.area);
           if (stats2.area!=stats[index].area) {
              print(msg+2);
              break;
           }   
      }
      manager.setSelectedIndexes([1,2,4,8,20]);
      manager.runCommand("Combine");
      stats2 = imp.getStatistics();
      if (stats2.area!=1853)
         print(msg+3);
      manager.setSelectedIndexes([45,44,33,5,0]);
      manager.runCommand("Combine");
      stats2 = imp.getStatistics();
      if (stats2.area!=1601)
         print(msg+4);
      if (!headless) {
         imp.close();
         manager.close();
      }
  }

  function compositeImageTests(headless) {
     msg = "FAIL: CompositeImageTest"+(headless?" (headless)":"")+" #";
     imp = IJ.openImage("http://imagej.nih.gov/ij/images/Rat_Hippocampal_Neuron.zip");
     if (!headless) imp.show();
     ip = imp.getProcessor();
     if (ip.getMin()!=472|| ip.getMax()!=2436) print(msg+1);
     stats = ip.getStatistics();
     if (stats.min!=472||stats.max!=8583) print(msg+2);

     imp.setC(3);
     ip = imp.getProcessor();
     if (ip.getMin()!=504|| ip.getMax()!=942) print(msg+3);
     stats = ip.getStatistics();
     if (stats.min!=484||stats.max!=5821) print(msg+4);
     if (!headless) imp.close();

     imp = IJ.openImage("http://imagej.nih.gov/ij/images/Spindly-GFP.zip");
     if (!headless) imp.show();
     ip = imp.getProcessor();
     if (ip.getMin()!=1582|| ip.getMax()!=6440) print(msg+5);
     stats = ip.getStatistics();
     if (stats.min!=1601||stats.max!=6796) print(msg+6);

     imp.setPosition(2, 4, 20);
     ip = imp.getProcessor();
     if (ip.getMin()!=1614|| ip.getMax()!=15787) print(msg+7);
     stats = ip.getStatistics();
     if (stats.min!=1634||stats.max!=16172) print(msg+8+" "+stats);
     //print("Mitosis (2-4-20): "+stats.min+"-"+stats.max);

     imp.setPosition(1, 2, 3);
     ip = imp.getProcessor();
     if (ip.getMin()!=1582|| ip.getMax()!=6440) print(msg+9);
     stats = ip.getStatistics();
     if (stats.min!=1606||stats.max!=18946) print(msg+10);
     if (!headless) imp.close();
  }

  function metadataTests() {
     msg = "FAIL: MetadataTests #";
     size = 256;
     info = "info-metadata";
     label = "label";
     for (n=1; n<10; n++) {
        imp = IJ.createImage("A","16-bit",size,size,n);
        imp.setProperty("Info", info+n);
        stack = imp.getStack();
        for (i=1; i<=stack.size(); i++)
           stack.setSliceLabel(label+i, i);
        imp2 = imp.duplicate();
        path = IJ.getDir("temp")+"untitled.tif";
        IJ.saveAs(imp2, "tif", path);
        imp3 = IJ.openImage(path);
        if (imp.getProperty("Info")!=info+n) print(msg+1);
        stack = imp3.getStack();
        for (i=1; i<=stack.size(); i++) {
           if (stack.getSliceLabel(i)!=label+i) print(msg+2);
        }
        imp3.setSlice(imp3.getStackSize());
        while (imp3.getStackSize()>1)
            IJ.run(imp3, "Delete Slice", "");
        if (imp3.getStackSize()!=1) print(msg+3);
        if (imp3.getStack().getSliceLabel(1)!=label+1) print(msg+4);;
     }
     imp = IJ.createImage("B","16-bit",size,size,1);
     stack = imp.getStack();
     stack.setSliceLabel(label,1);
     stack.addSlice(new FloatProcessor(size,size));
     ip = imp.getProcessor().duplicate();
     ip.add(12345);
     imp.setProcessor(ip);
     if (imp.getStatistics().mean!=12345) print(msg+5);
     imp2 = imp.duplicate();
     imp3 = imp2.duplicate();
     stack = imp3.getStack();
     if (stack.getSliceLabel(1)!=label) print(msg+6);
     stack = new ImageStack(size,size);
     stack.addSlice(label,new ByteProcessor(size,size));
     if (stack.getSliceLabel(1)!=label) print(msg+7);
     imp = new ImagePlus("",stack);
     if (imp.getStack().getSliceLabel(1)!=label) print(msg+8);
     imp = IJ.createImage("C","32-bit",size,size,1);
     imp.setStack(stack);
     if (imp.getStack().getSliceLabel(1)!=label) print(msg+9);  
  }

  function thresholdTests() {
     msg = "FAIL: ThresholdTests #";
     img = IJ.createImage("Untitled", "8-bit ramp", 256, 256, 1);
     IJ.setRawThreshold(img, 100, 200, null);
     Prefs.blackBackground = true;
     IJ.run(img, "Convert to Mask", "");
     stats = img.getStatistics();
     if (stats.histogram[255]!=25856) print(msg+1);
     img = IJ.createImage("Untitled", "16-bit ramp", 256, 256, 1);
     IJ.setRawThreshold(img, 16000, 45000, null);
     IJ.run(img, "Convert to Mask", "");
     stats = img.getStatistics();
     if (stats.histogram[255]!=28928) print(msg+2);
     img = IJ.createImage("Untitled", "32-bit ramp", 256, 256, 1);
     IJ.setRawThreshold(img, 0.25, 0.75, null);
     IJ.run(img, "Convert to Mask", "");
     stats = img.getStatistics();
     if (stats.histogram[255]!=33024) print(msg+3);
     methods = AutoThresholder.getMethods();

     // 'dark'
     values = [277,357,4359,1070,277,713,2259,357,357,7728,1506,1030,317,2259,7094,674,2893];
     img = IJ.openImage("http://wsr.imagej.net/images/m51.zip");
     ip = img.getProcessor();
     for (i=0; i<methods.length; i++) {
        IJ.setAutoThreshold(img, methods[i]+" dark");
        t1 = ip.getMinThreshold();
        t2 = ip.getMaxThreshold();
        if (i<values.length && (t1!=values[i]||t2!=65535))
           print(msg+4+"-"+i+" ("+methods[i]+")")
        //print(methods[i]+": "+t1+"-"+t2);
     }

    // enhanced contrast
    for (i=0; i<methods.length; i++) {
        IJ.run(img, "Enhance Contrast", "saturated=0.35");
        IJ.setAutoThreshold(img, methods[i]+" dark");
        t1 = ip.getMinThreshold();
        t2 = ip.getMaxThreshold();
        if (i<values.length && (t1!=values[i]||t2!=65535))
           print(msg+5+"-"+i+" ("+methods[i]+")")
      }

     // light background
     values = [238,317,4320,1030,238,674,2219,317,317,7688,1466,991,277,2219,7054,634,2853];
     for (i=0; i<methods.length; i++) {
        IJ.setAutoThreshold(img, methods[i]);
        t1 = ip.getMinThreshold();
        t2 = ip.getMaxThreshold();
        if (i<values.length && (t1!=0||t2!=values[i]))
           print(msg+6+"-"+i+" ("+methods[i]+")")
     }

      // enhanced contrast, 'no-reset'
      values = [690,312,1148,821,690,530,639,334,291,1932,654,821,305,581,1031,509,581];
      for (i=0; i<methods.length; i++) {
        IJ.run(img, "Enhance Contrast", "saturated=0.35");
        IJ.setAutoThreshold(img, methods[i]+" dark no-reset");
        t1 = ip.getMinThreshold();
        t2 = ip.getMaxThreshold();
        if (i<values.length && (t1!=values[i]||t2!=65535))
           print(msg+7+"-"+i+" ("+methods[i]+")")
     }

     // ROI
     values = [2972,2061,3805,3012,2972,2616,2893,1982,1704,5588,2972,3012,1704,2893,3329,2497,2893];
     img = IJ.openImage("http://wsr.imagej.net/images/m51.zip");
     img.setRoi(new OvalRoi(139,238,34,34));
     ip = img.getProcessor();
     for (i=0; i<methods.length; i++) {
        IJ.setAutoThreshold(img, methods[i]+" dark");
        t1 = ip.getMinThreshold();
        t2 = ip.getMaxThreshold();
        if (i<values.length && (t1!=values[i]||t2!=65535))
           print(msg+8+"-"+i+" ("+methods[i]+")")
      }

  }

  function bitDepthTests() {
     msg = "FAIL: BitDepthTests #";
     img8 = IJ.createImage("tmp", "8-bit", 10, 10, 1);
     if (img8.getBitDepth()!=8) print(msg+1);
     img = img8.createImagePlus();
     if (img.getBitDepth()!=8) print(msg+2);
     img16 = IJ.createImage("tmp", "16-bit", 10, 10, 1);
     if (img16.getBitDepth()!=16) print(msg+3);
     img = img16.createImagePlus();
     if (img.getBitDepth()!=16) print(msg+4);
     img8.setProcessor(img16.getProcessor().duplicate());
     if (img8.getBitDepth()!=16) print(msg+8);
     img32 = IJ.createImage("tmp", "32-bit", 10, 10, 1);
     if (img32.getBitDepth()!=32) print(msg+9);
     img = img32.createImagePlus();
     if (img.getBitDepth()!=32) print(msg+10);
     img16.setStack(img32.getStack());
     if (img16.getBitDepth()!=32) print(msg+11);
     img24 = IJ.createImage("tmp", "rgb", 10, 10, 1);
     if (img24.getBitDepth()!=24) print(msg+12);
     img = img24.createImagePlus();
     if (img.getBitDepth()!=24) print(msg+13);
     img32.setProcessor(img24.getProcessor());
     if (img32.getBitDepth()!=24) print(msg+14);
     img = new ImagePlus();
     if (img.getBitDepth()!=0) print(msg+15);
     img.setProcessor(new ShortProcessor(10,10));
     if (img.getBitDepth()!=16) print(msg+16);
}

  function setStackTests(showWindows) {
     msg = "FAIL: SetStackTests ("+(showWindows?"show":"no show")+") #";
     if (showWindows)
         msg = "FAIL: SetStackTests (show) #";
     delay = 0;

     img = IJ.createImage("Untitled", "8-bit ramp", 256, 256, 1);
     if (showWindows) img.show();
     IJ.wait(delay);
     stack = IJ.createImage("Stack", "8-bit ramp", 256, 256, 256);
     img.setStack(stack.getStack());
     IJ.wait(delay);
     if (img.getStackSize()!=256) print(msg+1);
     img2 = IJ.createImage("Stack", "16-bit random", 512, 512, 1);
     img.setStack(img2.getStack());
     IJ.wait(delay);
     if (img.getStackSize()!=1) print(msg+2);
     if (img.getBitDepth()!=16) print(msg+3);
     img.close();

     img = IJ.createImage("Untitled", "RGB black", 700, 400, 1);
     if (showWindows) img.show();
     IJ.wait(delay);
     stack = IJ.createImage("Stack", "32-bit ramp", 400, 400, 100);
     img.setStack(stack.getStack());
     IJ.wait(delay);
     if (img.getStackSize()!=100) print(msg+4);
     if (img.getBitDepth()!=32) print(msg+5);
     img.close();

     img = IJ.createImage("HyperStack", "16-bit color-mode label", 400, 300, 3, 4, 5);
     if (!img.isHyperStack()) print(msg+6);
     if (!img.isComposite()) print(msg+7);
     if (showWindows) img.show();
     IJ.wait(delay);
     stack = IJ.createImage("Stack", "32-bit ramp", 400, 400, 50);
     img.setStack(stack.getStack());
     IJ.wait(delay);
     if (img.getStackSize()!=50) print(msg+8);
     if (img.getBitDepth()!=32) print(msg+9);
     if (img.isHyperStack()) print(msg+10);
     if (img.isComposite()) print(msg+11);
     hyperstack = IJ.createImage("HyperStack2", "8-bit composite-mode label", 300, 300, 3, 5, 7);
     if (img.isHyperStack()) print(msg+12);
     if (img.isComposite()) print(msg+13);
     img.setStack(hyperstack.getStack(), 3, 5, 7); 
     IJ.wait(delay);
     if (img.getNChannels()!=3) print(msg+14);
     if (img.getNSlices()!=5) print(msg+15);
     if (img.getNFrames()!=7) print(msg+16);
     if (img.getBitDepth()!=8) print(msg+17);
     if (!img.isHyperStack()) print(msg+18);
     if (!img.isComposite()) print(msg+19);
     img.close();

     img = IJ.createImage("Untitled", "8-bit ramp", 256, 256, 1);
     if (showWindows) img.show();
     IJ.wait(delay);
     hyperstack = IJ.createImage("HyperStack2", "16-bit composite-mode label", 300, 300, 3, 5, 7);
     img.setStack(hyperstack.getStack(), 3, 5, 7); 
     IJ.wait(delay);
     if (img.getBitDepth()!=16) print(msg+20);
     if (img.isHyperStack()) print(msg+21);
     if (img.isComposite()) print(msg+22);
     if (img.getStackSize()!=105) print(msg+22);
     img.close();

     img = IJ.createImage("HyperStack", "8-bit composite-mode label", 400, 300, 3, 4, 5);
     if (showWindows) img.show(); 
     IJ.wait(delay);
     hyperstack = IJ.createImage("HyperStack2", "16-bit color-mode label", 555, 555, 2, 3, 4);
     img.setStack(hyperstack.getStack(), 2, 3, 4); 
     IJ.wait(delay);
     if (img.getNChannels()!=2) print(msg+23);
     if (img.getNSlices()!=3) print(msg+24);
     if (img.getNFrames()!=4) print(msg+25);
     if (img.getBitDepth()!=16) print(msg+26);
     if (!img.isHyperStack()) print(msg+27);
     if (!img.isComposite()) print(msg+28);
     hyperstack = IJ.createImage("Stack", "32-bit random", 444, 444, 30);
     img.setStack(hyperstack.getStack(), 3, 10, 1);
     IJ.wait(delay);
     if (img.getNChannels()!=3) print(msg+29);
     if (img.getNSlices()!=10) print(msg+30);
     if (img.getBitDepth()!=32) print(msg+31);
     if (!img.isHyperStack()) print(msg+32);
     if (!img.isComposite()) print(msg+33);
     hyperstack = IJ.createImage("Stack", "8-bit random", 333, 333, 7);
     img.setStack(hyperstack.getStack(), 7, 1, 1);
     IJ.wait(delay);
     if (img.getNChannels()!=7) print(msg+34);
     // if (!img.isHyperStack()) print(msg+35); ??
     if (!img.isComposite()) print(msg+36);
     img.close();

     img = IJ.createImage("HyperStack", "8-bit color-mode label", 111, 111, 3, 1, 1);
     if (showWindows) img.show(); 
     IJ.wait(delay);
     hyperstack = IJ.createImage("HyperStack2", "16-bit color-mode label", 444, 222, 3, 4, 5);
     img.setStack(hyperstack.getStack(), 3, 4, 5); 
     IJ.wait(delay);
     if (img.getNChannels()!=3) print(msg+37);
     if (img.getNSlices()!=4) print(msg+38);
     if (img.getNFrames()!=5) print(msg+39);
     if (img.getBitDepth()!=16) print(msg+40);
     if (!img.isHyperStack()) print(msg+41);
     if (!img.isComposite()) print(msg+42);
     img.close();

     img1 = IJ.createImage("a", "16-bit ramp", 512, 512, 1);
     img2 = IJ.createImage("b", "16-bit ramp", 512, 512, 1);
     img1.setDisplayRange(25, 4000);
     images = new Array(2);
     images[0] = img1;
     images[1] = img2;
     img3 = RGBStackMerge.mergeChannels(images, false);
     if (showWindows) img3.show(); 
     IJ.wait(delay);
     IJ.run(img3, "Rotate 90 Degrees Right", "");
     ip = img3.getProcessor();
     if (ip.getMin()!=25|| ip.getMax()!=4000) print(msg+43);
     img3.setSlice(2);
     ip = img3.getProcessor();
     if (ip.getMin()!=0|| ip.getMax()!=65535) print(msg+44);
     img1.close(); img2.close(); img3.close();
  }

function particleAnalyzerTests() {
  msg = "FAIL: PA Tests #";
  img = IJ.openImage("http://wsr.imagej.net/images/AuPbSn40.jpg");
  IJ.run("Clear Results", "");
  saveMeasurements = Analyzer.getMeasurements();
  Analyzer.setMeasurements(Measurements.ALL_STATS-Measurements.AREA_FRACTION);
  IJ.setAutoThreshold(img, "Huang");
  IJ.run(img, "Analyze Particles...", "  show=Overlay add clear");
  rt = ResultsTable.getResultsTable();
  rt = rt.clone();
  col = rt.getColumnHeadings().split("\t");
  n = rt.size();
  overlay = img.getOverlay();
  if (overlay.size()!=n) print(msg+1);

  // Compare to saved results
  Analyzer.setMeasurements(Measurements.ALL_STATS+Measurements.LIMIT);
  path = IJ.getDir("macros")+"RegressionTestsResults.csv";
  rt2 = ResultsTable.open(path);
  for (i=0; i<n; i++) {
      for (c=1; c<col.length; c++)
        compare("1: (Saved)", i, col[c], rt.getValue(col[c],i), rt2.getValue(col[c],i));
  }

  // Compare to measured overlay ROIs
  rt2 = ResultsTable.getResultsTable();
  for (i=0; i<n; i++) {
     roi = overlay.get(i);
     img.setRoi(roi);
     IJ.run(img, "Measure", "");
     for (c=1; c<col.length; c++)
        compare("2: (Overlay)", i, col[c], rt.getValue(col[c],i), rt2.getValue(col[c],i));
  }
  //img.show();
  //IJ.error("");

  // Compare to measured ROI Manager ROIs
  img.deleteRoi();
  rm = RoiManager.getInstance();
  IJ.run("Clear Results", "");
  rt2 = ResultsTable.getResultsTable();
  for (i=0; i<n; i++) {
     rm.select(img, i);
     IJ.run(img, "Measure", "");
     for (c=1; c<col.length; c++)
        compare("3 (ROI Manager)", i, col[c], rt.getValue(col[c],i), rt2.getValue(col[c],i));
  }

  Analyzer.setMeasurements(saveMeasurements);
  rm.close();
  IJ.selectWindow("Results");
  IJ.run("Close");
}

  function compare(test, row, column, value1, value2) {
     tolerance = 0.0000001;
     if (Math.abs(value1-value2)>tolerance || (!Double.isNaN(value1)&&Double.isNaN(value2)) )
        print(msg+test+"  "+row+"  "+column+"  "+value1+"  "+value2);
  }

function maskTests() {
  msg = "FAIL: Mask Tests #";
  img = IJ.openImage("http://wsr.imagej.net/images/blobs.gif");
  IJ.setAutoThreshold(img, "Default");
  mask = img.createThresholdMask();
  if (mask.getMinThreshold()!=255) print(msg+1);
  if (mask.getStats().histogram[255]!=22243) print(msg+2);
  maskImg = new ImagePlus("mask",mask);
  IJ.run(maskImg, "Create Selection", "");
  if (maskImg.getStatistics().area!=22243) print(msg+3);
  img.setRoi(new OvalRoi(66,52,134,146));
  mask = img.createRoiMask();
  if (mask.getMinThreshold()!=255) print(msg+4);
  if (mask.getStats().histogram[255]!=15368) print(msg+5);
  maskImg = new ImagePlus("mask",mask);
  IJ.run(maskImg, "Create Selection", "");
  if (maskImg.getStatistics().area!=15368) print(msg+6);
  img.deleteRoi();
  IJ.setAutoThreshold(img, "MinError");
  IJ.run(img, "Analyze Particles...", "  show=Overlay");
  mask = img.createRoiMask();
  if (mask.getStats().histogram[255]!=27149) print(msg+7);
  IJ.run(img, "Set Scale...", "distance=1 known=10 unit=mm");
  IJ.run(img, "Create Mask", "");
  maskImg = WindowManager.getCurrentImage();
  if (maskImg.getCalibration().pixelWidth!=10) print(msg+8)
  mask = maskImg.getProcessor();
  if (mask.getMinThreshold()!=255) print(msg+9);
  if (mask.getStats().histogram[255]!=27149) print(msg+10);
  maskImg.close();
  img.setOverlay(null);
  IJ.setAutoThreshold(img, "Shanbhag");
  IJ.run(img, "Create Mask", "");
  maskImg = WindowManager.getCurrentImage();
  if (maskImg.getCalibration().pixelWidth!=10) print(msg+11)
  mask = maskImg.getProcessor();
  if (mask.getMinThreshold()!=255) print(msg+12);
  if (mask.getStats().histogram[255]!=16546) print(msg+13);
  maskImg.close();
  //new ImagePlus("mask",mask).show();
}

