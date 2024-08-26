/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang',
  name: 'Years',
  extends: 'foam.mlang.AbstractExpr',
  documentation: 'Return the number of years since the specified date.',

/*
  implements: [
    'foam.core.Serializable'
  ],
  */

  javaImports:[
    'java.time.LocalDate',
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
        var from = this.arg1.f(obj).getUTCFullYear();
        var now = new Date().getUTCFullYear();
        var years = now - from;
        if ( from > now ) {
          years = from - now;
        }
        return years;
      },
      javaCode: `
        LocalDate d = LocalDate.ofInstant(((Date) getArg1().f(obj)).toInstant(), ZoneId.systemDefault());
        return ChronoUnit.YEARS.between(d, LocalDate.now());
      `
    },
    {
      name: 'toString',
      type: 'String',
      code: function() { return 'YEARS(\'' + this.arg1.toString() + '\')'; },
      javaCode: ' return "YEARS(\'" + getArg1() + "\')"; '
    }
  ]
});
