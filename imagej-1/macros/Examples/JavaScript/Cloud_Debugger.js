// This is an Imagej JavaScript version of the PlasmaCloud
// example from Section 2.3 (Recursion) of the book
// "Introduction to Programming in Java" by Robert
// Sedgewick and Kevin Wayne.
// http://introcs.cs.princeton.edu/java/23recursion/PlasmaCloud.java.html

    w=700; h=700;
    ran = new Random(50505050);
    ip = new ColorProcessor(w,h);
    imp = new ImagePlus("Plasma Cloud", ip);
    imp.show();
    c1 = ran.nextDouble();
    c2 = ran.nextDouble();
    c3 = ran.nextDouble();
    c4 = ran.nextDouble();
    count = 0;
    depth = 0;
    threshold = 16;
    stddev = 1.25; // controls color variation
    plasma(0.5, 0.5, 0.5, stddev, c1, c2, c3, c4);
    imp.updateAndDraw();

    function plasma(x,  y,  size, stddev, c1, c2, c3, c4) {
        if (size<=0.001) return;
        depth++;
        win = imp.getWindow();
        if (win!=null && !win.isVisible()) {
            IJ.beep();
            return;
        }
        var displacement = ran.nextGaussian()*stddev;
        var cM = (c1 + c2 + c3 + c4) / 4.0 + displacement;
        var color = Color.getHSBColor(cM, 1, 0.8);
        ip.setColor(color);
        var w2 = Math.round(size*w*2);
        var x2 = Math.round((x-size)*w);
        var y2 = Math.round((y-size)*w);
        ip.fillRect(x2, y2, w2, w2);
        count++;
        if (count>1000) threshold=31;
        if (w2>=threshold) {
            imp.updateAndDraw();
            delay = (w2-threshold-1)/4;
            if (delay>200) delay=200;
            if (count<5000) delay+=100;
            if (count<1500) delay+=150;
            if (count<15) delay+=200;
            if (count>50000) delay/=2;
            if (delay>1)  {
                imp.setTitle("Cloud Debugger ("+count+", "+depth+")");
                IJ.wait(delay);
            }
        }
        var cT = (c1 + c2) / 2.0;
        var cB = (c3 + c4) / 2.0;
        var cL = (c1 + c3) / 2.0;
        var cR = (c2 + c4) / 2.0;
        plasma(x - size/2, y - size/2, size/2, stddev/2, cL, cM, c3, cB);
        plasma(x + size/2, y - size/2, size/2, stddev/2, cM, cR, cB, c4);
        plasma(x - size/2, y + size/2, size/2, stddev/2, c1, cT, cL, cM);
        plasma(x + size/2, y + size/2, size/2, stddev/2, cT, c2, cM, cR);
        depth--;
    }
