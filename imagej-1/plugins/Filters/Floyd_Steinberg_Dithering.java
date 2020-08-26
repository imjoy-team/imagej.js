import ij.*;
import ij.process.*;
import ij.plugin.*;

/** Converts the current image to binary (0 and 255) using the 
    Floyd Steinberg dithering algorithm.
        http://en.wikipedia.org/wiki/Floyd-Steinberg_dithering
*/
public class Floyd_Steinberg_Dithering implements PlugIn {

    public void run(String arg) {
        ImagePlus imp = IJ.getImage();
        Undo.setup(Undo.TRANSFORM, imp);
        ImageProcessor ip = imp.getProcessor();
        int width = imp.getWidth();
        int height = imp.getHeight();
        ip = ip.convertToByte(true);
        int[][] pixel = ip.getIntArray();
        int oldpixel, newpixel, error;
        boolean nbottom, nleft, nright;
        for (int y=0; y<height; y++) {
            nbottom=y<height-1;
            for (int x=0; x<width; x++) {
                nleft=x>0; nright=x<width-1;
                oldpixel = pixel[x][y];
                newpixel = oldpixel<128?0:255;
                pixel[x][y] = newpixel;
                error = oldpixel-newpixel;
                if (nright) pixel[x+1][y] += 7*error/16;
                if (nleft&nbottom) pixel[x-1][y+1] += 3*error/16;
                if (nbottom) pixel[x][y+1] += 5*error/16;
                if (nright&&nbottom) pixel[x+1][y+1] += error/16;
            }
        }
        ip.setIntArray(pixel);
        imp.setProcessor(null, ip);
    }

}
