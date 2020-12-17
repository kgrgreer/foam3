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
  package: 'net.nanopay.cico.ui.ci',
  name: 'CashInSuccessModal',
  extends: 'foam.u2.Controller',

  imports: [ 'closeDialog', 'amount' ],

  documentation: 'Pop up modal displaying details of a successful cash in.',

  css: `
    ^ {
      width: 448px;
      height: 288px;
      margin: auto;
    }
    ^ .cashInContainer {
      width: 448px;
      height: 288px;
      border-radius: 2px;
      background-color: #ffffff;
      box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.02);
    }
    ^ .popUpHeader {
      width: 448px;
      height: 40px;
      background-color: /*%BLACK%*/ #1e1f21;
    }
    ^ .popUpTitle {
      width: 198px;
      height: 40px;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 14px;
      line-height: 40.5px;
      letter-spacing: 0.2px;
      text-align: left;
      color: #ffffff;
      margin-left: 20px;
      display: inline-block;
    }
    ^ .successIcon {
      width: 60px;
      height: 60px;
      display: inline-block;
      margin-left: 30px;
      padding: 0;
      vertical-align: top;
      margin-top: 20px;
    }
    ^ .cashInResultDiv {
      margin-top: 34px;
      display: inline-block;
      width: 301px;
    }
    ^ .cashInResult {
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 12px;
      line-height: 16px;
      letter-spacing: 0.3px;
      color: /*%BLACK%*/ #1e1f21;
      display: inline-block;
    }
    ^ .foam-u2-ActionView-closeButton {
      width: 24px;
      height: 24px;
      margin: 0;
      margin-top: 7px;
      margin-right: 20px;
      cursor: pointer;
      display: inline-block;
      float: right;
      outline: 0;
      border: none;
      background: transparent;
      box-shadow: none;
    }
    ^ .foam-u2-ActionView-closeButton:hover {
      background: transparent;
      background-color: transparent;
    }
    ^ .foam-u2-ActionView-okButton {
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      width: 136px;
      height: 40px;
      position: static;
      border-radius: 2px;
      background: /*%PRIMARY3%*/ #406dea;
      border: solid 1px /*%PRIMARY3%*/ #406dea;
      display: inline-block;
      color: white;
      text-align: center;
      cursor: pointer;
      font-size: 14px;
      margin: 0;
      outline: none;
      box-shadow: none;
      font-weight: normal;
    }
    ^ .foam-u2-ActionView-okButton:hover {
      background: /*%PRIMARY3%*/ #406dea;
      border-color: /*%PRIMARY3%*/ #406dea;
      opacity: 0.9;
    }
    ^ .amount {
      width: 100px;
      height: 16px;
      display: inline-block;
      padding: 0;
      margin: 0;
      margin-left: 5px;
      margin-bottom: 20px;
      font-size: 12px;
      line-height: 16px;
      letter-spacing: 0.3px;
      color: /*%BLACK%*/ #1e1f21;
    }
    ^ .okButtonDiv {
      width: 100%;
      text-align: center;
      margin-top: 40px;
    }
  `,

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      var formattedAmount = this.amount/100;

      this.addClass(this.myClass())
      .start()
        .start().addClass('cashInContainer')
          .start().addClass('popUpHeader')
            .start().add(this.Title).addClass('popUpTitle').end()
            .add(this.CLOSE_BUTTON)
          .end()
          .start({class: 'foam.u2.tag.Image', data: 'images/done-30.svg'}).addClass('successIcon').end()
          .start('div').addClass('cashInResultDiv')
            .start().add(this.CashInSuccessDesc).addClass('cashInResult').end()
            .start().add('$', formattedAmount.toFixed(2)).addClass('amount').end()
            .br()
            .start().add(this.CashInResultDesc).addClass('cashInResult').end()
          .end()
          .start('div').addClass('okButtonDiv')
            .add(this.OK_BUTTON)
          .end()
        .end()
      .end()
    }
  ],

  messages: [
    { name: 'Title', message: 'Cash In' },
    { name: 'CashInSuccessDesc', message: 'You have successfully cashed in '},
    {
      name: 'CashInResultDesc',
      message: "Please be advised that it will take around 2 business days for you to see the balance in the portal. If you don't see your balance after 5 business days please contact our advisor at support@nanopay.net."
    }
  ],

  actions: [
    {
      name: 'closeButton',
      icon: 'images/ic-cancelwhite.svg',
      code: function(X) {
        X.closeDialog();
      }
    },
    {
      name: 'okButton',
      label: 'OK',
      code: function(X) {
        X.closeDialog();
      }
    }
  ]
});