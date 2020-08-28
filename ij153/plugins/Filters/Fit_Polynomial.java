import ij.*;
import ij.plugin.filter.ExtendedPlugInFilter;
import ij.plugin.filter.PlugInFilterRunner;
import ij.gui.GenericDialog;
import ij.gui.DialogListener;
import ij.process.*;
import ij.plugin.filter.GaussianBlur;
import ij.measure.Calibration;
import ij.gui.Roi;
import java.util.Vector;
import java.awt.*;

/** This plugin-filter fits a polynomial of variable order to an
 * image. The selection (if any) determines the image area the polynomial
 * is fitted to. Output can be the polynomial fit or the image with the
 * fit subtracted. Output area is always the whole image, irrespective of the
 * selection.
 *
 * The order of the polynomial can be selected separarely for x, y and
 * mixed terms. E.g. with orders 2, 3, and 2 for x, y, and xy, respectively,
 * the polynomial will be
 *  a + b*x + c*x^2 + d*y + e*y^2 + f*y^3 + g*xy
 * (note that the lowest-order mixed term, xy, has order 2)
 *
 * "Output Fit (Don't Subtract)" determines whether the output should be
 * the polynomial function. If unchecked, the polynomial is subtracted
 * from the image.
 *
 * "Shift Values to Display Range" uses the mean value of the current
 * display range, (max+min)/2, as zero for the subtracted output
 * image. If unchecked, zero output corresponds to 128 for 8-bit
 * and RGB, 32768 for 16-bit and 0 for float images. This option has
 * no effect if "Output Fit (Don't Subtract)" is checked.
 * 
 * For 8-bit and 16-bit images with no or linear calibration, the image
 * will be calibrated by shifting the zero value appropriately.
 *
 * Restrictions:
 * - Undo will revert only the image contents, not the calibration.
 * - In some cases (some non-rectangular rois and/or very high order of
 * the polynomials), the fit may fail although mathematically possible
 * or produce no "Fit failed" message although there are not enough
 * points for the given order of the polynomial.
 *
 * Hints for usage:
 * - To exclude particles or other foreground objects from the
 * fit, select a threshold to include the background only, then run
 * Edit>Selection>Create Selection to restrict the fit to the
 * selection (i.e., to the background).
 * - For subtracting the background of 8-bit, 16-bit and RGB images,
 * saturation of the output can be avoided by setting
 * "Brightness&Contrast" to such values that desired background level
 * is in the middle of the displayed range, and selecting "Shift Values
 * to Display Range". Example: For an 8-bit image with background values
 * around 30 and no significant area of foreground objects in the
 * selection, set a display range of 0-60 before running the filter,
 * and check "Shift Values to Display Range".
 *
 *
 * This plugin-filter requires ImageJ 1.38u, which provides provisions
 * for preview.
 *
 * Version 2007-Jul-13 Michael Schmid
 */
public class Fit_Polynomial implements ExtendedPlugInFilter, DialogListener {

    /** the polynomial order in x */
    private static int xOrder = 1;
    /** the polynomial order in y */
    private static int yOrder = 1;
    /** the polynomial order of mixed x,y terms */
    private static int xyOrder = 0;
    /** whether output should bi a fit (instead of subtracting it) */
    private static boolean outputFit = false;
    /** whether to use the middle of the displayed pixels range as zero for the output */
    private static boolean shiftToDisplay = false;
    /** the flags specifying the capabilities and needs of the filter */
    private final int flags = DOES_ALL|CONVERT_TO_FLOAT|FINAL_PROCESSING|KEEP_PREVIEW|PARALLELIZE_STACKS;
    /** the ImagePlus of the setup call */
    private ImagePlus imp = null;
    /** the output level corresponding to zero*/
    private float offset = 0f;
    /** the number of base functions (and parameters) in the fit */
    private int baseSize;
    /** whether the matrix for the fit has been calculated already */
    private boolean matrixCalculated = false;
    /** the matrix used for the fit */
    private double[][] matrix;
    /** the powers of x and y for each element of the base */
    private int[] xPower, yPower;
    /** a list of the powers of all x & y coordinates required, arranged as
     *  0^0, 0^1, 0^(endPower-1), 1^0, 1^1, ... 1^(endPower-1), ... 
     * for better numeric performance, coordinates are transformed to
     * -1.5 ... 1.5 range within the roi */
    private double[] powerOfX, powerOfY;
    /** the highest power in powerOfN, plus 1*/
    private int endPower;
    /** the number of passes 2 * (color channels * stack slices) + 1 for matrix generation */
    private int nPasses = 2;
    /** current pass (for the progress bar) */
    private int pass;
    /** the time needed for making the matrix, compared to a typical pass */
    final static int MAKE_MATRIX_PASSES = 10;

