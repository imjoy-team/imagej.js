package Tools;

import ij.IJ;
import ij.ImagePlus;
import ij.Menus;
import ij.gui.ImageCanvas;
import ij.gui.ImageWindow;
import ij.gui.Toolbar;
import ij.measure.Calibration;
import ij.plugin.tool.PlugInTool;
import ij.process.ImageStatistics;
import java.awt.MenuItem;
import java.awt.PopupMenu;
import java.awt.Rectangle;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.MouseEvent;

/**
 * This tool will change the window/level by dragging the mouse.  The window is changed
 * by dragging the mouse over the image on the x axis.  The level is changed
 * by dragging the mouse on the y axis.
 */
public final class Window_Level_Tool extends PlugInTool implements ActionListener {
	static final int AUTO_THRESHOLD = 5000;
	final String origImg = "Image";	// these are the original images values
	final String abdom = "Chest-Abdomen";
	final String lung = "Lung";
	final String liver = "Liver";
	final String bone = "Bone";
	final String brain = "Brain-Sinus";
	int autoThreshold;
	private double currentMin = 0;
	private double currentMax = 0;
	private double rescaleIntercept = 0;
	private double rescaleSlope = 1.0;
	private double ctImgLevel, ctImgWidth;
	private int lastX = -1;
	private int lastY = -1;
	private ImagePlus impLast = null;
	private PopupMenu popup1 = null, oldPopup = null;
	private MenuItem autoItem, resetItem;
	private MenuItem ctOrig, ctAbdomen, ctLung, ctLiver, ctBone, ctBrain;
	private final int OFFSET = 0;
	private boolean RGB, isCT = false;

	@Override
	public void mousePressed(ImagePlus imp, MouseEvent e) {
		RGB = imp.getType() == ImagePlus.COLOR_RGB;
		if(impLast != imp) setupImage(imp, false);
		lastX = e.getX();
		lastY = e.getY();
		currentMin = imp.getDisplayRangeMin();
		currentMax = imp.getDisplayRangeMax();
	}

	@Override
	public void mouseDragged(ImagePlus imp, MouseEvent e ) {
		double minMaxDifference = currentMax - currentMin;
		int x = e.getX();
		int y = e.getY();
		int xDiff = x - lastX;
		int yDiff = y - lastY;
		int totalWidth  = (int) (imp.getWidth() * imp.getCanvas().getMagnification() );
		int totalHeight = (int) (imp.getHeight() * imp.getCanvas().getMagnification() );
		double xRatio = ((double)xDiff)/((double)totalWidth);
		double yRatio = ((double)yDiff)/((double)totalHeight);
		
		//scale to our image range
		double xScaledValue = minMaxDifference*xRatio;
		double yScaledValue = minMaxDifference*yRatio;

		//invert x
		xScaledValue = xScaledValue * -1;

		adjustWindowLevel(imp, xScaledValue, yScaledValue );
	}

	@Override
	public void mouseClicked(ImagePlus imp, MouseEvent e) {
		int n = e.getClickCount();
		if( n==2) fullScreen(imp);
	}

	void adjustWindowLevel(ImagePlus imp, double xDifference, double yDifference ) {

		//current settings
		double currentWindow = currentMax - currentMin;
		double currentLevel = currentMin + (.5*currentWindow);

		//change
		double newWindow = currentWindow + xDifference;
		double newLevel = currentLevel + yDifference;

		if( newWindow < 0 )
			newWindow = 0;
		if( newLevel < 0 )
			newLevel = 0;

		double printWin, printLev;
		printWin = newWindow * rescaleSlope;
		printLev = (newLevel + getCoef0(imp)) * rescaleSlope + rescaleIntercept;
		IJ.showStatus( "Window: " + IJ.d2s(printWin) + ", Level: " + IJ.d2s(printLev) );

		//convert to min/max
		double newMin = newLevel - (.5*newWindow);
		double newMax = newLevel + (.5*newWindow);

		imp.setDisplayRange(newMin, newMax);
		if(RGB) imp.draw();
		else imp.updateAndDraw();
	}
	
	void fullScreen(ImagePlus imp) {
		ImageWindow iw = imp.getWindow();
		ImageCanvas ic = imp.getCanvas();
		double zoom = ic.getMagnification();
		if( zoom < 1.1) {
			Rectangle rect = iw.getMaximumBounds();
			iw.setLocationAndSize(rect.x, rect.y, rect.width, rect.height);
		}
		else iw.minimize();
	}


