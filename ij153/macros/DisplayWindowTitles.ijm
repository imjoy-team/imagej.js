// Display Window Titles
//
// Displays the titles of non-image and image windows.

  list = getList("window.titles");
  if (list.length==0)
     print("No non-image windows are open");
  else {
     print("Non-image windows:");
     for (i=0; i<list.length; i++)
        print("   "+list[i]);
  }

  print("");
  if (nImages==0)
     print("No images are open");
  else {
     print("Image windows:");
     setBatchMode(true);
     for (i=1; i<=nImages; i++) {
        selectImage(i);
        print("   "+getTitle);
     }
  }
 print("");
