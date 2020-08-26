/////////////////////////////////////////////////////////////////////// 
// Image, Stack and Timelapse Arrow Labelling
// 
// avaible in the IJ macros toolsets repertory at  
// http://rsb.info.nih.gov/ij/macros/toolsets/Image, Stack and Timelapse Arrow Labelling.txt
/////////////////////////////////////////////////////////////////////// 
// Author: Gilles Carpentier, Faculte des Sciences et
// Technologies,  Universite Paris 12 Val de Marne, France

// More information is available at
// http://image.bio.methods.free.fr/arrows.html

// First version 24 04 2007
// Requires the ImageJ 1.38p 
// Based on the following macros:
// macro ArrowMakerTool, from the author and available on the ImageJ website at:
// http://rsb.info.nih.gov/ij/macros/tools/ArrowMakerTool.txt
// Macro BigCursorTool writen by Wayne Rasband, and avaible on the ImageJ website at:
// http://rsb.info.nih.gov/ij/macros/tools/BigCursorTool.txt
// macro change Color tool, from the author and available on the ImageJ website at:
// http://rsb.info.nih.gov/ij/macros/tools/ChangeColorTool.txt
// macro SelectionColorMenuTool, from the author and available on the ImageJ website at:
// http://rsbweb.nih.gov/ij/macros/tools/SelectionColorMenuTool.txt

var x,  y,  quadrantx,xlocation,ylocation,xinit,yinit,xprime,yprime,arrowline ; //spacer,
var  arrowlenght=20, arrowwidth=6, arrowconcav=21, taillenght=20,previewarrow=0,speed=15,defaultspeed=15;
var tailwidth=4, tailcolor="Cyan", tailorient="East", orientangle=0,newcolor = "Magenta", stackchoice="All the stack";
var colorchoices=newArray("Magenta","Cyan","Yellow","Black","White","Red","Green","Blue"),rgb=newArray(3);
var fromSlice ="", toSlice="",FSlice=0,TSlice=0,curentSlice=0;
var lastx=-1,lasty=-1,h=-1,w=-1;
var dyn=0,colorok=0,cursorok=0,drawok=0;
var px = newArray(6), py = newArray(6);
var ImaDemo="";

var newlook="New User Graphic Interface";
var oldlook="Standard User Interface";
var interface=newArray("New User Graphic Interface","Standard User Interface");
var lookInterface = "New User Graphic Interface";

var palette=0,reponse=0,cancel=0,apply=0;
var targetWindow=0,tempPalette=0,paletteID=0;
var Lpalette=250,Hpalette=420,Lprev=156,Hprev=156,xpreview=0,ypreview=0;

var	distBord=15,disthaut=30,largbuton=53,hautbuton=25;// button cancel and apply
var box1x=99,box1y=(Hpalette-135);
var box2x=222,box2y=(Hpalette-135);
var box3x=160,box3y=(Hpalette-115);
var box4x=89,box4y=(Hpalette-95);
var box5x=205,box5y=(Hpalette-95);

var Red="", Green="", Blue="", color ="", previousColor="";

var onlinedoclink = "http://image.bio.methods.free.fr/arrows.html";
var urllist = "http://image.bio.methods.free.fr/ij/ijupdatetest/ListOfMacros.txt";// to check the internet access
var demoimagelink1 ="http://image.bio.methods.free.fr/ij/ijmacro/zebrafish/LSM-timelapse-demo-movie.tif.zip",demoimagename1="LSM-timelapse-demo-movie.avi",demoimagename11="LSM-timelapse-demo-movie.zip";
var demoimagelink2 ="http://image.bio.methods.free.fr/ij/ijmacro/zebrafish/LSM-timelapse-demo-movie-Arw.tif.zip",demoimagename2="LSM-timelapse-demo-movie-Arw.avi",demoimagename22="LSM-timelapse-demo-movie-Arw.zip";

var xx = requires138p(); // check version at install time
function requires138p() {requires("1.38p"); return 0;}

// menu popup summering every commands of the the toolset menu bar (click right)
var pmCmds = newMenu("Popup Menu", newArray("Abort Download","-","Set Drawing Arrow\(s\) Location","Draw Arrow\(s\) at the Current Location","-","Restore the Last Cursor Location","Display Coordinates","-","New User Graphic Interface","Standard User Interface","-","Change the Color of a Arrow","-","Undo the Last Arrow","-", "Animation Speed Setting","Animate the Stack","-","Save a Stack as an \".avi\" Movie","-","Download\/Open Demo Timelapse Movie \(6 Mo\)","Download\/Open Demo Timelapse Movie Arrowed \(6 Mo\)","-","About \"Image, Stack and Timelapse Arrow Labelling\"","-","On Line Documentation"));

// click right menu, (ctrl click)
macro "Popup Menu" {
	cmd = getArgument();
	if (cmd !="-" && cmd =="Abort Download")  {abortProcess ();}
	if (cmd !="-" && cmd =="Set Drawing Arrow\(s\) Location") {colorok=0;cursorok=1;drawok=0;dyn=1;setTool(10);}
	if (cmd !="-" && cmd =="Draw Arrow\(s\) at the Current Location")  {drawArrow();} 
	if (cmd !="-" && cmd =="Change the Color of a Arrow") {colorok=1;cursorok=0;drawok=0;dyn=1; setTool(10);}
	if (cmd !="-" && cmd =="Restore the Last Cursor Location") {restoreLastCursor ();}
	if (cmd !="-" && cmd =="Display Coordinates") {DisplayCo ();}
	if (cmd !="-" && cmd == "Undo the Last Arrow") {UndoLast ();}
	if (cmd !="-" && cmd =="Save a Stack as an \".avi\" Movie")  {saveAsAvi ();}

	if (cmd !="-" && cmd == "New User Graphic Interface") {lookInterface = "New User Graphic Interface";}
	if (cmd !="-" && cmd == "Standard User Interface") {lookInterface = "Standard User Interface";}

	if (cmd !="-" && cmd =="Animation Speed Setting") {setMovieSpeed ();}
	if (cmd !="-" && cmd =="Animate the Stack") {AnimateStack();}
	if (cmd !="-" && cmd == "Download\/Open Demo Timelapse Movie \(6 Mo\)") {OpenMovieLink(1,demoimagelink1,demoimagename1,demoimagename11);}
	if (cmd !="-" && cmd == "Download\/Open Demo Timelapse Movie Arrowed \(6 Mo\)") {OpenMovieLink(1,demoimagelink2,demoimagename2,demoimagename22);}

	if (cmd !="-" && cmd == "About \"Image, Stack and Timelapse Arrow Labelling\"") {about1();}
	if (cmd !="-" && cmd == "On Line Documentation") {doc ();}
}

macro "  Tool-1 - " {

	if (colorok==1 && dyn ==1 && getTitle !="Arrow Palette" && getTitle !="Last Arrow") {changeColor ();}
	if (cursorok==1 && dyn ==1 && getTitle !="Arrow Palette" && getTitle !="Last Arrow") {Arrow (1);} 

	// no ansvers -> palette
	if (palette==1 && getTitle =="Arrow Palette"  && dyn ==1 && cancel==0 && reponse ==0) {
		if (isOpen("Arrow Palette")) {goGraphInt ();}
	}

	// ansvers is cancel -> close for cancel
	if (palette==0 && getTitle =="Arrow Palette"  && dyn ==1 && cancel==1 && reponse ==1) {
		palette=0;cursorok=1;
		if (isOpen("Arrow Palette")) {
			selectImage ("Arrow Palette");
			close ();	
		}
	}
	// close for bad conditions
	if (palette==1 && (getTitle !="Arrow Palette" ||  ! isOpen("Arrow Palette")) && dyn ==1 && cancel==0 && reponse ==0) {
		palette=0;cursorok=0;
		if (isOpen("Arrow Palette")) {
			selectImage ("Arrow Palette");
			close ();	
			showMessage("No user ansvers from the \"Arrow Palette\". \nThe tool has been unselected.");
		}
	}
	// apply a user choose
	if (palette==0 && getTitle =="Last Arrow"  && dyn ==1 && cancel==0 && reponse ==1 && apply==1) {
		if (isOpen(targetWindow)) {
			selectImage(targetWindow);
			DrawTheArrows (x,y);
			apply=0;reponse=0;cursorok=1;
		} 
	}
}  // leave slot between ImageJ tools, and allow user interaction

