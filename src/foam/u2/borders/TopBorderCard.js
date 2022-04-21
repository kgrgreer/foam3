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
    ^ {
      width: 100%;
      border: 1px solid/*%GREY5%*/ #f5f7fa;
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
      this.start().addClass(this.myClass('bar'))
        .style({ 'background' : this.color$, 'border' : '1px solid' + this.color$ })
      .end()

      .start('div', null, this.content$)
        .addClass()
      .end();
    }
  ]
});
