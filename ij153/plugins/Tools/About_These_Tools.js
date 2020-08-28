  message = 
     "This sub-menu contains tools that get installed on the\n"+
     "ImageJ toolbar. They are also listed in the toolbar's \">>\"\n"+
     "menu. The tools, either macros (\".ijm\") or plugins (\".jar\"),\n"+
     "are located in the folder at\n"+
     "   "+IJ.getDirectory("plugins")+"Tools";

  gd = new GenericDialog("About These Tools");
  gd.addMessage(message);
  gd.addHelp("http://imagej.nih.gov/ij/plugins/index.html#tools");
  gd.setHelpLabel("More Tools");
  gd.hideCancelButton();
  gd.showDialog();
