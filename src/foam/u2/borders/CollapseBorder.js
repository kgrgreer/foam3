/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.borders',
  name: 'CollapseBorder',
  extends: 'foam.u2.Controller',

  requires: [ 'foam.u2.ActionView' ],

  css: `
    ^ {
      position: relative;
      padding: 0.71em;
      border-top: 1px solid #999;
      margin-top: 1.14em;
    }
    ^.expanded {
      border: 1px solid #999;
      padding-left: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.38);
      padding-top: 20px;
    }
    ^control {
      display: inline;
      position: relative;
      width: 30px;
    }
    ^toolbar {
      display: flex;
      flex-direction: row;
      align-items: center;
      position: absolute;
      padding: 3px;
      width: calc(100% - 3vmin);
      left: 1.5vmin;
      top: max(-12px, -2vmin);
      color: #666;
      padding-top: 0;
    }
    ^title {
      background: white;
      position: relative;
    }
    ^toggle-button {
      font-size: inherit !important;
      border: none;
      outline: none;
      padding: 3px;
    }
    ^toggle-button:focus {
      background-color: white;
    }
    ^control > ^toggle-button {
      transform: rotate(-90deg);
      transition: transform 0.3s;
      width: 30px;
    }
    ^.expanded ^toggle-button {
      transform: rotate(0deg);
      transition: transform 0.3s;
    }
    ^place-right {
      order: 1;
    }
    ^space-even {
      justify-content: space-between;
    }
  `,

  properties: [
    'title',
    {
      class: 'Boolean',
      name: 'expanded',
      value: true
    },
    {
      name: 'label',
      value: '\u25BD'
    },
    [ 'toggleLeft', false ] /* if true, will place the toggle action to the left side of the title */
  ],

  methods: [
    function init() {
      this.
        addClass(this.myClass()).
        enableClass('expanded', this.expanded$).
        start('div').
          addClass(this.myClass('toolbar')).
          enableClass(this.myClass('space-even'), this.toggleLeft$.map( val => ! val)).
          start('div').
            addClass(this.myClass('control')).
            enableClass(this.myClass('place-right'), this.toggleLeft$.map( val => ! val)).
            start(this.TOGGLE, {label: this.label$}).
              addClass(this.myClass('toggle-button')).
            end().
          end().
          start('span').
            addClass(this.myClass('title')).
            start(this.TOGGLE, {label: this.title$, tabIndex: -1}).
              addClass(this.myClass('toggle-button')).
            end().
          end().
        end().
        start('div', null, this.content$).
          show(this.expanded$).
          addClass(this.myClass('content')).
        end();
    }
  ],

  actions: [
    function toggle() { this.expanded = ! this.expanded; }
  ]
});
