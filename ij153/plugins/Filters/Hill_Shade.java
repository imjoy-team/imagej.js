import ij.*;
import ij.process.*;
import ij.plugin.filter.ExtendedPlugInFilter;
import ij.plugin.filter.PlugInFilterRunner;
import ij.gui.*;
import java.awt.*;

/** Hill_Shade
 *  Produces relief shading similar to topographic maps, assuming that the pixel value is
 *  the height of a surface at the given position (x, y).
 *  Needs an 8-bit, 16-bit or float (=32-bit) input image; pixel value (height) calibration of
 *  8-bit and 16-bit input images is taken into account.
 *  The plugin produces a new 8-bit grayscale output image, irrespective of the type of
 *  input image. Preview is shown as an overlay of the input image, however.
 *  When 'Nonlinear Contrast' and 'Half Brightness for Flat Areas' are off, the brightness
 *  is proportional to the cosine of the angle between the direction perpendicular to the
 *  the indecent light.  If that angle is 90 degrees or more, i.e. if the slope that is
 *  directed away from the light source (Sun), the output is black.
 *  It is assumed that the "Mountains" do not cast a shadow, however.
 *
 * Dialog Parameters
 *    x Pixel Size  - Size of one pixel in x direction, in the same units as the pixel value.
 *    y Pixel Size  - Size of one pixel in y direction, in the same units as the pixel value.
 *    Elevation of Sun - height of the light source in degrees, typically between 30 and 60
 *    Azimuth of Sun  - direction to the light source in degrees, 0 is north, 90 east etc.
 *    Nonlinear Contrast - a number >0 (typically 1-4) enhances contrast for gentle slopes.
 *    Half Brightness for Horizontal - when selected, a gamma correction is applied to
 *      the output, such that a horizontal plane will appear with half brightness
 *      (pixel value = 128), irrespective of the elevation of the sun. When not selected,
 *      the pixel value of a horizontal plane will be roughly 256*sin(Sun_Elevation).
 *
 *
 * V 1.1  Michael Schmid 2014-11-21 fixes edge pixels, more options
 */

public class Hill_Shade implements ExtendedPlugInFilter, DialogListener {
    private static int FLAGS =      //bitwise or of the following flags:
            DOES_8G | DOES_16 | DOES_32 | //data types handled
            NO_CHANGES;             //it leaves the original untouched
    //remember these settings within an ImageJ session
    private static double xPixelSizeS = 90;
    private static double yPixelSizeS = 90;
    private static double elevationS = 45;
    private static double azimuthS = 315;
    private static double nonlinContrastS = 0;
    private static boolean halfBrightFlatS = true;
    //parameters
    private double xPixelSize;
    private double yPixelSize;
    private double elevation;
    private double azimuth;
    private double nonlinContrast;
    private boolean halfBrightFlat;
    //internal
    boolean previewing;
    ImagePlus imp;

    /**
     * This method is called by ImageJ for initialization.
     * @param arg Unused here. For plugins in a .jar file this argument string could
     *            be specified in the plugins.config file of the .jar archive.
     * @param imp The ImagePlus containing the image (or stack) to process.
     * @return    The method returns flags (i.e., a bit mask) specifying the
     *            capabilities (supported formats, etc.) and needs of the filter.
     *            See PlugInFilter.java and ExtendedPlugInFilter in the ImageJ
     *            sources for details.
     */
    public int setup (String arg, ImagePlus imp) {
        return FLAGS;
    }

    /** Ask the user for the parameters. This method of an ExtendedPlugInFilter
     *  is called by ImageJ after setup.
     * @param imp       The ImagePlus containing the image (or stack) to process.
     * @param command   The ImageJ command (as it appears the menu) that has invoked this filter
     * @param pfr       A reference to the PlugInFilterRunner, needed for preview
     * @return          Flags, i.e. a code describing supported formats etc.
     */
    public int showDialog (ImagePlus imp, String command, PlugInFilterRunner pfr) {
        this.imp = imp;
        if (imp.getWidth() < 3 || imp.getHeight() < 3) {
            IJ.error(command, "Error: Image too small");
            return DONE;
        }
        Overlay ovly = imp.getOverlay();
        GenericDialog gd = new GenericDialog(command+"...");
        gd.addNumericField("x Pixel Size", xPixelSizeS, 1, 8, "(height units)");
        gd.addNumericField("y Pixel Size", yPixelSizeS, 1, 8, "(height units)");
        gd.addNumericField("Elevation of Sun", elevationS, 0, 8, "\u00b0");
        gd.addNumericField("Azimuth of Sun", azimuthS, 0, 8, "\u00b0");
        gd.addNumericField("Nonlinear Contrast", nonlinContrastS, 0, 8, "");
        gd.addCheckbox("Half Brightness for Horizontal", halfBrightFlatS);
        gd.addPreviewCheckbox(pfr);
        gd.addDialogListener(this);
        previewing = true;
        gd.showDialog();            // user input (or reading from macro) happens now
        previewing = false;
        imp.setOverlay(ovly);
        if (gd.wasCanceled())       // dialog cancelled?
            return DONE;
        xPixelSizeS = xPixelSize;   // remember parameters for the next time
        yPixelSizeS = yPixelSize;
        elevationS = elevation;
        azimuthS = azimuth;
        halfBrightFlatS = halfBrightFlat;
        return FLAGS;               // triggers processing the slice
    }

