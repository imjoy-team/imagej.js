// This macro demonstrates how a macro can
// display a dialog box with a "Help" button
// that displays HTML formatted text.

  html = "<html>"
     +"<h2>HTML formatted help</h2>"
     +"<font size=+1>
     +"In ImageJ 1.46b or later, dialog boxes<br>"
     +"can have a <b>Help</b> button that displays<br>"
     +"<font color=red>HTML</font> formatted text.<br>"
     +"</font>";
  Dialog.create("Help");
  Dialog.addMessage("Click \"Help\" for an example\nof HTML formatted help.");
  Dialog.addHelp(html);
  Dialog.show
