/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.u2.wizard.data',
  name: 'Saver',
  proxy: true,

  methods: [
    {
      name: 'save',
      async: true
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'NullSaver',
  implements: [ 'foam.u2.wizard.data.Saver' ],

  properties: [
    'data'
  ],

  methods: [
    function save(data) {
      this.data = data;
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'DebugSaver',
  extends: 'foam.u2.wizard.data.ProxySaver',
  properties: ['breakpoint', 'name'],

  methods: [
    function save (...a) {
      console.log(`DebugSaver(${this.name}).save`, ...a);
      if ( this.breakpoint ) debugger;
      return this.delegate.save(...a);
    }
  ]
})
