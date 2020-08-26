// This macro demonstrates how to create a Results table
// containing both string and numeric columns.

  columns = 4;
  rows = 8;
  run("Clear Results");

  // add four string columns
  for (col=1; col<=columns; col++) {
     for (row=0; row<rows; row++) {
        data = "c"+col+"r"+(row+1);
        setResult("C"+col, row, data);
     }
  }

  // add a numeric column
  for (row=0; row<rows; row++)
     setResult("N1", row, row+0.5);
  updateResults;

  // retrieve values, modify and reset
  c2r2 = getResultString("C2", 1);
  setResult("C2", 1, c2r2+"m");
  n1r2 = getResult("N1", 1);
  setResult("N1", 1, n1r2+0.001
