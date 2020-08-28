// This macro demonstrates how to use the Process>Math>Macro
// command to do animation.

  requires("1.42k");
  setBatchMode(true);
  run("Lena (68K)");
  id1 = getImageID;
  div = 500;
  n = 50;
  delta = div/n;
  newImage("Movie", "RGB Black", getWidth, getHeight, n);
  id2 = getImageID;
  for (i=1; i<=n; i++) {
     showProgress(i, n);
     selectImage(id1);
     code = "a+=PI+d/"+div+";v=getPixel(d*cos(a)+w/2,d*sin(a)+h/2);";
     run("Macro...", "code="+code);
     div -= delta;
     //print(i+"/"+n+", dev="+div);
     run("Copy");
     run("Undo");
     selectImage(id2);
     setSlice(i);
     run("Paste");
  }
  setBatchMode(false);
  setSlice(1)
  run("Animation Options...", "speed=5 loop");
  doCommand("Start Animation [\\]");

