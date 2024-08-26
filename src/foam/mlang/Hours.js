/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang',
  name: 'Hours',
  extends: 'foam.mlang.AbstractExpr',
  documentation: 'Return the number of full hours since the specified date.',

/*
  implements: [
    'foam.core.Serializable'
  ],
  */

  javaImports:[
    'java.time.LocalDateTime',
    'java.time.ZoneId',
    'java.time.temporal.ChronoUnit',
    'java.util.Date'
  ],

  properties: [
    {
      class: 'foam.mlang.ExprProperty',
      name: 'arg1'
    }
  ],

  methods: [
    {
      type: 'FObject',
      name: 'fclone',
      javaCode: 'return this;'
    },
    {
      name: 'f',
      code: function f(obj) {
        var millisecondsPerHour = 60 * 60 * 1000;
        var from = this.arg1.f(obj);
        var now = new Date(Date.now());
        from.setMinutes(from.getMinutes() - from.getTimezoneOffset());
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

        var hours = Math.floor(Math.abs(now - from) / millisecondsPerHour);
        return hours;
      },
      javaCode: `
        LocalDateTime d = LocalDateTime.ofInstant(((Date) getArg1().f(obj)).toInstant(), ZoneId.systemDefault());
        return ChronoUnit.HOURS.between(d, LocalDateTime.now());
      `
    },
    {
      name: 'toString',
      type: 'String',
      code: function() { return 'HOURS(\'' + this.arg1.toString() + '\')'; },
      javaCode: ' return "HOURS(\'" + getArg1() + "\')"; '
    }
  ]
});
