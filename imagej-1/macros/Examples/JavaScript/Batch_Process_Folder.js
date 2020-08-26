// This script processes all the images in a folder and any subfolders.

  extension = ".tif";
  dir1 = IJ.getDir("Choose Source Directory ");
  //dir2 = getDir("Choose Destination Directory ");
   n = 0;
  processFolder(dir1);

  function processFolder(dir1) {
     f = new File(dir1);
     list = f.list();
    for (i=0; i<list.length; i++) {
          f = new File(dir1+list[i]);
          if (f.isDirectory())
              processFolder(dir1+list[i]);
          else if (list[i].endsWith(extension))
             processImage(dir1+list[i]);
      }
  }

  function processImage(path) {
     img = IJ.openImage(path);
     if (img!=null) {
        n++
        print(n+" "+img);
        // add code here to analyze or process the image
        //saveAs(extension, path);
        img.close();
     }
  }