// macro Open/Save a Movie Menu Tool 
var mCmds = newMenu("Movie and Stack Menu Tool",newArray("Open a Movie as Stack","Save a Stack as an \".avi\" Movie","-","Download\/Open Demo Timelapse Movie \(6 Mo\)","Download\/Open Demo Timelapse Movie Arrowed \(6 Mo\)","-","Animation Speed Setting","Animate the Stack"));
macro "Movie and Stack Menu Tool - CdccD16Dd0C999Df5CdefD3aC888D15CedeD52Db0Dc4CabdD72CfffD3bD3cD3dD3eD3fD4cD4dD4eD4fD5dD5eD5fD68D6dD6eD6fD7dD7eD7fD8dD8eD8fD9dD9eD9fDadDaeDafDbdDbfDceDcfDddDdeDeeDefDfeDffC17dD44CcdeD92CbbbD1bCffeD33D75C39eD93CeeeD61D71D81D91CcccD04D0dD12D21D22Dd1Dd2Dd4De6De8Df6Df8DfcC18eD36CcddDb3CaaaD01D03D05De7De9Df7CfeeD29DacC59dD59Dc6CeeeD1fD30D40D41D50D51D65D70D80D90Da0Da1Da2Db1Db2Dc0Dc1Dc2DdcCccdD27D85C1aeD9bCeddD25Dd8CcccD02D09D14D1eDe2De4DebDf2Df4CfffD66D98DbeDcdDdfC7adDa8CeeeD42D97CccdD18D26DecC18dD47CdddD06D0bD1aD20D23DeaCaa9D17CeeeD0fD2aD2bD2cD2eD32D88Dc3C48dDb4CbcdD82C29dDa9CddeDdbCcbbD00Df0CfffD5cD67D79D89C6adD77CeeeD57C09eD49CdddD08Dd5CabbDf9CfffD2dD2fDedDfdC59dD35CcceD43C3adD64CdeeD0aD0cD78C7bdD74CfeeDd9CcdeDa7C08eD45D48Db6CdccDd6C999D11De3Df3C59cDa3CaddD8cC19eDaaCdddD0eD24CbbbD07D10De0C4aeD9aC19eDbaCdddD28DfaC4adD87CcddD62D6cC1aeD7bCeedD60DdaC8bdDc5C08eDb9CaaaD1dDe1Df1C6bdD84CbceD58D76D99C29eD4aCcdeD34D4bCbcbDfbC5aeD6aCeeeD31C0aeD6bDbbC5adDc8CcdeD56C2afD83CddeD69C8ceDa4C08eDb7Db8C999D13De5C9ceDccC19eD38DcbCdddDd7C4aeD95C09eD46C1aeD5aD8bC7beD8aCa9aD19C49dD53CaceDc9C39dDc7CceeD9cC5beD94C09fD54C2aeD73CddcD1cCaceDbcC4beD5bC08eD37C4adD55DabC8beD7aDcaC7adDa6C29eD86C6beD39C5adD96C3aeD63C8ceDa5CdcdDd3CadeD7c"{
	cmd = getArgument();
	if (cmd!="-" && cmd == "Open a Movie as Stack")  {openMovie ();}
	if (cmd!="-" && cmd == "Save a Stack as an \".avi\" Movie")  {saveAsAvi ();}
	if (cmd !="-" && cmd == "Download\/Open Demo Timelapse Movie \(6 Mo\)") {OpenMovieLink(1,demoimagelink1,demoimagename1,demoimagename11);}
	if (cmd !="-" && cmd == "Download\/Open Demo Timelapse Movie Arrowed \(6 Mo\)") {OpenMovieLink(1,demoimagelink2,demoimagename2,demoimagename22);}
	if (cmd !="-" && cmd == "Animation Speed Setting") {setMovieSpeed ();}
	if (cmd !="-" && cmd =="Animate the Stack") {AnimateStack();}
}

// macro  Arrow Drawing Menu Tool
var aCmds = newMenu("Arrow Drawing Menu Tool",newArray("Set Drawing Arrow\(s\) Location","Draw Arrow\(s\) at the Current Location","-","Restore the Last Cursor Location","-","New User Graphic Interface","Standard User Interface","-","Display Coordinates","-","Change the Color of a Arrow","-","Undo the Last Arrow"));
macro "Arrow Drawing Menu Tool -C0b3D0bD1bD2bD3bD41D42D43D44D45D46D47D48D49D4aD4bD4cD4dD4eD4fD5bD6bD7bD8bD9bDabDbbDcbDdbDebDfbCfffD00D01D02D03D04D05D06D07D08D09D0aD0cD0dD0eD0fD10D11D12D13D14D15D16D17D18D19D1aD1cD1dD1eD1fD20D21D22D23D24D25D26D27D28D29D2aD2cD2dD2eD2fD30D31D32D33D34D35D36D37D38D39D3aD3cD3dD3eD3fD40D50D51D52D53D54D55D56D57D58D5cD5dD5eD5fD60D61D62D63D64D65D6aD6cD6dD6eD6fD70D71D72D73D7aD7cD7dD7eD7fD80D81D82D83D84D85D86D89D8aD8cD8dD8eD8fD90D91D92D93D94D95D96D99D9aD9cD9dD9eD9fDa0Da1Da2Da3Da4Da5Da6Da9DaaDacDadDaeDafDb0Db1Db2Db3Db4Db5Db6Db8Db9DbaDbcDbdDbeDbfDc0Dc1Dc2Dc3Dc4Dc5Dc6Dc7Dc8Dc9DcaDccDcdDceDcfDd0Dd1Dd2Dd3Dd4Dd5Dd6Dd7Dd8Dd9DdaDdcDddDdeDdfDe0De1De2De3De4De5De6De7De8De9DeaDecDedDeeDefDf0Df1Df2Df3Df4Df5Df6Df7Df8Df9DfaDfcDfdDfeDffC00fD59D67D68D69D74D75D76D77D78D79D87D88D97D98Da7Db7C88fD5aD66Da8" {
	cmd = getArgument();
	if (cmd!="-" && cmd == "Set Drawing Arrow\(s\) Location")  {colorok=0;cursorok=1;drawok=0;dyn=1; setTool(10);}
	if (cmd!="-" && cmd == "Draw Arrow\(s\) at the Current Location")  {drawArrow();} 
	if (cmd!="-" && cmd == "Change the Color of a Arrow")  {colorok=1;cursorok=0;drawok=0;dyn=1; setTool(10);}
	if (cmd!="-" && cmd == "Restore the Last Cursor Location")  {restoreLastCursor ();}
	if (cmd!="-" && cmd == "Display Coordinates") {DisplayCo ();}
	if (cmd!="-" && cmd == "Undo the Last Arrow") {UndoLast ();}
	if (cmd !="-" && cmd == "New User Graphic Interface") {lookInterface = "New User Graphic Interface";}
	if (cmd !="-" && cmd == "Standard User Interface") {lookInterface = "Standard User Interface";}
}

var cCmds = newMenu("Cursor Color Menu Tool",newArray("yellow","red","green","blue","magenta","cyan","orange","black","white","-","Restore Initial Selection Color","Get Curent Selection Color"));
macro "Cursor Color Menu Tool - C1b0D85D95Da5Db5Dc5Dd5De5Df5CfffD00D01D02D03D04D06D07D08D09D0aD0bD0cD0dD0eD0fD10D11D12D13D14D16D17D18D19D1aD1bD1cD1dD1eD1fD20D21D22D23D24D26D27D28D29D2aD2bD2cD2dD2eD2fD30D31D32D33D34D36D37D38D39D3aD3bD3cD3dD3eD3fD40D41D42D43D44D46D47D48D49D4aD4bD4cD4dD4eD4fD50D51D52D53D54D56D57D58D59D5aD5bD5cD5dD5eD5fD60D61D62D63D64D66D67D68D69D6aD6bD6cD6dD6eD6fD80D81D82D83D84D86D87D88D89D8aD8bD8cD8dD8eD8fD90D91D92D93D94D96D97D98D99D9aD9bD9cD9dD9eD9fDa0Da1Da2Da3Da4Da6Da7Da8Da9DaaDabDacDadDaeDafDb0Db1Db2Db3Db4Db6Db7Db8Db9DbaDbbDbcDbdDbeDbfDc0Dc1Dc2Dc3Dc4Dc6Dc7Dc8Dc9DcaDcbDccDcdDceDcfDd0Dd1Dd2Dd3Dd4Dd6Dd7Dd8Dd9DdaDdbDdcDddDdeDdfDe0De1De2De3De4De6De7De8De9DeaDebDecDedDeeDefDf0Df1Df2Df3Df4Df6Df7Df8Df9DfaDfbDfcDfdDfeDffC03fD70D71D72D73D74D75Cf00D05D15D25D35D45D55D65Cf0eD76D77D78D79D7aD7bD7cD7dD7eD7f" {
	cmd=getArgument();
	if (previousColor == "") {previousColor= call("ij.gui.Roi.getColor");}
	if (cmd != "Restore Initial Selection Color" && cmd != "Get Curent Selection Color" && cmd != "-") run("Colors...", "selection=["+cmd+"]");
	if (cmd == "Restore Initial Selection Color" && cmd != "-") RestoreInitColor ();
	if (cmd == "Get Curent Selection Color" && cmd != "-") GetCurentSelectionColor ();
	getSelectionColors(call("ij.gui.Roi.getColor"));
	showStatus("Selection color is now " + getColorName(Red,Green,Blue));
}

