  path = IJ.getDirectory("plugins")+"Examples/_Scripts/About Scripts";
  if (!(new File(path)).exists())
     IJ.error("\"About Scripts\" not found in ImageJ/plugins/Examples/_Scripts.");
  IJ.open(path);

