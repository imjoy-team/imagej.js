// These macros draw example graphs using the  
// macro language Plot.* functions.

    macro "Simple Plot" {
        yValues = newArray(0, 0.7, 2.3, 2.8, 1, 0.5);
        Plot.create("Simple Plot", "X", "Y", yValues);
        setJustification("center");
        Plot.addText("This is a line of centered text", 0.5, 0.5);
        setJustification("right");
        Plot.addText("This is a line of right justified text", 0.5, 0.7);
        setJustification("left");
        Plot.addText("This is a line of left justified text", 0.5, 0.9);
 }

     macro "Fancier Plot" {
        yValues = newArray(0, 0.7, 2.3, 2.8, 1, 0.5);
        Plot.create("Fancier Plot", "X", "Y");
        Plot.setLimits(0, 5, 0, 3);
        Plot.setLineWidth(2);
        Plot.setColor("lightGray");
        Plot.add("line", yValues);
        Plot.setColor("red");
        Plot.add("circles", yValues);
        Plot.show();
    }

     macro "Error Bars" {
        xValues = newArray(0.1, 0.25, 0.35, 0.5, 0.61,0.7,0.85,0.89,0.95);
        yValues = newArray(2,5.6,7.4,9,9.4,8.7,6.3,4.5,1);
        errorBars = newArray(0.8,0.6,0.5,0.4,0.3,0.5,0.6,0.7,0.8);
        Plot.create("Error Bars", "X", "Y", xValues, yValues);
        Plot.setLimits(0, 1, 0, 10);
        Plot.setLineWidth(2);
        Plot.add("error bars", errorBars);
        Plot.show();
    }

    macro "Scatter Plot" {
        n = 5000;
        x = newArray(n);
        y = newArray(n);
        for (i=0; i<n; i++) {
            x[i] = i+n/3*(random()-0.5);
            y[i] = i+n/3*(random()-0.5);
        }
        Plot.create("Scatter Plot", "X", "Y");
        Plot.setLimits(0, n, 0, n);
        Plot.add("dots", x, y);
  }

   macro "Animated Plot" {
        n = 100;
        loops = 100;
        x = newArray(n);
        for (i=0; i<n; i++)
            x[i] = i;
        y = newArray(n);
        for (i=0; i<loops; i++) {
            for (j=0; j<n; j++)
                y[j] += random()-0.5;
             for (j=1; j<n-1; j++)
                y[j] = (y[j-1]+y[j]+y[j+1])/3; // smooth
            Plot.create("Animated Plot", "X", "Y", x, y);
            Plot.setLimits(0, n-1, -3, 3);
            setJustification("center");
            Plot.addText("Plot # "+(i+1), 0.5, -0.01);
            Plot.update();
        }
    }

