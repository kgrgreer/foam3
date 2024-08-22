/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'QuickSink',
  extends: 'foam.dao.AbstractSink',

  axioms: [
    {
      class: 'foam.box.Remote',
      clientClass: 'foam.dao.ClientSink'
    }
  ],
  properties: [
    {
      class: 'Function',
      name: 'putFn'
    },
    {
      class: 'Function',
      name: 'removeFn'
    },
    {
      class: 'Function',
      name: 'eofFn'
    },
    {
      class: 'Function',
      name: 'resetFn'
    }
  ],

  methods: [
    function put() {
      return this.putFn && this.putFn.apply(this, arguments);
    },

    function remove() {
      return this.removeFn && this.removeFn.apply(this, arguments);
    },

    function eof() {
      return this.eofFn && this.eofFn.apply(this, arguments);
    },

    function reset() {
      return this.resetFn && this.resetFn.apply(this, arguments);
    }
  ]
});
