// This macro demonstrates how to use the makeText() macro
// function and the Image>Overlay>Add Selection command
// to create an animated graphical overlay.

   requires("1.43l");
   newImage("demo-1", "8-bit Ramp", 400, 400, 1);
   setBatchMode(true);
   for (i= 0; i<15; i++){
      makeRectangle(60, 150, 260, 140);
      run("Add Selection...", "stroke=#99ffff00 width=5 new");
      if (i%2==0) {
         makeText("Red", 100, 200);
         run("Add Selection...", "stroke=red font=36 fill=#77000088");
       } else {
         makeText("Green", 180, 200);
         run("Add Selection...", "stroke=green font=36 fill=#77000088");
      }
      wait(500);
   }

