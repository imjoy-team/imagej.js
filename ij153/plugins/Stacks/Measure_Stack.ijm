// Measure Stack
//
// This macro measure all the slices in a stack.

  macro "Measure Stack" {
       saveSettings;
       setOption("Stack position", true);
       for (n=1; n<=nSlices; n++) {
          setSlice(n);
          run("Measure");
      }
      restoreSettings;
  }
