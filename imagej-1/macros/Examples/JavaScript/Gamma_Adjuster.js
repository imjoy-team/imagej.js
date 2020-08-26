// This script demonstrates how to interactively update
// an image that has been added to a GenericDialog.
// Change line 11 to
//     dialogItemChanged(gd,event) {
// to make this code compatible with BeanShell and Java.

    img = IJ.openImage("http://imagej.nih.gov/ij/images/clown.jpg");
    ip = img.getProcessor();
    ip.snapshot();
    listener = new DialogListener() {
        dialogItemChanged : function(gd, event) {
            gamma = gd.getNextNumber();
            ip.reset();
            ip.gamma(gamma);
            img.setProcessor(ip);
            gd.repaint();
            return true;
        }
    };
    gd = new GenericDialog("Gamma Adjuster");
    gd.addImage(img);
    gd.addSlider("Gamma:", 0.05, 5.0, 1);
    gd.addDialogListener(listener);
    gd.showDialog();
