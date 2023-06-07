/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.LIB({
  name: 'foam.u2.wizard.data',

  methods: [
    // ensure that the last delegate is the null implementation
    function ensureTerminal(obj, proxyCls, nullCls) {
      while ( proxyCls.isInstance(obj) ) {
        if ( ! obj.delegate ) {
          obj.delegate = nullCls.create();
        }
        obj = obj.delegate;
      }
      return obj;
    }
  ]
});
