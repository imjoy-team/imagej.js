// Run this one line script and the main ImageJ window
// will always be on top of other windows.
//
// To test it, copy the last line in this file to the clipboard, 
// switch to ImageJ, type shift+v (File>New>System Clipboard),  
// then type ctrl+j (Macros>Evaluate Javascript). 
//
// To create an "Always on Top" command, save this script in the 
// plugins folder as "Always_on_Top.js", restart ImageJ and there 
// will be a new "Always on Top" command in the Plugins menu.
//
// To have ImageJ run the "Always on Top" command when
// it launches, add the following to the beginning of the 
// ImageJ/macros/StartupMacros.txt file:
//
//   macro "AutoRun" {
//      run("Always on Top");
//  }

  if (IJ.isJava16())
  	IJ.getInstance().setAlwaysOnTop(true);
  else
  	IJ.error("AlwaysOnTop", "This script requires Java 1.6 or later");
  	
