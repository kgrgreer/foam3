/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.cron.test',
  name: 'OrScheduleTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.X',
    'foam.nanos.cron.*',
    'java.time.*',
    'static foam.util.DateUtil.*'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        testSameTimezones(x);
        testDifferentTimezones(x);
      `
    },
    {
      name: 'testSameTimezones',
      args: 'X x',
      javaCode: `
        Schedule testTOD = new OrSchedule.Builder(x)
          .setDelegates(new Schedule[] {
            new TimeOfDaySchedule.Builder(x).setTimeZone(ZoneId.systemDefault().getId()).setTime(new foam.nanos.cron.TimeHMS.Builder(x).setHour(14).build()).build(),
            new TimeOfDaySchedule.Builder(x).setTimeZone(ZoneId.systemDefault().getId()).setTime(new foam.nanos.cron.TimeHMS.Builder(x).setHour(19).build()).build(),
          })
          .build();

        LocalDateTime now, next, expected;

        // Test 1: current time is before both schedules
        now = LocalDate.now().atTime(10, 0);
        next = dateToLocalDateTime(testTOD.getNextScheduledTime(x, localDateTimeToDate(now)));
        expected = LocalDateTime.of(now.getYear(), now.getMonthValue(), now.getDayOfMonth(), 14, 0);

        test(next.equals(expected),
          "Same timezone: current time before both schedules - Expected: " + expected + ", Received: " + next);

        // Test 2-2: current time is between both schedules
        now = LocalDate.now().atTime(16, 30);
        next = dateToLocalDateTime(testTOD.getNextScheduledTime(x, localDateTimeToDate(now)));
        expected = LocalDateTime.of(now.getYear(), now.getMonthValue(), now.getDayOfMonth(), 19, 0);

        test(next.equals(expected),
          "Same timezone: current time between two schedules - Expected: " + expected + ", Received: " + next);

        // Test 2-3: current time is after both schedules
        now = LocalDate.now().atTime(22, 0);
        next = dateToLocalDateTime(testTOD.getNextScheduledTime(x, localDateTimeToDate(now)));
        expected = LocalDateTime.of(now.getYear(), now.getMonthValue(), now.getDayOfMonth() + 1, 14, 0);

        test(next.equals(expected),
          "Same timezone: current time after both schedules - Expected: " + expected + ", Received: " + next);
      `
    },
    {
      name: 'testDifferentTimezones',
      args: 'X x',
      javaCode: `
        ZoneId zone_utc = getTimeZoneId(x, "Africa/Abidjan"); //UTC
        ZoneId zone_est5edt = getTimeZoneId(x, "EST5EDT");
        
        // First schedule 4/5 hours behind the second schedule
        Schedule testTOD = new OrSchedule.Builder(x)
          .setDelegates(new Schedule[] {
            new TimeOfDaySchedule.Builder(x).setTimeZone("Africa/Abidjan").setTime(new foam.nanos.cron.TimeHMS.Builder(x).setHour(14).build()).build(),
            new TimeOfDaySchedule.Builder(x).setTimeZone("EST5EDT").setTime(new foam.nanos.cron.TimeHMS.Builder(x).setHour(14).setMinute(0).setSecond(0).build()).build(),
          })
          .build();

        LocalDateTime now_utc, next_utc, expected_utc, now_est5edt, next_est5edt, expected_est5edt;

        // Test 2-1: current time is before both schedules
        now_utc = ZonedDateTime.of(2024, 3, 16, 8, 0, 0, 0, zone_utc).toLocalDateTime();
        next_utc = dateToLocalDateTime(testTOD.getNextScheduledTime(x, localDateTimeToDate(now_utc, zone_utc)), zone_utc);
        expected_utc = ZonedDateTime.of(2024, 3, 16, 14, 0, 0, 0, zone_utc).toLocalDateTime();

        test(next_utc.equals(expected_utc),
          "Different timezones: current time before both schedules - Expected: " + expected_utc + ", Received: " + next_utc);

        // Test 2-2: current time is between both schedules
        now_est5edt = ZonedDateTime.of(2024, 3, 16, 13, 0, 0, 0, zone_est5edt).toLocalDateTime();
        next_est5edt = dateToLocalDateTime(testTOD.getNextScheduledTime(x, localDateTimeToDate(now_est5edt, zone_est5edt)), zone_est5edt);
        expected_est5edt = ZonedDateTime.of(2024, 3, 16, 14, 0, 0, 0, zone_est5edt).toLocalDateTime();

        test(next_est5edt.equals(expected_est5edt),
          "Different timezones: current time between two schedules - Expected: " + expected_est5edt + ", Received: " + next_est5edt);

        // Test 2-3: current time is after both schedules
        now_est5edt = ZonedDateTime.of(2024, 3, 16, 15, 0, 0, 0, zone_est5edt).toLocalDateTime();
        next_utc = dateToLocalDateTime(testTOD.getNextScheduledTime(x, localDateTimeToDate(now_est5edt, zone_est5edt)), zone_utc);
        expected_utc = ZonedDateTime.of(2024, 3, 17, 14, 0, 0, 0, zone_utc).toLocalDateTime();

        test(next_utc.equals(expected_utc),
          "Different timezones: current time after both schedules - Expected: " + expected_utc + ", Received: " + next_utc);
      `
    }
  ]
});
