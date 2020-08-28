  // Calculates measured and theoretical area of elliptical selections with diameters 
  // varying from 1 to 500 pixels, and displays the difference as a percentage.

  max= 500;
  newImage("Test", "8-bit", max, max, 1);
  for (diameter=1; diameter<=max; diameter++) {
      makeOval(0, 0, diameter, diameter);
      run("Measure");
      area1 = getResult("Area", nResults-1);
      radius = diameter/2;
      area2 = PI*radius*radius;
      difference = ((area2-area1)/area1)*100;
      print(diameter+"  "+area1+"  "+area2+"  "+difference);
  }
  selectWindow("Test");
  run("Close");

