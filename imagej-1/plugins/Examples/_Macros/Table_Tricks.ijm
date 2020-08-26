// This macro demonstrates how to clear a Table (TextWindow) 
// and update its contents by sending it commands.
//
// There are five commands:
//
//    "\\Clear" - erase the window
//    "\\Update:<text>" - replace the current line with <text>
//    "\\Update<n>:<text>" - replace the nth line with <text>
//    "\\Headings:<tab-delimited list>" - set column headings
//    "\\Close" - close the window

  requires("1.38m");
  name = "[Table Tricks]";
  run("New... ", "name="+name+" type=Table");
  f = name;
  print(f, "\\Clear");
  print(f, "This macro demonstrates how to open a");
  print(f, "table, clear it and update its contents.");
  print(f, "");
  print(f, "The window will be cleared");
  print(f, "in five seconds.");

  wait(5000);
  print(f, "\\Clear");
  wait(1000);

  print(f, "Now, for 10 seconds, we will turn");
  print(f, "the last line into a digital clock.");
  print(f, "");
  getDateAndTime(year, month, week, day, hour, min, sec, msec);
  print(f, "Date: "+year+"/"+month+"/"+day);
  print(f, "Time:");
  start = getTime;
  while (getTime-start<=10000) {
      getDateAndTime(year, month, week, day, hour, min, sec, msec);
      print(f, "\\Update:"+"Time: "+pad(hour)+":"+pad(min)+":"+pad(sec)+":"+pad(floor(msec/100)));
      wait(100);
  }

  print(f, "\\Clear");
  print(f, "Finally, for 10 seconds, we repeatedly");
  print(f, "update nine lines in the window.");
  wait(4000);
  print(f, "\\Clear");
  bars = newArray("*", "**", "***", "****", "*****", "******", "*******", "********", "*********");
  n = bars.length;
  index = 0;
  print(f, "\\Clear");
  start = getTime;
  while (getTime-start<=10000) {
      for (i=0; i<n; i++) {
          print(f, "\\Update"+i+":"+"Line "+i+": "+bars[(index++)%n]);
      }
      index++;
      wait(100);
  }
  print(f, "\\Close");

  function pad(n) {
      n = toString(n);
      if (lengthOf(n)==1) n = "0"+n;
      return n;
  }

