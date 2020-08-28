// The showMessage() macro function and IJ.showMessage() method
// display HTML formatted text when the text starts with "<html>".

// Different font sizes
  showMessage("1/5", "<html>"
     +"<font size=+3>Big Font<br>"
     +"<font size=-2>Small Font");

// Multiple colors
  showMessage("2/5", "<html>"
     +"<font size=+2>"
     +"<font color=red>C"
     +"<font color=black>o"
     +"<font color=green>l"
     +"<font color=blue>o"
     +"<font color=purple>r");

// Ordered lists and headers
  showMessage("3/5", "<html>"
     +"<h3>ACGT Bases</h3>"
     +"<ol>"
     +"<li>Adenine"
     +"<li>Cytosine"
     +"<li>Guanine"
     +"<li>Thymidine"
     +"</ol>");

// Unordered lists, headers, and text modifiers
  showMessage("4/5", "<html>"
     +"<h1>ImageJ</h1>"
     +"<ul>"
     +"<li>Runs <u>everywhere</u>"
     +"<li>Fastest pure <b>Java</b> image processing program"
     +"<li>Easily extended using plugin and macros"
     +"</ul>");

// Headers, font color, and italics
  showMessage("5/5", "<html>"
     +"<h1><font color=red><i>Fin</i></h1>");
