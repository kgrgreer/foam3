/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang',
  name: 'Day',
  extends: 'foam.mlang.AbstractExpr',
  documentation: `Returns the first minute of the day. The property numberOfDays allows specify how many days ahead
                      of behind we want the date to be. For example new Day() returns the first minute of 'today'.
                      new Day(-1) returns the first minute of yesterday`,

  javaImports:[
    'java.util.Calendar'
  ],

  implements: [
    'foam.core.Serializable'
  ],

  properties: [
    {
      class: 'Int',
      name: 'numberOfDays',
      value: 0
    }
  ],

  methods: [
    {
      name: 'f',
      code: function() {
        var date = new Date();
        date.setMonth(date.getDay()+numberOfDays);
        date.setDate(1);
        date.setHours(0);
        date.setMinutes(0);
        return date
      },
      javaCode: `
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.DAY_OF_MONTH, getNumberOfDays());
        cal.set(Calendar.HOUR, 0);
        cal.set(Calendar.MINUTE, 0);
        return cal.getTime();
      `
    },
    {
      name: 'toString',
      type: 'String',
      code: function() {
        return 'Day(\'' + this.numberOfDays + '\')';
      },
      javaCode: ' return "Day(\'" + getNumberOfDays() + "\')"; '
    }
  ]
});
