/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.glang',
  name: 'EndOfTimeSpan',
  extends: 'foam.glang.AbstractDateGlang',
  properties: [
    {
      class: 'Long',
      name: 'timeSpanMs'
    }
  ],
  methods: [
    {
      name: 'f',
      code: function(obj) {
        var ts = new Date(this.delegate.f(obj));
        var ms = this.timeSpanMs;
        return new Date(Math.floor(ts.getTime() / ms) * ms + ms - 1);
      },
      javaCode: `
        java.util.Date ts = (java.util.Date) getDelegate().f(obj);
        long ms = getTimeSpanMs();
        return new java.util.Date((ts.getTime() / ms) * ms + ms - 1);
      `
    }
  ]
});
