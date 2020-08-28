// Sigmoid first and second derivatives numerical determination
// Author : Gilles Carpentier
// Faculte des Sciences et Technologies,
// Universite Paris 12 Val de Marne, France.

macro "Increasing Sigmoid Derivatives" {
	requires("1.42k");
	x=newArray (0.8,0.82,0.84,0.86,0.88,0.90,0.92,0.94,0.96,0.98,1);
	y=newArray (14.8393,14.7143,14.7356,15.4157,16.9371,19.5372,22.9676,24.3529,24.9607,25.7170,25.7);
	derivatives (x,y);
}

macro "Decreasing Sigmoid Derivatives" {
	requires("1.42k");
	x=newArray (0.0020,0.0152,0.0284,0.0416,0.0548,0.068,0.0812,0.0944,0.1076,0.1208);
	y=newArray (1.0361,0,-3.5905,-6.0928,-8.3546,-9.7343,-10.1599,-10.3712,-10.4371,-10.4889);
	derivatives (x,y);
}

function derivatives (x,y) {
	// Rotbard modeling
	Fit.logResults;	
	Fit.doFit("Rodbard",x, y);
	Fit.plot();
	rSquared1=Fit.rSquared;
	// sampling of the theoretical sigmoid obtained from fitting equation 
	sampling=1000;REx=newArray(sampling); REy= newArray(sampling); xmin=getMin(x); xmax= getMax (x); step=(xmax-xmin)/sampling;
	for (i=0; i< sampling; i++) {
		REx[i]=xmin+(i+1)*step;
		REy[i]=Fit.f(REx[i]);
	}
	// first derivative
	firstDer=newArray (sampling);
	for (i=0; i< (sampling-1); i++) {firstDer[i]=REy[i+1]-REy[i];}
	// second derivative
	secundDer=newArray (sampling);
	for (i=0; i< (sampling-1); i++) {secundDer[i]=firstDer[i+1]-firstDer[i];}
	firstDer[sampling-1]=firstDer[sampling-2];
	secundDer[sampling-1]=secundDer[sampling-3];secundDer[sampling-2]=secundDer[sampling-3];

	//get the tangent of the sigmoid
	if (REy[0] <REy[lengthOf(REy)-1]) {posx1=getXforYMax(firstDer);}else {posx1=getXforYMin(firstDer);}
	tanx1=REx[posx1]; tany1=Fit.f(tanx1);  
	//get the first inflexion of the sigmoid
	if (REy[0] <REy[lengthOf(REy)-1]) {posx2=getXforYMax(secundDer);} else {posx3=getXforYMin(secundDer);}
	//get the second inflexion of the sigmoid
	if (REy[0] <REy[lengthOf(REy)-1]) {posx3=getXforYMin(secundDer);} else {posx2=getXforYMax(secundDer);}
	tanx2=REx[posx2]; tany2=Fit.f(tanx2);
	tanx3=REx[posx3]; tany3=Fit.f(tanx3);
	
	// plot the curves
	Plot.create("Sigmoid Derivatives", "X Values", "Y Values");
	ymin=getMin(y); ymax=getMax(y);
	Plot.setLimits(getMin(x), getMax (x), ymin, ymax);
	len = (ymax-ymin)/20;
	Plot.setLineWidth(2);
	Plot.setColor("lightGray");
	//Plot.add("line", x, y);
	// plot the curve fitting
	Plot.setColor("Green");
	Plot.add("line", REx, REy);
	// plot the first derivative
	Plot.setColor("Blue");
	firstDerPlot=scaley (firstDer, getMin(y) ,getMax(y));
	Plot.add("line", REx, firstDerPlot);
	// plot the second derivative
	secundDerPlot=scaley (secundDer, getMin(y) ,getMax(y));
	Plot.setColor("Magenta");
	Plot.add("line", REx, secundDerPlot);
	Plot.setColor("red");
	Plot.add("circles", x,y);
	// plot the values
	Plot.setColor("blue");
	scale=(getMax(REx) - getMin(REx));
	Plot.drawLine(tanx1, tany1+len, tanx1, tany1-len);
	if (ymin<0) {x=0.8; y=0.12;} else {x=0.02; y=0.92;}
	Plot.addText("First Derivative", x, y);
	Plot.setColor("Magenta");
	Plot.drawLine(tanx2, tany2+len, tanx2, tany2-len);
	Plot.drawLine(tanx3, tany3+len, tanx3, tany3-len);
	if (ymin<0) {x=0.8; y=0.4;} else {x=0.02; y=0.40;}
	Plot.addText("Second Derivative", x, y);

	Plot.show();
	print ("First derivative tangent:");
	print ("tanx1="+tanx1 + " tany1="+tany1);
	print ("second derivative tangents:");
	print ("tanx2="+tanx2 + " tany2="+tany2);
	print ("tanx3="+tanx3 + " tany3="+tany3);
	print ("r2= "+ rSquared1);
}

// functions

function scaley (liste,min,max) {
	listemax=getMax(liste); listemin=getMin(liste);
	for (i=0; i< sampling; i++) {
		val=(liste[i]-listemin)/(listemax-listemin);
		liste[i]=val*(max-min)+min;
	}
	return liste;
}

function getMax(a) {
	Array.getStatistics(a, min, max);
	return max;
}	

function getMin(a) {
	Array.getStatistics(a, min, max);
	return min;
}

function getXforYMax (d) {
	max=d[0]; Nbofvalue=0;
	for (i=0;i<d.length;i++) {
		if (d[i] > max ) {max=d[i];Nbofvalue=i;}
	}
	return Nbofvalue;
}

function getXforYMin (d) {
	max=d[0]; Nbofvalue=0;
	for (i=0;i<d.length;i++) {
		if (d[i] < max ) {max=d[i];Nbofvalue=i;}
	}
	return Nbofvalue;
}
