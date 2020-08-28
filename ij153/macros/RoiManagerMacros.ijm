// "RoiManagerMacros"
// This macro set provides several macros for 
// using the ROI Manager. The ROI Manager
// is opened if it is not already open.
// Add these macros to StartupMacros.txt and they
// will be automatically installed when ImageJ starts up.

  macro "Add [1]" {
      roiManager("add");
  }

  macro "Add and Name [2]" {
      setKeyDown("alt");
      roiManager("add");
  }

  macro "Add and Draw [3]" {
      roiManager("Add & Draw");
  }

  macro "Add, Name and Draw [4]" {
      setKeyDown("alt");
      roiManager("add");
      run("Draw", "slice");
  }

  macro "Add and Move to Overlay [5]" {
      roiManager("add");
      run("Add Selection...");
  }

  macro "Add and Advance [6]" {
      if (nSlices==1)
          exit("This macro requires a stack");
      roiManager("add");
      run("Next Slice [>]");
  }

  macro "Update [7]" {
      roiManager("update");
  }

  macro "Open All" {
      dir = getDirectory("Choose a Directory ");
      list = getFileList(dir);
      for (i=0; i<list.length; i++) {
          if (endsWith(list[i], ".roi"))
              roiManager("open", dir+list[i]);
      }
  }