macro "Abort Process Action Tool - C810Dc2Df7Ca55D42D51Ce20D7dD8cDd6CfffD88Da7Cd20DadCfedD3eD55D5bDa9Dc1Ce40D63De6CfffD00D01D03D04D05D06D07D08D09D0aD0cD0dD0eD0fD10D11D14D1cD1dD1eD1fD20D21D22D2fD31D3fD40D66D6aDaaDb0Db5DbbDc0De0DefDf0Df1Df2Df3DfdDfeDffC811Da1Dd3Cc77D1bD6cCe20Dc7CfffD23D65D79DdfCc31D68Da4CeffDeeCd52D27D4dC910D7fD8fDbfDf9Cd64D4bD75Db7Dc6Ce30D39D47D48D74D85Da3CfffD13D30Da6Dd0De1Cc20DacDbdDdaDdbCfffD98Cd42D28D52D5eDe5Ca21D71D81D91DcaCfecD5aD67D69D96Cf30D3aD3bD94Db3Cc32D25D2bD34D9bCfffD12D50D70D80D87D89D90D99Da0Db6Dd1De2Cf63D64D72D82Db2DbeC910D9fDafDecDf8Cb66D17D19D1aDa8Ce20D37D49Dd7Dd8CeffD6bD77D97Cd20D6dD7cDc9CffeD4fD60D7aD9aDbaCf52D35D44D53D6eC821D5fD61De4DfbCebbD15DbcDcbDcfDdeCf30D58D73D83D93Cd41D3cD95De7CfffD2eD78Cf53Dc3DcdDd4DebCa20D6fDccCc75D18D24D5cD7bD8aCf30D36D84Cd30D46D59D8bDd5CfffD02D0bD2dD41D76Cf42D26D8eD9eDdcCa32D2cD3dD4eDb9CfedD56Da5Dd2DedDfcCe31D2aD57D5dDeaCc41D43D4cD86DaeCf63D62D92Da2C810DddDf6DfaCa66D16D33Ce30Dc8Cd20D8dD9cD9dDd9CfeeD32DabDe3Df4Cd51D29D7eC822Db1Df5Cea7Db4Dc5Ce30D4aDb8De9Cd40D38Dc4De8Cd53D45D54C911Dce" {
	abortProcess ();
}

macro "On Line Documentation Action Tool - C000Da9DadDb6DbdDc5Dc6Dd3Dd4Dd5Dd6DddC20fD11D12D13D14D15D16D17D18D19D1aD1bD1cD1dD1eD1fC0f3D42D43D44D45D46D47D48D49D4aD4bD4cD4dD4eD4fC0feD32D33D34D35D36D37D38D39D3aD3bD3cD3dD3eC444DdeDefC73fD01Cfd0D62D63D64D65D66D67D68D69D6aD6bD6cD6dD6eCeeeD90D95Da1Da4Db0Db2Db3De0De8Df0Df7DfaC222DeeC06fD22D23D24D25D26D27D28D29D2aD2bD2cD2dD2eC7f0D52D53D54D55D56D57D58D59D5aD5bD5cD5dD5eCcccDbfDf9Cf74D70Ca99D97C888Da8CfffD9bD9cC000Dc4Dd2C64fD10C0f4D41C0ffD31D3fCf40D71D72D73D74D75D76D77D78D79D7aD7bD7cD7dD7eD7fCa7fD00Cfd0D61D6fCfefD91C444Db5DdaDe9C06fD21D2fC7f0D51D5fCeddD96Cf88D82D83D84D85D8bD8cCaaaDccDeaDfdC999DcfCfffD9fDafDb1Db8De1C666Dc7C84fD02D03D04D05D06D07D08D09D0aD0bD0cD0dD0eC333Da6Da7DaaDb9DbcDd9DdcCdddD9aDa2Da3Dc8DdbDecCaaaDabDaeDc1De3De4De5De6Cf89D8dC222DcdDedDfeDffC4ffD30CfffDebDf1Df2Df3Df4Df5Df6DfcC48fD20C4f6D40CeeeD92D93D94Da0DcbDf8DfbCbbbDb4Dd8C9f4D50C555Dc2C73fD0fC333DbbDc3Dc9Dd1CdddDe7Cf89D81D86D8aD8fC111DbaDd7CdeeDa5CbbbDb7Dc0De2Cf99D87D88D89C777DacDcaCcbbD9eCfaaD80C999D98Cf89D8eC999D9dC766D99C555DceC888DbeCfd4D60C777DdfC666Dd0"{
	doc ();
} 

macro "Version and Update Infos Action Tool - CcccD5fD6fD7fD8fD9fC78bD17D19D2aD33D37D3bD42D4cD75D95DceDd5Dd9De6Df7Df9CddeDa3C36bD27D28D3aD57D58D59D66D76D77D86D87Da7Db8Dd6De8De9CeeeD00D01D02D04D06D07D08D09D0bD0dD0fD10D11D12D14D1bD1dD1fD20D21D22D2dD30D31D32D40D46D47D48D49D50D5bD60D70D71D72D74D7dD80D81D82D84D8dD90D91D92D94D9dDa0Da1Da2Da4Db0Db1DbbDc0Dc1Dc6Dc7Dc8Dc9Dd0Dd1Dd2De0De1De2DedDf0Df1Df2Df4DfbDfdDffC8beD3cD3dD4dD5aD6aD79D7aD7bD85D8bD9aDaaDc3Dc4Dd3Dd4CeeeD03D05D0aD0cD0eD13D15D1cD1eD23D2eD3eD4aD55D6cD73D7cD7eD83D8cD8eD93D9cD9eDb5DcaDdeDe3DeeDf3Df5DfcDfeC559D18D26D34D35D36D41D51D61DafDbfDcfDdaDdbDddDeaDf8CcddD2fD5cD6dD6eDabDb2Db4Dc2DefC99bD16D24D39D45D54D56D64D65Da5DacDb6DbcDcbDd7DecDfaCdefD67D8aC59dD29D2bD68D69D78D88D96D97D98D99Da6Da8Da9Db9De5De7CacdD1aD2cD38D4bD4eD5dD5eD6bD89D9bDb3DbaDc5Dd8De4Df6C348D25D43D44Db7DccDdcDebCcccD3fD4fDdf" {
	VersionInfos ();
}

