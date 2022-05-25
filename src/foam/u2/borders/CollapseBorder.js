/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.borders',
  name: 'CollapseBorder',
  extends: 'foam.u2.Controller',

  requires: [
    'foam.u2.ActionView',
    'foam.u2.tag.Image'
  ],

  css: `
    ^ {
      position: relative;
      padding: 0.8rem;
    }
    ^.expanded {
    }
    ^control {
      display: inline;
      position: relative;
      width: 30px;
    }
    ^toolbar {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      left: 1.5vmin;
      top: max(-12px, -2vmin);
      color: #666;
      cursor: pointer;
      /* button overrides */
      width: 100%;
      border: none;
      background: none;
    }
    ^.expanded > ^toolbar {
      padding-bottom: 0.8rem;
    }
    ^toggle-button {
      font-size: inherit !important;
      border: none;
      outline: none;
    }
    ^toggle-button:focus {
      background-color: /*%WHITE%*/ #ffffff;
    }
    ^control {
      transition: transform 0.3s;
    }
    ^.expanded ^control {
      transform: rotate(90deg);
    }
    ^control svg {
      max-height: 1em;
      fill: /*%BLACK%*/ #000;
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
    {
      class: 'String',
      name: 'controlGlyph',
      value: 'next'
    }
  ],

  methods: [
    function init() {
      this.
        addClass(this.myClass()).
        enableClass('expanded', this.expanded$).
        start('button').
          attrs({ name: this.TOGGLE.name, 'aria-label': this.TOGGLE.ariaLabel }).
          on('click', this.toggle.bind(this)).
          addClass(this.myClass('toolbar')).
          start('span').
            addClass('p-bold').
            add(this.title$).
          end().
          start(this.Image, { glyph: this.controlGlyph }).
            addClass(this.myClass('control')).
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
