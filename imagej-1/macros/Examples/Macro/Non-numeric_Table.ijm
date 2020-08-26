// Displays information about open images in the Results table

  if (nImages==0)
     exit("There are no open images.");
  run("Clear Results");
  for (i=0; i<nImages; i++) {
     selectImage(i+1);
     info = getInfo("image.subtitle");
     dir = getInfo("image.directory");
     setResult("n", i, i+1);
     setResult("Title", i, getTitle);
     setResult("Info", i, info);
     setResult("Directory", i, dir);
  }
  setOption("ShowRowNumbers", false);
  updateResults;
