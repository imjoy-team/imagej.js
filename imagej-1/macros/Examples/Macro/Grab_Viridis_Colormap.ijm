// Grab the Viridis (option-d) colormap from Berkeley Institute for 
// Data Science GitHub repo and parse it to an ImageJ LUT
// Viridis colormap presented @ SciPy 2015 by Nathaniel Smith 
// and Stéfan van der Walt (https://youtu.be/xAoljeRJ3lU)
// Author: Jerome Mutterer

  //s=File.openUrlAsString("https://raw.githubusercontent.com/BIDS/colormap/master/option_d.py"); // causes error on Fiji
  s=File.openUrlAsString("http://wsr.imagej.net/download/Examples/Python/option_d.py");
  if (startsWith(s,"<Error:"))
     exit("Download error: "+substring(s,8));
  //print(s);
  s=substring(s,indexOf(s,"[[")+1,indexOf(s,"]]")+1);
  s=replace(s,'\n\n','\n');
  s=replace(s,' ','');
  s=split(s,'\n');
  length = s.length;
  reds = newArray(length);
  greens = newArray(length);
  blues = newArray(length);
  for (i=0;i<s.length;i++) {
     l=split(substring (s[i],1,lengthOf(s[i])-2),',');
     reds[i] = 255*l[0];
     greens[i] = 255*l[1];
     blues[i] = 255*l[2];
  }
  run("Cell Colony (31K)");
  run("8-bit"); // may be needed on Fiji
  run("Invert");
  setLut(reds, greens, blues);
  run("Enhance Contrast", "saturated=0.35");
  run("Calibration Bar...", "location=[Upper Right] fill=Black label=White number=5 decimal=0 font=10 zoom=1 bold overlay");
