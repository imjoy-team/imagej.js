// This macro uses the Process>Math>Macro command
// to create a synthetic color image. The formulas
// that generate the red, green and blue channels are
// the ones used to create the Sine Argyle example
// supplied with Ulf Dittmer's ExpressionNT plugin
// (http://www.ulfdittmer.com/imagej/expression.html).
// ExpressionNT runs a lot faster than this macro because
// it compiles the formulas instead of interpreting them.

  width=512; height=512;
  min=-1; max=1;
  R = "v=cos(0.04*x)+sin(0.04*y)"; 
  G = "v=cos(0.08*x)+sin(0.08*y)";
  B = "v=cos(0.02*x)+sin(0.02*y)";
  delay = 1000; //ms

  run("New Hyperstack...", "title=[Sine Argyle] type=32-bit display=Color width="
    +width+" height="+height+" channels=3 slices=1 frames=1");
  Stack.setChannel(1);
  run("Macro...", "slice code=["+R+"]");
  setMinAndMax(min, max);
  wait(delay);
  Stack.setChannel(2);
  run("Macro...", "slice code=["+G+"]");
  setMinAndMax(min, max);
  wait(delay);
  Stack.setChannel(3);
  run("Macro...", "slice code=["+B+"]");
  setMinAndMax(min, max);
  wait(delay);
  Stack.setDisplayMode("composite");
  // run("RGB Color"); // convert to RGB
