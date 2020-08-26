// This macro demonstrates how to add axis to the ellipses drawn by the particle
// analyzer. The macro at http://rsb.info.nih.gov/ij/macros/DrawEllipse.txt
// draws the best fit ellipse and major and minor axis for an area selection.

  run("Blobs (25K)");
  setAutoThreshold;
  run("Set Measurements...", " area mean centroid fit ");
  run("Analyze Particles...", "size=0 circularity=0 show=Ellipses display exclude clear ");
  run("RGB Color");
  for(i=0; i<nResults; i++) {
      x=getResult('X',i);
      y=getResult('Y',i);
      d=getResult('Major',i);
      a = getResult('Angle',i)*PI/180;
      setColor("blue");
      drawLine(x+(d/2)*cos(a),y-(d/2)*sin(a),x-(d/2)*cos(a),y+(d/2)*sin(a));
      d=getResult('Minor',i);
      a=a+PI/2;
      setColor("red");
      drawLine(x+(d/2)*cos(a),y-(d/2)*sin(a),x-(d/2)*cos(a),y+(d/2)*sin(a));
  }
