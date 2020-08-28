// Look Up Tables Tool
// G. Landini 6/4/2006
// 23/5/06: fixed spaces in file name bug
// 16/5/13: uses getList("LUTs") to get LUT list
//
// This tool loads the next LUT in the Images>Lookup Tables
// menu each time  the icon is clicked it.
// Click+[shift] goes back in the list of LUTs
// Click+[alt] sets the first LUT in the list

// Tip: You can open a LUT file be double clicking on it if you
// associate the .lut extension with ImageJ. You can also open
// a LUT by dragging and dropping on the main ImageJ window.

// A 'luts' folder with 68 LUT files is available at
// <http://rsb.info.nih.gov/ij/download/luts/luts.zip>

    var GLlut=0;
    var list = getLutList();

   macro "Lookup Tables Action Tool - C900L222e Cf00L323e Cf90L424e Cfd0L525e Cff3L626e Cce4L727e C4f0L828e C3ecL929e C5cdLa2ae C79fLb2be C77fLc2ce Cb6fLd2de CfafLe2ee CfefLf2fe C000R11fe"{
       if (list.length<1)
           exit("No LUTs in the '/ImageJ/luts' folder.");
       if (isKeyDown("alt"))
           GLlut=0;
      else if (isKeyDown("shift"))
          GLlut-=1;
      else
          GLlut+=1;
      if (GLlut<0) GLlut=list.length-1;
      if (GLlut>list.length-1) GLlut=0;
      if (bitDepth()!=24)
         run(list[GLlut]);
      wait(20);
      showStatus(list[GLlut]);
  }

  function getLutList() {
      requires("1.47r");
      return getList("LUTs");
  }
