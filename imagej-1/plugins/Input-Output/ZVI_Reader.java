//
// ZVI_Reader.java
//

import ij.*;
import ij.io.*;
import ij.plugin.*;
import java.io.*;
import java.util.*;
import ij.process.*;

/**
 * Imports a Z series (image stack) from a Zeiss ZVI file. This plugin was
 * created through trial and error (i.e., reverse engineering several example
 * ZVI files), and most likely does not work with some types of ZVI.
 *
 * @author Curtis Rueden ctrueden at wisc.edu
 *
 * Modified by Michel Boudinot (mb) 24 Aug 2006.
 * michel.boudinot at inaf.cnrs-gif.fr
 * - improved decoding strategy, more robust against zvi file structure diversity.
 * - new approach to compute the number of channels.
 * - new image stack construction from file image slices.
 */

public class ZVI_Reader implements PlugIn {
    boolean littleEndian = true;
    private int theC, theZ, numC;
//+ (mb)    
    //+ new code
    private Set C_Set = new HashSet(); // to hold C channel index collection
//- (mb)    
    private ImageProcessor ip1;
    String fileName ;
  // -- Constants --

  /** First few bytes of every ZVI file. */
  private static final byte[] ZVI_SIG = {
    -48, -49, 17, -32, -95, -79, 26, -31
  };

  /** Block identifying start of useful header information. */
  private static final byte[] ZVI_MAGIC_BLOCK_1 = { // 41 00 10
    65, 0, 16
  };

  /** Block identifying second part of useful header information. */
  private static final byte[] ZVI_MAGIC_BLOCK_2 = { // 41 00 80
    65, 0, -128
  };

  /** Block identifying third part of useful header information. */
  private static final byte[] ZVI_MAGIC_BLOCK_3 = { // 20 00 10
    32, 0, 16
  };

  /** Memory buffer size in bytes, for reading from disk. */
  private static final int BUFFER_SIZE = 8192;

  /** Debugging flag. */
  private static final boolean DEBUG = false;

  // -- PlugIn API methods --

  /** Executes the plugin. */
  public void run(String arg) {
    OpenDialog od = new OpenDialog("Open ZVI...", arg);
    String directory = od.getDirectory();
    String fileName = od.getFileName();
    if (fileName == null) return;

    IJ.showStatus("Opening: " + directory + fileName);
    FileInfo[] fi = null;
    try { fi = getHeaderInfo(directory, fileName); }
    catch (Exception e) {
      IJ.showStatus("");
      IJ.showMessage("ZVI Reader", "" + e);
      return;
    }
    if (fi == null) {
      IJ.showStatus("");
      IJ.showMessage("ZVI Reader", "Could not find header information.");
      return;
    }

    Opener opener = new Opener();
    ImagePlus imp = opener.openTiffStack(fi); // is there a cleaner way?
    if (imp == null) {
      IJ.showStatus("");
      IJ.showMessage("ZVI Reader", "Could not extract pixel data.");
      return;
    }
    //setStack(fileName, imp.getStack());

    // addition by TjC
    ImageStack istk = imp.getStack();

    int nSlice = istk .getSize();
    int sWidth = istk.getWidth();
    int sHeight = istk.getHeight();
    String stackName="";
//+ (mb) new image stack construction.
    //- original code removed
    //- int sliceOffset = 1;   
    //- int sliceNumberPerChannel = nSlice/numC;
    //- 
    //- //IJ.showMessage("nSlice = " +nSlice  );
    //- //IJ.showMessage("nSlice/ch = " +sliceNumberPerChannel);
    //- 
    //- for (int i=1; i<=numC; i++)
    //-     {stackName= fileName + "  Ch"+i;
    //-     ImageStack img = new ImageStack (sWidth,sHeight);
    //-     for(int j=0; j<sliceNumberPerChannel; j++)
    //-     	{
    //-     	//IJ.showMessage("j = " +j);
    //-     	int theC = getChannel(fi[j*numC+i-1]);
    //-     	IJ.showMessage("theC = "+ theC);
    //-     	
    //-     	ip1 = istk.getProcessor(j*numC+i);
    //-     	img.addSlice(stackName, ip1);
    //-     	}
    //-     new ImagePlus(stackName, img).show();
    //-     }
    //-
    //+ new code
    // make ImageStack for each channel.
    Hashtable img = new Hashtable();
    Iterator it = C_Set.iterator();
    while (it.hasNext()) {
        Object theC = it.next();
        img.put(theC, new ImageStack (sWidth,sHeight));
    }
    // iteratate thru all image slices and
    // add slice to corresponding channel ImageStack.
    for (int n=0; n< nSlice; n++) {
		int theC = getChannel(fi[n]);
		ip1 = istk.getProcessor(n+1);
		((ImageStack)img.get(new Integer(theC))).addSlice(null, ip1);
    }
    // name image stacks and show them.
    it = C_Set.iterator();
    while (it.hasNext()) {
        Object theC = it.next();
    	stackName = fileName + "  Ch"+ theC;
        new ImagePlus(stackName, ((ImageStack)img.get(theC))).show();
    }
//- (mb)
    
//if (arg.equals("")) show();

}


