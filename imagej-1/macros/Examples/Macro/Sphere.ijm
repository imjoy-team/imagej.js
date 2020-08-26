// Generates a synthetic image and displays the elapsed
// time as the image title. For speed comparisons, versions
// are available for all ImageJ scripting languages.
//
// Relative speeds (lower is better):
//   Java: 1    (0.012)
//   Macro: 25
//   Python: 68
//   JavaScript: 120
//   BeanShell: 245
//
// Delete ImageJ/plugins/jars/BeanShell.jar and restart ImageJ if
// the BeanShell version takes more than a few seconds to run.

  size = 512;
  newImage("title", "32-bit black", size, size, 1);
  t0 = getTime;
  for (y=0; y<size; y++) {
     for (x=0; x<size; x++) {
        dx=x-size/2; dy=y-size/2;
        d = sqrt(dx*dx+dy*dy);
        setPixel(x,y,-d);
     }
  }
  resetMinAndMax;
  run("Red/Green");
  time = ""+(getTime-t0)/1000+" seconds";
  rename(time);
 
