//This macro builds a 3D ellipsoid in an image stack.
// Check 'Surface only' to get only the surface of the ellipsoid.
// Authors: G. Hernan Sendra and Holger Lorenz
// ZMBH University of Heidelberg, Germany

// Default values
Width = 200; 
Height = 200; 
Slices = 200; 
Name = "Ellipsoid"; 
x0 = Width/2; 
y0 = Height/2; 
z0 = Slices/2; 
xSemiAxis = 70; 
ySemiAxis = 70;
zSemiAxis = 95;
OnlySurface=false;  // Only Surface?

// Check if you want dialog
UseDialog = true;

// Macro start
if (UseDialog) {
    Dialog.create ("Build Ellipsoid");
    Dialog.addNumber ("Image width:", Width); //number 1
    Dialog.addNumber ("Image height:", Height); //number 2
    Dialog.addNumber ("Number of slices:", Slices); //number 3
    Dialog.addString ("Name:", Name); //number 4
    Dialog.addNumber ("X center:", x0); //number 5
    Dialog.addNumber ("Y center:", y0); //number 6
    Dialog.addNumber ("Z center:", z0); //number 7
    Dialog.addNumber ("X_radius:", xSemiAxis); //number 8
    Dialog.addNumber ("Y_radius:", ySemiAxis); //number 9
    Dialog.addNumber ("Z_radius:", zSemiAxis); //number 10
    Dialog.addCheckbox ("Surface only", OnlySurface); //check 1
    Dialog.show ();
    Width = Dialog.getNumber (); //1
    Height = Dialog.getNumber (); //2
    Slices = Dialog.getNumber (); //3
    Name = Dialog.getString (); //4
    x0 = Dialog.getNumber (); //5
    y0 = Dialog.getNumber (); //6
    z0 = Dialog.getNumber (); //7
    xSemiAxis = Dialog.getNumber (); //8
    ySemiAxis = Dialog.getNumber (); //9
    zSemiAxis = Dialog.getNumber (); //10
    OnlySurface=Dialog.getCheckbox (); //check 1
}

newImage(Name, "8-bit black", Width, Height, Slices);
for (z=0;z<Slices;z++) {
    showProgress(z+1, Slices);
    setSlice(z+1);
    for (x=0;x<Width;x++) {
        for (y=0;y<Height;y++) {
            if (pow((x-x0)/xSemiAxis,2)+pow((y-y0)/ySemiAxis,2)+pow((z-z0)/zSemiAxis,2) <= 1) {
                setPixel(x,y,255);
            }   
        }   
    }
}   
if (OnlySurface) {
    setOption("BlackBackground", true);
    run("Outline", "stack");
}
setSlice(Slices/2);

