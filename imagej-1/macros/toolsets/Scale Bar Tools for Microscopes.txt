/////////////////////////////////////////////
// Scale Bar Tools for Microscope Collection
////////////////////////////////////////////
// Author: Gilles Carpentier
// Faculte des Sciences et Technologies,
// Universite Paris 12 Val de Marne, France.
// May 2009

// documentation at the http://image.bio.methods.free.fr/ImageJ/?Scale-Bar-Tools-for-Microscopes.html
// Image sample, http://rsb.info.nih.gov/ij/macros/images/myotube.tif.zip
// The RGB image sample, is a composite of three microscopic images of the same field in fluorescence mode.
// The example contains a triple lableling of a differentiated mouse myogenic cell line.

// Cell culture and immunochemistry; Juliette Peltzer.
// Images from the courtesy of Dr Angelica Keller. Scion CFW-1310M CCD camera mounted on an Olympus BH-2 with a
// 0.3x C-mount optical adaptor.
// For more details about the cell line, contact Dr Angelica Keller at keller@univ-paris12.fr
// Faculte des Sciences et Technologies,
// Universite Paris 12 Val de Marne, France.

// global variables
// Check the net
var errorNetMessage ="Error: ";
var urllist = "http://image.bio.methods.free.fr/ij/ijupdatetest/ListOfMacros.txt";// to check the internet access
// Array containing the calibration data specific to each acquisition device:
var microscope1=newArray("");
// variable for demo image
var demoimagelink = "http://rsb.info.nih.gov/ij/macros/images/myotube.tif.zip";
var demoimagelink2 = "http://image.bio.methods.free.fr/ij/ijmacro/scalebar/myotube-sc.tif";
var demoimagename = "myotube.tif";
var onlinedoclink = "http://image.bio.methods.free.fr/ImageJ/?Scale-Bar-Tools-for-Microscopes.html";
var demoimagename2 = "myotube-sc.tif";
// variable for the objectives data
var objectdata = newArray(16);
var objective = newArray("no choice","Unchanged","Uncalibrated","","","","","","Other"); // list of choice deduced from objectives data
var obj="no choice",reponseUser,model="";
var nomdimage ="", imageid,imageCalibid,imagex,imagey,blackmarge=0,nblinecom=3,hightnblinecom=15,hightcom=24,TimeString;
var userchoices = newArray(14),pixobj,calibration ="",textcalib="",otherobjecvalue,otherobjective,unit,pixelWidth, userLenght=0,lastCustuserbar=0;
var microscopeCollection="Microscope Profiles Collection",editMode=0;
var	pixdist=1,knowndist=0.2, scaleunit="",defaultbar=0,pixobj=1,zoom=1,otherpixdist,otherknowndistance,othermodel="",autosave=0,spacerset=1,metaset=1,scalebarset=1,infoset=1,scaleset=1,noscaleLine=0;
var um = getInfo("micrometer.abbreviation");  // µm

var xx = requires143d (); // check version at install time
function requires143d() {requires("1.43d"); return 0;}

macro "Unused Tool- 1" {} // Space (empty tool icon) between native ImageJ tools and tools of this toolset.

macro "Scale Bar Action Tool - C111D4bD4cD6bCfffD00D08D09D0aD0bD0cD0dD0eD0fD10D18D19D1aD1bD1cD1dD1eD1fD20D21D22D23D25D26D27D28D29D2aD2bD2cD2dD2eD2fD30D31D32D33D35D36D37D38D39D3aD3bD3cD3dD3eD3fD40D41D42D43D45D46D47D48D4eD4fD50D51D52D53D55D56D57D58D59D5aD5dD5eD5fD60D61D62D63D65D66D67D68D6dD6eD6fD70D71D72D73D75D76D77D78D79D7aD7bD7dD7eD7fD80D81D82D83D85D86D87D88D8dD8eD8fD90D91D92D93D95D96D97D98D9aD9bD9cD9dD9eD9fDa0Da1Da2Da3Da5Da6Da7Da8DadDaeDafDb0Db1Db2Db3Db5Db6Db7Db8DbbDbcDbdDbeDbfDc0Dc1Dc2Dc3Dc5Dc6Dc7Dc8DcdDceDcfDd0Dd1Dd2Dd3Dd5Dd6Dd7Dd8Dd9DdaDdbDdcDddDdeDdfDe0De8De9DeaDebDecDedDeeDefDf0Df8Df9DfaDfbDfcDfdDfeDffC222D8bDabC03fD02D03D04D05D06D12D13D14D15D16D24D34D44D54D64D74D84D94Da4Db4Dc4Dd4De4Df2Df3Df4Df5Df6C89fD01D07D11D17De2De3De5De6Df1Df7C222D4aD6aD8aDaaC555D99Db9C999D5cC444Da9C999D6cD8cDacDccCbcfDe1De7C333D49D69D89DcaDcbC666D4dDc9CfffD7cDbaCbbbD5b"{
	setScaleBarre ();
}

macro "Extract and Edit Image Action Tool - C01538R01fdR23" {
	extractAndEditImage ();
}

var availableMicroProfiles = InstalledProfiles();

// installed microscope profiles menu tool
var aCmds = newMenu("Available Microscope Profiles Menu Tool",availableMicroProfiles);
macro "Available Microscope Profiles Menu Tool - CfffD00D01D02D03D04D05D06D07D08D09D0aD0bD0cD0dD0eD0fD10D11D12D13D14D15D16D17D18D19D1aD1bD1cD1dD1eD1fD20D21D22D23D24D25D26D27D28D29D2aD2bD2cD2dD2eD30D31D32D33D34D35D36D37D38D39D3aD3bD3cD3dD40D41D42D43D44D45D46D4bD4cD4dD50D51D52D53D54D55D5cD5dD60D61D62D63D64D67D68D69D70D71D72D73D77D78D79D89D8cD8dD99D9cDa0Da1Da2Da3Da4Da5Da6Da7Da8Da9DacDb0Db1Db2Db3Db4Db5Db6Db7Db8Db9DbcDbdDc0Dc1Dc2Dc3Dc4Dc5Dc6Dc7Dc8Dc9DcbDccDcdDceDd0Dd1Dd2Dd3Dd4Dd5Dd6Dd7Dd8Dd9DdaDdbDdcDddDdeDdfDe0De1De2De3De4De5De6De7De8De9DeaDebDecDedDeeDefDf0Df1Df2Df3Df4Df5Df6Df7Df8Df9DfaDfbDfcDfdDfeDffC38fD2fD3eD3fD48D49D4aD4eD4fD56D57D58D59D5aD5bD5eD5fD66D6aD6bD6cD6dD6fD75D76D7aD7bD7cD7dD7fD80D81D82D83D84D85D86D87D88D8fD90D98D9fC25fD74C24fD6eD7eD8eD91D92D96D9aD9eDaaDaeC37fD47D65D8aD8bD93D94D95D97D9bD9dDabDadDafDbbDbfC32fDbaDbeDca"{
	cmd = getArgument();
	if (cmd!="-" && cmd !="No microscope profile found" && cmd != "Record this tool into the \"toolsets\" folder, to use this menu tool." ) {
		var microscope1=GetArrayFromProfile(cmd);
	}
}

