package net.nanopay.meter.reports;

import java.util.function.Function;

public abstract class AbstractReport {

  protected char separator = ',';

  public <T> String nullCheckToString(T obj, Function<T, String> fn) {
    return (obj != null) ?
      fn.apply(obj) :
      "";
  }

  public String buildCSVLine(int numElements, String... args) {
    StringBuilder sb = new StringBuilder();
    for ( int i = 0; i < numElements; i++) {
      if ( i < args.length) 
        sb.append(args[i]);
      if ( i < numElements - 1 ) 
        sb.append(separator);
      else 
        sb.append(System.getProperty("line.separator"));
    }
    return sb.toString();
  }
}

