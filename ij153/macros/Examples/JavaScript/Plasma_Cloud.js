// This is an Imagej JavaScript version of the PlasmaCloud
// example from Section 2.3 (Recursion) of the book
// "Introduction to Programming in Java" by Robert
// Sedgewick and Kevin Wayne.
// http://introcs.cs.princeton.edu/java/23recursion/PlasmaCloud.java.html

    w=1000; h=700;
    ran = new Random();
    ip = new ColorProcessor(w,h);
    imp = null;
    for (i=0; i<25; i++) {
        update();
        IJ.wait(500);
     }
 
    function update() {
       // choose intial corner colors at random betwen 0 and 1
        var c1 = ran.nextDouble();
        var c2 = ran.nextDouble();
        var c3 = ran.nextDouble();
        var c4 = ran.nextDouble();
        var stddev = 0.75; // controls color variation
        t0 = System.currentTimeMillis();
        plasma(0.5, 0.5, 0.5, stddev, c1, c2, c3, c4);
        if (imp==null) {
            imp = new ImagePlus("Plasma Cloud", ip);
            imp.show();
        } else
            imp.updateAndDraw();
        time = System.currentTimeMillis() - t0;
        imp.setTitle("Plasma Cloud ("+time+"ms)");
   }

    function plasma(x,  y,  size, stddev, c1, c2, c3, c4) {
 
        // base case
        if (size<=0.001) return;

        // calculate new color of midpoint using random displacement
        var displacement = ran.nextGaussian()*stddev;
        var cM = (c1 + c2 + c3 + c4) / 4.0 + displacement;
 
        // draw a colored square
        var color = Color.getHSBColor(cM, 0.8, 0.8);
        ip.setColor(color);
        var w2 = Math.round(size*w*2);
        var h2 = Math.round(size*h*2);
        var x2 = Math.round((x-size)*w);
        var y2 = Math.round((y-size)*h);
        ip.fillRect(x2, y2, w2, h2);
 
        var cT = (c1 + c2) / 2.0;    // top
        var cB = (c3 + c4) / 2.0;    // bottom
        var cL = (c1 + c3) / 2.0;    // left
        var cR = (c2 + c4) / 2.0;    // right

        plasma(x - size/2, y - size/2, size/2, stddev/2, cL, cM, c3, cB);
        plasma(x + size/2, y - size/2, size/2, stddev/2, cM, cR, cB, c4);
        plasma(x - size/2, y + size/2, size/2, stddev/2, c1, cT, cL, cM);
        plasma(x + size/2, y + size/2, size/2, stddev/2, cT, c2, cM, cR);
    }