macro "About \"Image, Stack and Timelapse Arrow Labelling\" Action Tool - C000D84Cb9fD25De7CaaaD14D2dDa0DafDecDfaCedfD49D4aD4bD4cD58D68D9bDb9DbaDbbDbcC889D2cDebCddfD52CcccD0bD22CeeeD00D03D0cD0fD10D1fD20D2fD30D40Dc0Dd0DdfDe0DefDf0Df1Df2Df3DfcDfeDffC666D07D70CdcfD34D35Dc4CbacD86D91CfefD6bD6dD7cD8cD8dD8eD9cD9dDadC97aDd3De5CedfD99CeeeD01D02D04D0dD0eD11D12D1eD21D3fDcfDd1De1De2DeeDf4DfdCfefD7dC545D94Da5CdbeDa4Da7CbabD05D50DaeCfefD7eC98aD32Da1CecfD39D3aD3bD46D48D57D67Da8Db6Db8Dc9DcaDcbDccCdcdD81C878D1bD60D65CdcfD29D36D38D47D77Db7Dc8Dd9DdaCcbcD7aDbfDc1De3C98bD16D24D75DeaCedfD56D66D73D76D83D93Da3C212D7bD88D96D97CcaeD26D3cDdbCaaaD3eD5fCfdfD59C889D15D1aD78Dc2CdcfD45Db4Db5Dc6CdddD13D31D4fDdeDedDfbC777D09D7fD85D90Df7CeceDbdCbadD18D55Db2De9Ca9aD5eDcdDceDdcC656D08D64D80D87D8bCdbfD28D2aD37Dc7Dd8CbbbD1cD42Dd2Df5CfdfD5aD5bD5cD5dD69D6aD6cD9aDa9DabDacC999D0aD41DddDf6CdddD1dD2eD9eDb0C888D06D4eD6fD9fDf9CcbdD54D71D98Dc3Ca9dD17D19Dd4De6C000D74D79D95CcafDd5Dd6De8CedfD62D72D92C889D51Db1DbeCedfD53D63Da2CdcdD6eC777D8fDf8CdcfD43D44Db3Dc5CbadD2bD33C99aD23De4C545D89Da6CcbfD27Dd7CbabD61CedfD82DaaC98aD3dCdceD4dD8a" {
	about1 ();
}

macro "Undo Last Arrow [z]"{
      run("Undo");
}

///////////////// Functions ////////////////////

// set the location
function Arrow (curs) {
	targetWindow=getImageID();
	if (curs == 1) {
		getCursorLoc(x, y, z, flags);
		xstart=x; ystart=y;
		w = getWidth(); h = getHeight();
		x2=x; y2=y;
		while (flags&16!=0) {
			getCursorLoc(x, y, z, flags);
			if (x!=x2 || y!=y2) {
				makeCursor(x,y,w,h);
			}
			x2=x; y2=y;
			wait(10);
		};
	} else {xstart =-1; ystart=-1;} 

	// choose slice 
	if (x!=xstart && y!=ystart) {
		lastx=x;lasty=y;
		nbslice= nSlices;curentSlice= getSliceNumber();
		if (nbslice >1) {chooseStack(curentSlice,nbslice);} else {FSlice=nbslice;TSlice=nbslice;} 
		if (lookInterface == oldlook) {DrawTheArrows (x,y);}
		if (lookInterface == newlook) {
			palette=1;dyn=1;reponse=0;cancel=0;cursorok=0;
			if (! isOpen("Arrow Palette")) {updatePalette (1);}
			setTool(10);
		}
	}
} 

// set the parameters
function arrow (box) {
	// old interface
	if (lookInterface == oldlook) {
		if (box == 1) {
			previewarrow=0;
			arrowchoices1=newArray("3","6","10","15","20","25","30");
			arrowchoices2=newArray("10","15","20","25","30");
			arrowchoices3=newArray("6","11","16","21","26","31");
			arrowchoices4=newArray("0","5","10","15","20","25","30");
			arrowchoices5=newArray("0","2","4","6","12");
			arrowchoices7=newArray("North","N-E","East","S-E","South","S-W","West","N-W");

 			Dialog.create("Arrow Size and Form");
 			Dialog.addChoice("Arrow length:", arrowchoices2,  toString(arrowlenght));
 			Dialog.addChoice("Arrow width:", arrowchoices1,  toString(arrowwidth));
 			Dialog.addChoice("Arrowhead Filling Level:", arrowchoices3, toString(arrowconcav));
 			Dialog.addChoice("Tail Size (Length):", arrowchoices4,  toString(taillenght));
 			Dialog.addChoice("Tail Size (Width):", arrowchoices5,  toString(tailwidth));
			Dialog.addChoice("Arrow Color:",colorchoices, tailcolor);
			Dialog.addChoice("Arrow Orientation:",arrowchoices7, tailorient);
 			Dialog.addCheckbox("Preview", false);
 			Dialog.addMessage("          Press 'z' to Undo (only the last arrow)");
			Dialog.show();

			arrowlenght = parseFloat (Dialog.getChoice());
			arrowwidth = parseFloat (Dialog.getChoice());
			arrowconcav = parseFloat( Dialog.getChoice());
			taillenght = parseFloat(Dialog.getChoice());
			tailwidth = parseFloat(Dialog.getChoice());
			tailcolor = Dialog.getChoice();
			tailorient = Dialog.getChoice();
			previewarrow = parseFloat (Dialog.getCheckbox());
		} 
		if (arrowconcav > (arrowlenght+1)) arrowconcav=(arrowlenght+1);
		if (tailwidth > arrowwidth) tailwidth = (arrowwidth-3);
		arrowline=1;xfleche=x; yfleche=y;
		if (previewarrow == true)  {preview();}
		selectImage(targetWindow);
		setupUndo();

		if (arrowconcav > (arrowlenght+1)) arrowconcav=(arrowlenght+1);
		if (tailwidth > arrowwidth) tailwidth = (arrowwidth-3);

		for (a=0;a<4;a++) {
			builtarrow (arrowline,xfleche,yfleche,arrowwidth,arrowlenght,tailorient,arrowconcav,tailwidth,taillenght,getRGBcolor (tailcolor));
		}
	}
	
	// new interface
	if  (lookInterface == newlook) {
		arrowline=1;xfleche=x; yfleche=y;
		setupUndo();
		for (a=0;a<4;a++) {
			builtarrow (arrowline,xfleche,yfleche,arrowwidth,arrowlenght,tailorient,arrowconcav,tailwidth,taillenght,getRGBcolor (tailcolor));
		}
	}
}

function preview () {
	prev="Arrow preview";
	newImage(prev,"RGB Black",200,300,1);
	image=getImageID();
	xfleche=100;yfleche=75;
	setFont("Serif", 12);
	builtarrow (arrowline,xfleche,yfleche,arrowwidth,arrowlenght,tailorient,arrowconcav,tailwidth,taillenght,getRGBcolor (tailcolor));
	selectImage(image);
	setColor(255,255,255);
	drawString("Arrow lenght: "+arrowlenght +  "  Arrow width:  "+arrowwidth, 2,210);
	drawString("Arrowhead Filling Level: "+arrowconcav,2,225);
	drawString("Tail Lenght: "+taillenght+ " Tail Width: "+tailwidth,2,240);
	drawString("Arrow Color: "+tailcolor,2,260);
	drawString("Arrow Orientation: "+tailorient,2,275);
	exit;
}

function builtarrow (arrowline,xfleche,yfleche,arrowwidth,arrowlenght,tailorient,arrowconcav,tailwidth,taillenght,couleur) {
	// convert into rgv if 8 bit grey
	if (bitDepth()==8) {showMessageWithCancel ("Conversion into 24 bit (RGB) will be performed."); run("RGB Color");}
	autoUpdate(false);
	setColor(rgb[0], rgb[1], rgb[2]);
	if (tailorient == "North") {orientangle=0;}
	if (tailorient == "N-E") {orientangle=(PI/4);arrowline=2;}
	if (tailorient == "East") {orientangle=(PI/2);}
	if (tailorient == "S-E") {orientangle=(PI*3/4);arrowline=2;}
	if (tailorient == "South") {orientangle=(PI);}
	if (tailorient == "S-W") {orientangle=(5*PI/4);arrowline=2;}
	if (tailorient == "West") {orientangle=(3*PI/2);}
	if (tailorient == "N-W") {orientangle=(-(PI/4));arrowline=2;}

	fleche1=newArray (3);
	fleche2=newArray (3);
	alpha3a=(PI/2);lineWidth=1;xi=0;
	setLineWidth(arrowline);
	// arrowhead drawing
	moveTo(xfleche, yfleche);
	x1=(-1*arrowwidth);y1=(arrowlenght); alpha1a=(atan2(y1,x1));  alpha1b=(alpha1a+orientangle);
	getxy (x1,y1,alpha1b);
	fleche1[0]=(xfleche+xprime);fleche2[0]=(yfleche+ yprime);
	x2=(arrowwidth);y2=(arrowlenght);  alpha2a=(atan2(y2,x2));alpha2b=(alpha2a+orientangle);
	getxy (x2,y2,alpha2b);
	fleche1[2]=(xfleche+xprime);fleche2[2]=(yfleche+yprime);
	for (i=2; i<arrowconcav; i++) {
		getxy (xi,i,alpha3a);
		getxy (xprime,yprime,(alpha3a+orientangle));
		fleche1[1]=(xfleche + xprime);fleche2[1]=(yfleche + yprime);
		drawLine(fleche1[0], fleche2[0], fleche1[1], fleche2[1]);
		drawLine(fleche1[2],fleche2[2], fleche1[1], fleche2[1]);
	}
	// tail drawing
	if (tailwidth != 0) {
		getxy (0,arrowconcav,alpha3a);
		getxy (xprime,yprime,(alpha3a+orientangle));
		x3a=xprime;y3a=yprime;
		getxy (0,(arrowconcav+taillenght),alpha3a);
		getxy (xprime,yprime,(alpha3a+orientangle));
		x3b=xprime;y3b=yprime;
		lineWidth=tailwidth;
		setLineWidth(tailwidth);
		drawLine ((xfleche+x3a), (yfleche + y3a), (xfleche+x3b),(yfleche+y3b));
	}
	updateDisplay;
}

