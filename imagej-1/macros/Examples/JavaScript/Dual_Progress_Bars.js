// This macro demonstrates how IJ.showProgress() displays subordinate
// progress bars as moving dots when passed a negative argument.

  n = 10;
  imp = IJ.createImage("Untitled", "8-bit random", 400, 400, n);
  for (i=1; i<=n; i++) {
     IJ.showProgress(-i/n);
     imp.setSlice(i);
     IJ.run(imp, "Median...", "radius=20 slice");
  }