	@Override
	public void showPopupMenu(MouseEvent e, Toolbar par) {
		addPopupMenu(par);
		popup1.show(e.getComponent(), e.getX()+OFFSET, e.getY()+OFFSET);
	}

	void addPopupMenu(Toolbar par) {
		ImagePlus imp = IJ.getImage();
		if(impLast != imp) setupImage(imp, true);
		if ( popup1 != null) return; // do only when necessary
		par.remove(oldPopup);
		oldPopup = null;
		popup1 = new PopupMenu();
		if (Menus.getFontSize()!=0)
			popup1.setFont(Menus.getFont());
		autoItem = new MenuItem("Auto");
		autoItem.addActionListener(this);
		popup1.add(autoItem);
		resetItem = new MenuItem("Reset");
		resetItem.addActionListener(this);
		popup1.add(resetItem);
		if (isCT) {
			popup1.addSeparator();
			ctOrig = new MenuItem(origImg);
			ctOrig.addActionListener(this);
			popup1.add(ctOrig);
			ctAbdomen = new MenuItem(abdom);
			ctAbdomen.addActionListener(this);
			popup1.add(ctAbdomen);
			ctLung = new MenuItem(lung);
			ctLung.addActionListener(this);
			popup1.add(ctLung);
			ctLiver = new MenuItem(liver);
			ctLiver.addActionListener(this);
			popup1.add(ctLiver);
			ctBone = new MenuItem(bone);
			ctBone.addActionListener(this);
			popup1.add(ctBone);
			ctBrain = new MenuItem(brain);
			ctBrain.addActionListener(this);
			popup1.add(ctBrain);
		}
		par.add(popup1);
	}

	@Override
	public void actionPerformed(ActionEvent e) {
		String cmd = e.getActionCommand();
		if ("Auto".equals(cmd))
			autoItemActionPerformed(e);
		else if ("Reset".equals(cmd))
			resetItemActionPerformed(e);
		else maybeSetCt(cmd);
	}
	
	private void setupImage(ImagePlus imp, boolean fullSetup) {
		if( imp == null) return;
		if(fullSetup) {
			RGB = imp.getType() == ImagePlus.COLOR_RGB;
			currentMin = imp.getDisplayRangeMin();
			currentMax = imp.getDisplayRangeMax();
		}
		boolean currType = isCTImage(imp);
		if( currType != isCT) {
			oldPopup = popup1;
			popup1 = null;
		}
		isCT = currType;
		if(RGB) imp.getProcessor().snapshot();
		autoThreshold = 0;
		impLast = imp;
	}
	
	private void autoItemActionPerformed(ActionEvent evt) {
		if( impLast == null || !impLast.isVisible()) return;
		int depth = impLast.getBitDepth();
		if( depth != 16 && depth != 32) {
			resetItemActionPerformed(evt);
			return;
		}
		int hmin, hmax;
		Calibration cal = impLast.getCalibration();
		impLast.setCalibration(null);
		ImageStatistics stat1 = impLast.getStatistics();	// uncalibrated
		impLast.setCalibration(cal);
		int limit = stat1.pixelCount/10;
		int[] histogram = stat1.histogram;
		if (autoThreshold<10) autoThreshold = AUTO_THRESHOLD;
		else autoThreshold /= 2;
		int threshold = stat1.pixelCount/autoThreshold;
		int i = -1;
		boolean found;
		int count;
		do {
			i++;
			count = histogram[i];
			if (count>limit) count = 0;
			found = count> threshold;
		} while (!found && i<255);
		hmin = i;
		i = 256;
		do {
			i--;
			count = histogram[i];
			if (count>limit) count = 0;
			found = count > threshold;
		} while (!found && i>0);
		hmax = i;
		if( hmax >= hmin) {
			currentMin = stat1.histMin + hmin*stat1.binSize;
			currentMax = stat1.histMin + hmax*stat1.binSize;
			if( currentMin == currentMax) {
				currentMin = stat1.min;
				currentMax = stat1.max;
			}
			adjustWindowLevel(impLast, 0 ,0);
		}
	}
	
	private void resetItemActionPerformed(ActionEvent evt) {
		if( impLast == null || !impLast.isVisible()) return;
		impLast.resetDisplayRange();
		currentMin = impLast.getDisplayRangeMin();
		currentMax = impLast.getDisplayRangeMax();
		autoThreshold = 0;
		if (RGB) {
			impLast.getProcessor().reset();
			currentMin = 0;
			currentMax = 255;
			impLast.setDisplayRange(currentMin, currentMax);
			impLast.draw();
		} else
			adjustWindowLevel(impLast, 0 ,0);
	}
	
