/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.glang',
  name: 'StartOfMonth',
  extends: 'foam.glang.AbstractDateGlang',
  flags: ['js'], // java requires 'f' implemented
  methods: [
    {
      name: 'f',
      code: function(obj) {
        var ts = new Date(this.delegate.f(obj));
        ts.setMonth(ts.getMonth());
        ts.setDate(1);
        ts.setHours(0, 0, 0, 0);
        return ts;
      }
    }
  ]
});
