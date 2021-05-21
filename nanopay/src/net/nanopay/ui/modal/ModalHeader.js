/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.ui.modal',
  name: 'ModalHeader',
  extends: 'foam.u2.View',

  documentation: 'Modal Container close/title',

  imports: [
    'stack',
    'closeDialog'
  ],

  exports: [
    'closeDialog'
  ],

  properties: [
    'title'
  ],

  css: `
    ^ {
      height: 40.8px;
      width: 448px;
      border-radius: 2px 2px 0 0;
      margin: auto;
      border-bottom: solid 1px #CBCFD4;
    }
    ^ .title {
      height: 40px;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 14px;
      line-height: 2.86;
      text-align: left;
      margin-left: 19px;
      display: inline-block;
    }
    ^ .foam-u2-ActionView-closeModal {
      position: relative;
      right: 0px;
      width: 50px;
      height: 40px;
      background: transparent;
      margin-top: 0;
      top: 0;
      right: 0;
      border: 0;
      display: inline-block;
    }
  `,

  methods: [
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start().addClass('title').add(this.title).end();
    }
  ]
});
