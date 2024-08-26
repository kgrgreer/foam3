/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'PromisedDetachable',

  properties: [
    { name: 'promise', factory: function() { return this.Latch.create(); } }
  ],

  methods: [
    function detach() {
      this.promise.then(p => {
        p.detach();
        this.promise = null;
      });
    }
  ]
});