    public int setup(String arg, ImagePlus imp) {
        if (arg.equals("final") && !outputFit) {
            setCalibration();              //at the very end: calibration (non-float images)
            return DONE;
        } else {
            if (IJ.versionLessThan("1.38u")) // generates an error message for older versions
                return DONE;
            this.imp = imp;
            return flags;
        }
    }

    /** Ask the user for the parameters
     */
    public int showDialog(ImagePlus imp, String command, PlugInFilterRunner pfr) {
        GenericDialog gd = new GenericDialog(command);
        gd.addSlider("x Direction: Order", 0., 10., xOrder);
        gd.addSlider("y Direction: Order", 0., 10., yOrder);
        gd.addSlider("mixed xy: Order", 0., 10., xyOrder);
        gd.addCheckbox("Output Fit (Don't Subtract)", outputFit);
        gd.addCheckbox("Shift Values to Display Range", shiftToDisplay);
        gd.addPreviewCheckbox(pfr);
        gd.addDialogListener(this);
        gd.addHelp("http://imagejdocu.tudor.lu/doku.php?id=plugin:filter:fit_polynomial:start");
        gd.showDialog();                    //input by the user (or macro) happens here
        if (gd.wasCanceled()) return DONE;
        IJ.register(this.getClass());       //protect static class variables (filter parameters) from garbage collection
        return IJ.setupDialog(imp, flags);  //ask whether to process all slices of stack (if a stack)
    }

    public boolean dialogItemChanged(GenericDialog gd, AWTEvent e) {
        Vector numericFields = gd.getNumericFields();
        xOrder = (int)gd.getNextNumber();
        yOrder = (int)gd.getNextNumber();
        xyOrder = (int)gd.getNextNumber();
        if (xOrder < 0 || yOrder < 0 || xyOrder < 0 || xOrder>50 || yOrder>50 || xyOrder>10)
            return false;
        outputFit = gd.getNextBoolean();
        shiftToDisplay = gd.getNextBoolean();
        if (e!=null && !(e.getSource() instanceof Checkbox))
            matrixCalculated = false;
        setOffset();
        return true;
    }

    private void setOffset() {
        ImageProcessor ip = imp.getProcessor();
        if (shiftToDisplay) {
            offset = (float)(ip.getMin() + ip.getMax())/2;
        } else {
            offset = 0f;
            if (ip instanceof ByteProcessor || ip instanceof ColorProcessor)
                offset = 128f;
            else if (ip instanceof ShortProcessor)
                offset = 32768f;
        }
     }

    private void setCalibration() {
        if (matrix==null) return;           //fit failed
        ImageProcessor ip = imp.getProcessor();
        /* Calibrate the image to reflect zero level (8-bit and 16-bit only) */
        if (!(ip instanceof FloatProcessor) && !(ip instanceof ColorProcessor)) {
            Calibration cal = imp.getCalibration();
            double slope = 1;
            String valueUnit = "Gray Value";
            if (cal != null && cal.calibrated() && cal.getFunction()== Calibration.STRAIGHT_LINE) {
                slope = cal.getCoefficients()[1];
                valueUnit = cal.getValueUnit();
            }
            double[] coefficients = new double[] {-offset*slope, slope};
            cal.setFunction(Calibration.STRAIGHT_LINE, coefficients, valueUnit);
        }
        if (!shiftToDisplay && (ip instanceof ShortProcessor || ip instanceof FloatProcessor)) {
            double range = ip.getMax() - ip.getMin();
            ip.setMinAndMax(offset-range/2, offset+range/2);
        }
    }

