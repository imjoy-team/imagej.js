// This macro demonstrates how to label gel lanes
// by adding text rotated 45 degree to an overlay.

requires("1.48q");
run("Gel (105K)");
w=getWidth;
h=getHeight;
lanes = 6;
makeRectangle(16, 19, 255, 194);
setBackgroundColor(255, 255, 255);
run("Canvas Size...", "width=500 height=800 position=Center");
xoffset = (getWidth-w)/2;
yoffset = (getHeight-h)/2;
setFont("SanSerif", 24)
setColor("black");
for (l=0;l<lanes;l++)
  Overlay.drawString("Lane "+l+1, xoffset+(l+0.5)*w/lanes, yoffset, 45);
Overlay.show;
