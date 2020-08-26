// Three Color Overlay Plot of a Line

  run("Fluorescent Cells (400K)");
  if (!is("composite"))
      run("Make Composite");
  id = getImageID;
  setBatchMode(true);
  run("Profile Plot Options...", "width=450 height=200 minimum=0 maximum=255 fixed interpolate draw");
  makeLine(50, 50, getWidth-50, getHeight-50);
  run("Plot Profile");
  run("Invert");
  rename("red");
  selectImage(id);
  setSlice(2);
  run("Plot Profile");
  run("Invert");
  rename("green");
  selectImage(id);
  setSlice(3);
  run("Plot Profile");
  run("Invert");
  rename("blue");
  run("Merge Channels...", "red=red green=green blue=blue gray=*None* create");
  setBatchMode(false);
