import ij.*;
import ij.process.*;
import ij.plugin.*;

public class Sphere_ implements PlugIn {

  public void run(String arg) {
     double t0 = System.currentTimeMillis();
     int size = 512;
     ImageProcessor ip = new FloatProcessor(size,size);
     for (int y=0; y<size; y++) {
        for (int x=0; x<size; x++) {
           double dx=x-size/2, dy=y-size/2;
           double d = Math.sqrt(dx*dx+dy*dy);
           ip.setf(x,y,-(float)d);
        }
    }
    String time = (System.currentTimeMillis()-t0)/1000+" seconds";
    ImagePlus img = new ImagePlus(time,ip);
    IJ.run(img,"Red/Green","");
    img.show();
  }

}
