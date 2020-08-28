// This macro plots, using the current "Interactive 3D Surface Plot" 
// settings, all the images in a stack and saves the plots in another 
// stack. Press the Esc key to abort the macro.

  n = nSlices;
  if (n==1) exit("Stack required");
  stack1 = getImageID;
  stack2 = 0;
  setBatchMode(true);
  for (i=1; i<=n; i++) {
     showProgress(i, n);
     showStatus(i+"/"+n);
     selectImage(stack1);
     setSlice(i);
     run("Interactive 3D Surface Plot", "snapshot=1");
     run("Copy");
     w = getWidth; h = getHeight;
     close;
     if (stack2==0) {
       newImage("Plots", "RGB", w, h, 1);
       stack2 = getImageID;
     } else {
       selectImage(stack2);
       run("Add Slice");
     }
     run("Paste");
  }
  setSlice(1);
  run("Select None");
  setBatchMode(false);
  doCommand("Start Animation [\\]")