var mCmds = newMenu("Microscope Profiles Manager Menu Tool",newArray("Get Current Microscope Profile Infos","Get Meta-Label","Get Meta-Infos","-","Create a New Microscope Profile","Edit & Modify a Microscope Profile","-","Erase a Microscope Profile","Restore a Microscope Profile from a Scaled Image","-","Update the Microscope Profiles Menu"));
macro "Microscope Profiles Manager Menu Tool - CcccD55D57D5aD66D6aD7bD81D85D8aD93Da6DadDbdDc6Dd6C333Db1Dc2Dd3CeeeD34D35D4cD69D77Dc9Dd9CdddD32D33D42D43D47D52D53D59D63D64D73D7aD87D89D97D99D9bDa9Db9DcaDd8CbbbD58D75D7dD8bD96D9dDa4CfffD00D01D02D03D04D05D06D07D08D09D0aD0bD0cD0dD0eD0fD10D11D12D13D14D15D16D17D18D19D1aD1bD1cD1dD1eD1fD20D21D22D23D24D25D26D27D28D29D2aD2bD2cD2dD2eD2fD30D3bD3cD3dD3eD40D4eD50D5eD60D6eD70D7eD80D8eD90D9eDa0DaeDb0DbeDc0Dc1DceDd0Dd1Dd2De0De1De2De3De4De5De6De7De8De9DeaDebDecDedDeeDefDf0Df1Df2Df3Df4Df5Df6Df7Df8Df9DfaDfbDfcDfdDfeDffCdddD31D41D44D4aD4bD51D54D5bD62D67D72D74D83D84D8dDa7Db2Db7Dc7DcbDcdDd7CaaaD95Db5CfffD38D39D3aD6cD7cD8cDb3DbcDccDdbDdcDddDdeCbbbD45D5dD68D6bD78D88D92D9aDaaDabDb4Db8DbbDc8CcccD46D48D4dD56D61D6dD71D76D82D86D94Da1Da2Da3DbaDc3Dc4Dd4C777D3fD4fD5fD6fD7fD8fD9fDafDbfDcfDdfCeeeD36D37D49D5cD79D9cDacDdaCaaaD65D91D98Da5Da8Db6Dc5Dd5"{
	cmd = getArgument();
	if (cmd!="-" && cmd == "Get Current Microscope Profile Infos") {
		infos=testGetArrayFromProfile();
		if (infos != "" ) {print("\\Clear");print(infos);} else {exit ("No microscope profile selected");}
	}
	if (cmd!="-" && cmd == "Create a New Microscope Profile") editMicProfile ("new");
	if (cmd!="-" && cmd == "Edit & Modify a Microscope Profile") editMicProfile ("edit");
	if (cmd!="-" && cmd == "Restore a Microscope Profile from a Scaled Image") testSaveaProfile ();
	if (cmd!="-" && cmd == "Erase a Microscope Profile") {editMode=1; rmProfFromProfileCat (); }
	if (cmd!="-" && cmd == "Get Meta-Label") {
		metafromima=getMetaLabel ();
		if (metafromima != "") {print("\\Clear");print ("Metadata of the Image Title\:");print (getMetaLabel ());}
		if (metafromima == "") showMessage ("No metadata label available in this image");
	}
	if (cmd!="-" && cmd == "Get Meta-Infos") {
		metafromima=getMetaInfosIma ();
		if (metafromima != "") {print("\\Clear");print ("Metadata Infos Concerning the Image\:");print (getMetaInfosIma ());}  
		metafromprof=getMetaInfosMic ();
		if (metafromprof != "") {print ("Metadata Concerning the Microscope Profile\:");print (getMetaInfosMic ());}
		if (metafromima == "" && metafromima =="") showMessage ("No metadata infos available in this image");
	}
	if (cmd!="-" && cmd == "Update the Microscope Profiles Menu") UpdateProfileList();
	if (cmd!="-") {if (isOpen("Log")) selectWindow ("Log");}
}

var dCmds = newMenu("On Line Documentation & Demo Menu Tool",newArray ("Open On Line Documentation","Download Unscaled Sample Image","Download a Scaled Sample Image","-","Install a Demo Microscope Profiles Set"));
macro "On Line Documentation & Demo Menu Tool - C000D89D8dD96D9dDa5Da6Db3Db4Db5Db6DbdC06fD12D13D14D15D16D17D18D19D1aD1bD1cD1dD1eC0f3D32D33D34D35D36D37D38D39D3aD3bD3cD3dD3eD3fCeeeD80C444DbeDcfC73fD01Cfd0D42D43D44D45D46D47D48D49D4aD4bD4cD4dD4eCfffD7cD7fD8fD91D98Dc1DceDd1Dd3DdeDdfDe0De1De2De3De4De5De6De7De8De9DeaDebDecDedDeeDefDf0Df1Df2Df3Df4Df5Df6Df7Df8Df9DfaDfbDfcDfdDfeDffC222C0feD22D23D24D25D26D27D28D29D2aD2bD2cD2dD2eC888D88CfffD71D90DcbDd0Dd2Dd4Dd5Dd6DdcCf74D50CcccD9fCbbbD97Da0Dc2C000Da4Db2C06fD11D1fC0f4D31CeeeD70D75D81D84D92D93Dc0Dc8Dd7DdaDdbCf40D51D52D53D54D55D56D57D58D59D5aD5bD5cD5dD5eD5fCa7fD00Cfd0D41D4fC444D95DbaDc9C0ffD21D2fC4f6D30CfffD7bCf88D62D63D64D65D6bD6cCeeeD72D73D74DabDbbDccDd8Cf89D6dC666Da7C84fD02D03D04D05D06D07D08D09D0aD0bD0cD0dD0eC333D86D87D8aD99D9cDb9DbcCaaaD8eDa1Dc3Dc4Dc5Dc6CeddD76Cf89D61D66D6aD6eD6fC222DadDcdC48fD10Cfd4D40C4ffD20CaaaDacDcaDddCfaaD60C555Da2C73fD0fC333D9bDa3Da9Db1C999D7dCdddD7aD83Da8Dc7CbbbDb8C111D9aDb7CaaaD8bCf99D67D68D69C777D8cDaaCdeeD82D85C999DafCdddDd9C766D79C555DaeC999D78CcccD7eD94C888D9eC777DbfC666Db0Ca99D77"{
	cmd = getArgument();

	if (cmd!="-" && cmd == "Open On Line Documentation") {
		netTest ();
		doc ();
	}
	if (cmd!="-" && cmd == "Download Unscaled Sample Image") {
		OpenImageLink(demoimagelink,demoimagename,1);
	}	
	if (cmd!="-" && cmd == "Download a Scaled Sample Image") {
		OpenImageLink(demoimagelink2,demoimagename2,1);
	}		
	if (cmd!="-" && cmd == "Install a Demo Microscope Profiles Set") instalDemoCollection ();
} 

// click right menu
// menu popup summering most used commands of the toolset (click right)
var pmCmds = newMenu("Popup Menu", newArray("Scale Bar","-","Extract and Edit Image","About \"Scale Bar Tools for Microscopes\""));

// click right menu, (ctrl click)
macro "Popup Menu" {
	cmd = getArgument();
	if (cmd !="-" && cmd =="Scale Bar")  {setScaleBarre ();}
	if (cmd !="-" && cmd =="Extract and Edit Image") {extractAndEditImage ();}
	if (cmd !="-" && cmd =="About \"Scale Bar Tools for Microscopes\"")  {aboutTheTools ();} 
}

macro "About \"Scale Bar Tools for Microscopes\" Action Tool - C000D84Cb9fD25De7CaaaD14D2dDa0DafDecDfaCedfD49D4aD4bD4cD58D68D9bDb9DbaDbbDbcC889D2cDebCddfD52CcccD0bD22CeeeD00D03D0cD0fD10D1fD20D2fD30D40Dc0Dd0DdfDe0DefDf0Df1Df2Df3DfcDfeDffC666D07D70CdcfD34D35Dc4CbacD86D91CfefD6bD6dD7cD8cD8dD8eD9cD9dDadC97aDd3De5CedfD99CeeeD01D02D04D0dD0eD11D12D1eD21D3fDcfDd1De1De2DeeDf4DfdCfefD7dC545D94Da5CdbeDa4Da7CbabD05D50DaeCfefD7eC98aD32Da1CecfD39D3aD3bD46D48D57D67Da8Db6Db8Dc9DcaDcbDccCdcdD81C878D1bD60D65CdcfD29D36D38D47D77Db7Dc8Dd9DdaCcbcD7aDbfDc1De3C98bD16D24D75DeaCedfD56D66D73D76D83D93Da3C212D7bD88D96D97CcaeD26D3cDdbCaaaD3eD5fCfdfD59C889D15D1aD78Dc2CdcfD45Db4Db5Dc6CdddD13D31D4fDdeDedDfbC777D09D7fD85D90Df7CeceDbdCbadD18D55Db2De9Ca9aD5eDcdDceDdcC656D08D64D80D87D8bCdbfD28D2aD37Dc7Dd8CbbbD1cD42Dd2Df5CfdfD5aD5bD5cD5dD69D6aD6cD9aDa9DabDacC999D0aD41DddDf6CdddD1dD2eD9eDb0C888D06D4eD6fD9fDf9CcbdD54D71D98Dc3Ca9dD17D19Dd4De6C000D74D79D95CcafDd5Dd6De8CedfD62D72D92C889D51Db1DbeCedfD53D63Da2CdcdD6eC777D8fDf8CdcfD43D44Db3Dc5CbadD2bD33C99aD23De4C545D89Da6CcbfD27Dd7CbabD61CedfD82DaaC98aD3dCdceD4dD8a" {
	aboutTheTools ();
}

