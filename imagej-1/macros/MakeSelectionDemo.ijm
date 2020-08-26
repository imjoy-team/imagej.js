// This macro demonstrates how to use the makeRectangle(),
// makeOval(), makeLine() and makeSelection() macro functions.

  saveSettings;
  run("Colors...", "foreground=black background=white selection=red");
  newImage("Demo", "8-bit", 200, 125, 1);
  delay = 2000; // 2 seconds

  rename("Rectangle");
  makeRectangle(41, 21, 105, 68);
  wait(delay);

  rename("Oval");
  makeOval(70, 20, 50, 80);
  wait(delay);

  rename("Polygon");
  makeSelection("polygon", newArray(50,100,150,100), newArray(50,25,50,100));
  wait(delay);

  rename("Freehand");
  makeSelection("freehand", newArray(50,100,150,100), newArray(50,25,50,100));
  wait(delay);

  rename("Straight Line");
  makeLine(30, 80, 160, 40);
  wait(delay);

  rename("Polyline");
  makeSelection("polyline", newArray(50,100,150,100), newArray(50,25,50,100));
  wait(delay);

  rename("Freeline");
  makeSelection("freeline", newArray(50,100,150,100), newArray(50,25,50,100));
  wait(delay);

  rename("Angle");
  makeSelection("angle", newArray(140,50,130), newArray(20,40,100));
  wait(delay);

  rename("Point");
  x=newArray(1); y=newArray(1);
  x[0]=90; y[0]=50;
  makeSelection("point", x, y);
  wait(delay);

  rename("Points");
  makeSelection("point", newArray(50,100,150,140), newArray(40,25,50,100));
  wait(delay);

  restoreSettings;