function getxy (xxx,yyy,beta) {
	if (xxx==0) xxx=1;
	if (yyy==0) yyy=1;
	xprime=round( (cos(beta) *(xxx/(cos(atan2(yyy,xxx))))));
	yprime=round( (sin(beta) *(xxx/(cos(atan2(yyy,xxx))))));
}

function getRGBcolor (couleur) {
	if (couleur=="Magenta") {rgb[0] = 255; rgb[1]= 0; rgb[2] = 225;}
	if (couleur=="Cyan") {rgb[0]=0; rgb[1]=255; rgb[2]=255;}
	if (couleur=="Yellow") {rgb[0]=255; rgb[1]=255; rgb[2]=0;}
	if (couleur=="White") {rgb[0] =255; rgb[1] =255; rgb[2]=255;}
	if (couleur=="Black") {rgb[0]=0; rgb[1]=0; rgb[2]=0;}
	if (couleur=="Red") {rgb[0]=255; rgb[1]=0; rgb[2]=0;}
	if (couleur=="Green") {rgb[0]=0; rgb[1]=255; rgb[2]=0;}
	if (couleur=="Blue") {rgb[0]=0; rgb[1]=0; rgb[2]=255;}
	return rgb;
}

function chooseStack(curentSlc,nbslices) {
	SliceMenu=newArray(nbslices);fromSlice=curentSlc;toSlice=curentSlc;
	for (i=0; i < nbslices ; i++) {SliceMenu[i]=toString(i+1);}
	Dialog.create("User Choices");
	if (nbslices >1) {
		Dialog.addMessage("You are working with a stack of " + nbslices +" slices . Choose \nto draw an arrowonto the current slice or other slices:");
		Dialog.addMessage("the default values correspond to the current slice. Set the\nsame slicenumber to draw an arrow onto a single slice.");
		Dialog.addMessage("Arrow drawing");
		Dialog.addChoice("from the slice", SliceMenu,toString(fromSlice));		Dialog.addChoice("to the slice",SliceMenu,toString(toSlice));
	}
	Dialog.show();
	fromSlice= Dialog.getChoice(); FSlice=parseFloat (fromSlice);
	toSlice= Dialog.getChoice(); TSlice=parseFloat (toSlice);
}

function openMovie () {
	if (ImaDemo != "") {
		run("Using QuickTime...", "open...");
		//run("Using QuickTime...", "open=["+ImaDemo+"]");
	} else {run("Using QuickTime...", "open..."); }
	ImaDemo="";
}

function saveAsAvi () {
	theStack= getTitle;
	if (nSlices == 1) exit ("You can\'t make a movie with a single image. Fist make a stack.");
	folderTreatedpath =getDirectory("current");
	if (ImaDemo != "") folderTreatedpath =ImaDemo;
	if (endsWith(theStack, ".tif") == 1) {theStack = substring (theStack,0,(indexOf(theStack, ".tif")));}
	if (endsWith(theStack, ".avi") == 1) {theStack = substring (theStack,0,(indexOf(theStack, ".avi")));}
	kind=lastIndexOf(theStack, "-Arw-");
	if (kind>0) {theStack = substring (theStack,0,kind);}
	n=1;
	checkpath= folderTreatedpath + theStack + "-Arw-"+n+".avi";
	while (File.exists(checkpath)) {
		n++;
		checkpath= folderTreatedpath + theStack + "-Arw-"+n+".avi";
	}
	// set the rate speed of the movie (image/sec)
	userspeed=15;speed=0;
	while (speed < 1 || speed > 60) {
		Dialog.create("Save Movie Settings");
		Dialog.addMessage("File destination\:\n"+checkpath);
		Dialog.addNumber("Speed of the movie 1 ... 60  ?", defaultspeed, 0, 2, "(image\/sec)");
		Dialog.show();
		speed=Dialog.getNumber(); 

	}
	defaultspeed=speed;
	run("Animation Options...", "speed=["+speed+"]");
	saveAs ("avi", checkpath);
}

// to draw a arrow at the curent location
function drawArrow() {
	if (getTitle =="Arrow Palette" || getTitle =="Last Arrow") exit;
	targetWindow=getImageID();
	makeCursor(lastx,lasty,w,h);
	if (lastx != -1 && lasty!= -1) {
		x=lastx;y=lasty;
		Arrow (0);
	} else {showMessage ("No current location coordinates found. Choose a location \nusing the \"Set Drawing Arrow\(s\) Location\" sub menu of the \n\"Arrow Drawing Menu Tool\".");}
} 

// called from the user interface tool
function changeColor () {
	if (getTitle !="Arrow Palette" && getTitle !="Last Arrow") {
		setupUndo();
		getCursorLoc(x, y, z, flags);
		doWand(x, y);
 		Dialog.create("New Color Choice");
		Dialog.addChoice("Color?",colorchoices, toString(newcolor));
		Dialog.addMessage("          Press 'z' to Undo");
		Dialog.show();
		newcolor = Dialog.getChoice();
		rgb=getRGBcolor (newcolor);
		setColor(rgb[0], rgb[1], rgb[2]);
		fill();
		run("Select None");
	}
}

function makeCursor(x,y,w,h) {
	px[0]=0; py[0]=y;
	px[1]=w; py[1]=y;
	px[2]=x; py[2]=y;
	px[3]=x; py[3]=0;
	px[4]=x; py[4]=h;
	px[5]=x; py[5]=y;
	makeSelection("polgon", px, py);
	showStatus("Target coodinates: x="+x+", y="+y);
}

function restoreLastCursor () {
	if (getTitle =="Arrow Palette" || getTitle =="Last Arrow") exit;
	if (lastx != -1 && lasty!= -1) {
		makeCursor(lastx,lasty,w,h);
	} else {exit ("No previous cursor available.");}
}

// draw the arrows
function DrawTheArrows (x,y) {
	nbslice= nSlices;countslc=1;
	for (i=FSlice; i<= TSlice; i++) {
		setSlice(i);
		if (countslc ==1) {arrow (1);} else {arrow (0);}
		countslc ++;
	}
	setSlice(curentSlice);
}

// download demo movies
function OpenMovieLink(question,demoimagelink,demoim,demoim1) {
	setBatchMode(true);
	// Check if already downloaded.
	if (isOpen(demoim)) exit ("The \"" + demoim + "\" is already opened as a stack.");
	demoimalocation = getDirectory("startup");	
	ImaDemo1 = demoimalocation+"Downloaded Demo Images"+File.separator;
	ImaDemo2 =ImaDemo1 + "Demo Movie Working Folder" + File.separator;
	ImaDemo=ImaDemo2;
	fildestination = ImaDemo + demoim;
	fildestination1= ImaDemo + demoim1;

	// download the demo if not already into the ImageJ folder
	if (! File.exists(fildestination) || ! File.exists(fildestination1)) {
		if (File.openUrlAsString(urllist) == "") exit("You need an internet access to run this function.");
		showMessageWithCancel ("ImageJ will download a demo movie. Continue?");
		run("URL...", "url=["+demoimagelink+"]");
		imageid = getImageID();
		nomdimage = getTitle;
		// Create a <Downloaded Demo Images> repertory in ImageJ folder.
		File.makeDirectory(ImaDemo1);
		if (!File.exists(ImaDemo1)) exit ("Unable to create the directory \""+ImaDemo1+"\" , something wrong in the ImageJ folder");
		// Create a <Demo Movie Working Folder> repertory in ImageJ folder.
		File.makeDirectory(ImaDemo2);
		if (!File.exists(ImaDemo2)) exit ("Unable to create the directory \""+ImaDemo2+"\" , something wrong in the ImageJ folder");
		selectWindow(nomdimage);speed=15;
		run("Animation Options...", "speed=["+speed+"]");
		saveAs ("avi", fildestination); 
		saveAs ("zip", fildestination1);
		close();
	} 
    
	// create a working folder with the dowloaded movie
	if (File.exists(fildestination) && ! isOpen(demoim)) {
		//if (question ==1 ) showMessageWithCancel ("The \"" + demoim + "\" has been downloaded available at the following HD location:\n" + fildestination + "\n and:" + fildestination1+"\nOpen it now as a stack ?\n(Or \"Cancel\" and open it from the  \"Open a Movie as Stack\" sub\-menu of the \"Movie and Stack Menu Tool\"\) ");
		if (question ==1 ) showMessageWithCancel ("- The \"" + demoim + "\" has been downloaded and available at the following HD location:\n" + fildestination + "\n- A \".zip\" stack version is also available at the following HD location (for computer without required QuickTime resources):\n"+ fildestination1+"\n \nOpen the stack now? ");
		//run("Using QuickTime...", "open=["+fildestination+"]");
		open(fildestination1);
	}
	setBatchMode("exit and display");
}