function aboutTheTools () {
	requires("1.42k");
	about="------------------------ \"Scale Bar Tools for Microscopes\" --------------------------\n";
	about= about+"The \"Scale Bar Tools for Microscopes\" allows drawing of scale bars in image margins, for";
	about= about+"\n several microscopes profiles stored on the computer. It also allows calibration of images, and";
	about= about+"\n keeps set informations in metadata. The integrity of the image area is so preserved, and margin";
	about= about+"\n can be removed by a single click.";
	about=about + "\n---------------------------------------------------------------------------------";
	about= about+"\nInstallation: the tools file has to be stored in the \"ImageJ\/macros\/toolset\" repertory";
	about=about + "\n---------------------------------------------------------------------------------";
	about= about+"\nShort documentation:";
	about=about+"\n";
	about= about+"\n - \"Scale Bar tool icon\": creates a scaled and calibrated image once a microscope profile has been";
	about= about+"\n choosen from the \"Available Microscope Profiles\" tool bar menu icon.";
	about= about+"\n - \"Extract and Edit\" Image tool icon: creates an image with original name from a scaled image";
	about= about+"\n without margin and metadata.";
	about= about+"\n - \"Available Microscope Profiles\" tool bar menu icon: choice of the appropriate microscope profile";
	about= about+"\n to use, before drawing a scale bar.";
	about= about+"\n - \"Microscope Profiles Manager\" tool bar menu icon contains every functions required to create or";
	about= about+"\n modify the microscope profiles. It also contains some functions to read the \"Label\" and \"Info\"";
	about= about+"\n metadata set to the scaled image (see online documentation for more details).";
	about= about+"\n - \"Online Documentation and Demo\" tool bar menu gives some internet ressources\; documentation,";
	about= about+"\n scaled and unscaled images samples and a demo set of microscope profiles for training.";
	about= about+"\n - Click on the \"Version and Update Infos\" ImageJ tool bar icon to look for new versions.";
	about=about + "\n---------------------------------------------------------------------------------";
	about=about +"\nAuthor : Gilles Carpentier"+"\nFaculte des Sciences et Technologies"+"\nUniversite Paris 12 Val de Marne, France.";
	about=about + "\n---------------------------------------------------------------------------------\n";
	about=about +"\nThis tool is inspired from the scalling functionalities of the \"3FluoLablelingExploringTools\" available ";
	about=about +"\non the ImageJ web site: http://rsb.info.nih.gov/ij/macros/tools/3FluoLablelingExploringTools.txt";
	about=about + "\n---------------------------------------------------------------------------------\n";

	about=about+ testGetArrayFromProfile();
	showMessage(about);
	// from PrintToTextWindow macro available at the http://rsbweb.nih.gov/ij/macros/PrintToTextWindow.txt
	// author: Wayne Rasband
	title1 = "Infos for the \"Scale Bar Tools for Microscopes\"";
	title2 = "["+title1+"]";
	f = title2;
	if (isOpen(title1)) {
		print(f, "\\Update:"); // clears the window
  		print(f, about);
		selectWindow (title1);
	} else {
		run("New... ", "name="+title2+" type=[Text File] width=80 height=16");
  		print(f, about);
	}
}

macro "Version and Update Infos Action Tool - CcccD5fD6fD7fD8fD9fC78bD17D19D2aD33D37D3bD42D4cD75D95DceDd5Dd9De6Df7Df9CddeDa3C36bD27D28D3aD57D58D59D66D76D77D86D87Da7Db8Dd6De8De9CeeeD00D01D02D04D06D07D08D09D0bD0dD0fD10D11D12D14D1bD1dD1fD20D21D22D2dD30D31D32D40D46D47D48D49D50D5bD60D70D71D72D74D7dD80D81D82D84D8dD90D91D92D94D9dDa0Da1Da2Da4Db0Db1DbbDc0Dc1Dc6Dc7Dc8Dc9Dd0Dd1Dd2De0De1De2DedDf0Df1Df2Df4DfbDfdDffC8beD3cD3dD4dD5aD6aD79D7aD7bD85D8bD9aDaaDc3Dc4Dd3Dd4CeeeD03D05D0aD0cD0eD13D15D1cD1eD23D2eD3eD4aD55D6cD73D7cD7eD83D8cD8eD93D9cD9eDb5DcaDdeDe3DeeDf3Df5DfcDfeC559D18D26D34D35D36D41D51D61DafDbfDcfDdaDdbDddDeaDf8CcddD2fD5cD6dD6eDabDb2Db4Dc2DefC99bD16D24D39D45D54D56D64D65Da5DacDb6DbcDcbDd7DecDfaCdefD67D8aC59dD29D2bD68D69D78D88D96D97D98D99Da6Da8Da9Db9De5De7CacdD1aD2cD38D4bD4eD5dD5eD6bD89D9bDb3DbaDc5Dd8De4Df6C348D25D43D44Db7DccDdcDebCcccD3fD4fDdf" {
	VersionInfos ();
}

function setScaleBarre () {
	requires("1.42n");	
	// check for a previous calibration by this tool
	metalabel=getMetadata("Label");
	metainfo=getMetadata("Info");
	if (metalabel != "" && (indexOf(metainfo, "<MicVal>") >=0)) exit ("This image has already been scaled\:\n"+metalabel);	
	if (microscope1[0] == "") exit ("First select a microscope profile from the blue microscope menu");
	var calibdata = microscope1;
	setBatchMode(true);
	imageid=getImageID();
	depth = bitDepth; nbslice = getSliceNumber();
	objectlist = getlistobj (calibdata);
	if (otherobjecvalue != 0){
 		objectlist[6] = otherobjective;
	} else {
		model=objectdata[0];
	} 
	reponseUser=0;
	while (reponseUser==0) {resultchoices=userparameters (imageid);}
	if (pixobj==6) {
		resultchoices[7]=otherobjective;
		objectlist[6]=otherobjective;
	} else {
		model=objectdata[0];
	}  
	//blackmarge =(hightcom*nblinecom);
	//hightnblinecom : hight of a line of info
	//nbline : nb of line of info
	//hightcom : hight of the scale
	if (scaleset == 1 || scalebarset ==1) {blackmarge =(hightnblinecom* (nblinecom * infoset) + hightcom); noscaleLine = 0;}
	if (scaleset == 0 && scalebarset ==0) {blackmarge =(hightnblinecom* (nblinecom * infoset)); noscaleLine = 1;}
	makeBottomMargin (imageid);
	selectImage (imageCalibid);
	run("Set Scale...", resultchoices[9]);
	SetBar (imageCalibid,resultchoices[7],resultchoices[10],-1,imagex,imagey);	
	if (autosave == 1) AutoSaveCalib (imageid,imageCalibid);
	setBatchMode("exit and display");
}