	private void maybeSetCt(String cmd) {
		if( impLast == null || !impLast.isVisible()) return;
		autoThreshold = 0;
		double level1 = 0, width1 = -100000;
		if( cmd.equals(origImg)) {
			level1 = ctImgLevel;
			width1 = ctImgWidth;
		}
		if( cmd.equals(abdom)) {
			level1 = 56;
			width1 = 340;
		}
		if( cmd.equals(lung)) {
			level1 = -498;
			width1 = 1464;
		}
		if( cmd.equals(liver)) {
			level1 = 93;
			width1 = 108;
		}
		if( cmd.equals(bone)) {
			level1 = 570;
			width1 = 3080;
		}
		if( cmd.equals(brain)) {
			level1 = 40;
			width1 = 80;
		}
		if( width1 == -100000) return;
		width1 = width1 / rescaleSlope;
		level1 = (level1 - rescaleIntercept) / rescaleSlope;
		level1 -= getCoef0(impLast);
		currentMin = level1 - width1/2;
		currentMax = level1 + width1/2;
		adjustWindowLevel(impLast, 0 ,0);
	}
	
	private double getCoef0(ImagePlus img) {
		double[] coef = img.getCalibration().getCoefficients();
		double retVal = 0.;
		if (coef != null) retVal = coef[0];
		return retVal;
	}
	
	// both checks for CT and sets slope and intercept
	private boolean isCTImage(ImagePlus img) {
		// reset the slope and intercept
		rescaleIntercept = 0;
		rescaleSlope = 1.0;
		ctImgLevel = 56;
		ctImgWidth = 340;
		String meta = img.getStack().getSliceLabel(1);	// use slice 1
		// meta will be null for SPECT studies
		if (meta == null || !meta.contains("0010,0010")) meta = (String) img.getProperty("Info");
		if (meta == null) return false;
		String val1 = getDicomValue(meta, "0008,0016");	// SOPClass
		if( val1 == null) return false;	// maybe it isn't DICOM?
		// first check for Nuclear medicine
		if (val1.startsWith("1.2.840.10008.5.1.4.1.1.20")) return false;
		if (val1.startsWith("1.2.840.10008.5.1.4.1.1.2")) {
			if( getCoef0(img) == 0.) {
				val1 = getDicomValue(meta, "0028,1052");
				rescaleIntercept = parseDouble( val1, 0.);
			}
			val1 = getDicomValue(meta, "0028,1053");
			rescaleSlope = parseDouble( val1, 1.0);
			val1 = getDicomValue(meta, "0028,1050");
			ctImgLevel = parseDouble( val1, ctImgLevel);
			val1 = getDicomValue(meta, "0028,1051");
			ctImgWidth = parseDouble( val1, ctImgWidth);
			// need special treatment for Hawkeye
			val1 = getDicomValue(meta, "0008,1090");
			if( val1.equals("VARICAM") || val1.equals("INFINIA") || val1.equals("QUASAR")) {
				rescaleIntercept = -1000.;
				ctImgLevel += rescaleIntercept;
			}
			return true;
		}
		return false;
	}
	
	double parseDouble( String tmp1, double defaultValue) {
		double ret1 = defaultValue;
		if( tmp1 != null && !tmp1.isEmpty()) {
			try {
				ret1 = Double.parseDouble(tmp1);
			} catch (Exception e) {
				ret1 = defaultValue;
			}
		}
		return ret1;
	}
	
	private String getDicomValue(String meta, String key1) {
		String tmp1, ret1 = null;
		int k0, k1;
		if( meta == null) return null;
		k0 = meta.indexOf(key1);
		if( k0 > 0) {
			k1 = meta.indexOf("\n", k0);
			if( k1 < 0) return null;
			tmp1 = meta.substring(k0, k1);
			k1 = tmp1.indexOf(": ");
			if( k1 > 0) tmp1 = tmp1.substring(k1+2);
			ret1 = tmp1.trim();
			if( ret1.isEmpty()) ret1 = null;
		}
		return ret1;
	}

	@Override
	public String getToolIcon() {
		return "T0b12W Tbb12L";
	}

	@Override
	public String getToolName() {
		return "Window Level Tool (right click for Reset, Auto)";
	}
	
}
