// Author : Gilles Carpentier
// Faculte des Sciences et Technologies,
// Universite Paris 12 Val de Marne, France.

// This macro returns the list of macros, examples, tools and toolsets available 
// from the ftp macros pages of the ImageJ website.

var macrosFolder = "http://rsb.info.nih.gov/ij/macros/";
var exampleFolder = "http://rsb.info.nih.gov/ij/macros/examples/";
var toolsFolder = "http://rsb.info.nih.gov/ij/macros/tools/";
var toolsetsFolder = "http://rsb.info.nih.gov/ij/macros/toolsets/";
var nbmacro=0;

macro "getList Of Online Macros" {
	nbmacro=0;
	List.clear;
	extractLinesFromfolder (macrosFolder,"Macro "); 
	extractLinesFromfolder (exampleFolder,"Example "); 
	extractLinesFromfolder (toolsFolder,"Tool "); 
	extractLinesFromfolder (toolsetsFolder,"Toolset "); 
	print("\\Clear");
	print ("-------- "+ List.size +" Macros and Tools available at the ImageJ web site: --------\n\n");
	for (i=1; i<= List.size; i++) print (pad(i) +": "+List.getValue(i));
}

// function extracting the lines containing a text file name (.txt) from the ImgageJ macros ftp repertories 
function extractLinesFromfolder (urlfolder,kindOfMacro) {
	folderContents =File.openUrlAsString(urlfolder);
	folderContentLines=split(folderContents,"\n");
	for (i=0; i<folderContentLines.length; i++) {
		titleCandidat=extractFromLine (folderContentLines[i],"<a","</a"); 
		titleCandidat=extractFromLine (titleCandidat,">",".txt");
		if (titleCandidat != "") {
			nbmacro++;  
			List.set(nbmacro, " "+ kindOfMacro + titleCandidat); 
		}
	}
}

//function extracting from a line, a substring comprised between prefixe and sufixe
function extractFromLine (line,prefixe,sufixe) {
	pieceOfLine="";
	if (indexOf(line,prefixe) >0 && lastIndexOf(line,sufixe) >0)  {
		pieceOfLine= substring(line, indexOf(line, prefixe)+lengthOf(prefixe), lastIndexOf(line, sufixe)+lengthOf(sufixe));
	}
	return pieceOfLine;
}

// from http://rsb.info.nih.gov/ij/macros/Process_Virtual_Stack.txt  Author: Wayne Rasband
function pad(n) {
      str = toString(n);
      while (lengthOf(str)<3) str = "0" + str;
      return str;
}