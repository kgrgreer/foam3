package net.nanopay.kotak;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

public class KotakUtils {

  public static String getUniqueId() {
    // length of a unique id for Kotak should less than or equal to 18
    String[] idd = UUID.randomUUID().toString().split("-");
    return idd[0] + idd[1] + idd[2];
  }

  public static String getCurrentIndianDate() {
    Instant instant = Instant.now();
    ZoneId india = ZoneId.of("Asia/Kolkata");
    ZonedDateTime zonedDateTime = ZonedDateTime.ofInstant(instant, india);
    DateTimeFormatter format = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    return zonedDateTime.format(format);
  }
}
