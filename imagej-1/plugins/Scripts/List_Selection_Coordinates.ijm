// ListSelectionCoordinates
//
// This macro lists the coordinates of the points
// that define the current selection and the length
// of the line segments that connect the points.

  if (selectionType==-1)
      exit("Selection required");
  getSelectionCoordinates(x, y);
  getPixelSize(unit, pixelWidth, pixelHeight);
  run("Clear Results");
  count = 0;
  n = x.length;
  for (i=0; i<n; i++) {
      setResult("X", i, x[i]);
      setResult("Y", i, y[i]);
      dx = (x[(i+1)%n] - x[i])*pixelWidth;
      dy = (y[(i+1)%n] - y[i])*pixelHeight;
      length = sqrt(dx*dx+dy*dy);
      if (i<n-1 || selectionType<=4) {
          setResult("Length", i, length); 
          sumLength += length;
          count++;
      }      
  }
  //if (count>0)
  //    setResult("Length", n, sumLength/count);
  updateResults();
