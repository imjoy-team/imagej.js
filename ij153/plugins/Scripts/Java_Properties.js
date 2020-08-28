// Lists all available Java properties and their values in a Results table

  rt = new ResultsTable();
  props = System.getProperties();
  row = 0;
  for (en=props.keys(); en.hasMoreElements();) {
     key = en.nextElement();
     rt.setValue("Key", row, key);
     rt.setValue("Value", row, props.get(key));
     row++;
  }
 rt.show("Java Properties");
