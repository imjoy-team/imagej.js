// This macro demonstrates how to display text
// on an image in a non-destructive overlay.
//
// JavaScript version:
//    http://rsb.info.nih.gov/ij/macros/js/TextOverlay2.js

  run("Fluorescent Cells (400K)");
  url = "http://rsbweb.nih.gov/ij/macros/examples/TextOverlay.txt";
  text = File.openUrlAsString(url);
  setFont("SansSerif", 14, " antialiased");
  makeText(text, 10, 20);
  run("Add Selection...", "stroke=yellow fill=#660000ff");
  run("Select None");
