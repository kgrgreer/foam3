/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.glang',
  name: 'StartOfQuarter',
  extends: 'foam.glang.AbstractDateGlang',
  flags: ['js'], // java requires 'f' implemented

  methods: [
    {
      name: 'f',
      code: function(obj) {
        var ts = new Date(this.delegate.f(obj));
        ts.setMonth(Math.floor(ts.getMonth() / 3) * 3);
        ts.setDate(0);
        ts.setHours(0, 0, 0, 0);
        return ts;
      },
    }
  ]
});
