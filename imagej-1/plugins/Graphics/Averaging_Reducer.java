import ij.*;
import ij.process.*;
import ij.measure.Calibration;
import ij.gui.*;
import java.awt.*;
import ij.plugin.*;

public class Averaging_Reducer implements PlugIn {
    static int xshrink=2, yshrink=2;
    double product;
    int[] pixel = new int[3];
    int[] sum = new int[3];
    int samples;

    public void run(String arg) {
        ImagePlus imp = IJ.getImage();
        if (showDialog()) {
            ImagePlus imp2 = shrink(imp);
            imp2.show();
            imp2.setSlice(imp2.getStackSize()/2);
            imp2.getProcessor().resetMinAndMax();
        }
    }

    public ImagePlus shrink(ImagePlus imp) {
        ImageStack stack1 = imp.getStack();
        ImageStack stack2 = new ImageStack(imp.getWidth()/xshrink,imp.getHeight()/yshrink);
        int n = stack1.getSize();
        for (int i=1; i<=n; i++) {
            IJ.showStatus(i+"/"+n);
            IJ.showProgress(i, n);
            ImageProcessor ip2 = shrink(stack1.getProcessor(i));
            stack2.addSlice(null, ip2);
        }
        ImagePlus imp2 = new ImagePlus("Reduced "+imp.getShortTitle(), stack2);
        imp2.setCalibration(imp.getCalibration());
        Calibration cal2 = imp2.getCalibration();
        if (cal2.scaled()) {
            cal2.pixelWidth *= xshrink;
            cal2.pixelHeight *= yshrink;
        }
        return imp2;
    }

    public ImageProcessor shrink(ImageProcessor ip) {
        if (ip instanceof FloatProcessor)
                    return shrinkFloat(ip);
        samples = ip instanceof ColorProcessor?3:1;
        int w = ip.getWidth()/xshrink;
        int h = ip.getHeight()/yshrink;
        ImageProcessor ip2 = ip.createProcessor(w, h);
        for (int y=0; y<h; y++)
            for (int x=0; x<w; x++) 
                ip2.putPixel(x, y, getAverage(ip, x, y));
       return ip2;
    }

    int[] getAverage(ImageProcessor ip, int x, int y) {
         for (int i=0; i<samples; i++)
            sum[i] = 0;       
         for (int y2=0; y2<yshrink; y2++) {
            for (int x2=0;  x2<xshrink; x2++) {
                pixel = ip.getPixel(x*xshrink+x2, y*yshrink+y2, pixel); 
                for (int i=0; i<samples; i++)
                     sum[i] += pixel[i];
             }
        }
        for (int i=0; i<samples; i++)
            sum[i] = (int)(sum[i]/product+0.5);
       return sum;
    }

    boolean showDialog() {
        GenericDialog gd = new GenericDialog("Image Shrink");
        gd.addNumericField("X Shrink Factor:", xshrink, 0);
        gd.addNumericField("Y Shrink Factor:", yshrink, 0);
        gd.showDialog();
        if (gd.wasCanceled()) 
            return false;
        xshrink = (int) gd.getNextNumber();
        yshrink = (int) gd.getNextNumber();
        product = xshrink*yshrink;
        return true;
    }

   ImageProcessor shrinkFloat(ImageProcessor ip) {
        int w = ip.getWidth()/xshrink;
        int h = ip.getHeight()/yshrink;
        ImageProcessor ip2 = ip.createProcessor(w, h);
        for (int y=0; y<h; y++)
            for (int x=0; x<w; x++) 
                ip2.putPixelValue(x, y, getFloatAverage(ip, x, y));
        return ip2;
    }

    float getFloatAverage(ImageProcessor ip, int x, int y) {
        double sum = 0.0;
        for (int y2=0; y2<yshrink; y2++)
            for (int x2=0;  x2<xshrink; x2++)
                sum += ip.getPixelValue(x*xshrink+x2, y*yshrink+y2); 
        return (float)(sum/product);
    }

}
