/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.controller',
  name: 'WindowHash',

  imports: [ 'globalThis' ],

  properties: [
    {
      name: 'value'
    },
    {
      name: 'feedback_'
    }
  ],

  methods: [
    function initArgs(args, ctx) {
      this.SUPER(args, ctx);

      this.onPopState();
      this.globalThis.onpopstate = this.onPopState;
    },
    function valueChanged(value, replaceHistoryState) {
      if ( value )
        this.value = value;

      if ( replaceHistoryState )
        this.globalThis.history.replaceState(null, '', this.globalThis.origin + '/#' + this.value);
      else
        this.updateHash();
    },
    function updateHash() {
      if ( this.feedback_ ) return;

        this.feedback_ = true;
        this.globalThis.location.hash = this.value;
        this.feedback_ = false;
    }
  ],

  listeners: [
    function onPopState() {
      if ( this.feedback_ ) return;
      
      this.value = this.globalThis.location.hash.substr(1);
      this.feedback_ = false;
    },
    {
      name: 'onValueChange',
      isFramed: true,
      code: function() {
        if ( this.feedback_ ) return;

        this.feedback_ = true;
        this.globalThis.location.hash = this.value;
        this.feedback_ = false;
      }
    }
  ]
});
