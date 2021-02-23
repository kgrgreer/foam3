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
  package: 'net.nanopay.ui',
  name: 'ActionButton',
  extends: 'foam.u2.View',

  documentation: 'View for displaying buttons on the Partners page such as Filters and Sync',

  css: `
    ^ {
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      width: 75px;
      height: 40px;
      border-radius: 2px;
      background-color: rgba(164, 179, 184, 0.1);
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
      display: inline-block;
      cursor: pointer;
      margin-right: 5px;
    }
    ^ .button-image {
      padding-top: 10px;
      padding-bottom: 10px;
      padding-left: 5px;
      width: 20px;
      height: 20px;
      display: inline-block;
    }
    ^ .button-text {
      pointer-events: none;
      width: 31px;
      display: inline-block;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 11px;
      color: /*%BLACK%*/ #1e1f21;
      padding-left: 9px;
      font-weight: 300;
      line-height: 20px;
      position: relative;
      top: -16px;
    }
  `,

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
          .start({class:'foam.u2.tag.Image', data: this.data.image}).addClass('button-image').end()
          .start('h6').addClass('button-text').add(this.data.text).end()
    }
  ]
});