function extractAndEditImage () {
	initScaled=getImageID();
	xsc = getWidth(); ysc = getHeight();
	namesc= getTitle;
	setBatchMode(true);
	metalabel=getMetadata("Label");
	metainfo=getMetadata("Info");
	pref= "<blackmarge>"; suff ="</blackmarge>";
	if (metalabel == "" && (indexOf(metainfo, "<MicVal>") < 0)) {exit ("This image has not been treated by this tool");}
	if (indexOf(metainfo,pref) >0 && indexOf(metainfo,suff) >0) {
     	blackmargeValue = parseFloat (substring (metainfo, (indexOf(metainfo, pref)+lengthOf(pref)), indexOf(metainfo, suff)));
    } else {exit ("The metadata seems to be corrupted");}
    pref = "<xsize>" ; suff = "</xsize>";
    if (indexOf(metainfo,pref) >0 && indexOf(metainfo,suff) >0) {
     	xsizeValue = parseFloat (substring (metainfo, (indexOf(metainfo, pref)+lengthOf(pref)), indexOf(metainfo, suff)));
    } else {exit ("The metadata seems to be corrupted");}
    pref = "<ysize>" ; suff = "</ysize>";
    if (indexOf(metainfo,pref) >0 && indexOf(metainfo,suff) >0) {
     	ysizeValue = parseFloat (substring (metainfo, (indexOf(metainfo, pref)+lengthOf(pref)), indexOf(metainfo, suff)));
    } else {exit ("The metadata seems to be corrupted");}	
	if ((xsc != xsizeValue) || (ysc != (ysizeValue + blackmargeValue))) {exit ("The size of the image doesn't correspond to the original");}
	newName=namesc;
	if (indexOf(namesc,"-sc") > 0) {newName = substring (namesc, 0, indexOf(namesc, "-sc")); }
    selectImage (initScaled); 
    run("Duplicate...", "title=["+newName+"]");
    setMetadata("Info", "");
    if (blackmargeValue > 0) {
    	makeRectangle(0, 0, xsizeValue, ysizeValue);
    	run("Crop");
    	run("Select None");
    }
    setBatchMode("exit and display");
}

// function removing a microscope profile file
function rmProfFromProfileCat () {
	UpdateProfileList();ok=1;
	nameofprofiles=InstalledProfiles();
	choix = catalogMicroPref (nameofprofiles,"remove");
	ijlocation = getDirectory("startup");	
 	filetodelete = ijlocation+ microscopeCollection + File.separator+ choix  ;
	if (File.exists(filetodelete )) showMessageWithCancel ("You will delete the \""+ choix + "\" microscope profile file\. Continue?");
	trydelete= File.delete(filetodelete);
	if (trydelete == 1) {print("\\Clear");print ("The \""+ choix+ "\" microscope profile file has been deleted");} 
	else {print("\\Clear");print ("The \""+ choix+ "\" microscope profile file can't be delete for unknown reason");}
	UpdateProfileList();
}

// function editing for modification a microscope profile
function editMicProfile (kind) {
	choice="";toutok=0;
	ijlocation = getDirectory("startup");
	if (kind == "edit") {
		UpdateProfileList();
		nameofprofiles=InstalledProfiles();
		choice = catalogMicroPref (nameofprofiles,"edit-modify");
		ijlocation = getDirectory("startup");
 		contentOfProf=GetArrayFromProfile(choice);
 	}
 	if (kind == "new") {contentOfProf=newArray(21);}
 	while (toutok == 0) { 	
 		Dialog.create("Editing of the \""+choice+"\" Microscope profile");
 		Dialog.addMessage("Modify the values as explained in the documentation. Changing name creates a new profile");
 		Dialog.addString("Microscope profile name", contentOfProf[0],30);
 	
 		Dialog.addString("Objective 1", contentOfProf[1],15);
 		Dialog.addNumber("Distance in pixels", contentOfProf[2], 0, 5, "pixels");
 		Dialog.addNumber("Known Distance in "+um, contentOfProf[3], 3, 8, um);
 		Dialog.addNumber("Default bar size in "+um, contentOfProf[4], 3, 8, um);
 	
 		Dialog.addString("Objective 2", contentOfProf[5],15);
 		Dialog.addNumber("Distance in pixels", contentOfProf[6], 0, 5, "pixels");
 		Dialog.addNumber("Known Distance in "+um, contentOfProf[7], 3, 8, um);
 		Dialog.addNumber("Default bar size in "+um, contentOfProf[8], 3, 8, um);
 	
 		Dialog.addString("Objective 3", contentOfProf[9],15);
 		Dialog.addNumber("Distance in pixels", contentOfProf[10], 0, 5, "pixels");
 		Dialog.addNumber("Known Distance in "+um, contentOfProf[11], 3, 8, um);
 		Dialog.addNumber("Default bar size in "+um, contentOfProf[12], 3, 8, um);
 	
 		Dialog.addString("Objective 4", contentOfProf[13],15);
 		Dialog.addNumber("Distance in pixels", contentOfProf[14], 0, 5, "pixels");
 		Dialog.addNumber("Known Distance in "+um, contentOfProf[15], 3, 8, um);
 		Dialog.addNumber("Default bar size in "+um, contentOfProf[16], 3, 8, um);
 	
 		Dialog.addString("Objective 5", contentOfProf[17],15);
 		Dialog.addNumber("Distance in pixels", contentOfProf[18], 0, 5, "pixels");
 		Dialog.addNumber("Known Distance in "+um, contentOfProf[19], 3, 8, um);
 		Dialog.addNumber("Default bar size in "+um, contentOfProf[20], 3, 8, um);
		Dialog.show();	
		// ansvers
		contentOfProf[0] =Dialog.getString();
		// objective 1
		contentOfProf[1] =Dialog.getString();
		contentOfProf[2] =Dialog.getNumber();
		contentOfProf[3] =Dialog.getNumber();
		contentOfProf[4] =Dialog.getNumber();
		// objective 2
		contentOfProf[5] =Dialog.getString();
		contentOfProf[6] =Dialog.getNumber();
		contentOfProf[7] =Dialog.getNumber();
		contentOfProf[8] =Dialog.getNumber();
		// objective 3
		contentOfProf[9] =Dialog.getString();
		contentOfProf[10] =Dialog.getNumber();
		contentOfProf[11] =Dialog.getNumber();
		contentOfProf[12] =Dialog.getNumber();
		// objective 4
		contentOfProf[13] =Dialog.getString();
		contentOfProf[14] =Dialog.getNumber();
		contentOfProf[15] =Dialog.getNumber();
		contentOfProf[16] =Dialog.getNumber();
		// objective 5
		contentOfProf[17] =Dialog.getString();
		contentOfProf[18] =Dialog.getNumber();
		contentOfProf[19] =Dialog.getNumber();
		contentOfProf[20] =Dialog.getNumber();	
		for (i=0; i<contentOfProf.length; i++) {
			if (contentOfProf[i] == "") contentOfProf[i]="-";
			if (contentOfProf[i] == 0) contentOfProf[i]="1";
		}
		if (contentOfProf[1] == 1) contentOfProf[1] = "-"; 
		if (contentOfProf[5] == 1) contentOfProf[5] = "-"; 
		if (contentOfProf[9] == 1) contentOfProf[9] = "-"; 
		if (contentOfProf[13] == 1) contentOfProf[13] = "-"; 
		if (contentOfProf[17] == 1) contentOfProf[17] = "-"; 		
		if (contentOfProf[0] == "-" || contentOfProf[0] == "1") {showMessageWithCancel ("Set another name to this profile");toutok=0;} else {toutok=1;}
	}
	nouveauProfile=getProfileFromArray (contentOfProf);
	saveMicroPref (nouveauProfile[0],nouveauProfile[1]); 
	UpdateProfileList();
}

function GetArrayFromProfile(name) {
	linesOfProfile = getFileContents (name);
	profilArray= getArrayFromProfile (linesOfProfile);
	return profilArray;
}

function getMetaLabel () {
	metaLabel=getMetadata("Label"); 
	return metaLabel;
}

function getMetaInfosIma () {
	// extract metainfos from the scaled image
	metaInfos = getMetadata("Info"); metainfoimage = "";
	pref="<MicVal>"; suff ="</MicVal>";
	if ((indexOf(metaInfos, pref)) >= 0 ){
		metainfoimage = substring (metaInfos, (indexOf(metaInfos, pref)+lengthOf(pref)), indexOf(metaInfos, suff));
	}
	return metainfoimage;
}

