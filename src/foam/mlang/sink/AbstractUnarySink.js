/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'AbstractUnarySink',
  extends: 'foam.dao.AbstractSink',

  implements: [
    'foam.lang.Serializable'
  ],

  documentation: 'An Abstract Sink baseclass which takes only one argument.',

  properties: [
    {
      class: 'foam.mlang.ExprProperty',
      name: 'arg1',
      hidden: true
    },
    {
      class: 'Int',
      name: 'precision',
      value: -1,
      documentation: 'Number of decimal places for numeric results. -1 means no rounding (default behavior).'
    }
  ],

  methods: [
    function toString() {
      return foam.String.constantize(this.cls_.name) + '(' + this.arg1.toString() + this.precisionSuffix() + ')';
    },

    function precisionSuffix() {
      /* Part of toString() because TTLSelectCachingDAO keys its select cache on
         the sink's toString(); without it a precision change reuses the cached
         result computed at the old precision. */
      return this.precision < 0 ? '' : ', p' + this.precision;
    },

    function applyPrecision(val) {
      try {
        if ( this.precision < 0 || typeof val !== 'number' ) return val;
        return Number(val).toFixed(this.precision);
      } catch (x) {
        return val;
      }
    }
  ]
});
