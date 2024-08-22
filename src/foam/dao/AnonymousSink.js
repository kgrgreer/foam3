/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'AnonymousSink',
  implements: [ 'foam.dao.Sink' ],
  flags: [],

  axioms: [
    {
      class: 'foam.box.Remote',
      clientClass: 'foam.dao.ClientSink'
    }
  ],

  properties: [ 'sink' ],

  methods: [
    function put(obj, sub) {
      var s = this.sink;
      s && s.put && s.put(obj, sub);
    },
    function remove(obj, sub) {
      var s = this.sink;
      s && s.remove && s.remove(obj, sub);
    },
    function eof() {
      var s = this.sink;
      s && s.eof && s.eof();
    },
    function reset(sub) {
      var s = this.sink;
      s && s.reset && s.reset(sub);
    }
  ]
});
