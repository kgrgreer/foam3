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
      sched.setHour(time.getHour());
      Date last = sched.getNextScheduledTime(x, null);
      LocalDateTime lastTime = LocalDateTime.ofInstant(last.toInstant(), ZoneId.systemDefault());
      Date next = sched.getNextScheduledTime(x, last);
      LocalDateTime nextTime = LocalDateTime.ofInstant(next.toInstant(), ZoneId.systemDefault());
      test ( ChronoUnit.DAYS.between(lastTime, nextTime) == 1, "Hour - next day" );

      sched.setHour(2);
      sched.setMinute(25);
      last = sched.getNextScheduledTime(x, null);
      lastTime = LocalDateTime.ofInstant(last.toInstant(), ZoneId.systemDefault());
      next = sched.getNextScheduledTime(x, last);
      nextTime = LocalDateTime.ofInstant(next.toInstant(), ZoneId.systemDefault());
      test ( ChronoUnit.DAYS.between(lastTime, nextTime) == 1, "Hour/Minute - next day" );

      sched.setHour(-1);
      sched.setMinute(5);
      sched.setSecond(-1);
      last = sched.getNextScheduledTime(x, null);
      lastTime = LocalDateTime.ofInstant(last.toInstant(), ZoneId.systemDefault());
      next = sched.getNextScheduledTime(x, last);
      nextTime = LocalDateTime.ofInstant(next.toInstant(), ZoneId.systemDefault());
      test ( ChronoUnit.HOURS.between(lastTime, nextTime) == 1, "Minute - next hour" );

      sched.setHour(-1);
      sched.setMinute(-1);
      sched.setSecond(30);
      last = sched.getNextScheduledTime(x, null);
      lastTime = LocalDateTime.ofInstant(last.toInstant(), ZoneId.systemDefault());
      next = sched.getNextScheduledTime(x, last);
      nextTime = LocalDateTime.ofInstant(next.toInstant(), ZoneId.systemDefault());
      test ( ChronoUnit.MINUTES.between(lastTime, nextTime) == 1, "Second - next minute" );

      // next called twice with same last, should give same results
      sched.setHour(-1);
      sched.setMinute(5);
      sched.setSecond(-1);
      last = sched.getNextScheduledTime(x, null);
      lastTime = LocalDateTime.ofInstant(last.toInstant(), ZoneId.systemDefault());
      next = sched.getNextScheduledTime(x, last);
      nextTime = LocalDateTime.ofInstant(next.toInstant(), ZoneId.systemDefault());
      Date next2 = sched.getNextScheduledTime(x, last);
      LocalDateTime nextTime2 = LocalDateTime.ofInstant(next2.toInstant(), ZoneId.systemDefault());
      test ( ChronoUnit.MINUTES.between(nextTime, nextTime2) == 0, "Call twice - same result" );

      sched.setHour(-1);
      sched.setMinute(-1);
      sched.setSecond(-1);
      sched.setDayOfMonth(15);
      last = sched.getNextScheduledTime(x, null);
      lastTime = LocalDateTime.ofInstant(last.toInstant(), ZoneId.systemDefault());
      next = sched.getNextScheduledTime(x, last);
      nextTime = LocalDateTime.ofInstant(next.toInstant(), ZoneId.systemDefault());
      long diff = ChronoUnit.MONTHS.between(lastTime, nextTime);
      test ( diff == 1, "DayOfMonth - next month "+diff );

      sched.setHour(-1);
      sched.setMinute(-1);
      sched.setSecond(-1);
      sched.setDayOfMonth(-1);
      sched.setDayOfWeek(2); // Tuesday
      last = sched.getNextScheduledTime(x, null);
      lastTime = LocalDateTime.ofInstant(last.toInstant(), ZoneId.systemDefault());
      next = sched.getNextScheduledTime(x, last);
      nextTime = LocalDateTime.ofInstant(next.toInstant(), ZoneId.systemDefault());
      diff = ChronoUnit.DAYS.between(lastTime, nextTime);
      test ( diff == 7, "DayOfWeek - next week "+diff );


      sched.setDayOfWeek(-1);
      sched.setHour(2);
      sched.setMinute(25);
      sched.setTimezone("America/Toronto"); // EST
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