    /** Listener to modifications of the input fields of the dialog.
     *  Here the parameters should be read from the input dialog.
     *  @param gd The GenericDialog that the input belongs to
     *  @param e  The input event
     *  @return whether the input is valid and the filter may be run with these parameters
     */
    public boolean dialogItemChanged (GenericDialog gd, AWTEvent e) {
        xPixelSize = gd.getNextNumber();
        yPixelSize = gd.getNextNumber();
        elevation = gd.getNextNumber();
        azimuth = gd.getNextNumber();
        nonlinContrast = gd.getNextNumber();
        halfBrightFlat = gd.getNextBoolean();
        return !gd.invalidNumber() && xPixelSize>0 && yPixelSize>0;
    }

    /**
     * This method is called by ImageJ for processing
     * @param ip The image that should be processed
     */
    public void run (ImageProcessor ip) {
        ByteProcessor bp = makeHillshade(ip, xPixelSize, yPixelSize, elevation, azimuth, nonlinContrast, halfBrightFlat);
        if (bp == null) return; //preview interrupted?
        if (previewing) {
            if (!Thread.currentThread().isInterrupted())
                imp.setOverlay(new Overlay(new ImageRoi(0,0,bp)));
        } else {
            String title = imp.getTitle()+"_shaded";
            title = WindowManager.makeUniqueName(title);
            new ImagePlus(title, bp).show();
        }
    }

    /** And here we create the actual hillshade */
    public static ByteProcessor makeHillshade(ImageProcessor ip, double xPixelSize, double yPixelSize,
            double elevation, double azimuth, double nonlinContrast, boolean halfBrightFlat) {
        int width = ip.getWidth();
        int height = ip.getHeight();
        ByteProcessor bp = new ByteProcessor(width, height);
        elevation *= Math.PI/180;               //to radians
        azimuth  *= Math.PI/180;
        double xSun = Math.sin(azimuth)*Math.cos(elevation);
        double ySun = -Math.cos(azimuth)*Math.cos(elevation);
        double zSun = Math.sin(elevation);      //normalized vector to the sun
        for (int y=1; y<height-1; y++) {        //for all interior pixels
            if (y%50==0) {
                if (Thread.currentThread().isInterrupted())
                    return null;                //preview interrupted
                IJ.showProgress((y-1)/(double)height);
            }
            float a, d, g;                      //a...i will be a 9-pixel neighborhood
            float b = ip.getPixelValue(0, y-1); //preload values
            float c = ip.getPixelValue(1, y-1);
            float e = ip.getPixelValue(0, y);
            float f = ip.getPixelValue(1, y);
            float h = ip.getPixelValue(0, y+1);
            float i = ip.getPixelValue(1, y+1);
            for (int x=1; x<width-1; x++) {
                a = b; b = c;   //shift pixels in x by 1
                d = e; e = f;
                g = h; h = i;
                c = ip.getPixelValue(x+1, y-1);
                f = ip.getPixelValue(x+1, y);
                i = ip.getPixelValue(x+1, y+1);
                double xSlope = ((a+2*d+g)-(c+2*f+i)) /(8*xPixelSize);
                double ySlope = ((a+2*b+c)-(g+2*h+i)) /(8*yPixelSize);
                double hillshade = getShade(xSlope, ySlope, xSun, ySun, zSun, 1./nonlinContrast, halfBrightFlat);
                bp.putPixelValue(x,y, hillshade);
            }
        }
        double[] slopes = new double[2];        //used to return xSlope, ySlope
        for (int y=0; y<height; y+=height-1)    //edges: for y=0 and y=height-1
            for (int x=1; x<width-1; x++) {
                getEdgeSlopeX(ip, x, y, xPixelSize, yPixelSize, slopes);
                double hillshade = getShade(slopes[0], slopes[1], xSun, ySun, zSun, 1./nonlinContrast, halfBrightFlat);
                bp.putPixelValue(x, y, hillshade);
            }
        for (int x=0; x<width; x+=width-1)      //edges: for x=0 and x=height-1
            for (int y=1; y<height-1; y++) {
                getEdgeSlopeY(ip, x, y, xPixelSize, yPixelSize, slopes);
                double hillshade = getShade(slopes[0], slopes[1], xSun, ySun, zSun, 1./nonlinContrast, halfBrightFlat);
                bp.putPixelValue(x, y, hillshade);
            }
        for (int y=0; y<height; y+=height-1)    //4 corners
            for (int x=0; x<width; x+=width-1) {
                getCornerSlope(ip, x, y, xPixelSize, yPixelSize, slopes);
                double hillshade = getShade(slopes[0], slopes[1], xSun, ySun, zSun, 1./nonlinContrast, halfBrightFlat);
                bp.putPixelValue(x, y, hillshade);
            }
        IJ.showProgress(1.0);
        return bp;
    }

