/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.cron.test',
  name: 'CronScheduleTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.nanos.cron.*',
    'java.util.*',
    'java.time.*',
    'java.time.temporal.ChronoUnit'
  ],

  methods: [
    {
      name: 'runTest',

      javaCode: `
      CronSchedule sched = new CronSchedule();
      LocalDateTime time = LocalDateTime.now();
      time = time.minusHours(1);
      sched.setHours(String.valueOf(time.getHour()));
      Date last = sched.getNextScheduledTime(x, null);
      LocalDateTime lastTime = LocalDateTime.ofInstant(last.toInstant(), ZoneOffset.UTC);
      Date next = sched.getNextScheduledTime(x, last);
      LocalDateTime nextTime = LocalDateTime.ofInstant(next.toInstant(), ZoneOffset.UTC);
      test ( ChronoUnit.DAYS.between(lastTime, nextTime) == 1, "Hour (-1 all) - next hour" );
      next = sched.getNextScheduledTime(x, next);
      nextTime = LocalDateTime.ofInstant(next.toInstant(), ZoneOffset.UTC);
      test ( ChronoUnit.DAYS.between(lastTime, nextTime) == 2, "Hour (-1 all) - next next hour" );

      sched.setHours("2");
      sched.setMinute(25);
      last = sched.getNextScheduledTime(x, null);
      lastTime = LocalDateTime.ofInstant(last.toInstant(), ZoneOffset.UTC);
      next = sched.getNextScheduledTime(x, last);
      nextTime = LocalDateTime.ofInstant(next.toInstant(), ZoneOffset.UTC);
      test ( ChronoUnit.DAYS.between(lastTime, nextTime) == 1, "Hour/Minute - next day" );

      sched = new CronSchedule();
      sched.setHour(-1);
      last = sched.getNextScheduledTime(x, null);
      lastTime = LocalDateTime.ofInstant(last.toInstant(), ZoneOffset.UTC);
      next = sched.getNextScheduledTime(x, last);
      nextTime = LocalDateTime.ofInstant(next.toInstant(), ZoneOffset.UTC);
      test ( ChronoUnit.HOURS.between(lastTime, nextTime) == 1, "Hour/Minute - next day" );

      sched = new CronSchedule();
      sched.setMinute(5);
      last = sched.getNextScheduledTime(x, null);
      CronSchedule.SECOND.clear(sched);
      lastTime = LocalDateTime.ofInstant(last.toInstant(), ZoneOffset.UTC);
      next = sched.getNextScheduledTime(x, last);
      nextTime = LocalDateTime.ofInstant(next.toInstant(), ZoneOffset.UTC);
      test ( ChronoUnit.HOURS.between(lastTime, nextTime) == 1, "Minute - next hour" );

      sched = new CronSchedule();
      sched.setSecond(30);
      last = sched.getNextScheduledTime(x, null);
      lastTime = LocalDateTime.ofInstant(last.toInstant(), ZoneOffset.UTC);
      next = sched.getNextScheduledTime(x, last);
      nextTime = LocalDateTime.ofInstant(next.toInstant(), ZoneOffset.UTC);
      test ( ChronoUnit.MINUTES.between(lastTime, nextTime) == 1, "Second - next minute" );

      // next called twice with same last, should give same results
      sched = new CronSchedule();
      sched.setMinute(5);
      last = sched.getNextScheduledTime(x, null);
      lastTime = LocalDateTime.ofInstant(last.toInstant(), ZoneOffset.UTC);
      next = sched.getNextScheduledTime(x, last);
      nextTime = LocalDateTime.ofInstant(next.toInstant(), ZoneOffset.UTC);
      Date next2 = sched.getNextScheduledTime(x, last);
      LocalDateTime nextTime2 = LocalDateTime.ofInstant(next2.toInstant(), ZoneOffset.UTC);
      test ( ChronoUnit.MINUTES.between(nextTime, nextTime2) == 0, "Call twice - same result" );

      sched = new CronSchedule();
      sched.setDaysOfMonth(new Integer[] {15});
      last = sched.getNextScheduledTime(x, null);
      lastTime = LocalDateTime.ofInstant(last.toInstant(), ZoneOffset.UTC);
      next = sched.getNextScheduledTime(x, last);
      nextTime = LocalDateTime.ofInstant(next.toInstant(), ZoneOffset.UTC);
      // If nextTime month changes DST/EST, then month delta will be zero as it's an hour short of a full month.
      // long diff = ChronoUnit.MONTHS.between(lastTime, nextTime);
      long diff = Math.abs(nextTime.getMonthValue() - lastTime.getMonthValue());
      test ( diff == 1 || diff == 11, "DaysOfMonth - next month "+diff );

      // migration test of dayOfMonth
      sched = new CronSchedule();
      sched.setDayOfMonth(15);
      last = sched.getNextScheduledTime(x, null);
      lastTime = LocalDateTime.ofInstant(last.toInstant(), ZoneOffset.UTC);
      next = sched.getNextScheduledTime(x, last);
      nextTime = LocalDateTime.ofInstant(next.toInstant(), ZoneOffset.UTC);
      // If nextTime month changes DST/EST, then month delta will be zero as it's an hour short of a full month.
      // long diff = ChronoUnit.MONTHS.between(lastTime, nextTime);
      diff = Math.abs(nextTime.getMonthValue() - lastTime.getMonthValue());
      test ( diff == 1 || diff == 11, "DayOfMonth (legacy) - next month "+diff );


      sched = new CronSchedule();
      sched.setDaysOfWeek(new foam.time.DayOfWeek[] { foam.time.DayOfWeek.values()[LocalDateTime.now().getDayOfWeek().getValue() - 1] }); // day of test run.
      last = sched.getNextScheduledTime(x, null);
      lastTime = LocalDateTime.ofInstant(last.toInstant(), ZoneOffset.UTC);
      next = sched.getNextScheduledTime(x, last);
      nextTime = LocalDateTime.ofInstant(next.toInstant(), ZoneOffset.UTC);
      diff = ChronoUnit.DAYS.between(lastTime, nextTime);
      test ( diff == 7, "DaysOfWeek - next week "+diff );

      // migration dayOfWeek -1 - all
      sched = new CronSchedule();
      sched.setDayOfWeek(-1);
      last = sched.getNextScheduledTime(x, null);
      lastTime = LocalDateTime.ofInstant(last.toInstant(), ZoneOffset.UTC);
      next = sched.getNextScheduledTime(x, last);
      nextTime = LocalDateTime.ofInstant(next.toInstant(), ZoneOffset.UTC);
      diff = ChronoUnit.DAYS.between(lastTime, nextTime);
      test ( diff == 1, "DayOfWeek (legacy -1) - next day "+diff );
      next = sched.getNextScheduledTime(x, next);
      nextTime = LocalDateTime.ofInstant(next.toInstant(), ZoneOffset.UTC);
      diff = ChronoUnit.DAYS.between(lastTime, nextTime);
      test ( diff == 2, "DayOfWeek (legacy -1) - next next day "+diff );

      // migration dayOfWeek
      sched = new CronSchedule();
      sched.setDayOfWeek(LocalDateTime.now().getDayOfWeek().getValue()); // day of test run.
      last = sched.getNextScheduledTime(x, null);
      lastTime = LocalDateTime.ofInstant(last.toInstant(), ZoneOffset.UTC);
      next = sched.getNextScheduledTime(x, last);
      nextTime = LocalDateTime.ofInstant(next.toInstant(), ZoneOffset.UTC);
      diff = ChronoUnit.DAYS.between(lastTime, nextTime);
      test ( diff == 7, "DayOfWeek (legacy) - next week "+diff );

      // legacy - monthOfYear
      sched = new CronSchedule();
      sched.setMonth(LocalDate.now().getMonth().getValue());
      last = sched.getNextScheduledTime(x, null);
      lastTime = LocalDateTime.ofInstant(last.toInstant(), ZoneOffset.UTC);
      next = sched.getNextScheduledTime(x, last);
      nextTime = LocalDateTime.ofInstant(next.toInstant(), ZoneOffset.UTC);
      diff = ChronoUnit.MONTHS.between(lastTime, nextTime);
      test ( diff == 12, "Month (legacy) - next month "+diff );

      // legacy - monthOfYear -1
      sched = new CronSchedule();
      sched.setMonth(-1);
      last = sched.getNextScheduledTime(x, null);
      lastTime = LocalDateTime.ofInstant(last.toInstant(), ZoneOffset.UTC);
      next = sched.getNextScheduledTime(x, last);
      nextTime = LocalDateTime.ofInstant(next.toInstant(), ZoneOffset.UTC);
      long diffMonths = ChronoUnit.MONTHS.between(lastTime, nextTime);
      long diffDays = ChronoUnit.DAYS.between(lastTime, nextTime);
      test ( diffMonths == 0 && diffDays > 0, "Month (legacy -1) - next month "+diff );
      next = sched.getNextScheduledTime(x, next);
      nextTime = LocalDateTime.ofInstant(next.toInstant(), ZoneOffset.UTC);
      diffMonths = ChronoUnit.MONTHS.between(lastTime, nextTime);
      diffDays = ChronoUnit.DAYS.between(lastTime, nextTime);
      test ( diffMonths == 1, "Month (legacy -1) - next next month "+diff );

      sched = new CronSchedule();
      sched.setMonthsOfYear(new foam.time.MonthOfYear[] { foam.time.MonthOfYear.forOrdinal(LocalDate.now().getMonth().getValue()) });
      last = sched.getNextScheduledTime(x, null);
      lastTime = LocalDateTime.ofInstant(last.toInstant(), ZoneOffset.UTC);
      next = sched.getNextScheduledTime(x, last);
      nextTime = LocalDateTime.ofInstant(next.toInstant(), ZoneOffset.UTC);
      diff = ChronoUnit.MONTHS.between(lastTime, nextTime);
      test ( diff == 12, "MonthsOfYear - next month "+diff+" "+lastTime+" "+nextTime );

      // TimeZone
      sched = new CronSchedule();
      sched.setHours("2");
      sched.setMinute(25);
      sched.setTimeZone("America/Toronto"); // EST
      ZoneId zoneId = ZoneId.of("America/Toronto");
      last = sched.getNextScheduledTime(x, null);
      lastTime = LocalDateTime.ofInstant(last.toInstant(), zoneId);
      next = sched.getNextScheduledTime(x, last);
      nextTime = LocalDateTime.ofInstant(next.toInstant(), zoneId);
      test ( ChronoUnit.DAYS.between(lastTime, nextTime) == 1, "EST Hour/Minute - next day" );
      Calendar cal = Calendar.getInstance();
      cal.setTime(next);
      test ( cal.get(Calendar.HOUR_OF_DAY) == 2, "EST Hour 2");
      test ( cal.get(Calendar.MINUTE) == 25, "EST Minute 25");
      // works for common America/Toronto
      test ( cal.getTimeZone().getID().equals(zoneId.getId()), "EST timezone" );
      `
    }
  ]
});
