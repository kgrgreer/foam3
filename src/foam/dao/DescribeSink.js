/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'DescribeSink',
  implements: [ 'foam.dao.Sink' ],
  flags: [],

  documentation: 'Calls .describe() on every object.  Useful for debugging to quickly see what items are in a DAO.',

  methods: [
    function put(o) {
      o.describe();
    },
    function remove() {},
    function eof() {},
    function reset() {}
  ]
});
