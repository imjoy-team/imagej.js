// This macro demonstrates how to use the Overlay.* functions
// added in ImageJ 1.44e by displaying two polygons in an overlay.

  if (nImages==0)
     run("Boats (356K)");
  Overlay.remove;
  drawPolygon(25, "blue", 1, 0.95);
  drawPolygon(12, "green", 2, 0.6);
  drawText("yellow");
  Overlay.show;

  function drawPolygon(n, color, width, scale) {
    setColor(color);
    setLineWidth(width);
    size = minOf(getWidth, getHeight);
    center = size/2;
    r = scale*center;
    twoPi = 2*PI;
    inc = twoPi/n;
    for (a1=0; a1<twoPi; a1+=inc) {
        x1 = r*sin(a1) + center;
        y1 = r*cos(a1) + center;
        for (a2=a1; a2<twoPi; a2+=inc) {
            x2 = r*sin(a2) + center;
            y2 = r*cos(a2) + center;
            Overlay.drawLine(x1,y1,x2,y2);
        }
     }
     Overlay.add;
  }

  function drawText(color) {
    setColor(color);
    size = 24 *getWidth/512;
    setFont("SansSerif", size);
    Overlay.drawString("Polygons", 10, size);
  }