    /** For the edges in x direction, write xSlope, ySlope into slopes[0], slopes[1] */
    private static void getEdgeSlopeX(ImageProcessor ip, int x, int y, double xPixelSize, double yPixelSize, double[] slopes) {
        int y1 = y==0 ? 1 : y-1;
        int y2 = y==0 ? 2 : y-2;
        float a = ip.getPixelValue(x-1, y);
        float b = ip.getPixelValue(x, y);
        float c = ip.getPixelValue(x+1, y);
        float d = ip.getPixelValue(x-1, y1);
        float e = ip.getPixelValue(x, y1);
        float f = ip.getPixelValue(x+1, y1);
        float g = ip.getPixelValue(x-1, y2);
        float h = ip.getPixelValue(x, y2);
        float i = ip.getPixelValue(x+1, y2);
        slopes[0] = (a-c) / (2*xPixelSize);     //xSlope
        slopes[1] = (4*(d+2*e+f) - 3*(a+2*b+c) - (g+2*h+i)) / (8*yPixelSize);  //ySlope: extrapolate
        if (y==0) slopes[1] = -slopes[1];
    }

    /** For the edges in y direction, write edge xSlope, ySlope into slopes[0], slopes[1] */
    private static void getEdgeSlopeY(ImageProcessor ip, int x, int y, double xPixelSize, double yPixelSize, double[] slopes) {
        int x1 = x==0 ? 1 : x-1;
        int x2 = x==0 ? 2 : x-2;
        float a = ip.getPixelValue(x, y-1);
        float b = ip.getPixelValue(x, y);
        float c = ip.getPixelValue(x, y+1);
        float d = ip.getPixelValue(x1, y-1);
        float e = ip.getPixelValue(x1, y);
        float f = ip.getPixelValue(x1, y+1);
        float g = ip.getPixelValue(x2, y-1);
        float h = ip.getPixelValue(x2, y);
        float i = ip.getPixelValue(x2, y+1);
        slopes[1] = (a-c) / (2*yPixelSize);     //ySlope
        slopes[0] = (4*(d+2*e+f) - 3*(a+2*b+c) - (g+2*h+i)) / (8*xPixelSize);  //xSlope: extrapolate
        if (x==0) slopes[0] = -slopes[0];
    }

    /** For the corners, write xSlope, ySlope into slopes[0], slopes[1] */
    private static void getCornerSlope(ImageProcessor ip, int x, int y, double xPixelSize, double yPixelSize, double[] slopes) {
        int x1 = x==0 ? 1 : x-1;
        int x2 = x==0 ? 2 : x-2;
        int y1 = y==0 ? 1 : y-1;
        int y2 = y==0 ? 2 : y-2;
        float a = ip.getPixelValue(x, y);
        float bx = ip.getPixelValue(x1, y);
        float cx = ip.getPixelValue(x2, y);
        float by = ip.getPixelValue(x, y1);
        float cy = ip.getPixelValue(x, y2);
        slopes[0] = (4*bx - 3*a - cx) / (2*xPixelSize);  //xSlope: extrapolate
        if (x==0) slopes[0] = -slopes[0];
        slopes[1] = (4*by - 3*a - cy) / (2*yPixelSize);  //ySlope: extrapolate
        if (y==0) slopes[1] = -slopes[1];
    }

    /** calculates the shade value between 0 and 256 */
    private static double getShade(double xSlope, double ySlope, double xSun, double ySun, double zSun, double invNonlinContrast, boolean halfBrightFlat) {
        double slopeSqr = xSlope*xSlope + ySlope*ySlope;
        double slopeFact = 1./Math.sqrt(1+slopeSqr);
        double xNorm = xSlope*slopeFact;
        double yNorm = ySlope*slopeFact;
        double zNorm = slopeFact;
        double hillshade = xNorm*xSun + yNorm*ySun + zNorm*zSun;
        boolean doNonlinContrast = invNonlinContrast < 1e5;
        if ((halfBrightFlat || doNonlinContrast) && hillshade > 0 && zSun > 0.0001 && zSun < 0.99999)
            hillshade = Math.pow(hillshade, Math.log(0.5)/Math.log(zSun));  //gamma, puts the 'neutral point' to 0.5
        if (doNonlinContrast) {
            double sign = hillshade > 0.5 ? +2.0 : -2.0;
            double tmp = sign*(hillshade - 0.5); //0...1 range
            tmp = Math.log(invNonlinContrast + tmp);
            double min = Math.log(invNonlinContrast);
            double max = Math.log(invNonlinContrast + 1);
            tmp = (tmp - min)/(max - min);
            hillshade = 0.5 + 0.25*tmp*sign;
            if (doNonlinContrast && !halfBrightFlat) //revert gamma if undesired
                hillshade = Math.pow(hillshade, Math.log(zSun)/Math.log(0.5));
        }
        return hillshade * 256.0;
    }

    /** Set the number of calls of the run(ip) method. This information is
     *  needed for displaying a progress bar; unused here.
     */
    public void setNPasses (int nPasses) {}

}
