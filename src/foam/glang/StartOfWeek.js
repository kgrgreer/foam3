/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.glang',
  name: 'StartOfWeek',
  extends: 'foam.glang.AbstractDateGlang',
  flags: ['js'],  // java requires 'f' implemented
  properties: [
    {
      class: 'Int',
      name: 'startOfWeek',
      documentation: 'Value between 0 - Sunday and 6 - Saturday inclusive.  Indicates which day is considered the first day of a new week.',
      min: 0,
      max: 6,
      value: 0
    }
  ],
  methods: [
    {
      name: 'f',
      code: function(obj) {
        var ts = new Date(this.delegate.f(obj));
        ts.setDate(ts.getDate() - ((ts.getDay() - this.startOfWeek + 7) % 7));
        ts.setHours(0, 0, 0, 0);
        return ts;
      }
    }
  ]
});
