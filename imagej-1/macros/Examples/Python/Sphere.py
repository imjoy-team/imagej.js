t0 = System.currentTimeMillis()
size = 512
ip = FloatProcessor(size,size)
for y in range(size):
   IJ.showProgress(y,size-1)
   for x in range(size):
       dx=x-size/2; dy=y-size/2
       d = Math.sqrt(dx*dx+dy*dy)
       ip.setf(x,y,-d)
time = str((System.currentTimeMillis()-t0)/1000.0)+" seconds"
ImagePlus(time,ip).show()
IJ.run("Red/Green");
