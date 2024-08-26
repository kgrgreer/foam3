/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'FnSink',
  implements: [ 'foam.dao.Sink' ],
  documentation: `Converts all sink events to call to a singular function.
      Useful for subscribing a listener method to a DAO`,
  flags: [],

  axioms: [
    {
      class: 'foam.box.Remote',
      clientClass: 'foam.dao.ClientSink'
    }
  ],

  properties: [
    {
      name: 'fn',
      swiftType: '((String?, Any?, foam_core_Detachable?) -> Void)',
      swiftRequiresEscaping: true,
    },
  ],

  methods: [
    {
      name: 'put',
      code: function(obj, s) {
        this.fn('put', obj, s);
      },
      swiftCode: 'fn("put", obj, sub)',
    },
    {
      name: 'remove',
      code: function(obj, s) {
        this.fn('remove', obj, s);
      },
      swiftCode: 'fn("remove", obj, sub)',
    },
    function eof() {
      this.fn('eof');
    },
    {
      name: 'reset',
      code: function(s) {
        this.fn('reset', s);
      },
      swiftCode: 'fn("reset", nil, sub)',
    },
  ]
});
