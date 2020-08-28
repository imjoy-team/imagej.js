// OpenDialog Demo
//
// This macro demonstrates how do use the 
// File.openDialog() macro function.

  path = File.openDialog("Select a File");
  //open(path); // open the file
  dir = File.getParent(path);
  name = File.getName(path);
  print("Path:", path);
  print("Name:", name);
  print("Directory:", dir);
  list = getFileList(dir);
  print("Directory contains "+list.length+" files");