function getMetaInfosMic () {
	// extract metainfos from the microscope profile
	metaInfos = getMetadata("Info"); metainfomicprofile="";
	pref="<MicProf>"; suff ="</MicProf>";
	if ((indexOf(metaInfos, pref)) >= 0 )  {
		metainfomicprofile = substring (metaInfos, (indexOf(metaInfos, pref)+lengthOf(pref)), indexOf(metaInfos, suff));
	}
	return metainfomicprofile;
}

function testGetArrayFromProfile() {
	// from the curent microscope profile name, return a profile info recorded on the hd
	if (microscope1[0] != "") {
		linesOfProfile = getFileContents (microscope1[0]);
		profilArray= getArrayFromProfile (linesOfProfile);
		curentprofileInfo="\n Current Microcope Profile\:\n \n";
		if (profilArray[0] != 0) curentprofileInfo=curentprofileInfo + profilArray[0] + "\n";
		for (i=1; i<profilArray.length; i+=4) {
		curentprofileInfo=curentprofileInfo +"\|";
			j=0;
			for (j=0; j<4; j++) {
				curentprofileInfo=curentprofileInfo+ profilArray[i+j] + " \| " ;
			}
		curentprofileInfo =curentprofileInfo+"\n";
		}
		return curentprofileInfo;
	} else return "";
}

// function allowing the installation/restoration of a microscope profile from a scaled image
function testSaveaProfile () {
	metalabel=getMetadata("Label");
	metainfo=getMetadata("Info");
	if (metalabel == "" && (indexOf(metainfo, "<MicVal>") < 0)) {exit ("This image has not been treated by this tool");}
	pref = "<MicProf>"; suff ="</MicProf>";
	if (indexOf(metainfo,pref) <0 || indexOf(metainfo,suff) <0) {exit ("The metadata seems to be corrupted");}
    pref = "<val>"; suff ="</val>";
    microprof=getMetaInfosMic ();
    var microscope1=newArray (21);
    for (i=0; i<21; i++) {
    	microscope1 [i]= substring (microprof, (indexOf(microprof, pref)+lengthOf(pref)), indexOf(microprof, suff));
    	microprof=substring (microprof, (indexOf(microprof, suff) +lengthOf(suff)),lengthOf(microprof));
    }
	testProfil=getProfileFromArray (microscope1);
	saveMicroPref (testProfil[0],testProfil[1]); 
	UpdateProfileList();
}

function makeBottomMargin (imageid) {
	selectImage(imageid); nomdimage = getTitle; compo=0;
	width = getWidth(); height = getHeight();
	imagex=width; imagey=height;
	//if name contains "." or other extention:
	if (lastIndexOf(nomdimage, ".") > 0) {nomdimage=substring (nomdimage,0,lastIndexOf(nomdimage, "."));}
	nomdimage= nomdimage + "-sc";
	selectImage (imageid);
	if (is("composite")==1) {
		showMessage ("The scaled image will be 24 bit RGB encoded.");run("RGB Color"); depth = bitDepth;
		run("Select All");run("Copy");run("Select None");close ();
	} else {
 		run("Select None");
  		run("Duplicate...", "title=dup_"+nomdimage);
  		depth = bitDepth;
   		if (depth == 16 || depth == 32) {showMessage ("The scaled image will be 8 bit grey encoded.");run("8-bit");	depth = bitDepth;}
   		run("Select None");run("Select All");run("Copy");run("Select None");close ();
  	}
	if (depth == 24) tipeu="\"RGB Black\"";
	if (depth == 8) tipeu="\"8-bit Black\"";	
	newImage(nomdimage, tipeu, width, (height+blackmarge), nbslice);
	makeRectangle(0, 0, width, height);
	setPasteMode("Copy");
	run("Paste"); run("Select None");
	if (blackmarge !=0 ) {
		setLineWidth(1);setColor(255,255,255) ;
		drawLine(0, height,width, height);
	}
	imageCalibid=getImageID();
}

function AutoSaveCalib (init,calib) {
	selectImage(init);
	chemin=getDirectory("image");
	if (chemin != "") {
		selectImage(calib);
		nom=getTitle;
		path=chemin+nom; format ="tiff";
		saveAs (format, path);
	} 
}

// Function creating working arrays from the (calibdata) array contaning the microscope(n) data (n=1).
// return calibration data in the global array objectdata

function getlistobj (microdata) {
	for (i=0;i<5;i++) {
		ii=(i*4+1);
		objective[i+3]=microdata[ii];
	}
	objectdata[0]=microdata[0];
	a=0;
	for (ii=0;ii<5;ii++) {
		for (i=1;i<4;i++){
			a=a+1;
			objectdata[a]=microdata[ii*4+i+1];
		}
	}
	nbobj = 6;
	objectlist = newArray(nbobj+1);
	objectlist[0]="Obj ?";

	for (ob = 1; ob <= nbobj; ob ++) {
		objectlist[ob]=objective[ob+2];
	}
	return objectlist;
}

function getCalib (image) {
	selectImage(image);
	getPixelSize(unit, pixelWidth, pixelHeight);
	if (unit !=um) {calibration = um+" uncalibrated";} else {calibration = " "+ d2s(pixelWidth,4) +" "+unit+" /pixel";}
	textinfo="Current spatial calibration is ("+calibration+" )" ;
	return 	textinfo;
}

function userparameters (image) {
	// Current calibration (pixel are supposed to be squared) :
	if (model == "")  {model=objectdata[0];}
	textcalib=getCalib (image);
	if ( model != "" && model != objectdata[0]) {diaMicro="Other for Microscope Model: "+ model;} else {diaMicro="Calibrating for Microscope Model: "+ model;}
  	Dialog.create("User settings for the image acquisition.");
  	Dialog.addMessage  (diaMicro);
  	Dialog.addChoice(textcalib, objective,obj);
	Dialog.addCheckbox("Draw a scale bar", scalebarset);
	Dialog.addCheckbox("Write scale", scaleset);
	Dialog.addCheckbox("Write infos", infoset);
	Dialog.addCheckbox("Auto-Save the scaled image", autosave);
 	Dialog.show();
	obj = Dialog.getChoice();
	scalebarset = Dialog.getCheckbox();
	scaleset = Dialog.getCheckbox();
	infoset = Dialog.getCheckbox();
	autosave = Dialog.getCheckbox();	
	userchoices[7] = obj;
	defaultbar=""; pixdist=""; scaleunit=""; knowndist=""; spcalibration="";
	if (obj == objectlist[1])  {
		pixdist= objectdata[1]; knowndist=objectdata[2];scaleunit=um;defaultbar=objectdata[3]; pixobj=1;
	}
	if (obj == objectlist[2])  {
		pixdist= objectdata[4]; knowndist=objectdata[5];scaleunit=um;defaultbar=objectdata[6]; pixobj=2;
	}
	if (obj == objectlist[3])  {
		pixdist= objectdata[7]; knowndist=objectdata[8];scaleunit=um;defaultbar=objectdata[9]; pixobj=3;
	}
	if (obj == objectlist[4])  {
		pixdist= objectdata[10]; knowndist=objectdata[11];scaleunit=um;defaultbar=objectdata[12]; pixobj=4;
	}
	if (obj == objectlist[5])  {
		pixdist= objectdata[13]; knowndist=objectdata[14];scaleunit=um;defaultbar=objectdata[15]; pixobj=5;
	}
	if (obj == "Uncalibrated")  {
		pixdist= 0; knowndist=0;scaleunit="pixel";defaultbar=100;pixobj=0;
	}
	if (obj == "Unchanged" )  {
		pixdist= 100; knowndist=(pixelWidth*100);scaleunit=unit;defaultbar=50;pixobj=0;
	}
	if (obj == "Other")  {
		other (image);
	}
	if (unit !=um  && obj == "Unchanged")  userchoices[8] = 0;
	if (pixobj > 0 && pixobj< 6)  model = objectdata[0];
	spcalibration= "distance="+pixdist+" known="+knowndist+" pixel=1 unit="+scaleunit;
	userchoices[9] =spcalibration; 
	userchoices[10]=defaultbar;
	getPixelSize(unit, pixelWidth, pixelHeight);
	if (obj== "Uncalibrated") {
		objectcode= 0; 
		userchoices[8] = 0;
	}
	if (obj != "no choice") reponseUser =1;
	if (obj == "-") {obj="no choice"; userchoices[7]="no choice";reponseUser =0;}
	return userchoices;
}

