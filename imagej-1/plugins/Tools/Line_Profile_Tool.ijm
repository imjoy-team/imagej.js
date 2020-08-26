// This tool draws a line and overlays its profile
  
macro "Line Profile Tool -C037L0ff0G0e2b157581c1f000" {
    getCursorLoc(x, y, z, flags);
    xstart = x; ystart = y;
    x2=x; y2=y;        
    fontSize = 14; 
    fontSize/=getZoom;
    setFont('SanSerif', fontSize, 'antialiased');
    setLineWidth(2);
    if (getZoom>=2) setLineWidth(1);
    while (true) {
        getCursorLoc(x, y, z, flags);
        if (flags&16==0) {
           Overlay.addSelection;
           exit;
        }
        if (x!=x2 || y!=y2) {
            makeLine(xstart, ystart, x, y);
            overlayProfile(xstart, ystart, x, y, fontSize);
        }
        x2=x; y2=y;
        wait(30);
    };
}

  
function overlayProfile(x1,y1,x2,y2, fontSize) {
    Overlay.clear;
    p = getProfile();
    Array.getStatistics(p, min, max, mean, stdDev);
    List.setMeasurements;
    text = 'length='+d2s(List.getValue('Length'),2)+', min='+d2s(min,2)+', max='+d2s(max,2);
    showStatus(text);
    range = max - min;
    scale = 50/getZoom;
    Overlay.moveTo(x1, y1);
    setColor(Roi.getDefaultColor);
    for (i=0;i<p.length;i++) {
        xs = (x2-x1)/p.length;
        ys = (y1-y2)/p.length;
        d = -scale*(p[i]-min)/range;
        a = atan2(y2-y1, x2-x1);
        Overlay.lineTo(x1+i*xs-d*sin(a), y1-i*ys+d*cos(a));
    }
    Overlay.lineTo(x2, y2);
    a = 360-a*180/PI;
    x = x1 + ys*fontSize*1.25;
    y = y1 + xs*fontSize*1.25;
    Overlay.drawString(d2s(min,0)+'-'+d2s(max,0), x, y, a);
    Overlay.show;
}
