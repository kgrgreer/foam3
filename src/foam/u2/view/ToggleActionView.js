/**
* @license
* Copyright 2022 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2',
  name: 'ToggleActionView',
  extends: 'foam.u2.ActionView',

  documentation: 'ActionView for a toggle-able action, state toggles on click',

  css: `
    ^active, ^active svg {
      background-color: $grey50;
      color: $primary400;
      fill: $primary400;
      border-color: $primary400;
    }
  `,
  properties: [
    {
      class: 'Boolean',
      name: 'actionState'
    },
    {
      name: 'buttonStyle',
      value: foam.u2.ButtonStyle.TERTIARY
    }
  ],

  methods: [
    function initCls() {
      this.SUPER();
      this.enableClass(this.myClass('active'), this.actionState$);
    }
  ],
  listeners: [
    function click() {
      this.SUPER();
      this.actionState = ! this.actionState;
    }
  ]
});
