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
      LocalDateTime lastTime = LocalDateTime.ofInstant(last.toInstant(), ZoneId.systemDefault());
      Date next = sched.getNextScheduledTime(x, last);
      LocalDateTime nextTime = LocalDateTime.ofInstant(next.toInstant(), ZoneId.systemDefault());
      test ( ChronoUnit.DAYS.between(lastTime, nextTime) == 1, "Hour - next day" );

      sched.setHours("2");
      sched.setMinute(25);
      last = sched.getNextScheduledTime(x, null);
      lastTime = LocalDateTime.ofInstant(last.toInstant(), ZoneId.systemDefault());
      next = sched.getNextScheduledTime(x, last);
      nextTime = LocalDateTime.ofInstant(next.toInstant(), ZoneId.systemDefault());
      test ( ChronoUnit.DAYS.between(lastTime, nextTime) == 1, "Hour/Minute - next day" );

      CronSchedule.HOURS.clear(sched);
      sched.setMinute(5);
      sched.setSecond(-1);
      last = sched.getNextScheduledTime(x, null);
      lastTime = LocalDateTime.ofInstant(last.toInstant(), ZoneId.systemDefault());
      next = sched.getNextScheduledTime(x, last);
      nextTime = LocalDateTime.ofInstant(next.toInstant(), ZoneId.systemDefault());
      test ( ChronoUnit.HOURS.between(lastTime, nextTime) == 1, "Minute - next hour" );

      CronSchedule.HOURS.clear(sched);
      sched.setMinute(-1);
      sched.setSecond(30);
      last = sched.getNextScheduledTime(x, null);
      lastTime = LocalDateTime.ofInstant(last.toInstant(), ZoneId.systemDefault());
      next = sched.getNextScheduledTime(x, last);
      nextTime = LocalDateTime.ofInstant(next.toInstant(), ZoneId.systemDefault());
      test ( ChronoUnit.MINUTES.between(lastTime, nextTime) == 1, "Second - next minute" );

      // next called twice with same last, should give same results
      CronSchedule.HOURS.clear(sched);
      sched.setMinute(5);
      sched.setSecond(-1);
      last = sched.getNextScheduledTime(x, null);
      lastTime = LocalDateTime.ofInstant(last.toInstant(), ZoneId.systemDefault());
      next = sched.getNextScheduledTime(x, last);
      nextTime = LocalDateTime.ofInstant(next.toInstant(), ZoneId.systemDefault());
      Date next2 = sched.getNextScheduledTime(x, last);
      LocalDateTime nextTime2 = LocalDateTime.ofInstant(next2.toInstant(), ZoneId.systemDefault());
      test ( ChronoUnit.MINUTES.between(nextTime, nextTime2) == 0, "Call twice - same result" );

      CronSchedule.HOURS.clear(sched);
      sched.setMinute(-1);
      sched.setSecond(-1);
      sched.setDaysOfMonth(new Integer[] {15});
      last = sched.getNextScheduledTime(x, null);
      lastTime = LocalDateTime.ofInstant(last.toInstant(), ZoneId.systemDefault());
      next = sched.getNextScheduledTime(x, last);
      nextTime = LocalDateTime.ofInstant(next.toInstant(), ZoneId.systemDefault());
      // If nextTime month changes DST/EST, then month delta will be zero as it's an hour short of a full month.
      // long diff = ChronoUnit.MONTHS.between(lastTime, nextTime);
      long diff = Math.abs(nextTime.getMonthValue() - lastTime.getMonthValue());
      test ( diff == 1 || diff == 11, "DayOfMonth - next month "+diff );

      CronSchedule.HOURS.clear(sched);
      sched.setMinute(-1);
      sched.setSecond(-1);
      sched.setDaysOfMonth(new Integer[] {});
      sched.setDaysOfWeek(new foam.time.DayOfWeek[] { foam.time.DayOfWeek.values()[LocalDateTime.now().getDayOfWeek().getValue()] }); // day of test run.
      last = sched.getNextScheduledTime(x, null);
      lastTime = LocalDateTime.ofInstant(last.toInstant(), ZoneId.systemDefault());
      next = sched.getNextScheduledTime(x, last);
      nextTime = LocalDateTime.ofInstant(next.toInstant(), ZoneId.systemDefault());
      diff = ChronoUnit.DAYS.between(lastTime, nextTime);
      test ( diff == 7, "DayOfWeek - next week "+diff );


      sched.setDaysOfWeek(new foam.time.DayOfWeek[] {});
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
