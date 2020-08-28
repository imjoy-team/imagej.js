This folder contains ImageJ macros. You open a macro file using the
File->Open command and run it by pressing ctrl-r (File->Run Macro).
You can also open a macro file by dragging and dropping it on the
main ImageJ window. You can run a small piece of macro code by selecting
it in the editor and typing ctrl-r. Some of the files (e.g., MacroSet.txt)
contain multiple macros that are installed in the editor's "Macros" menu.

Macros located in the ImageJ/plugins folder,  with names containing an
an underscore ("_") or ending in ".ijm", are installed in the Plugins menu.
Examples of such macros can be found in ImageJ/plugins/Examples/_Macros.

Macros and macro tools in the ImageJ/macros/StartupMacros.txt file are
installed in the Plugins>Macros submenu and in the toolbar when ImageJ
starts. Macros can be assigned keyboard shortcuts. For examples,
refer to the macros/MacroSet.ijm file. Note that macro shortcuts only
work when an image window or the ImageJ window has focus.

The tools folder contains tool macros that are added to ImageJ's tool
bar when you open the file. The toolsets folder contains macro sets
that are installed in the toolbar's ">>" menu when ImageJ starts.

Information about the macro language (including a 48 page PDF),
a list of the built in macro functions and more example macros are
available at

     http://imagej.nih.gov/ij/developer