    /** This method is invoked for each slice and color channel during execution.
     * @param ip The image subject to filtering.
     * Since the CONVERT_TO_FLOAT flag is set, <code>ip</code> is always a FloatProcessor.
     */
    public void run(ImageProcessor ip) {
        Rectangle roi = ip.getRoi();
        int width = ip.getWidth();
        int height = ip.getHeight();
        float[] pixels = (float[])ip.getPixels();
        byte[] mask = ip.getMaskArray();
        Thread thread = Thread.currentThread();
        synchronized(this) {
            if (!matrixCalculated) {
                matrixCalculated = true;
                calculateMatrixEtc(ip);
                if (matrix == null)
                    IJ.error("Fit failed, use lower order.");
            }
        }
        if (matrix==null || thread.isInterrupted()) return;
        double[] vector = new double[baseSize];         //calculate fit
		long lastTime = System.currentTimeMillis();
        for (int y=roi.y, powerY=y*endPower; y<roi.y+roi.height; y++, powerY+=endPower) {
			long time = System.currentTimeMillis();
			if (time-lastTime > 100) {
				lastTime = time;
				if (thread.isInterrupted()) return;
				showProgress((y-roi.y)/(double)(roi.height));
            }
            for (int x=roi.x, p=width*y+x, m=(y-roi.y)*roi.width, powerX=x*endPower; x<roi.x+roi.width; x++, p++, m++, powerX+=endPower)
                if (mask == null || mask[m] != 0)
                    for (int iBase=0; iBase<baseSize; iBase++)
                        vector[iBase] += pixels[p]*
                                powerOfX[powerX+xPower[iBase]]*powerOfY[powerY+yPower[iBase]];
                    //for iBase
                //if inside mask
            //for x
        } //for y
        pass++;
        double[] coeff = new double[baseSize];
        for (int i=0; i<baseSize; i++)
            for (int j=0; j<baseSize; j++)
                coeff[i] += matrix[i][j]*vector[j];
        //IJ.log("coeff:");printVector(coeff);
        //                                              // apply fit
        for (int y=0, p=0, powerY=0; y<height; y++, powerY+=endPower) {
			long time = System.currentTimeMillis();
			if (time-lastTime > 100) {
				lastTime = time;
				if (thread.isInterrupted()) return;
				showProgress(y/(double)(height));
            }
            for (int x=0, powerX=0; x<width; x++, p++, powerX+=endPower) {
                double background = 0.;
                for (int iBase=0; iBase<baseSize; iBase++)
                    background += coeff[iBase]*powerOfX[powerX+xPower[iBase]]*powerOfY[powerY+yPower[iBase]];
                if (outputFit)
                    pixels[p] = (float)background;
                else
                    pixels[p] += offset - (float)background;
            } //for x
        } //for y
        pass++;
    }

    /** calculate the base, tabulate powers of integers required and
     *  calculate the matrix needed for fitting. On error, matrix = null. */
    private void calculateMatrixEtc(ImageProcessor ip) {
        Thread thread = Thread.currentThread();
        Rectangle roi = ip.getRoi();
        int width = ip.getWidth();
        int height = ip.getHeight();
        byte[] mask = ip.getMaskArray();
        baseSize = xyOrder*(xyOrder-1)/2;   // t h e   b a s e
        if (baseSize < 0) baseSize = 0;
        baseSize += xOrder + yOrder + 1;
        xPower = new int[baseSize];
        yPower = new int[baseSize];
        int iBase = 0;                      //get powers of x, y in the base
        for (int ix=0; ix<=xOrder; ix++, iBase++)
            xPower[iBase] = ix;
        for (int iy=1; iy<=yOrder; iy++, iBase++)
            yPower[iBase] = iy;
        for (int ix=1; ix<xyOrder; ix++)
            for (int iy=1; ix+iy<=xyOrder; iy++, iBase++) {
                xPower[iBase] = ix;
                yPower[iBase] = iy;
        }
        //IJ.log("xPower:");String s="";for (int i=0;i<baseSize;i++) s+=xPower[i]+","; IJ.log(s);
        //IJ.log("yPower:");s="";for (int i=0;i<baseSize;i++) s+=yPower[i]+","; IJ.log(s);
        endPower = xOrder > yOrder ? xOrder : yOrder;
        if (xyOrder-1 > endPower) endPower = xyOrder-1;
        endPower++;
        powerOfX = new double[endPower*width];
        powerOfY = new double[endPower*height];
        for (int x=0,p=0; x<width; x++) {    //tabulate powers of x coordinates
            double power = 1.;
            double xScaled = 3*(x-roi.x)/(double)roi.width-1.5; //scale to get well-conditioned matrix
            for (int iPow = 0; iPow<endPower; iPow++,p++) {
                powerOfX[p] = power;
                power *= xScaled;
            }
        } 
        for (int y=0,p=0; y<height; y++) {    //tabulate powers of y coordinates
            double power = 1.;
            double yScaled = 3*(y-roi.y)/(double)roi.height-1.5;
            for (int iPow = 0; iPow<endPower; iPow++,p++) {
                powerOfY[p] = power;
                power *= yScaled;
            }
        }                                   // t h e   m a t r i x
        matrix = new double[baseSize][baseSize];
		long lastTime = System.currentTimeMillis();
        for (int y=roi.y, powerY=y*endPower; y<roi.y+roi.height; y++, powerY+=endPower) {
			long time = System.currentTimeMillis();
			if (time-lastTime > 100) {
				lastTime = time;
				if (thread.isInterrupted()) return;
				showProgress(MAKE_MATRIX_PASSES*(y-roi.y)/(double)(roi.height));
            }
            for (int x=roi.x, p=width*y+x, m=(y-roi.y)*roi.width, powerX=x*endPower; x<roi.x+roi.width; x++, p++, m++, powerX+=endPower)
                if (mask == null || mask[m] != 0)
                    for (iBase=0; iBase<baseSize; iBase++) {
                        double fct = powerOfX[powerX+xPower[iBase]]*powerOfY[powerY+yPower[iBase]];
                        matrix[iBase][iBase] += fct*fct;
                        for (int iBase1=0; iBase1<iBase; iBase1++) {
                            double fct1 = powerOfX[powerX+xPower[iBase1]]*powerOfY[powerY+yPower[iBase1]];
                            matrix[iBase][iBase1] += fct*fct1;
                            matrix[iBase1][iBase] += fct*fct1;
                        }
                    }
                //for x
            //if inside mask
        } //for y
        if (!invertSymmetricMatrix(matrix)) matrix = null;
        pass += MAKE_MATRIX_PASSES;
    }

