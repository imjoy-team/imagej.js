// This macro demonstrates how to use the Array.* functions.

  requires("1.49v");
  print("");
  print("Array functions");
  print("");
  a = newArray(1, 2, 3, 4, 5);
  Array.print("a:", a);
  Array.print("copy(a):", Array.copy(a));
  Array.print("trim(a,2): ", Array.trim(a,2));
  Array.print("slice(a,1):", Array.slice(a,1));
  Array.print("slice(a,0,a.length-1):", Array.slice(a,0,a.length-1));
  Array.print("slice(a,0,2):", Array.slice(a,0,2));
  Array.print("slice(a,a.length-2):", Array.slice(a,a.length-2));
  Array.print("reverse(a): ", Array.reverse(a));
  Array.print("sort(a): ", Array.sort(a));
  a2 = Array.copy(a);
  Array.print("fill(a,-1):", Array.fill(a,-1));
  Array.getStatistics(a2, min, max, mean, std);
  print("getStatistics(a):");
  print("   min: "+min);
  print("   max: "+max);
  print("   mean: "+mean);
  print("   std dev: "+std);
  
  print("");
  a = newArray("one", "two", "three", "four", "five");
  Array.print("a:", a);
  Array.print("copy(a):", Array.copy(a));
  Array.print("trim(a,2): ", Array.trim(a,2));
  Array.print("slice(a,1):", Array.slice(a,1));
  Array.print("slice(a,0,a.length-1):", Array.slice(a,0,a.length-1));
  Array.print("slice(a,0,2):", Array.slice(a,0,2));
  Array.print("slice(a,a.length-2):", Array.slice(a,a.length-2));
  Array.print("reverse(a): ", Array.reverse(a));
  Array.print("sort(a): ", Array.sort(a));

  print("");
  a = newArray("a1","a2","a3");
  Array.print("a:", a);
  b = newArray("b1","b2","b3");
  Array.print("b:", b);
  Array.print("concat(a,b):", Array.concat(a,b));
  Array.print("concat(\"xx\", a):", Array.concat("xx",a));
  Array.print("concat(b,\"xx\"):", Array.concat(b,"xx"));
  Array.print("concat(a,newArray(a.length)):", Array.concat(a,newArray(a.length)));


