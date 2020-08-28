// This macro displays a sine/cosine table in the Results window.

  run("Clear Results");
  for (i=0, n=0; n<=2*PI; i++, n+=0.1) {
     setResult("n", i, n);
     setResult("sin (n)", i, sin(n));
     setResult("cos (n)", i, cos(n));
  }
  setOption("ShowRowNumbers", false);
  updateResults;
