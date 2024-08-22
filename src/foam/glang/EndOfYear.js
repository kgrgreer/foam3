/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.glang',
  name: 'EndOfYear',
  extends: 'foam.glang.AbstractDateGlang',
  methods: [
    {
      name: 'f',
      code: function(obj) {
        var ts = new Date(this.delegate.f(obj));
        ts.setMonth(11);
        ts.setDate(31);
        ts.setHours(23, 59, 59);
        ts.setMilliseconds(999);
        return ts;
      },
      javaCode: `
java.util.Date date = (java.util.Date) getDelegate().f(obj);

java.time.Instant t = java.time.Instant.ofEpochMilli(date.getTime())
  .atZone(java.time.ZoneId.systemDefault())
  .toLocalDate()
  .with(java.time.temporal.TemporalAdjusters.lastDayOfYear())
  .atTime(23, 59, 59)
  .atZone(java.time.ZoneId.systemDefault())
  .toInstant();

return java.util.Date.from(t);
      `
    }
  ]
});
