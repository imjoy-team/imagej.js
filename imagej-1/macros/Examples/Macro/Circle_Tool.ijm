// This macro tool creates circular selections and measures 
// them. Double click on the tool icon (a circle) to set the
// radius. There is more information about macro tools at
//   http://imagej.nih.gov/ij/developer/macro/macros.html#tools

var radius = 10;

macro "Circle Tool - C00cO11cc" {
   getCursorLoc(x, y, z, flags);
   makeOval(x-radius, y-radius, radius*2, radius*2);
   run("Measure");
}

macro "Circle Tool Options" {
   radius = getNumber("Radius: ", radius);
}