    /** Invert a symmetric n*n matrix. Returns false on error (singular matrix).
     * Needs a reasonably well-conditioned matrix */
    public static boolean invertSymmetricMatrix(double[][] matrix) {
        int n = matrix.length;
        if (matrix[0].length != n) {
            IJ.error("invertSymmetricMatrix - not a square matrix");
            return false;
        }
        boolean[] processed = new boolean[n];
        double[] qq = new double[n];
        double[] pp = new double[n];
        double pivot0 = 1e-50;           //absolute value of the first (largest) pivot
        //IJ.log("---invert matrix---"); printMatrix(matrix);
        for (int i=0; i<n; i++) {       //loop: process all matrix lines&columns
            double max = pivot0 * 1e-14; //pivot must be bigger than this
            int iPivot = -1;
            for (int j=0; j<n; j++)     //find pivot
                if (!processed[j]) {
                    double abs = matrix[j][j];
                    abs = abs<0 ? -abs : abs;//abs = Math.abs(matrix[j][j]); but faster
                    if (abs > max)  {
                        max = abs;
                        iPivot = j;
                    }
            }
            if (iPivot < 0)
                return false;           //no pivot large enough, looks singular
            if (i==0)
                pivot0 = max;
            processed[iPivot] = true;
            pp[iPivot] = 1.;
            double q = 1./matrix[iPivot][iPivot];
            qq[iPivot] = q;
            matrix[iPivot][iPivot] = 0.;
            for (int j=0; j<iPivot; j++) {
                pp[j] = matrix[j][iPivot];
                qq[j] = matrix[j][iPivot]*q*(processed[j]?1:-1);
                matrix[j][iPivot] = 0.;
            }
            for (int j=iPivot+1; j<n; j++) {
                pp[j] = matrix[iPivot][j]*(processed[j]?-1:1);
                qq[j] = -matrix[iPivot][j]*q;
                matrix[iPivot][j] = 0.;
            }
            for (int j=0; j<n; j++)
                for (int k=j; k<n; k++)
                    matrix[j][k] += pp[j]*qq[k];
            //printMatrix(matrix);
        } //for i
        //IJ.log("asymmetric:");printMatrix(matrix);
        for (int i=1; i<n; i++)         //fill bottom left to make symmetric again
            for (int j=0; j<i; j++)
                matrix[i][j] = matrix[j][i];
        //IJ.log("result:");printMatrix(matrix);
        return true;
    }
	/** This method is called by ImageJ to set the number of calls to run(ip)
	 *  corresponding to 100% of the progress bar */
	public void setNPasses (int nPasses) {
		this.nPasses = 2*nPasses; //one pass for fitting, one for subtracting
		if (!matrixCalculated) this.nPasses += MAKE_MATRIX_PASSES; //+time for making the matrix
        pass = 0;
	}

    private void showProgress(double percent) {
    	percent = (pass + percent)/nPasses;
    	IJ.showProgress(percent);
    }

    /** for debug output */
    /*
    static void printMatrix(double[][] matrix) {
        int n = matrix.length;
        for (int i=0; i<n; i++) {
            StringBuffer b = new StringBuffer(n*13);
                for (int j=0; j<n; j++)
                    addToStringBuffer(b, matrix[i][j]);
            IJ.log(b.toString());
        }
    }
    static void printVector(double[] vector) {
        int n = vector.length;
        StringBuffer b = new StringBuffer(n*13);
        for (int i=0; i<n; i++)
            addToStringBuffer(b, vector[i]);
        IJ.log(b.toString());
    }
    static void addToStringBuffer(StringBuffer b, double x) {
        String s = Float.toString((float)x);
        b.append(" ");
        for (int i=s.length();i<12;i++)
            b.append(" ");
        b.append(s);
    }
    */
}
