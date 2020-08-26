// "Snake"
//
// This macro set demonstrates how to use numeric keypad keys
// as shortcuts, how to generate and use a custom color LUT, 
// how to create an image centered on the screen and how to 
// display HTML formatted messages in dialog boxes.
//
// Keypad keys:
//    + - start
//    8 - move up
//    6 - move right
//    2 (or 5) - move down
//    4 - move left
//
// Hint: Green and cyan are good, red and black are bad.

  var d,x,y,score,level;
  var s=128;

  macro "New Game [n+]" {
     score=0; level=1; 
     while (level<=10) {
        initPlayBoard();
        exitLevel=false;
        while(!exitLevel) {
           checkCurrentDirection();
           if (getPixel(x,y)==1) 
              youAteSomethingGood();
           else if ((getPixel(x,y)==2)||((getPixel(x,y)==0)&&(d!=""))) 
              youAteSomethingBad();
           else if (getPixel(x,y)==4) 
              exitLevel=true;	
           else
              setPixel(x,y,0);
           wait(100-level*8);
           updateDisplay();
        }
        beep;
        level++;
     }
     level--;
     showMessage(
       "<html><font size=+3>Congratulations!</font><p>"+
       "<font size=+2>Level: "+level+"</font><br>"+
       "<font size=+2>Score: "+score+"</font>"
     );
     close;
  }

  macro"Up [n8]" {d="U";}
  macro"Down [n2]" {d="D";}
  macro"Down [n5]" {d="D";}
  macro"Right [n6]" {d="R";}
  macro"Left [n4]" {d="L";}

  function initPlayBoard() {
      reuse = nImages>0;
      if (reuse) reuse = startsWith(getTitle, "Level ");
      if (reuse)
         rename("Level "+level+" Score "+score);
      else {
         if (getVersion>="1.37e")
            call("ij.gui.ImageWindow.centerNextImage");
         newImage("Level "+level,"8-bit",s,s,1);
         run("View 100%"); run("In"); run("In");
     }
     x=s/2;y=x;d="";
     r=newArray(0, 0, 255, 255,  0, 220);
     g=newArray(0, 200, 0, 255, 255, 230);
     b=newArray(0, 0, 0, 255, 255, 255);
     setLut(r,g,b); // a custom LUT with just 5 colors.
     setColor(3); fillRect(0,0,s,s); // the white image bckgd
     setColor(0); drawRect(0,0,s,s); // the black image frame
     setColor(5); // the backgroung text color
     setFont("Monospaced",32,"bold"); setJustification("center");
     drawString("ImageJ",s/2,s/3);
     drawString("Snake",s/2,2*s/3);
     drawString("Game",s/2,s);
     addItem(20,1); // 20 green color food
     addItem(20,2); // 20 red color poison
     addItem( 1,4); // 1 cyan color door to next level
     setPixel(x,y,0); // sets start position to center
  }

  function addItem(f,type) {
     setColor(type);
     for (i=0;i<f;i++) {
        xf=s/10+random()*s*0.8;
        yf=s/10+random()*s*0.8;
        if (yf<s/2) {side=-1;}
        if (type==4) {
           side =1;
           if (yf<s/2) side=-1;
           drawRect(xf,(s/2+side*0.4*s),10,2);
        } else
          drawRect(xf,yf,2,2);
     }
  }

  function checkCurrentDirection() {
     if (d=="U") {y=y-1;}
     else if(d=="D") {y=y+1;}
     else if(d=="L") {x=x-1;}
     else if(d=="R") {x=x+1;}
  }

  function youAteSomethingBad() {
     run("Find Edges");
     showMessage(
       "<html><font size=+3>Game Over</font><p>"+
       "<font size=+2>Level: "+level+"</font><br>"+
       "<font size=+2>Score: "+score+"</font>"
     );
     close;
     exit;
  }

  function youAteSomethingGood() {
     for (i=x-1;i<=x+1;i++) {
        for (j=y-1;j<=y+1;j++) {
           if (getPixel(i,j)==1)
              setPixel(i,j,3);
        }
     }
     score++;
     rename("Level "+level+" Score "+score);
     beep();
  }
