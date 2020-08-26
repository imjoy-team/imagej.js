// This macro demonstrates how showProgress() displays subordinate
// progress bars as moving dots when passed a negative argument.

  requires("1.49a");
  newImage("Untitled", "8-bit random", 400, 400, 15);
  for (i=1; i<=nSlices; i++) {
     showProgress(-i/nSlices);
     setSlice(i);
     run("Median...", "radius=20 slice");
  }
