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
    ^  {
      width: 100%;
      background: #ffffff;
      border: 1px solid/*%GREY5%*/ #f5f7fa;
      border-top: none;
      border-bottom-left-radius: 4px;
      border-bottom-right-radius: 4px;
      margin-bottom: 24px;
    }
    ^ .bar {
      width: 100%;
      height: 8px;
      background: /*%PRIMARY1%*/ #406dea;
      border: 1px solid /*%PRIMARY1%*/ #406dea;
      padding: 0px;
      box-sizing: border-box;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
    }
  `,

  methods: [
    function init() {
      this.addClass().start('div', null, this.content$)
        .start().addClass('bar').end()
      .end();
    }
  ]
});
