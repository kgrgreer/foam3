package net.nanopay.tx.bmo;

import org.apache.commons.lang3.StringUtils;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;

public class BmoFormatUtil {

  public static String toJulianDate(LocalDate date) {
    return "0"
        + String.valueOf(date.getYear() % 100)
        + addLeftZeros(date.getDayOfYear(), 3);
  }

  public static String toJulianDate(Date date) {
    return toJulianDate(date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate());
  }

  public static String addLeftZeros(long number, int size) {
    return addLeftZeros(String.valueOf(number), size);
  }

  public static String addLeftZeros(int number, int size) {
    return addLeftZeros(String.valueOf(number), size);
  }

  public static String addLeftZeros(String str, int size) {
    return StringUtils.leftPad(str, size, "0");
  }

  public static String addRightBlanks(String str, int size) {
    return StringUtils.rightPad(str, size, " ");
  }

  public static String blanks(int size) {
    return StringUtils.rightPad("", size, " ");
  }


}
