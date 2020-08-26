// This script demonstrates how to create a Results table
// containing both string and numeric columns.

  columns = 4;
  rows = 8;
  rt = new ResultsTable();
  // add four string columns
  for (col=1; col<=columns; col++) {
     for (row=0; row<rows; row++) {
        data = "c"+col+"r"+(row+1);
        rt.setValue("C"+col, row, data);
     }
  }
  // add a numeric column
  for (row=0; row<rows; row++)
     rt.setValue("N1", row, row+0.5);
 rt.show("Results");
 // retrieve string and numeric values
 //print("c2r2 = \""+rt.getStringValue("C2", 1)+"\"");
 //print("n1r2 = "+rt.getValue("N1", 1));
