/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.glang',
  name: 'EndOfWeek',
  extends: 'foam.glang.AbstractDateGlang',
  properties: [
    {
      class: 'Int',
      name: 'startOfWeek',
      documentation: 'Value between 0 - Sunday and 6 - Saturday inclusive.  Indicates which day is considered the first day of a new week.',
      min: 0,
      max: 6,
      value: 0
    }
  ],
  methods: [
    {
      name: 'f',
      code: function(obj) {
        var ts = new Date(this.delegate.f(obj));

        var date = ts.getDate();
        var endOfWeek = (this.startOfWeek + 6) % 7;
        var day = ts.getDay();
        var daysToEndOfWeek = (endOfWeek - day + 7) % 7;

        ts.setDate(date + daysToEndOfWeek);

        ts.setHours(23, 59, 59);
        ts.setMilliseconds(999);

        return ts;
      },
      javaCode: `
// Convert to LocalDate
java.util.Date date = (java.util.Date) getDelegate().f(obj);
java.time.LocalDate localDate = java.time.Instant.ofEpochMilli(date.getTime()).atZone(java.time.ZoneId.systemDefault()).toLocalDate();

// Set to end of week
localDate = localDate.plusDays(6 - (long)localDate.getDayOfWeek().getValue());

// Convert to LocalDateTime set to End of Day
java.time.LocalDateTime localDateTime = localDate.atTime(java.time.LocalTime.MAX);

// Convert to Date using LocalDateTime
return java.util.Date.from(localDateTime.atZone(java.time.ZoneId.systemDefault()).toInstant());
      `
    }
  ]
});