/////////////////////////////////////////////////////////////////////////////////////////////////
// Function for spacial calibration with other data than these contained in the microscope specific array.
/////////////////////////////////////////////////////////////////////////////////////////////////

function other (image) {
	if (objectdata[0] == model) model ="";
	textcalib=getCalib (image);
	if (otherpixdist <= 0) pixdist= 1; else {pixdist = otherpixdist;}
	if (otherknowndistance <= 0) knowndist=0.2; else {knowndist = otherknowndistance;}
	if (othermodel != "") model=othermodel;
	scaleunit=um; defaultbar=10; pixobj=6;
	Dialog.create("Other settings for the calibration.");
	Dialog.addMessage(textcalib);
	Dialog.addNumber("Magnify factor of the objective (< 100, with the number format: xx.x) ? ",otherobjecvalue);
	Dialog.addNumber("Distance in pixels ? ",pixdist);
	Dialog.addNumber("Known distance (in the following format: x.xx) ? ",knowndist);
	Dialog.addNumber("Zoom factor (lsm) ? ",zoom);
	Dialog.addString("Microscope model ? ", model);
	Dialog.show();
	otherobjecvalue = Dialog.getNumber();
	pixdist = Dialog.getNumber();
	knowndist = Dialog.getNumber();
	otherpixdist=pixdist;otherknowndistance=knowndist;
	zoom=Dialog.getNumber();
	model=Dialog.getString();othermodel=model;
	otherobjective="Obj "+otherobjecvalue+"x";
	pixdist=pixdist*100;
	knowndist=knowndist*100;	
}

///////////////////////////////////////////////////////////////////////////////////////////
// Function drawing a scale bar in the lower black margin.
////////////////////////////////////////////////////////////////////////////////////////////

function SetBar (targetid,objec,baresize,spacer,imagex,imagey) {
	metaLabelMicro="";
	metaInfoMicro="";	
	single=0;
	if (spacer == -1) single=1;
	selectImage (targetid);
	largimage = getWidth();
	hautimage =getHeight();
	getPixelSize(unit, pixelWidth, pixelHeight);
	pixbar= floor(baresize/pixelWidth);
	if (pixbar >= (largimage/5)) {
		while (pixbar >= (largimage/5)) {
         	pixbar= floor(baresize/pixelWidth);
			baresize = floor(baresize / 2);
		}
	}
	if (single==0) maxcustbar= floor((pixelWidth*(largimage + 3*spacer))/4);
	if (single==1) maxcustbar= floor((pixelWidth*largimage )/4);
	if (maxcustbar == 0) maxcustbar =1;
	custuserbar = 0;	
	if (scalebarset == 1) {
		while (custuserbar < 1 || custuserbar > maxcustbar){ 
			if (baresize == 0) baresize =1;
			message="Advised size of the bar, for "+objec+" : " + baresize + " "+unit+". You can set a custom size  to from 1 to "+ maxcustbar + " "+unit+ " - Current value =";
			if (lastCustuserbar != 0 && lastCustuserbar <= maxcustbar) {baresize = lastCustuserbar;}
 			Dialog.create("Custom user scale bar size.");
			Dialog.addNumber(message, baresize);
			Dialog.show(); 	
			custuserbar = Dialog.getNumber();		
		} 
	}	
	baresize = custuserbar; lastCustuserbar=baresize;
	barx=newArray(1); bary=newArray(1);
	bar="width="+baresize+" height=2 font=12 color=Yellow location=[At Selection] bold";
	barx[0]=10;
	bary[0]=(hautimage-(blackmarge - 5));	
	if (scalebarset == 1) {
		makeSelection("point", barx, bary);
		run("Scale Bar...",bar);
		run("Select None");
	}	
	thescale = "Scale: "+ d2s (pixelWidth, 3)  +" "+unit+ " / pixel";
	if ((largimage - ((baresize / pixelWidth) - 20)) > 150) {
		xobjec=((baresize/pixelWidth) + 20); yobjec=(imagey + hightnblinecom +hightnblinecom/2);
		if (scalebarset == 0) xobjec=10;
		setColor(0, 255, 0);
		setFont("SansSerif", 12,"bold");
		if (scaleset == 1) {drawString(thescale, xobjec, yobjec);}
	}
	if (infoset == 1) {
		// Insert objective in the black margin (line 1).
		setColor(0, 255, 255);
		if ((largimage+130) > 50) {
  			xobjec=10; yobjec=(imagey + (blackmarge/nblinecom + hightnblinecom *(1-noscaleLine)));
  			drawString(objec, xobjec, yobjec);
		}
		if (pixobj==6){
			// Insert zoom and additional info in the black margin (line 1).
			setColor(0, 255, 255);
			message="Zoom factor (lsm): "+zoom;
			if (largimage  > 290) {
  				xobjec=70; yobjec=(imagey + (blackmarge/nblinecom + hightnblinecom *(1-noscaleLine)));
  				drawString(message, xobjec, yobjec);
			}
		}
		// Insert the date in the black margin (line 2).
		thedate = GetTime ();
		setColor(150, 150, 255);
		if (largimage  > 290) {
			xobjec=10; yobjec=(imagey + (blackmarge/nblinecom +(2-noscaleLine)*hightnblinecom ));
			drawString(TimeString, xobjec, yobjec);
		}
		// Insert the model of microscope corresponding to the scaling values in the black margin (line 3).
		setColor(150, 150, 255);
		message="Microscope model: "+model;
		if (largimage  > 290) {
  			xobjec=10; yobjec=(imagey + (blackmarge/nblinecom +(3-noscaleLine)*hightnblinecom ));
  			drawString(message, xobjec, yobjec);
		}
	}
	if (metaset == 1) {
		// compile meta label:
		metaLabelMicro= metaLabelMicro + model + " \; " + objec + " \; ";
		if (pixobj==6){metaLabelMicro = metaLabelMicro + "Zoom: "+zoom + " \; ";}
		metaLabelMicro = metaLabelMicro + thescale +" ";
		setMetadata("Label", metaLabelMicro);
		// compile meta infos for current image
		metaInfoMicro=metaInfoMicro + "<MicVal>";
		metaInfoMicro=metaInfoMicro + "<model>" +model+ "</model>";
		metaInfoMicro=metaInfoMicro + "<obj>" +objec + "</obj>";
		metaInfoMicro=metaInfoMicro + "<zoom>" +zoom + "</zoom>";
		metaInfoMicro=metaInfoMicro + "<scale>" +d2s (pixelWidth, 3) + "</scale>";
		metaInfoMicro=metaInfoMicro + "<unit>" + unit + "</unit>";
		metaInfoMicro=metaInfoMicro + "<bar>" + baresize + "</bar>";
		metaInfoMicro=metaInfoMicro + "<blackmarge>" + blackmarge + "</blackmarge>";
		metaInfoMicro=metaInfoMicro + "<xsize>" + imagex + "</xsize>";
		metaInfoMicro=metaInfoMicro + "<ysize>" + imagey + "</ysize>";
		metaInfoMicro=metaInfoMicro + "</MicVal>";
		// compile meta infos for the current image microscope profile
		metaInfoMicro=metaInfoMicro +"<MicProf>";
		for (i=0; i<microscope1.length; i++) {metaInfoMicro=metaInfoMicro+ "<val>" + microscope1 [i] + "</val>";}
		metaInfoMicro=metaInfoMicro + "</MicProf>";
		setMetadata("Info", metaInfoMicro);
	}
}

