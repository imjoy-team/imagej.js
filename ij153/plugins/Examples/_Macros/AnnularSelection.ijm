// This macro demonstrates two different 
// ways to create an annular selection.

  x = 125;
  y = 125;
  radius= 75;  // outer radius
  width = 20;

  // First method. Create a circular selection and subtract 
  // from it by holding down alt key.
  if (nImages==0) run("Blobs (25K)");
  makeOval(x-radius, y-radius, radius*2, radius*2);
  radius -= width;
  setKeyDown("alt");
  makeOval(x-radius, y-radius, radius*2, radius*2);
  wait(1000);
  run("Fill");
  wait(2000);
  run("Undo");

  // Second method. Create a circular selection and add
  // to it using the Edit>Selection>Make Band command.
  radius= 55;  // inner radius
  makeOval(x-radius, y-radius, radius*2, radius*2);
  run("Make Band...", "band="+width);

