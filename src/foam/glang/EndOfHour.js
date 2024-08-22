/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.glang',
  name: 'EndOfHour',
  extends: 'foam.glang.AbstractDateGlang',
  methods: [
    {
      name: 'f',
      code: function(obj) {
        var ts = new Date(this.delegate.f(obj));
        ts.setMinutes(59, 59);
        ts.setMilliseconds(999);
        return ts;
      },
      javaCode: `
      // Convert to LocalDate
      java.util.Date date = (java.util.Date) getDelegate().f(obj);
      java.time.LocalDate localDate = java.time.Instant.ofEpochMilli(date.getTime()).atZone(java.time.ZoneId.systemDefault()).toLocalDate();

      // Convert to LocalDateTime set to End of Day
      java.time.LocalDateTime localDateTime = localDate.atTime(java.time.LocalTime.MAX);

      // Convert to Date using LocalDateTime
      return java.util.Date.from(localDateTime.atZone(java.time.ZoneId.systemDefault()).toInstant());
      `
    }
  ]
});