function setMovieSpeed () {
	userspeed=15;speed=0;
	while (speed < 1 || speed > 60) {
		Dialog.create("Movie\/Stack Animation Speed Settings");
		Dialog.addNumber("Speed of the movie\/stack animation 1 ... 60  ?", defaultspeed, 0, 2, "(image\/sec)");
		Dialog.show();
		speed=Dialog.getNumber(); 
	}
	defaultspeed=speed;
	run("Animation Options...", "speed=["+speed+"]");
}

function AnimateStack() {
	run("Start Animation");
}

function UndoLast () {
	run("Undo");
}

function DisplayCo () {
    showMessage("X Coordinate: "+x + "\nY Coordinate: "+y);
}

// graphic interface
function goGraphInt () {
	clickx=0;clicky=0;
	reponse=0;cancel=0;dyn =0;
	if (! isOpen("Arrow Palette")) {reponse=1;cancel=1;}
	getCursorLoc(clickx, clicky, z, flags);

	if (Nord(clickx,clicky) ==1) {tailorient="North";updatePalette (0);}
	if (Sud (clickx,clicky) ==1) {tailorient="South";updatePalette (0);}
	if (Est (clickx,clicky)	==1) {tailorient="East";updatePalette (0);}
	if (Ouest (clickx,clicky) ==1) {tailorient="West";updatePalette (0);}
	if (NordOuest (clickx,clicky) ==1) {tailorient="N-W";updatePalette (0);}
	if (NordEst (clickx,clicky) ==1) {tailorient="N-E";updatePalette (0);}
	if (SudEst (clickx,clicky) ==1) {tailorient="S-E";updatePalette (0);}
	if (SudOuest (clickx,clicky) ==1) {tailorient="S-W";updatePalette (0);}

	testcolor= coloBoxes(0,1,clickx,clicky);
	if (testcolor != "") {tailcolor=testcolor;updatePalette (0);}

	boxstatut=adjustBoxes(box1x,box1y,0,1,clickx,clicky);
	if (boxstatut == 2) {arrowlenght=arrowlenght-1;updatePalette (0);}
	if (boxstatut == 3) {arrowlenght=arrowlenght+1;updatePalette (0);}

	boxstatut=adjustBoxes(box2x,box2y,0,1,clickx,clicky);
	if (boxstatut == 2) {arrowwidth=arrowwidth-1;updatePalette (0);}
	if (boxstatut == 3) {arrowwidth=arrowwidth+1;updatePalette (0);}

	boxstatut=adjustBoxes(box3x,box3y,0,1,clickx,clicky);
	if (boxstatut == 2) {arrowconcav=arrowconcav-1;updatePalette (0);}
	if (boxstatut == 3) {arrowconcav=arrowconcav+1;updatePalette (0);}

	boxstatut=adjustBoxes(box4x,box4y,0,1,clickx,clicky);
	if (boxstatut == 2) {taillenght=taillenght-1;updatePalette (0);}
	if (boxstatut == 3) {taillenght=taillenght+1;updatePalette (0);}

	boxstatut=adjustBoxes(box5x,box5y,0,1,clickx,clicky);
	if (boxstatut == 2) {tailwidth=tailwidth-1;updatePalette (0);}
	if (boxstatut == 3) {tailwidth=tailwidth+1;updatePalette (0);}

	if (Cancel (clickx,clicky) == 1) {cancel=1;reponse=1;palette=0;}
	if (Apply (clickx,clicky) ==1) {cancel=0;reponse=1;palette=0;apply=1;cursorok=1;}
	dyn =1;
}

function getSample () {
	selectImage (targetWindow);
	xtemp=getWidth();  ytemp=getHeight();
	run("Select None");
	setBatchMode(true);
	run("Duplicate...", "title=temp");
	run("Select All");run("Copy");close ();
	newImage("tempSample","RGB Black",xtemp+2*Lprev,ytemp+2*Hprev,1);
	setForegroundColor(62,10,113);
	run("Select All");run("Fill");run("Select None");
	run("Paste");run("Select None");
	makeRectangle ((x+(Lprev/2)+1), (y+(Lprev/2)+1), Lprev-2, Hprev-2);
	run("Copy");close ();
}

function coloBoxes(draw,detect,clickx,clicky) {
	xcolorbox=20;ycolorbox=10;spcol=(Lpalette-8*xcolorbox)/9;
	setLineWidth(1);detectcol=-1;democolor="";
	for (a=0;a<8;a++) {
		setColor(255,0,93);
		if (detect==1) {
			if (clicky >(Hpalette-160) && clicky < (Hpalette-160+ycolorbox)) {
				if (clickx > (a*xcolorbox+a*spcol+spcol) && clickx < ((a*xcolorbox+a*spcol+spcol)+xcolorbox)) detectcol=a;
			}
		}
		if (draw==1) {drawRect ((a*xcolorbox+a*spcol+spcol), (Hpalette-160), xcolorbox, ycolorbox);run("Select None");}
		if (a==0) {getRGBcolor ("Red");if (detect==1 && detectcol==0) {democolor ="Red";}}
		if (a==1) {getRGBcolor ("Green");if (detect==1 && detectcol==1) {democolor ="Green";}}
		if (a==2) {getRGBcolor ("Blue");if (detect==1 && detectcol==2) {democolor ="Blue";}}
		if (a==3) {getRGBcolor ("Cyan");if (detect==1 && detectcol==3) {democolor ="Cyan";}}
		if (a==4) {getRGBcolor ("Yellow");if (detect==1 && detectcol==4) {democolor ="Yellow";}}
		if (a==5) {getRGBcolor ("Magenta");if (detect==1 && detectcol==5) {democolor ="Magenta";}}
		if (a==6) {getRGBcolor ("Black");if (detect==1 && detectcol==6) {democolor ="Black";}}
		if (a==7) {getRGBcolor ("White");if (detect==1 && detectcol==7) {democolor ="White";}}
		if (draw==1) {setColor(rgb[0], rgb[1], rgb[2]);fillRect ((a*xcolorbox+a*spcol+spcol+1), (Hpalette-160+1), (xcolorbox-2), (ycolorbox-2));run("Select None");}
	}
	return democolor;
}

function adjustBoxes(xbx,ybx,draw,detect,clickx,clicky) {
	xadjustbox=25;yadjustbox=14;
	setLineWidth(1);status=0;
	if (detect==1) {
		if (clicky >(ybx) && clicky < (ybx+yadjustbox) && clickx > (xbx+xadjustbox/2) && clickx < (xbx+xadjustbox)) {status=3;}
		if (clicky >(ybx) && clicky < (ybx+yadjustbox) && clickx > xbx && clickx < (xbx+xadjustbox/2)) {status=2;}
	}
	if (draw==1) {
		setColor(100,50,50);fillRect ((xbx+1), (ybx+1), (xadjustbox-1), (yadjustbox-1));run("Select None");
		setColor(255,0,93);drawRect (xbx, ybx, xadjustbox, yadjustbox); run("Select None");
		drawLine ((xbx+xadjustbox/2-1), ybx, (xbx+xadjustbox/2-1), (ybx+yadjustbox-1));
		setFont("SansSerif", 15,"antialiased");setColor(0,255,0);
		drawString("-",(xbx+2),(ybx+15));
		drawString("+",(xbx+xadjustbox/2-1),(ybx+15));
	}
	return status;
}

