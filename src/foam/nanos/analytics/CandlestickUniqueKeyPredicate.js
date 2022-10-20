/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.analytics',
  name: 'CandlestickUniqueKeyPredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',

  properties: [
    {
      class: 'Map',
      name: 'results',
      factory: function() { return {}; },
      javaFactory: 'return new java.util.HashMap();'
    }
  ],

  methods: [
    {
      name: 'f',
      code: function() {
        if ( obj && ! this.results[obj.key] ) {
          this.results[obj.key] = true;
          return true;
        }
        return false;
      },
      javaCode: `
        Candlestick candlestick = (Candlestick) obj;
        if ( candlestick != null &&
          ! getResults().containsKey(candlestick.getKey()) ) {
          getResults().put(candlestick.getKey(), true);
          return true;
        }
        return false;
      `
    }
  ]
});
