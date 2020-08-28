// How to use true type fonts in ImageJ :
// Place your *.ttf file in your ImageJ/jre/lib/font/ folder
// Restart ImageJ and use standart setFont() function
// Note : Be sure to use the full font name, 
// which can be different from the font's file name.

   fonts = getFontList();
  Dialog.create("Available fonts");
  Dialog.addChoice("Font name",fonts);
  Dialog.addChoice("Font size",newArray("9","12","18","24","36","48","72"), "24");
  Dialog.addCheckbox("Antialiased",true);
  Dialog.addCheckbox("Display all fonts",true);
  Dialog.show();
  font = Dialog.getChoice();
  size = Dialog.getChoice();
  aa = Dialog.getCheckbox();
  all = Dialog.getCheckbox();
  if (aa) aa = "antialiased";
  else aa = "";
  setFont(font, size, aa);
  newImage(font+" Demo", "8-bit White", 512, size+size/2, 1);
  setColor(0);
  drawString ("ABCDEFGHIJKLMNOPQRSTUVWXYZ", 5, getHeight);
  if (!all) exit;
  n = fonts.length;
  newImage("All "+n+" Fonts", "RGB White", 512, 35*n, 1);
  for (i=0; i<n; i++) {
      setFont(fonts[i], 30, aa);
      drawString (fonts[i], 5, 35*i+35);
  }



