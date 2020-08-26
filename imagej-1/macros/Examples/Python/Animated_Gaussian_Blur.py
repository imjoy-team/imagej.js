# Creates a 51 frame stack containing a copy of the current 
# image plus copies blurred using the Gaussian Blur filter
# with the radius varying between 1 and 50.

imp = WindowManager.getCurrentImage()
if imp==None:
   imp = IJ.openImage("http://imagej.nih.gov/ij/images/blobs.gif")
ip = imp.getProcessor()
inc=1
max=50
stack = ImageStack(imp.getWidth(), imp.getHeight())
stack.addSlice("original", ip.duplicate())
radius = inc
slice = 0
while radius<=max:
   IJ.showProgress(radius, max/inc);
   ip2 = ip.duplicate()
   ip2.blurGaussian(radius)
   stack.addSlice("radius="+str(radius), ip2)
   radius += inc
ImagePlus("Animated Gaussian Blur", stack).show()
IJ.run("Animation Options...", "speed=10 loop")
IJ.doCommand("Start Animation [\\]")