  // -- Helper methods --

  /** Reads header information from the given file. */
  private FileInfo[] getHeaderInfo(String directory, String fileName)
    throws IOException
  {
    // Highly questionable decoding strategy:
    //
    // Note that all byte ordering is little endian, including 4-byte header
    // fields. Other examples: 16-bit data is LSB MSB, and 3-channel data is
    // BGR instead of RGB.
    //
    // 1) Find image header byte sequence:
    //    A) Find 41 00 10. (ZVI_MAGIC_BLOCK_1)
    //    B) Skip 19 bytes of stuff.
    //    C) Read 41 00 80. (ZVI_MAGIC_BLOCK_2)
    //    D) Read 11 bytes of 00.
    //    E) Read potential header information:
    //       - Z-slice (4 bytes)
    //       - channel (4 bytes)
    //       - timestep (4 bytes)
    //    F) Read 108 bytes of 00.
    //
    // 2) If byte sequence is not as expected at any point (e.g.,
    //    stuff that is supposed to be 00 isn't), start over at 1A.
    //
    // 3) Find 20 00 10. (ZVI_MAGIC_BLOCK_3)
    //
    // 4) Read more header information:
    //    - width (4 bytes)
    //    - height (4 bytes)
    //    - ? (4 bytes; always 1)
    //    - bytesPerPixel (4 bytes)
    //    - pixelType (this is what the AxioVision software calls it)
    //       - 1=24-bit (3 color components, 8-bit each)
    //       - 3=8-bit (1 color component, 8-bit)
    //       - 4=16-bit (1 color component, 16-bit)
    //       - 8=48-bit (3 color components, 16-bit each)
    //    - bitDepth (4 bytes--usually, but not always, bytesPerPixel * 8)
    //       - AK: seems that it is always 16
    //
    // 5) Read image data (width * height * bytesPerPixel)
    //
    // 6) Repeat the entire process until no more headers are identified.

    RandomAccessFile in = new RandomAccessFile(directory + fileName, "r");
    byte[] sig = new byte[ZVI_SIG.length];
    in.readFully(sig);
    for (int i=0; i<sig.length; i++) {
      if (sig[i] != ZVI_SIG[i]) return null;
    }
//+ (mb)    
    //+ new code
    Set Z_Set = new HashSet(); // to hold Z plan index collection.
    Set T_Set = new HashSet(); // to hold T time index collection.
//- (mb)    
    long pos = 0;
    Vector blockList = new Vector();
    int numZ = 0, numT = 0;
	numC=0;
    while (true) {
      // search for start of next image header
      long header = findBlock(in, ZVI_MAGIC_BLOCK_1, pos);

      if (header < 0) {
        // no more potential headers found; we're done
        break;
      }
      pos = header + ZVI_MAGIC_BLOCK_1.length;

      if (DEBUG) System.err.println("Found potential image block: " + header);

      // these bytes don't matter
      in.skipBytes(19);
      pos += 19;

      // these bytes should match ZVI_MAGIC_BLOCK_2
      byte[] b = new byte[ZVI_MAGIC_BLOCK_2.length];
      in.readFully(b);
      boolean ok = true;
      for (int i=0; i<b.length; i++) {
        if (b[i] != ZVI_MAGIC_BLOCK_2[i]) {
          ok = false;
          break;
        }
        pos++;
      }
      if (!ok) continue;

      // these bytes should be 00
      b = new byte[11];
      in.readFully(b);
      for (int i=0; i<b.length; i++) {
        if (b[i] != 0) {
          ok = false;
          break;
        }
        pos++;
      }
      if (!ok) continue;

      // read potential header information
      int theZ = readInt(in);
      int theC = readInt(in);
      int theT = readInt(in);
      pos += 12;

      // these bytes should be 00
      b = new byte[108];
      in.readFully(b);
      for (int i=0; i<b.length; i++) {
        if (b[i] != 0) {
          ok = false;
          break;
        }
        pos++;
      }
      if (!ok) continue;
      // everything checks out; looks like an image header to me

//+ (mb) decoding strategy modification
      //      Some zvi images have the following structure:
      //        ZVI_SIG                    Decoding:
      //        ZVI_MAGIC_BLOCK_1 
      //        ZVI_MAGIC_BLOCK_2      <== Start of header information
      //        - Z-slice (4 bytes)     -> theZ = 0
      //        - channel (4 bytes)     -> theC = 0
      //        - timestep (4 bytes)    -> theT = 0
      //        ZVI_MAGIC_BLOCK_2      <==  Start of header information
      //        - Z-slice (4 bytes)     -> theZ actual value
      //        - channel (4 bytes)     -> theC actual value
      //        - timestep (4 bytes)    -> theT actual value
      //        ZVI_MAGIC_BLOCK_3      <== End of header information
      //        ... 
      //        
      //        Two consecutive Start of header information ZVI_MAGIC_BLOCK_2
      //        make test 3) of original decoding strategy fail. The first
      //        null values are taken as theZ, theC and theT values, the
      //        following actual values are ignored. 
      //        Parsing the rest of the file appears to be ok.
      //
      //        New decoding strategy looks for the last header information
      //        ZVI_MAGIC_BLOCK_2 / ZVI_MAGIC_BLOCK_3 to get proper image
      //        slice theZ, theC and theT values.

      //- original code removed
      //- long magic3 = findBlock(in, ZVI_MAGIC_BLOCK_3, pos);
      //- if (magic3 < 0) return null;
      //- pos = magic3 + ZVI_MAGIC_BLOCK_3.length;
      //- 
      //-
      //+ new code
      // these bytes don't matter
      in.skipBytes(89);
      pos += 89;

      byte[] magic3 = new byte[ZVI_MAGIC_BLOCK_3.length];
      in.readFully(magic3);
      for (int i=0; i<magic3.length; i++) {
        if (magic3[i] != ZVI_MAGIC_BLOCK_3[i]) {
          ok = false;
          break;
        }
      }
      if (!ok) continue;
      pos += ZVI_MAGIC_BLOCK_3.length;
//- (mb)

      // read more header information
      int w = readInt(in);
      int h = readInt(in);
      int alwaysOne = readInt(in); // don't know what this is for
      int bytesPerPixel = readInt(in);
      int pixelType = readInt(in); // not clear what this value signifies
      int bitDepth = readInt(in); // doesn't always equal bytesPerPixel * 8
      pos += 24;

      ZVIBlock zviBlock = new ZVIBlock(theZ, theC, theT,
        w, h, alwaysOne, bytesPerPixel, pixelType, bitDepth, pos);
      if (DEBUG) System.out.println(zviBlock);
//+ (mb)
      //- original code removed
      //- // perform some checks on the header info
      //- if (theZ >= numZ) numZ = theZ + 1;
      //- if (theC >= numC) numC = theC + 1;
      //- if (theT >= numT) numT = theT + 1;
      //+ new code 
      // populate Z, C and T index collections
      Z_Set.add(new Integer(theZ));    
      C_Set.add(new Integer(theC));    
      T_Set.add(new Integer(theT));    
//- (mb)
     // save this image block's position
      blockList.add(zviBlock);
      pos += w * h * bytesPerPixel;
    }

    if (blockList.isEmpty()) return null;

//+ (mb)
    //+ new code
    // number of Z, C and T index
    numZ = Z_Set.size();    
    numC = C_Set.size();
    numT = T_Set.size();    
//- (mb)

    if (numZ * numC * numT != blockList.size()) {
      IJ.showMessage("ZVI Reader", "Warning: image counts do not match.");
    }

    // convert ZVI blocks into single FileInfo object
    FileInfo[] fi = new FileInfo[blockList.size()];
    for (int i=0; i<fi.length; i++) {
      ZVIBlock zviBlock = (ZVIBlock) blockList.elementAt(i);
      int ft = -1;
      if (zviBlock.numChannels == 1) {
        if (zviBlock.bytesPerChannel == 1) ft = FileInfo.GRAY8;
        else if (zviBlock.bytesPerChannel == 2) ft = FileInfo.GRAY16_UNSIGNED;
      }
      else if (zviBlock.numChannels == 3) {
        if (zviBlock.bytesPerChannel == 1) ft = FileInfo.BGR;
        else if (zviBlock.bytesPerChannel == 2) ft = FileInfo.RGB48;
      }
      if (ft < 0) {
        IJ.showMessage("ZVI Reader",
          "Warning: unknown file type for image plane #" + (i + 1));
        ft = FileInfo.GRAY8; // better than nothing...
      }
      fi[i] = new FileInfo();
      fi[i].fileFormat = FileInfo.RAW;
      fi[i].fileName = fileName;
      fi[i].directory = directory;
      fi[i].nImages = 1;
      fi[i].intelByteOrder = true;
      fi[i].width = zviBlock.width;
      fi[i].height = zviBlock.height;
      fi[i].offset = (int) zviBlock.imagePos;
      fi[i].fileType = ft;
//+ (mb)
      //+ new code
      // add Z, C and T index to file info.
      fi[i].info = new String(zviBlock.theZ+"," +zviBlock.theC+"," +zviBlock.theT); 
//- (mb)
    }
    return fi;
  }

