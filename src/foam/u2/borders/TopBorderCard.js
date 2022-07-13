/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.borders',
  name: 'TopBorderCard',
  extends: 'foam.u2.View',

  css: `
    ^container {
      width: 100%;
      padding: 2.4rem;
      background: #ffffff;
      border: 1px solid/*%GREY5%*/ #f5f7fa;
      border-top: none;
      border-bottom-left-radius: 4px;
      border-bottom-right-radius: 4px;
    }
    ^bar {
      width: 100%;
      height: 8px;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
    }
  `,

  properties: [
    {
      class: 'Color',
      name: 'color'
    }
  ],

  methods: [
    function init() {
      this.addClass()
        .start().addClass(this.myClass('bar'))
          .style({ 'background' : this.color$, 'border' : '1px solid' + this.color$ })
        .end()
        .start('div', null, this.content$)
          .addClass(this.myClass('container'))
        .end()
        ;
    }
  ]
});