// location of the different interactive areas
// cancel
function Cancel (clickx,clicky) {
	testcancel=0;
	if (clickx > distBord && clickx < (distBord+largbuton) &&  clicky > (Hpalette-disthaut) && clicky < (Hpalette-disthaut+hautbuton)) {testcancel=1;}
	return testcancel;	
}

function Nord (clickx,clicky) {
	if (clickx > (xpreview-8)   && clickx < (xpreview +8)  &&  clicky > ((ypreview+(Hprev/2))+(Lpalette-Hprev)/6)   && clicky  < ((ypreview+(Hprev/2))+(Lpalette-Hprev)/6+20)) {testpal=1;} else {testpal=0;} return testpal;
}

function Sud (clickx,clicky) {
	if (clickx > (xpreview-8)   && clickx < (xpreview +8)  &&  clicky > ((Lpalette-Hprev)/3-20)   && clicky  < ((Lpalette-Hprev)/3)) {testpal=1;} else {testpal=0;} return testpal;
}

function Ouest (clickx,clicky) {
	if (clickx > (xpreview+(Lprev/2)+(Lpalette-Lprev)/6)   && clickx < (xpreview+(Lprev/2)+(Lpalette-Lprev)/6+20)  &&  clicky > (ypreview-8)   && clicky  < (ypreview+8) ) {testpal=1;} else {testpal=0;} return testpal;
}

function Est (clickx,clicky) {
	if (clickx > ((Lpalette-Lprev)/3-20)   && clickx < ((Lpalette-Lprev)/3)  &&  clicky > (ypreview-8)   && clicky  < (ypreview+8) ) {testpal=1;} else {testpal=0;} return testpal;
}

function NordOuest (clickx,clicky) {
	if (clickx > (xpreview+(Lprev/2)+(Lpalette-Lprev)/6)   && clickx < (xpreview+(Lprev/2)+(Lpalette-Lprev)/6+18)  &&  clicky > ((ypreview+(Hprev/2))+(Lpalette-Hprev)/6)   && clicky  < ((ypreview+(Hprev/2))+(Lpalette-Hprev)/6+18) ) {testpal=1;} else {testpal=0;} return testpal;
}

function NordEst (clickx,clicky) {
	if (clickx > ((Lpalette-Lprev)/3-18)   && clickx < ((Lpalette-Lprev)/3)  &&  clicky > ((ypreview+(Hprev/2))+(Lpalette-Hprev)/6)   && clicky  < ((ypreview+(Hprev/2))+(Lpalette-Hprev)/6+18) ) {testpal=1;} else {testpal=0;} return testpal;
}

function SudEst (clickx,clicky) {
	if (clickx > ((Lpalette-Lprev)/3-18)   && clickx < ((Lpalette-Lprev)/3)  &&  clicky > ((Lpalette-Hprev)/3-18)   && clicky  < ((Lpalette-Hprev)/3) ) {testpal=1;} else {testpal=0;} return testpal;
}

function SudOuest (clickx,clicky) {
	if (clickx > (xpreview+(Lprev/2)+(Lpalette-Lprev)/6)   && clickx < (xpreview+(Lprev/2)+(Lpalette-Lprev)/6+18)  &&  clicky > ((Lpalette-Lprev)/3-18)   && clicky  < ((Lpalette-Lprev)/3) ) {testpal=1;} else {testpal=0;} return testpal;
}

// apply
function Apply (clickx,clicky) {
	testapply=0;
	if (clickx > (Lpalette-distBord-largbuton) && clickx < (Lpalette-distBord) &&  clicky > (Hpalette-disthaut) && clicky < (Hpalette-disthaut+hautbuton)) {
		makeRectangle (0,0,Lpalette,(Hpalette-36));
		run("Crop"); 
		if (isOpen("Last Arrow")) {selectWindow("Last Arrow");close ();}
		selectImage (paletteID);rename ("Last Arrow");
		testapply=1;
	}
	return testapply;
}

function updatePalette (draw) {
	setBatchMode(true);
	if (draw ==1) {
		setBatchMode(true);
		getSample ();
		restoreLastCursor ();
		setLineWidth(arrowline);
		// make the palette window
		newImage("Arrow Palette","RGB Black",Lpalette,Hpalette,1);
		paletteID=getImageID();
		setForegroundColor(32,0,93);
		run("Select All");run("Fill");run("Select None");
		setColor(255,0,93);
		drawRect ( (Lpalette-Lprev)/2, (Lpalette-Lprev)/2, Lprev, Hprev);run("Select None");
		xpreview=((Lpalette-Lprev)/2 + Lprev/2);
		ypreview=((Lpalette-Lprev)/2 + Hprev/2);

		// draw orientation arrows
	
		builtarrow (2,(Lpalette-Lprev)/3,ypreview,6,20,"East",15,0,0,getRGBcolor ("Yellow"));
		builtarrow (2,(Lpalette-Lprev)/3,(Lpalette-Hprev)/3,6,20,"S-E",15,0,0,getRGBcolor ("Yellow"));
		builtarrow (2,xpreview,(Lpalette-Hprev)/3,6,20,"South",15,0,0,getRGBcolor ("Yellow"));
		builtarrow (2,xpreview+(Lprev/2)+(Lpalette-Lprev)/6,(Lpalette-Hprev)/3,6,20,"S-W",15,0,0,getRGBcolor ("Yellow"));
		builtarrow (2,xpreview+(Lprev/2)+(Lpalette-Lprev)/6,ypreview,6,20,"West",15,0,0,getRGBcolor ("Yellow"));
		builtarrow (2,xpreview+(Lprev/2)+(Lpalette-Lprev)/6,(ypreview+(Hprev/2))+(Lpalette-Hprev)/6,6,20,"N-W",15,0,0,getRGBcolor ("Yellow"));
		builtarrow (2,xpreview,(ypreview+(Hprev/2))+(Lpalette-Hprev)/6,6,20,"North",15,0,0,getRGBcolor ("Yellow"));
		builtarrow (2,(Lpalette-Lprev)/3,(ypreview+(Hprev/2))+(Lpalette-Hprev)/6,6,20,"N-E",15,0,0,getRGBcolor ("Yellow"));

		coloBoxes(1,0,0,0);

		setLineWidth(arrowline);
		setColor(255,0,0);// button cancel
		drawRect (distBord, (Hpalette-disthaut), largbuton, hautbuton);run("Select None");
		setColor(0,255,0);// button apply
		drawRect ((Lpalette-distBord-largbuton), (Hpalette-disthaut), largbuton, hautbuton);run("Select None");
		setColor(100,0,133);
		fillRect (distBord+1, Hpalette-disthaut+1, largbuton-2, hautbuton-2);
		fillRect (Lpalette-distBord-largbuton+1, Hpalette-disthaut+1, largbuton-2, hautbuton-2);
		setFont("SansSerif", 12,"bold");
		setColor(255,60,60);
		drawString("Cancel",(distBord+5),(Hpalette-10));run("Select None");
		setColor(0,255,0);
		drawString("Apply",(Lpalette-distBord-largbuton+7),(Hpalette-10));run("Select None");
	}

	makeRectangle ( ((Lpalette-Lprev)/2+1), ((Lpalette-Lprev)/2+1), Lprev-2, Hprev-2);
	run("Paste");run("Select None");
	if (arrowconcav > (arrowlenght+1)) arrowconcav=(arrowlenght+1);
	if (tailwidth > arrowwidth) tailwidth = (arrowwidth-3);
	if (arrowwidth < 0) arrowwidth=0;
	if (arrowlenght < 0) arrowwidth=0;
	if (arrowconcav < 0) arrowconcav=0;
	if (tailwidth < 0) tailwidth=0;
	if (taillenght < 0) taillenght=0;
	builtarrow (arrowline,xpreview,ypreview,arrowwidth,arrowlenght,tailorient,arrowconcav,tailwidth,taillenght,getRGBcolor (tailcolor));

	setColor(32,0,93); //setColor(150,0,93);
	fillRect(0, (Hpalette-140), Lpalette,103);

	adjustBoxes(box1x,box1y,1,0,0,0);
	adjustBoxes(box2x,box2y,1,0,0,0);
	adjustBoxes(box3x,box3y,1,0,0,0);
	adjustBoxes(box4x,box4y,1,0,0,0);
	adjustBoxes(box5x,box5y,1,0,0,0);

	setColor(255,255,255);
	setFont("SansSerif", 12);
	drawString("Arrow Lenght:"+arrowlenght, 2,(Hpalette-120));
	drawString("Arrow Width:"+arrowwidth, 130,(Hpalette-120));

	drawString("Arrowhead Filling Level:"+arrowconcav,2,(Hpalette-120+20));
	drawString("Tail Lenght:"+taillenght,2,(Hpalette-120+40));
	drawString("Tail Width:"+tailwidth,125,(Hpalette-120+40));
	drawString("Arrow Color:"+tailcolor,2,(Hpalette-120+60));

	drawString("Arrow Orientation:"+tailorient,2,(Hpalette-120+80));
	setBatchMode("exit and display");
}

