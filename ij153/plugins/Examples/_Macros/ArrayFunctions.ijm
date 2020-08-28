// This macro demonstrates how to use the Array.* functions.

  requires("1.42j");
  a1 = newArray(10, 5, 15, 2, 1.23456);
  a2 = Array.copy(a1);
  list("original", a2);
  a2 = Array.trim(a1, 2);
  list("trim", a2);
  Array.sort(a1);
  list("sort", a1);
  Array.getStatistics(a1, min, max, mean, std);
  print("stats");
  print("   min: "+min);
  print("   max: "+max);
  print("   mean: "+mean);
  print("   std dev: "+std);
  Array.fill(a1, -1);
  list("fill", a1);

  a1 = newArray("one", "two", "three", "four");
  print("");
  a2 = Array.copy(a1);
  list("original", a2);
  a2 = Array.trim(a1, 2);
  list("trim", a2);
  Array.sort(a1);
  list("sort", a1);

  function list(name, a) {
      print(name);
      for (i=0; i<a.length; i++)
          print("   "+a[i]);
  }
