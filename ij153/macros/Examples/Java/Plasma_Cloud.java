import ij.*;
import ij.process.*;
import ij.plugin.*;
import java.awt.Color;
import java.util.Random;

/** This is a plugin version of the PlasmaCloud.java program from
    Section 2.3 (Recursion) of the book "Introduction to Programming in Java"
    by Robert Sedgewick and Kevin Wayne.
    http://introcs.cs.princeton.edu/java/23recursion/PlasmaCloud.java.html
*/
public class Plasma_Cloud implements PlugIn {
    private int w=1000, h=700;
    private Random ran = new Random();
    private ImageProcessor ip;
    private ImagePlus imp;
    private int count;
 
    public void run(String arg) {
         ip = new ColorProcessor(w,h);
         for (int i=0; i<25; i++) {
             showPlasma();
             IJ.wait(500);
         }
    }

    private void showPlasma() {
       // choose intial corner colors at random betwen 0 and 1
        double c1 = ran.nextDouble();
        double c2 = ran.nextDouble();
        double c3 = ran.nextDouble();
        double c4 = ran.nextDouble();
        long t0 = System.currentTimeMillis();
        // controls variation in color
        double stddev = 0.75;
        plasma(0.5, 0.5, 0.5, stddev, c1, c2, c3, c4);
        if (imp==null) {
            imp = new ImagePlus("Plasma Cloud", ip);
            imp.show();
        } else
            imp.updateAndDraw();
        long time = System.currentTimeMillis() - t0;
        imp.setTitle("Plasma Cloud ("+time+"ms)");
  }

    // centered at (x, y), of given size, using given standard deviation for computing the
    // displacement, and with upper left, upper right, lower lower, and lower right hues c1, c2, c3, c4
     private void plasma(double x,  double y,  double size, double stddev,
         double c1, double c2, double c3,   double c4) {

        // base case
        if (size<=0.001) return;

        // calculate new color of midpoint using random displacement
        double displacement = ran.nextGaussian()*stddev;
        double cM = (c1 + c2 + c3 + c4) / 4.0 + displacement;

        // draw a colored square
        Color color = Color.getHSBColor((float) cM, 0.8f, 0.8f);
        ip.setColor(color);
        int w2 = (int)Math.round(size*w*2);
        int h2 = (int)Math.round(size*h*2);
        int x2 = (int)Math.round((x-size)*w);
        int y2 = (int)Math.round((y-size)*h);
        ip.fillRect(x2, y2, w2, h2);
 
        double cT = (c1 + c2) / 2.0;    // top
        double cB = (c3 + c4) / 2.0;    // bottom
        double cL = (c1 + c3) / 2.0;    // left
        double cR = (c2 + c4) / 2.0;    // right

        plasma(x - size/2, y - size/2, size/2, stddev/2, cL, cM, c3, cB);
        plasma(x + size/2, y - size/2, size/2, stddev/2, cM, cR, cB, c4);
        plasma(x - size/2, y + size/2, size/2, stddev/2, c1, cT, cL, cM);
        plasma(x + size/2, y + size/2, size/2, stddev/2, cT, c2, cM, cR);
    }

}
