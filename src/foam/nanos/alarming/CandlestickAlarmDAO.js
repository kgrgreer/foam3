/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.alarming',
  name: 'CandlestickAlarmDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Generate an alarm if a monitor exceeds threshold',

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.analytics.Candlestick',
    'foam.nanos.logger.Loggers',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.DESC',
    'foam.mlang.order.Comparator'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      Candlestick old = (Candlestick) getDelegate().orderBy(DESC(Candlestick.CLOSE_TIME)).find(obj);
      Candlestick nu = (Candlestick) getDelegate().put_(x, obj);
      if ( old == null ) return nu;

      CandlestickAlarm ca = (CandlestickAlarm) ((DAO) x.get("candlestickAlarmDAO")).find(EQ(CandlestickAlarm.KEY, nu.getKey()));
      if ( ca == null ) return nu;

      Object oldValue = old.getProperty(ca.getPropertyName());
      Object newValue = nu.getProperty(ca.getPropertyName());
      Loggers.logger(x, this).debug(ca.getPropertyName(), "old", oldValue, "nu", newValue);

      if ( oldValue == null || newValue == null ) return nu;

      // calculate between last/old, and old/new
      long o = 0L;
      long n = 0L;
      if ( newValue instanceof Float ) {
        o = ((Float) oldValue).longValue();
        n = ((Float) newValue).longValue();
      } else {
        o = ((Long) oldValue).longValue();
        n = ((Long) newValue).longValue();
      }

      long d = (long) ((n - o) / o) * 100;
      if ( ca.getPercentageChange() > 0 &&
           d >= ca.getPercentageChange() ||
           ca.getPercentageChange() < 0 &&
           d <= ca.getPercentageChange() ) {
        alarm(x, ca, true, d);
      } else {
        alarm(x, ca, false, d);
      }

      return nu;
      `
    },
    {
      name: 'alarm',
      args: 'Context x, CandlestickAlarm ca, boolean active, long change',
      javaCode: `
      Alarm alarm = (Alarm) ((DAO) x.get("alarmDAO")).find(EQ(Alarm.NAME, ca.getAlarmName()));
      if ( alarm == null && active ) {
        alarm = new Alarm(ca.getAlarmName(), AlarmReason.CONGESTION);
        StringBuilder sb = new StringBuilder();
        sb.append("monitor: "); sb.append(ca.getKey()); sb.append("\\n");
        sb.append("property: "); sb.append(ca.getPropertyName()); sb.append("\\n");
        sb.append("threshold: "); sb.append(ca.getPercentageChange()); sb.append("\\n");
        sb.append("detected: "); sb.append(change); sb.append("\\n");
        alarm.setNote(sb.toString());
        ((DAO) x.get("alarmDAO")).put(alarm);
      } else if ( alarm != null &&
                  ( alarm.getIsActive() && ! active ||
                    ! alarm.getIsActive() && active ) ) {
        alarm = (Alarm) alarm.fclone();
        alarm.setIsActive(active);
        ((DAO) x.get("alarmDAO")).put(alarm);
      }
      `
    }
  ]
});