function GetTime () {
	MonthNames = newArray("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec");
	DayNames = newArray("Sun", "Mon","Tue","Wed","Thu","Fri","Sat");
	getDateAndTime(year, month, dayOfWeek, dayOfMonth, hour, minute, second, msec);
	TimeString ="Treatment date: "+DayNames[dayOfWeek]+" ";
	if (dayOfMonth<10) {TimeString = TimeString+"0";}
	TimeString = TimeString+dayOfMonth+"-"+MonthNames[month]+"-"+year+" Time: ";
	if (hour<10) {TimeString = TimeString+"0";}
	TimeString = TimeString+hour+":";
	if (minute<10) {TimeString = TimeString+"0";}
	TimeString = TimeString+minute+":";
	if (second<10) {TimeString = TimeString+"0";}
	TimeString = TimeString+second;
    return TimeString;
}

function saveMicroPref (profileName,profileContents) {
 	microlocation = getDirectory("startup");	
 	filedestination = microlocation+ microscopeCollection + File.separator+ profileName ;
	if (File.exists(filedestination + "-MicProf"+".txt")) showMessageWithCancel ("A \"" + profileName + "\" microscope profile already exists. Overwrite it?");
	// Create a <microscope profile folder> (name contened in the variable repertory microscopeCollection) in ImageJ folder.
	microDir = microlocation + microscopeCollection + File.separator;
	File.makeDirectory(microDir );
	if (!File.exists(microDir)) exit("Unable to create directory, something wrong in the ImageJ folder");
	pathProf = filedestination + "-MicProf"+".txt";
	theprofile = File.open(pathProf);
	print (theprofile,profileContents);
	File.close(theprofile);
}

function catalogMicroPref (listerm,action) {
	if (listerm.length > 0 && listerm[0] != "No microscope profile found") {
		Dialog.create("List of Microscope Profiles");
		message="Choose the microscope profile to "+ action;
		Dialog.addChoice(message, listerm);
		Dialog.show();
		chosenProfile = Dialog.getChoice();
		return chosenProfile;
	} else {exit ("No microscope profile found");}
}

// Function giving the number (NumberOfProfiles) of profiles contained a file list (lprofile).
function getProfileNumber (lprofile) {
	NumberOfProfiles=0;
	for (i=0; i<lprofile.length; i++) {
     	showProgress(i,lprofile.length);
		if (endsWith(lprofile[i], "-MicProf.txt") && lengthOf(lprofile[i]) > lengthOf("-MicProf.txt")) NumberOfProfiles ++;
	}
	return NumberOfProfiles;
}

// Function giving a text profile from a profile array
function getProfileFromArray (arrayToTreat) {
	pref="<val>"; suff ="</val>";
	textFomArray=newArray (2); // 0 contains the title of the array, 1 contains the profile text itself
	textFomArray[0]=arrayToTreat[0]; text="";
	for (i=1; i<arrayToTreat.length; i++) {
     	if (arrayToTreat[i] != "") {
     		text = text + pref + arrayToTreat[i] + suff + "\n";
     	} else {text = text+ "\n";}
	}
	textFomArray[1]=text;
	return textFomArray;
}

// Function giving a profile array from a text profile
function getArrayFromProfile (listToTreat) {
	pref="<val>"; suff ="</val>";
	if (indexOf(listToTreat [1], pref) < 0) exit ("Invalid profile");
	arrayFomText=newArray (listToTreat.length);
	arrayFomText[0]=listToTreat[0]; 
	for (i=1; i<listToTreat.length; i++) {
     	if ( startsWith(listToTreat[i], pref) && endsWith(listToTreat[i], suff)) {
     		value = substring (listToTreat[i], (indexOf(listToTreat[i], pref)+lengthOf(pref)), indexOf(listToTreat[i], suff));
     	}
		arrayFomText[i]=value;
	}
	return arrayFomText;
}

function getFileContents (profilename) {
 	microlocation = getDirectory("startup");	
 	filedestination = microlocation+ microscopeCollection + File.separator+ profilename ;
	if (! File.exists(filedestination + "-MicProf"+".txt")) exit ("The \"" + profilename + "\" microscope profile can't be found.");
	lines=split(File.openAsString(filedestination + "-MicProf"+".txt"),"\n");
	theLineandTitle=newArray(lines.length +1);
	theLineandTitle[0]=profilename;
	for (i=0; i<lines.length; i++) {theLineandTitle[i+1]=lines[i];}
	return theLineandTitle;
}

// function returning the installed profiles, as file list (catalogue), or as name of profiles list (shortCat)
function InstalledProfiles() {
 	microlocation = getDirectory("startup");	
 	microlocationFolder = microlocation+ microscopeCollection + File.separator ;
 	listoffiles=getFileList(microlocationFolder);
 	NumberOfProfiles=getProfileNumber (listoffiles);
 	if (NumberOfProfiles !=0) {
 	 	var catalogue= newArray (NumberOfProfiles);
 		var shortCat= newArray (NumberOfProfiles);
 		nbProf=0;
 		for (i=0; i<listoffiles.length; i++) {
     		showProgress(i,listoffiles.length);
			if (endsWith(listoffiles[i], "-MicProf.txt") && lengthOf(listoffiles[i]) > lengthOf("-MicProf.txt")) {
				catalogue [nbProf]=listoffiles[i];
				shortCat [nbProf]=replace(catalogue [nbProf], "-MicProf.txt", "");
				nbProf++;			
			}
		}
	} else {
		var catalogue= newArray ("No microscope profile found");
 		var shortCat= newArray ("No microscope profile found");	
 	}
 	if (editMode ==0) return shortCat;
 	if (editMode ==1) return catalogue;
}


function instalDemoCollection ()  {
	microscope1 = newArray("Axiovert 10 CCD Axiocam MRm","Obj 5x achro","772","1000","100","Obj 5x neofluo","759","1000","100","Obj 10x achro","755","500","50","Obj 10x neofluo","763","500","50","Obj 20x achro","612","200","25");
	demoProfil=getProfileFromArray (microscope1);
	saveMicroPref (demoProfil[0],demoProfil[1]); 
	microscope1 = newArray("Olympus BH-2 CCD Scion","Obj 4x","832","1000","100","Obj 10x","207","100","50","Obj 20x","417","100","50","Obj 40x","833","100","10","Obj 100x","185","9","10");
	demoProfil=getProfileFromArray (microscope1);
	saveMicroPref (demoProfil[0],demoProfil[1]); 
	microscope1 = newArray("Leica Palermo","Obj 10x","658","500","50", "Obj 20x","525","200","50","Obj 40x","530","100","10", "Obj 63x","827","100","10", "Obj 100x","1312","100","10"); 
	demoProfil=getProfileFromArray (microscope1);
	saveMicroPref (demoProfil[0],demoProfil[1]); 
	microscope1 = newArray("Leitz Aristoplan CCD CoolSnap ","Obj 6,3x","436","500","100","Obj 10x plan","549","400","50","Obj 25x Fluotar","1035","300","50","Obj 40x Fluotar","1103","200","10","Obj 100x oil Fluotar","1103","80","10");
	demoProfil=getProfileFromArray (microscope1);
	saveMicroPref (demoProfil[0],demoProfil[1]); 
	microscope1 = newArray("Nikon TE2000 Salpetriere CCD Hamamatsu","Obj 10x ph1","1160","500","50", "Obj 20x plan fluo","928","200","50","-","1","1","1", "-","1","1","1","-","1","1","1"); 
	demoProfil=getProfileFromArray (microscope1);
	saveMicroPref (demoProfil[0],demoProfil[1]); 
	UpdateProfileList();
}

function UpdateProfileList() {
	// update the profile list
	kind="toolsets";macroname="Scale Bar Tools for Microscopes.txt";
	macropath=getDirectory("macros") + kind + File.separator+ macroname;
	if (!File.exists(macropath)) {exit ("Record this tool into the \"ImageJ\/macros\/toolset\" repertory folder\nwith the name \"" +macroname+ "\", to use it.");}
	run("Install...", "install=["+macropath+"]");
}	

