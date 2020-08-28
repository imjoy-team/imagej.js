/**
 * License: GPL
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License 2
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.
 */
import java.awt.Rectangle;
import ij.IJ;
import ij.ImagePlus;
import ij.Undo;
import ij.gui.GenericDialog;
import ij.gui.Roi;
import ij.plugin.PlugIn;
import ij.process.ByteProcessor;
import ij.process.ImageProcessor;

/**
 * &lsquot;Contrast Limited Adaptive Histogram Equalization&rsquot; as
 * described in
 * 
 * <br />BibTeX:
 * <pre>
 * @article{zuiderveld94,
 *   author    = {Zuiderveld, Karel},
 *   title     = {Contrast limited adaptive histogram equalization},
 *   book      = {Graphics gems IV},
 *   year      = {1994},
 *   isbn      = {0-12-336155-9},
 *   pages     = {474--485},
 *   publisher = {Academic Press Professional, Inc.},
 *   address   = {San Diego, CA, USA},
 * }
 * </pre>
 * 
 * @author Stephan Saalfeld <saalfeld@mpi-cbg.de>
 * @version 0.1b
 */
public class Enhance_Local_Contrast implements PlugIn
{
	static private int blockRadius = 63;
	static private int bins = 255;
	static private float slope = 3;
	
	final static boolean setup()
	{
		final GenericDialog gd = new GenericDialog( "Enhance Local Contrast" );
		gd.addNumericField( "blocksize : ", blockRadius * 2 + 1, 0 );
		gd.addNumericField( "histogram bins : ", bins + 1, 0 );
		gd.addNumericField( "maximum slope : ", slope, 2 );
		gd.addHelp( "http://fiji.sc/Enhance_Local_Contrast_(CLAHE)" );
		
		gd.showDialog();
		
		if ( gd.wasCanceled() ) return false;
		
		blockRadius = ( ( int )gd.getNextNumber() - 1 ) / 2;
		bins = ( int )gd.getNextNumber() - 1;
		slope = ( float )gd.getNextNumber();
		
		return true;
	}
	
	final public void run( final String arg )
	{
		final ImagePlus imp = IJ.getImage();
		synchronized ( imp )
		{
			if ( !imp.isLocked() )
				imp.lock();
			else
			{
				IJ.error( "The image '" + imp.getTitle() + "' is in use currently.\nPlease wait until the process is done and try again." );
				return;
			}
		}
		
		if ( !setup() )
		{
			imp.unlock();
			return;
		}
		
		Undo.setup( Undo.TRANSFORM, imp );
		
		run( imp );
		imp.unlock();
	}
	
	/**
	 * Process an {@link ImagePlus} with the static parameters.  Create mask
	 * and bounding box from the {@link Roi} of that {@link ImagePlus}.
	 * 
	 * @param imp
	 */
	final static public void run( final ImagePlus imp )
	{
		run( imp, blockRadius, bins, slope );
	}
	
	/**
	 * Process and {@link ImagePlus} with a given set of parameters.  Create
	 * mask and bounding box from the {@link Roi} of that {@link ImagePlus}.
	 * 
	 * @param imp
	 * @param blockRadius
	 * @param bins
	 * @param slope
	 */
	final static public void run(
			final ImagePlus imp,
			final int blockRadius,
			final int bins,
			final float slope )
	{
		final Roi roi = imp.getRoi();
		if ( roi == null )
			run( imp, blockRadius, bins, slope, null, null );
		else
		{
			final Rectangle roiBox = roi.getBounds();
			final ImageProcessor mask = roi.getMask();
			if ( mask != null )
				run( imp, blockRadius, bins, slope, roiBox, ( ByteProcessor )mask.convertToByte( false ) );
			else
				run( imp, blockRadius, bins, slope, roiBox, null );
		}
	}
	
