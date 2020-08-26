// Recursively lists the files in a user-specified directory.
// Open files on the list by double clicking on them. 

  dir = getDirectory("Choose a Directory ");
  count = 1;
  listFiles(dir); 

  function listFiles(dir) {
      list = getFileList(dir);
      for (i=0; i<list.length; i++) {
          if (endsWith(list[i], "/"))
              listFiles(""+dir+list[i]);
          else
              print((count++) + ": " + dir + list[i]);
      }
  }