  /**
   * Finds the first occurrence of the given byte block within the file,
   * starting from the given file position.
   */
  private long findBlock(RandomAccessFile in, byte[] block, long start)
    throws IOException
  {
    long filePos = start;
    long fileSize = in.length();
    byte[] buf = new byte[BUFFER_SIZE];
    long spot = -1;
    int step = 0;
    boolean found = false;
    in.seek(start);

    while (true) {
      int len = (int) (fileSize - filePos);
      if (len < 0) break;
      if (len > buf.length) len = buf.length;
      in.readFully(buf, 0, len);

      for (int i=0; i<len; i++) {
        if (buf[i] == block[step]) {
          if (step == 0) {
            // could be a match; flag this spot
            spot = filePos + i;
          }
          step++;
          if (step == block.length) {
            // found complete match; done searching
            found = true;
            break;
          }
        }
        else {
          // no match; reset step indicator
          spot = -1;
          step = 0;
        }
      }
      if (found) break; // found a match; we're done
      if (len < buf.length) break; // EOF reached; we're done

      filePos += len;
    }

    // set file pointer to byte immediately following pattern
    if (spot >= 0) in.seek(spot + block.length);

    return spot;
  }

  /** Translates up to the first 4 bytes of a byte array to an integer. */
  private static int batoi(byte[] b) {
    int len = b.length > 4 ? 4 : b.length;
    int total = 0;
    for (int i = 0; i < len; i++) {
      int q = b[i] < 0 ? b[i] + 256 : b[i]; // convert to unsigned
      int shift = 8 * i; // little endian
      total += q << shift;
    }
    return total;
  }

