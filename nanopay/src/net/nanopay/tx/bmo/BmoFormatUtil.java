package net.nanopay.tx.bmo;

import org.apache.commons.lang3.StringUtils;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;

public class BmoFormatUtil {

  public static String getCurrentJulianDateEST() {
    return toJulianDateEST(Instant.now());
  }

  public static String toJulianDateEST(Instant instant) {
    ZonedDateTime est = instant.atZone(ZoneId.of("America/Toronto"));
    return "0"
      + String.valueOf(est.getYear() % 100)
      + addLeftZeros(est.getDayOfYear(), 3);
  }

  public static String getCurrentDateTimeEST() {
    ZonedDateTime est = ZonedDateTime.now(ZoneId.of("America/Toronto"));
    return est.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
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