function RestoreInitColor () {
	if (previousColor !="") {
		getSelectionColors (previousColor);
		run("Colors...", "selection=["+getColorName(Red,Green,Blue)+"]");
		showMessage ("Previous selection color \"" + getColorName(Red,Green,Blue) + "\" has been restored");
	} else {showMessage ("Selection Color has not been changed");}
}

function GetCurentSelectionColor () {
	color= call("ij.gui.Roi.getColor");
	getSelectionColors (color);
	showMessage ("Curent selection color: "+ getColorName(Red,Green,Blue) + " \(Red="+Red+" Green="+Green+" Blue="+Blue+"\)");
}

// decodes a color in the form "java.awt.Color[r=255,g=255,b=0]"
function getSelectionColors (color) {
	Red = substring(color, (indexOf(color, "r=")+2), (indexOf(color, "g=")-1));
	Green=  substring(color, (indexOf(color, "g=")+2), (indexOf(color, "b=")-1));
	Blue=  substring(color, (indexOf(color, "b=")+2), indexOf(color, "]"));
}

function getColorName(r,g,b) {
	if (r=="255" && g=="255" && b=="0") ColorName ="yellow";
	if (r=="255" && g=="0" && b=="0") ColorName ="red";
	if (r=="0" && g=="255" && b=="0") ColorName ="green";
	if (r=="0" && g=="0" && b=="255") ColorName ="blue";
	if (r=="255" && g=="0" && b=="255") ColorName ="magenta";
	if (r=="0" && g=="255" && b=="255") ColorName ="cyan";
	if (r=="255" && g=="200" && b=="0") ColorName ="orange";
	if (r=="0" && g=="0" && b=="0") ColorName ="black";
	if (r=="255" && g=="255" && b=="255") ColorName ="white";
	return ColorName;
}

function abortProcess () {setKeyDown("Esc");}

function about1() {
	about="";
	about=about+"			                                        -- Image, Stack and Timelapse Arrow Labelling --";
	about=about+"\n* Description:";
	about=about+"\nThis toolset allows to draw, with an interactive graphic interface, \"histological\" arrows on images,\nstacks and movies.";
	about=about+"\n* Notice:";
	about=about+"\n   - The \"Movie and Stack Menu\" regroups the functions specific to movies and stack:";
	about=about+"\n         - \"Open a Movie as Stack\" displays a dialog box to open a movie, using QuickTime resources,\n         which will be opened as a stack of images.";
	about=about+"\n         - \"Save a Stack as an \".avi\" Movie\" records a stack as an avi uncompressed movie into the same\n         repertory than the original one, with an incremented suffix number.";
	about=about+"\n         - \"Download\/Open Demo Timelapse Movie\" and \"Download\/Open Demo Timelapse Movie Arrowed\"\n         give respectively a training movie and an example of arrowed movie. Initial movie, obtained by\n         LSM microscopy, was provided by Tim Chico (*).";
	about=about+"\n         - Set the stack/movie animation speed using \"Animation Speed Setting\".";
	about=about+"\n         - Check for the arrow effect on a stack using \"Animate the Stack\". ";        
	about=about+"\n   - The \"Arrow Drawing Menu\" regroups the arrow drawing utilities:";
	about=about+"\n         - \"Set Drawing Arrow(s) Location\" is the first step to draw arrows: move, staying clicked, onto the\n         image, until the cursor points the correct target of the arrow. Unclick, and adjust settings using the\n         menu and the graphic interface which then will appear.";
	about=about+"\n         - \"Draw Arrow(s) at the Current Location\" draws a arrow at the current location when the user\n         graphic interface has been canceled, or the cursor erased for any reason.";
	about=about+"\n         - \"Restore the Last Cursor Location\" restores a visual (non active) cursor at the last location.";
	about=about+"\n         - \"New User Graphic Interface\" is the default interface to set the arrow characteristics.";
	about=about+"\n         - \"Standard User Interface\" allows to use the dialog box interface of the \"ArrowMakerTool\" instead\n         of the graphical interface.";
	about=about+"\n         - \"Display Coordinates\" gives the coordinates x, y  of the current location (same as displayed in the\n         status bar).";
	about=about+"\n         - \"Change the Color of a Arrow\" allows to change the color of a draw arrow, by clicking on it.";
	about=about+"\n         - \"Undo the Last Arrow\" erases the last drawn arrow (only for single image or slice).";
	about=about+"\n   - The \"Cursor Color Menu Menu\" allows to manage the cursor color to make easier the visual location\n         of the target area, depending of the background color of the image.";
	about=about+"\n   - Click on the \"Abort Process\" ImageJ tool bar icon to cancel too long processes.";
	about=about+"\n   - Click on the \"On Line Documentation\" ImageJ tool bar icon for more details.";	about=about+"\n   - Click on the \"Version and Update Infos\" ImageJ tool bar icon to look for new beta versions.";
	about=about+"\n---------------------------------------------------------------------------------------------";
	about=about+"\nThis toolset based on the \"ArrowMakerTool\" was adapted to stacks and movies at the request of Tim Chico,\nPI in vascular biology at the University of Sheffield, UK. Tim Chico also provided the downloadable movie\nexample.";
	about=about + "\n--------------------------------------------------------------------------------------------";
	about=about +"\nAuthor: Gilles Carpentier"+"\nFaculte des Sciences et Technologies"+"\nUniversite Paris 12 Val de Marne, France.";

	showMessage(about);
	//print (about);
}

function doc () {
	if (File.openUrlAsString(urllist) == "") exit("You need an internet access to run this function.");
	showMessageWithCancel  ("A notice is avaible on line. Open it with your default web browser?");
	run("URL...", "url=["+onlinedoclink +"]");
}


// --- End of code of the macro project ---//
// ----------------------------------//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
// -------------------*** Additionnal code for on line update resources ***-----------------------------

//Developer info
//Kind:Toolset
//Title:"Image, Stack and Timelapse Arrow Labelling" 
//Version:1.0
//Date: 28 April 2007
//Origin:NIH
//End info

function VersionInfos () {
	// variables for on line update resources
	beginsign="//Developer info";endsign="//End info"; 
	kind="toolsets/"; 
	urlrep="http://image.bio.methods.free.fr/ij/ijmacro/zebrafish/";
	name="Image, Stack and Timelapse Arrow Labelling.txt"; 
	namedev="Image, Stack and Timelapse Arrow Labelling-dev.txt"; 
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
				update="\n \nA new beta version "+new+ " is available on the "  +giveDevInfo (macrotextdistant,5)+ " web site: ";
				update=update+ "\n \nDo you want to install it?";
			} else {
				update ="\n \nThe new "+new+" beta version called \"" +namedev+ "\" provided by \nthe "+giveDevInfo (macrotextdistant,5) +" web site has already be installed";
				update = update+ " in the \"" +kind+ "\" repertory \nof ImageJ.";
			}
		} else {
			update="No new Beta version available.";
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
	if (File.openUrlAsString("http://rsb.info.nih.gov/ij/macros/Arrays.txt") != "") {
		distantmacrolink = urlrep + name;
		if (indexOf(distantmacrolink, " ") > -1) {
			while (indexOf(distantmacrolink, " ") > -1) {
				distantmacrolink=substring(distantmacrolink, 0, (indexOf(distantmacrolink, " ")))+"%20"+substring(distantmacrolink, (indexOf(distantmacrolink, " ")+1),lengthOf(distantmacrolink) );
			}
		}
		showStatus("Internet link...");
		macrotextnih =File.openUrlAsString(distantmacrolink);
		showStatus("");
	} else { showMessage ("No internet connection to looks for beta version.");}
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



