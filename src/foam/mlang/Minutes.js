/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang',
  name: 'Minutes',
  extends: 'foam.mlang.AbstractExpr',
  documentation: 'Return the number of minutes since the specified date.',

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
        var millisecondsPerMinute = 60 * 1000;
        var from = this.arg1.f(obj);
        var now = new Date(Date.now());
        from.setMinutes(from.getMinutes() - from.getTimezoneOffset());
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

        var minutes = Math.floor(Math.abs(now - from) / millisecondsPerMinute);
        return minutes;
      },
      javaCode: `
        LocalDateTime d = LocalDateTime.ofInstant(((Date) getArg1().f(obj)).toInstant(), ZoneId.systemDefault());
        return ChronoUnit.MINUTES.between(d, LocalDateTime.now());
      `
    },
    {
      name: 'toString',
      type: 'String',
      code: function() { return 'MINUTES(\'' + this.arg1.toString() + '\')'; },
      javaCode: ' return "MINUTES(\'" + getArg1() + "\')"; '
    }
  ]
});