function netTest () {
	erNetMessage ="Error: ";
	testlink = "http://rsb.info.nih.gov/ij/macros/Arrays.txt";
	if (indexOf (File.openUrlAsString(urllist), errorNetMessage) >0) exit("You need an internet access to run this function.");
}

function OpenImageLink(link,name,question) {
	// Check if already downloaded.
	demoimalocation = getDirectory("startup");	
	fildestination = demoimalocation+ "Downloaded Demo Images/" + name;
	if (File.exists(fildestination)) {
		if (question ==1 ) showMessageWithCancel ("The \"" + name + "\" has already been downloaded. Open it?");
		open(fildestination);
	}
	else {
		netTest ();
		showMessageWithCancel ("ImageJ will download a demo image. Continue?");
		run("URL...", "url=["+link+"]");
		imageid = getImageID();
		nomdimage = getTitle;
		// Create a <Downloaded Demo Images> repertory in ImageJ folder.
		ImaDemo = demoimalocation+"Downloaded Demo Images"+File.separator;
		File.makeDirectory(ImaDemo);
		if (!File.exists(ImaDemo)) exit("Unable to create directory, something wrong in the ImageJ folder");
		selectWindow(nomdimage);
		save(""+ImaDemo+""+ nomdimage +"");
	}
}

function doc () {
	netTest ();
	showMessageWithCancel  ("A notice is avaible on line. Open it with your default web browser?");
	run("URL...", "url=["+onlinedoclink +"]");
}


// -------------------*** Additionnal code for on line update resources ***-----------------------------

//Developer info
//Kind:Toolset
//Title:"Scale Bar Tools for Microscopes" 
//Version:1.0
//Date: 11/05/2009
//Origin:NIH
//End info

function VersionInfos () {
	// variables for on line update resources
	beginsign="//Developer info";endsign="//End info"; 
	kind="toolsets/"; 
	urlrep="http://image.bio.methods.free.fr/ij/ijmacro/scalebar/";
	name="Scale Bar Tools for Microscopes.txt"; 
	namedev="Scale Bar Tools for Microscopes-dev.txt"; 
	favoritefoldername= "Image.Bio.Methods";
	version=versionMessage();
	if (indexOf(version, "install it?" ) > 0 ) {
		macrotext=getdistantmacro (namedev,urlrep);macrolocal="";
		macropath=getDirectory("macros")+kind+namedev;
		if (File.exists(macropath)) {macrolocal=File.openAsString(macropath);}
		if (macrotext != macrolocal) {
			//perfom the installation
			Dialog.create("New version installation option");
			Dialog.addMessage(version);
			Dialog.addCheckbox("Install a Plugin Shortcut?", 0);
			Dialog.addMessage("(This option provides a shortcut in the plugins menu of ImageJ, making easier\nthe next use of the new installed version).");
			Dialog.show();
			plugin= Dialog.getCheckbox();
			f= File.open(macropath);
			print (f,macrotext);
			File.close(f);
			if (plugin ==1) {InstallPluginsStarter(namedev);}
			message="The installation of the "+giveDevInfo (macrotext,1)+ " "+ giveDevInfo (macrotext,2)+ "is completed.";
			message=message+ " Do you want to run it?";
			showMessageWithCancel(message);
			run("Install...", "install=["+macropath+"]");
		}
	} else {showMessage (version); // comment without installation available}
}

function versionMessage() {
	version="";
	if (getDirectory("startup") == 0) exit ("Unable to find the startup directory, something wrong in the ImageJ folder");
	if (getDirectory("macros") == 0) exit ("Unable to find the macros directory, something wrong in the ImageJ folder");
	MacroPath=getDirectory("macros");thismacropath=MacroPath+kind+name;
	if (! File.exists(thismacropath)) exit ("This macro has to be recorded under the name of \"" +name+"\"\ninto the \"macros/"+kind+"\" folder of ImageJ.");
	macrotext=File.openAsString(thismacropath);
	macrotextdistant=getdistantmacro (namedev,urlrep);
	version="";macrolocal="";
	version=version + "\n \nThis version of the " + giveDevInfo (macrotext,1) + " " + giveDevInfo (macrotext,2);
	version=version + "is provided by the " + giveDevInfo (macrotext,5)+ " web site.";
	version=version + "\nVersion number: " + giveDevInfo (macrotext,3)+ " - " + giveDevInfo (macrotext,4) +".";
	if (macrotextdistant !="" ) {
		new=giveDevInfo (macrotextdistant,3);old=giveDevInfo (macrotext,3);
		if (new > old) {
			macropath=getDirectory("macros")+kind+namedev;
			if (File.exists(macropath)) {macrolocal=File.openAsString(macropath);}
			if (macrotextdistant != macrolocal) {
				update="\n \nA new version "+new+ " is available on the "  +giveDevInfo (macrotextdistant,5)+ " web site: ";
				update=update+ "\n \nDo you want to install it?";
			} else {
				update ="\n \nThe latest "+new+" version called \"" +namedev+ "\" provided by \nthe "+giveDevInfo (macrotextdistant,5) +" web site has already be installed";
				update = update+ " in the \"" +kind+ "\" repertory \nof ImageJ.";
			}
		} else {
			update="No new version available.";
		}
		version=version +"\n" + update ;
	} 
	return version; 
}

function giveDevInfo (text,n) {
	lines=split(text,"\n");
	if ( (indexOf(text, beginsign)<0) || (indexOf(text, endsign)<0) ) exit ("Not upgradable macro code.");
	for (i=0; lines[i] != endsign; i ++) {}
	for (j=i; lines[j] != beginsign; j --) {}
	infotext=newArray(i-j-1);
	for (i=0; i < infotext.length; i ++) {infotext[i]=lines[i+j+1];}
	info=infotext[n-1]; signature=":";
	cut = indexOf(info, signature);
	info = substring(info,(cut+lengthOf(signature)),lengthOf(info));
	return info;
}

// Function giving the content of a distant macro (name) located at the distant repertory (urlrep).
function getdistantmacro (name,urlrep) {
	macrotextnih="";
	erNetMessage ="Error: ";
	testlink = "http://rsb.info.nih.gov/ij/macros/Arrays.txt";
	if (indexOf (File.openUrlAsString(testlink), erNetMessage) < 0) {
		distantmacrolink = urlrep + name;
		if (indexOf(distantmacrolink, " ") > -1) {
			while (indexOf(distantmacrolink, " ") > -1) {
				distantmacrolink=substring(distantmacrolink, 0, (indexOf(distantmacrolink, " ")))+"%20"+substring(distantmacrolink, (indexOf(distantmacrolink, " ")+1),lengthOf(distantmacrolink) );
			}
		}
		showStatus("Internet link...");
		macrotextnih =File.openUrlAsString(distantmacrolink);
		showStatus("");
	} else { showMessage ("No internet connection to looks for new version.");}
	return macrotextnih;
}

function InstallPluginsStarter(macroname) {
	// from MacroPluginShortcutsTool.txt
	codestarter = "run\(\"Install...\", \"install=[\"+getDirectory(\"macros\")+\""+kind+ macroname + "\]\"\);";
	if (getDirectory("plugins") == "") exit ("Unable to find the Plugins directory; something wrong in the ImageJ folder.");
	if (endsWith(macroname, ".txt") || endsWith(macroname, ".ijm")) pluginname = substring(macroname, 0, (lengthOf(macroname)-4));
	StarterDir = getDirectory("plugins")+favoritefoldername+File.separator;
	File.makeDirectory(StarterDir);
	if (!File.exists(StarterDir)) exit ("Unable to create "+favoritefoldername+" Macros directory, something wrong in the ImageJ folder.");
	starterplugin = StarterDir + pluginname +"_ .ijm";
	f= File.open(StarterDir + pluginname +"_ .ijm");
	print (f,codestarter);
	File.close(f);
	showMessage ("The plugin shortcut \"" +pluginname+ "\" will be available after\nImageJ restarting, in the \"Plugins->" + favoritefoldername + "\" menu.");
}

// *** End of additionnal code for on line update ressources ***



