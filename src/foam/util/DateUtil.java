/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.util;

import foam.core.X;
import foam.dao.DAO;
import foam.time.TimeZone;
import foam.util.SafetyUtil;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import static foam.mlang.MLang.*;

public abstract class DateUtil {

  public static ZoneId getTimeZoneId(X x, String timeZoneStr) {
    ZoneId zone = ZoneId.systemDefault();

    if ( SafetyUtil.isEmpty(timeZoneStr) ) return zone;

    TimeZone timeZone = (TimeZone) ((DAO) x.get("timeZoneDAO"))
      .find(OR(EQ(TimeZone.ID, timeZoneStr), EQ(TimeZone.DISPLAY_NAME, timeZoneStr)));

    return timeZone == null ? zone : ZoneId.of(timeZone.getId());
  }

  public static Date localDateToDate(LocalDate localDate) {
    return Date.from(localDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
  }

  public static Date localDateToDate(LocalDate localDate, ZoneId zone) {
    if ( zone == null ) {
      return localDateToDate(localDate);
    }
    return Date.from(localDate.atStartOfDay(zone).toInstant());
  }

  public static Date localDateTimeToDate(LocalDateTime localDateTime) {
    return Date.from(localDateTime.atZone(ZoneId.systemDefault()).toInstant());
  }

  public static Date localDateTimeToDate(LocalDateTime localDateTime, ZoneId zone) {
    if ( zone == null ) {
      return localDateTimeToDate(localDateTime);
    }
    return Date.from(localDateTime.atZone(zone).toInstant());
  }

  public static LocalDate dateToLocalDate(Date date) {
    return LocalDate.ofInstant(date.toInstant(), ZoneId.systemDefault());
  }

  public static LocalDate dateToLocalDate(Date date, ZoneId zone) {
    if ( zone == null ) {
      return dateToLocalDate(date);
    }
    return LocalDate.ofInstant(date.toInstant(), zone);
  }

  public static LocalDateTime dateToLocalDateTime(Date date) {
    return LocalDateTime.ofInstant(date.toInstant(), ZoneId.systemDefault());
  }

  public static LocalDateTime dateToLocalDateTime(Date date, ZoneId zone) {
    if ( zone == null ) {
      return dateToLocalDateTime(date);
    }
    return LocalDateTime.ofInstant(date.toInstant(), zone);
  }
}
