// This macro demonstrates how to clear the Log window 
// and update its contents by sending it commands.
//
// There are three commands:
//
//    "\\Clear" - erase the Log window
//    "\\Update:<text>" - replace the current line with <text>
//    "\\Update<n>:<text>" - replace the nth line with <text>, where n<26

  requires("1.37j");
  print("\\Clear");
  print("This macro demonstrates how a");
  print("macro can clear the Log window ");
  print("and update its contents.");
  print("");
  print("The Log window will be");
  print(" cleared in five seconds.");

  wait(5000);
  print("\\Clear");
  wait(1000);

  print("Now, for 10 seconds, we will turn");
  print("the last line into a digital clock.");
  print("");
  getDateAndTime(year, month, week, day, hour, min, sec, msec);
  print("Date: "+year+"/"+month+"/"+day);
  print("Time:");
  start = getTime;
  while (getTime-start<=10000) {
      getDateAndTime(year, month, week, day, hour, min, sec, msec);
      print("\\Update:"+"Time: "+hour+":"+min+":"+sec+":"+floor(msec/100));
      wait(100);
  }

  print("\\Clear");
  print("Finally, for 10 seconds, we repeatedly");
  print("update nine lines in the Log window.");
  wait(4000);
  print("\\Clear");
  bars = newArray("*", "**", "***", "****", "*****", "******", "*******", "********", "*********");
  n = bars.length;
  index = 0;
  print("\\Clear");
  start = getTime;
  while (getTime-start<=10000) {
      for (i=0; i<n; i++) {
          print("\\Update"+i+":"+"Line "+i+": "+bars[(index++)%n]);
      }
      index++;
      wait(100);
  }
