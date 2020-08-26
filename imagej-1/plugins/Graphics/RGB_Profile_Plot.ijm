// This macro plots multiple intensity profiles
// of line selections on RGB images, or on
// 2 or 3 channel composite images.

  ylabel = "Intensity";
  if (bitDepth==24) {
     setKeyDown("none");
     setRGBWeights(1,0,0); r=getProfile();
     setRGBWeights(0,1,0); g=getProfile();
     setRGBWeights(0,0,1); b=getProfile();
  } else {
     getDimensions(width, height, channels, slices, frames);
     if (channels==1 || channels>3)
        exit("RGB or multi-channel (2 or 3) image required.");
     if (channels==3) {
        Stack.setChannel(3);
        b=getProfile();
     } else
        b = newArray(0);
     Stack.setChannel(2);
     g=getProfile();
     Stack.setChannel(1);
     r=getProfile();
  }
  getVoxelSize(vw, vh, vd, unit);
  x = newArray(r.length);
  for (i=0; i<x.length; i++)
     x[i] = i*vw;
  Plot.create("RGB Profiles","Distance ("+unit+")", ylabel);
  ymax = getMax(r,g,b)+5;
  Plot.setLimits(0, (r.length-1)*vw, 0, ymax);
  Plot.setColor("red");
  Plot.add("line", x, r);
  Plot.setColor("green");
  Plot.add("line", x, g);
  if (b.length>0) {
     Plot.setColor("blue");
     Plot.add("line", x, b);
  }
  Plot.update();

  function getMax(a,b,c) {
     max=a[0];
     for (i=0; i<a.length; i++) {
        max = maxOf(max,a[i]);
        max = maxOf(max,b[i]);
        if (c.length>0)
           max = maxOf(max,c[i]);
     }
     return max;
  }
 
