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
  package: 'net.nanopay.admin.ui.form.shopper',
  name: 'AddShopperSendMoneyForm',
  extends: 'foam.u2.Controller',

  documentation: 'Form to input amount to be sent to the new user',

  imports: [
    'viewData',
    'goBack',
    'goNext'
  ],

  css:`
    ^ .stepTwoBottomMargin {
      margin-bottom: 30px;
    }
    ^ .property-amount {
      margin-left: 0;
      border-radius: 0;
    }
  `,

  messages: [
    { name: 'Step', message: 'Step 3: Input the amount of money you want to send to the user or click next to skip.' },
    { name: 'AmountLabel', message: 'Amount' }
  ],

  properties: [
    {
      class: 'UnitValue',
      name: 'amount',
      postSet: function(oldValue, newValue) {
        this.viewData.amount = newValue;
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .start()
          .start('p').add(this.Step).addClass('pDefault').addClass('stepTopMargin').addClass('stepTwoBottomMargin').end()
          .start().add(this.AmountLabel).addClass('infoLabel').end()
          .start(this.AMOUNT).addClass('inputLarge').end()
        .end();
    }
  ]
});
