import ij.*;
import ij.process.*;
import ij.gui.*;
import java.awt.*;
import ij.plugin.*;
import java.awt.image.*;

public class Transparent_Image_Overlay implements PlugIn {

    public void run(String arg) {
        if (IJ.versionLessThan("1.46p"))
           return;
        ImagePlus imp = IJ.openImage("http://imagej.nih.gov/ij/images/cardio.dcm.zip");
        ImageProcessor ip = imp.getProcessor();
        ip = ip.crop();
        ip.setRoi(142, 132, 654, 616);
        int width = ip.getWidth()/2;
        int height = ip.getHeight()/2;
        ip = ip.resize(width, height, true);
        ip.setColor(Color.red);
        ip.setFont(new Font("SansSerif",Font.PLAIN,28));
        ip.drawString("Transparent\nImage\nOverlay", 0, 40);
        ImageRoi imageRoi = new ImageRoi(100, 25, ip);
        imageRoi.setZeroTransparent(true);
        ImagePlus boats = IJ.openImage("http://imagej.nih.gov/ij/images/boats.gif");
        Overlay overlay = new Overlay(imageRoi);
        boats.setOverlay(overlay);
        boats.setRoi(imageRoi);
        boats.show();
        for (int a=0; a<=360; a++) {
           imageRoi.setAngle(a);
           boats.draw();
           IJ.wait(20);
        }
    }

}
