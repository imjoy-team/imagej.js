// "CompositeSelections"
// This macro demonstrates how to create composite selections using
// makeOval(), makeRectangle() and makePolygon(), in combination 
// with setKeyDown("shift") (to add selections) and setKeyDown("alt")
// (to subtract selections).

   width=400; height=400;
  saveSettings;
  run("Colors...", "selection=red");
  newImage("Composite Selections", "8-bit White", 400, 400, 1);
  setLocation(screenWidth/2-width/2, screenHeight/10);
  makeOval(110, 94, 156, 156);
  setKeyDown("alt");
  makeOval(144, 129, 87, 87);
  show();

  makeOval(62, 40, 55, 55);
  setKeyDown("shift");
  makeOval(246, 49, 60, 60);
  setKeyDown("shift");
  makeOval(285, 200, 60, 60);
  setKeyDown("shift");
  makeRectangle(136, 254, 58, 58);
  setKeyDown("shift");
  makeRectangle(31, 150, 58, 58);
  show();

  makePolygon(84,182,143,127,212,87,260,124,301,202,290,255,247,253,214,188,190,195,134,249,87,247,116,201);
  setKeyDown("alt");
  makePolygon(228,136,158,151,137,189,143,204,193,171,243,183,260,174);
  setKeyDown("shift");
  makePolygon(264,70,285,48,311,43,369,76,363,189,322,186,300,140,271,116);
  show();

  restoreSettings;


  function show() {
     for (i=0; i<10; i++) {
        run("Invert");
        wait(150);
     }
     wait(1000);
  }
