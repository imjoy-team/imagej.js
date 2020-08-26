import ij.*;
import ij.plugin.*;
import ij.plugin.filter.RGBStackSplitter;
import ij.process.*;
import ij.gui.*;
import java.awt.*;

/* The author of this software is Christopher Philip Mauer.  Copyright (c) 2003.
Permission to use, copy, modify, and distribute this software for any purpose 
without fee is hereby granted, provided that this entire notice is included in 
all copies of any software which is or includes a copy or modification of this 
software and in all copies of the supporting documentation for such software.
Any for profit use of this software is expressly forbidden without first
obtaining the explicit consent of the author. 
THIS SOFTWARE IS BEING PROVIDED "AS IS", WITHOUT ANY EXPRESS OR IMPLIED WARRANTY. 
IN PARTICULAR, THE AUTHOR DOES NOT MAKE ANY REPRESENTATION OR WARRANTY 
OF ANY KIND CONCERNING THE MERCHANTABILITY OF THIS SOFTWARE OR ITS FITNESS FOR ANY 
PARTICULAR PURPOSE. 
*/
/* This PlugInFilter implements a recursive prediction/correction 
algorithm based on the Kalman Filter.  The application for which
it was designed is cleaning up timelapse image streams.  It operates 
in linear space by filtering a previously opened stack of images and
producing a new filtered stack.
													Christopher Philip Mauer 
	cpmauer@northwestern.edu
*/
public class Kalman_Stack_Filter implements PlugIn {
	private static double percentvar = 0.05;
	private static double gain = 0.8;;

	public void run (String arg) {
		ImagePlus imp = IJ.getImage();
		if (imp.getStackSize()==1)
			{IJ.error("Stack required"); return;}
		String ErrorMessage = new String("One of your values was not properly formatted.\nThe default values will be used.");
		GenericDialog d = new GenericDialog("Kalman Stack Filter");
		d.addNumericField("Acquisition_noise variance estimate:", percentvar, 2);
		d.addNumericField("Bias to be placed on the prediction:", gain, 2);
		d.showDialog();
		if(d.wasCanceled()) return;
		double percentvar = d.getNextNumber();
		gain = d.getNextNumber();	
		if(d.invalidNumber())
			{IJ.error("Invalid input Number"); return;}
		if(percentvar>1.0||gain>1.0||percentvar<0.0||gain<0.0){
			IJ.error(ErrorMessage);
			percentvar = 0.05;
			gain = 0.8;
		}
		ImageStack stack = imp.getStack();
		if (imp.getBitDepth()==24)
			stack = filterRGB(stack, percentvar, gain);
		else
			filter(stack, percentvar, gain);
		imp.setStack(null, stack);
	}

	public void filter(ImageStack stack, double percentvar, double gain) {
		ImageProcessor ip = stack.getProcessor(1);
		int bitDepth = 0;
		if (ip instanceof ByteProcessor)
			bitDepth = 8;
		else if (ip instanceof ShortProcessor)
			bitDepth = 16;
		else if (ip instanceof FloatProcessor)
			bitDepth = 32;
		else
			throw new IllegalArgumentException("RGB stacks not supported");

		int width = stack.getWidth();
		int height = stack.getHeight();
		int dimension = width*height;
		int stacksize = stack.getSize();
		double[] stackslice = new double[dimension];
		double[] filteredslice = new double[dimension];
		double[] noisevar = new double[dimension];
		double[] average = new double[dimension];
		double[] predicted = new double[dimension];
		double[] predictedvar = new double[dimension];
		double[] observed = new double[dimension];
		double[] Kalman = new double[dimension];
		double[] corrected = new double[dimension];
		double[] correctedvar = new double[dimension];
		
		for (int i=0; i<dimension; ++i)
			noisevar[i] = percentvar;
		predicted = toDouble(stack.getPixels(1), bitDepth);
		predictedvar = noisevar;
		
		for(int i=1; i<stacksize; ++i) {
			IJ.showProgress(i, stacksize);
			stackslice = toDouble(stack.getPixels(i+1), bitDepth);
			observed = toDouble(stackslice, 64);
			for(int k=0;k<Kalman.length;++k)
				Kalman[k] = predictedvar[k]/(predictedvar[k]+noisevar[k]);
			for(int k=0;k<corrected.length;++k)
				corrected[k] = gain*predicted[k]+(1.0-gain)*observed[k]+Kalman[k]*(observed[k] - predicted[k]);
			for(int k=0;k<correctedvar.length;++k)
				correctedvar[k] = predictedvar[k]*(1.0 - Kalman[k]);
			predictedvar = correctedvar;
			predicted = corrected;
			stack.setPixels(fromDouble(corrected, bitDepth), i+1);
		}
	}

	public ImageStack filterRGB(ImageStack stack, double percentvar, double gain) {
		RGBStackSplitter splitter = new RGBStackSplitter();
		splitter.split(stack, false);
		filter(splitter.red, percentvar, gain);
		filter(splitter.green, percentvar, gain);
		filter(splitter.blue, percentvar, gain);
		RGBStackMerge merge = new RGBStackMerge();
		ImageProcessor ip = splitter.red.getProcessor(1);
		return merge.mergeStacks(ip.getWidth(), ip.getHeight(), splitter.red.getSize(), splitter.red, splitter.green, splitter.blue, false);
        }
	
	public Object fromDouble(double[] array, int bitDepth) {
		switch (bitDepth) {
			case 8:
				byte[] bytes = new byte[array.length];
				for(int i=0; i<array.length; i++)
					bytes[i] = (byte)array[i];
				return bytes;
			case 16:
				short[] shorts = new short[array.length];
				for(int i=0; i<array.length; i++)
					shorts[i] = (short)array[i];
				return shorts;
			case 32:
				float[] floats = new float[array.length];
				for(int i=0; i<array.length; i++)
					floats[i] = (float)array[i];
				return floats;
		}
		return null;
	}

	public double[] toDouble(Object array, int bitDepth) {
		double[] doubles = null;
		switch (bitDepth) {
			case 8:
				byte[] bytes = (byte[])array;
				doubles = new double[bytes.length];
				for(int i=0; i<doubles.length; i++)
					doubles[i] = (bytes[i]&0xff);
				break;
			case 16:
				short[] shorts = (short[])array;
				doubles = new double[shorts.length];
				for(int i=0; i<doubles.length; i++)
					doubles[i] = (shorts[i]&0xffff);
				break;
			case 32:
				float[] floats = (float[])array;
				doubles = new double[floats.length];
				for(int i=0; i<doubles.length; i++)
					doubles[i] = floats[i];
				break;
			case 64:
				double[] doubles0 = (double[])array;
				doubles = new double[doubles0.length];
				for(int i=0; i<doubles.length; i++)
					doubles[i] = doubles0[i];
				break;
		}
		return doubles;
	}

}
