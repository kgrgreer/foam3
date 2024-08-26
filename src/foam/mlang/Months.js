/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang',
  name: 'Months',
  extends: 'foam.mlang.AbstractExpr',
  documentation: 'Return the number of months since the specified date.',

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
        var from = this.arg1.f(obj);
        var now = new Date(Date.now());
        if ( from > now ) {
          now = from;
          from = new Date(Date.now());
        }
        var monthDiff = now.getMonth() - from.getMonth();
        var yearDiff = now.getYear() - from.getYear();

        var months = monthDiff + yearDiff * 12
        return months;
      },
      javaCode: `
        LocalDate d = LocalDate.ofInstant(((Date) getArg1().f(obj)).toInstant(), ZoneId.systemDefault());
        return ChronoUnit.MONTHS.between(d, LocalDate.now());
     `
    },
    {
      name: 'toString',
      type: 'String',
      code: function() { return 'MONTHS(\'' + this.arg1.toString() + '\')'; },
      javaCode: ' return "MONTHS(\'" + getArg1() + "\')"; '
    }
  ]
});
