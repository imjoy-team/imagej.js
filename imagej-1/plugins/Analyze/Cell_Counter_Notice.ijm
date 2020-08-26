  msg = "The \"Cell Counter\" plugin has been replaced\n"
         + "by ImageJ's built in multi-point tool. For more\n"
         + "information, click \"Help\" in the \"Point Tool\"\n"
         + "dialog, opened by double clicking on the\n"
         + "multi-point tool icon.";
  setTool("multipoint");
  showMessage("Cell Counter", msg);
  run("Point Tool...", "");