	/**
	 * Process and {@link ImagePlus} with a given set of parameters including
	 * the bounding box and mask.
	 * 
	 * @param imp
	 * @param blockRadius
	 * @param bins
	 * @param slope
	 * @param roiBox can be null
	 * @param mask can be null
	 */
	final static public void run(
			final ImagePlus imp,
			final int blockRadius,
			final int bins,
			final float slope,
			final java.awt.Rectangle roiBox,
			final ByteProcessor mask )
	{
		/* initialize box if necessary */
		final Rectangle box;
		if ( roiBox == null )
		{
			if ( mask == null )
				box = new Rectangle( 0, 0, imp.getWidth(), imp.getHeight() );
			else
				box = new Rectangle( 0, 0, Math.min( imp.getWidth(), mask.getWidth() ), Math.min( imp.getHeight(), mask.getHeight() ) );
		}
		else
			box = roiBox;
		
		/* make sure that the box is not larger than the mask */
		if ( mask != null )
		{
			box.width = Math.min( mask.getWidth(), box.width );
			box.height = Math.min( mask.getHeight(), box.height );
		}
		
		/* make sure that the box is not larger than the image */
		box.width = Math.min( imp.getWidth() - box.x, box.width );
		box.height = Math.min( imp.getHeight() - box.y, box.height );
		
		final int boxXMax = box.x + box.width;
		final int boxYMax = box.y + box.height;
		
		/* convert 8bit processors with a LUT to RGB and create Undo-step */
		final ImageProcessor ip;
		if ( imp.getType() == ImagePlus.COLOR_256 )
		{
			ip = imp.getProcessor().convertToRGB();
			imp.setProcessor( imp.getTitle(), ip );
		}
		else
			ip = imp.getProcessor();
		
		/* work on ByteProcessors that reflect the user defined intensity range */
		final ByteProcessor src;
		if ( imp.getType() == ImagePlus.GRAY8 )
			src = ( ByteProcessor )ip.convertToByte( true ).duplicate();
		else
			src = ( ByteProcessor )ip.convertToByte( true );
		final ByteProcessor dst = ( ByteProcessor )src.duplicate();
		
		for ( int y = box.y; y < boxYMax; ++y )
		{
			final int yMin = Math.max( 0, y - blockRadius );
			final int yMax = Math.min( imp.getHeight(), y + blockRadius + 1 );
			final int h = yMax - yMin;
			
			final int xMin0 = Math.max( 0, box.x - blockRadius );
			final int xMax0 = Math.min( imp.getWidth() - 1, box.x + blockRadius );
			
			/* initially fill histogram */
			final int[] hist = new int[ bins + 1 ];
			final int[] clippedHist = new int[ bins + 1 ];
			for ( int yi = yMin; yi < yMax; ++yi )
				for ( int xi = xMin0; xi < xMax0; ++xi )
					++hist[ roundPositive( src.get( xi, yi ) / 255.0f * bins ) ];
			
			for ( int x = box.x; x < boxXMax; ++x )
			{
				final int v = roundPositive( src.get( x, y ) / 255.0f * bins );
				
				final int xMin = Math.max( 0, x - blockRadius );
				final int xMax = x + blockRadius + 1;
				final int w = Math.min( imp.getWidth(), xMax ) - xMin;
				final int n = h * w;
				
				final int limit;
				if ( mask == null )
					limit = ( int )( slope * n / bins + 0.5f );
				else
					limit = ( int )( ( 1 + mask.get( x - box.x,  y - box.y ) / 255.0f * ( slope - 1 ) ) * n / bins + 0.5f );
				
				/* remove left behind values from histogram */
				if ( xMin > 0 )
				{
					final int xMin1 = xMin - 1;
					for ( int yi = yMin; yi < yMax; ++yi )
						--hist[ roundPositive( src.get( xMin1, yi ) / 255.0f * bins ) ];						
				}
					
				/* add newly included values to histogram */
				if ( xMax <= imp.getWidth() )
				{
					final int xMax1 = xMax - 1;
					for ( int yi = yMin; yi < yMax; ++yi )
						++hist[ roundPositive( src.get( xMax1, yi ) / 255.0f * bins ) ];						
				}
				
				/* clip histogram and redistribute clipped entries */
				System.arraycopy( hist, 0, clippedHist, 0, hist.length );
				int clippedEntries = 0, clippedEntriesBefore;
				do
				{
					clippedEntriesBefore = clippedEntries;
					clippedEntries = 0;
					for ( int i = 0; i <= bins; ++i )
					{
						final int d = clippedHist[ i ] - limit;
						if ( d > 0 )
						{
							clippedEntries += d;
							clippedHist[ i ] = limit;
						}
					}
					
					final int d = clippedEntries / ( bins + 1 );
					final int m = clippedEntries % ( bins + 1 );
					for ( int i = 0; i <= bins; ++i)
						clippedHist[ i ] += d;
					
					if ( m != 0 )
					{
						final int s = bins / m;
						for ( int i = 0; i <= bins; i += s )
							++clippedHist[ i ];
					}
				}
				while ( clippedEntries != clippedEntriesBefore );
				
				/* build cdf of clipped histogram */
				int hMin = bins;
				for ( int i = 0; i < hMin; ++i )
					if ( clippedHist[ i ] != 0 ) hMin = i;
				
				int cdf = 0;
				for ( int i = hMin; i <= v; ++i )
					cdf += clippedHist[ i ];
				
				int cdfMax = cdf;
				for ( int i = v + 1; i <= bins; ++i )
					cdfMax += clippedHist[ i ];
				
				final int cdfMin = clippedHist[ hMin ];
				
				dst.set( x, y, roundPositive( ( cdf - cdfMin ) / ( float )( cdfMax - cdfMin ) * 255.0f ) );
			}
			
			/* multiply the current row into ip */
			final int t = y * imp.getWidth();
			if ( imp.getType() == ImagePlus.GRAY8 )
			{
				for ( int x = box.x; x < boxXMax; ++x )
				{
					final int i = t + x;
					ip.set( i, dst.get( i ) );
				}
			}
			else if ( imp.getType() == ImagePlus.GRAY16 )
			{
				final int min = ( int )ip.getMin();
				for ( int x = box.x; x < boxXMax; ++x )
				{
					final int i = t + x;
					final int v = ip.get( i );
					final float a = ( float )dst.get( i ) / src.get( i );
					ip.set( i, Math.max( 0, Math.min( 65535, roundPositive( a * ( v - min ) + min ) ) ) );
				}
			}
			else if ( imp.getType() == ImagePlus.GRAY32 )
			{
				final float min = ( float )ip.getMin();
				for ( int x = box.x; x < boxXMax; ++x )
				{
					final int i = t + x;
					final float v = ip.getf( i );
					final float a = ( float )dst.get( i ) / src.get( i );
					ip.setf( i, a * ( v - min ) + min );
				}
			}
			else if ( imp.getType() == ImagePlus.COLOR_RGB )
			{
				for ( int x = box.x; x < boxXMax; ++x )
				{
					final int i = t + x;
					final int argb = ip.get( i );
					final float a = ( float )dst.get( i ) / src.get( i );
					final int r = Math.max( 0, Math.min( 255, roundPositive( a * ( ( argb >> 16 ) & 0xff ) ) ) );  
					final int g = Math.max( 0, Math.min( 255, roundPositive( a * ( ( argb >> 8 ) & 0xff ) ) ) );
					final int b = Math.max( 0, Math.min( 255, roundPositive( a * ( argb & 0xff ) ) ) );
					ip.set( i, ( r << 16 ) | ( g << 8 ) | b );
				}
			}
			imp.updateAndDraw();
		}
	}
	
	final static private int roundPositive( float a )
	{
		return ( int )( a + 0.5f );
	}
}

