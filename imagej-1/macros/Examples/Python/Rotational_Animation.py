# This Python script demonstrates how to use the 
# ImageProcessor.applyMacro() method to do animation.

imp = IJ.openImage("http://imagej.nih.gov/ij/images/lena-std.tif")
div = 500
n = 50
delta = div/n
stack = ImageStack(imp.getWidth(), imp.getHeight())
ip = imp.getProcessor();
for i in range(n):
   IJ.showProgress(i, n-1)
   code = "a+=PI+d/"+str(div)+";v=getPixel(d*cos(a)+w/2,d*sin(a)+h/2);"
   ip2 = ip.duplicate()
   ip2.applyMacro(code)
   stack.addSlice(ip2)
   div -= delta
ImagePlus("Rotational Animation", stack).show()
IJ.run("Animation Options...", "speed=5 loop")
IJ.doCommand("Start Animation [\\]")

