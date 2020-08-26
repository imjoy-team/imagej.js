// The macro demonstrates how to count cells
// using the Process>Find Maxima command.

  run("Cell Colony (31K)"); // File>Open Samples>Cell Colony
  getRawStatistics(nPixels, mean, min, max, std, histogram);
  run("Find Maxima...", "noise=&std output=[Point Selection] light");
  getSelectionCoordinates(xCoordinates, yCoordinates);
  print("count="+ xCoordinates.length);