  /** Reads a little-endian integer from the given file. */
  private static int readInt(RandomAccessFile fin) throws IOException {
    byte[] b = new byte[4];
    fin.readFully(b);
    return batoi(b);
  }
  
//+ (mb)
  //+ new code
  /** get channel index theC from slice fileInfo(). */
  private static int getChannel(FileInfo theFi) {
        StringTokenizer st = new StringTokenizer(theFi.info," ,");
        int theZ  = Integer.parseInt(st.nextToken()); // skip Z index
        int theC  = Integer.parseInt(st.nextToken());
        // int theT  = Integer.parseInt(st.nextToken());
    return theC;
  }
//- (mb)
 

  // -- Helper classes --

  /** Contains information collected from a ZVI image header. */
  private class ZVIBlock {
    private int theZ, theC, theT;
    private int width, height;
    private int alwaysOne;
    private int bytesPerPixel;
    private int pixelType;
    private int bitDepth;
    private long imagePos;

    private int numPixels;
    private int imageSize;
    private int numChannels;
    private int bytesPerChannel;

    public ZVIBlock(int theZ, int theC, int theT, int width, int height,
      int alwaysOne, int bytesPerPixel, int pixelType, int bitDepth,
      long imagePos)
    {
      this.theZ = theZ;
      this.theC = theC;
      this.theT = theT;
      this.width = width;
      this.height = height;
      this.alwaysOne = alwaysOne;
      this.bytesPerPixel = bytesPerPixel;
      this.pixelType = pixelType;
      this.bitDepth = bitDepth;
      this.imagePos = imagePos;

      numPixels = width * height;
      imageSize = numPixels * bytesPerPixel;

      numChannels = 1; 
      // the second decision is redundant, but left there for further(?) pixel types 
      if ((pixelType == 1) | (pixelType == 8)) {
      	numChannels = 3;} // 1 and 8 are RGB 8-bit and 16-bit
      else if ((pixelType == 3) | (pixelType == 4)) {
        numChannels = 1;} // 3 and 4 are GRAY 8-bit and 16-bit

      if (bytesPerPixel % numChannels != 0) {
        IJ.showMessage("ZVI Reader", "Warning: incompatible bytesPerPixel (" +
          bytesPerPixel + ") and numChannels (" + numChannels +
          "). Assuming grayscale data.");
        numChannels = 1;
      }
      bytesPerChannel = bytesPerPixel / numChannels;
      
      // IJ.showMessage("ZVI Reader", "numChannels: " + numChannels + ", bytesPerPixel: " + bytesPerPixel + ", pixelType: " + pixelType + ", bitDepth: " + bitDepth + ", imagePos: " + imagePos);
    }

    public String toString() {
      return "Image header block:\n" +
        "  theZ = " + theZ + "\n" +
        "  theC = " + theC + "\n" +
        "  theT = " + theT + "\n" +
        "  width = " + width + "\n" +
        "  height = " + height + "\n" +
        "  alwaysOne = " + alwaysOne + "\n" +
        "  bytesPerPixel = " + bytesPerPixel + "\n" +
        "  pixelType = " + pixelType + "\n" +
        "  bitDepth = " + bitDepth;
    }
  }

}
