// Displays information about open images in a table.

   rt = new ResultsTable();
   list = WindowManager.getIDList();
   if (list==null)
      IJ.error("No images are open");
   for (i=0; i<list.length; i++) {
      img = WindowManager.getImage(list[i]);
      win = img.getWindow();
      info = win!=null?win.createSubtitle():"";
      fi = img.getOriginalFileInfo();
      path = fi!=null?fi.directory:null;
      if (fi!=null && (path==null||path.equals("")))
         path = fi.url;
      rt.setValue("n", i, i+1);
      rt.setValue("Name", i, img.getTitle());
      rt.setValue("Info", i, info);
      rt.setValue("Path", i, path);
   }
   rt.showRowNumbers(false);
   rt.show("Open Images");
