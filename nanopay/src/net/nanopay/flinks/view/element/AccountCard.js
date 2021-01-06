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
  package: 'net.nanopay.flinks.view.element',
  name: 'AccountCard',
  extends: 'foam.u2.View',

  documentation: 'view for account and balance',

  imports: [ 'addCommas' ],

  css: `
    ^ {
      width: 451px;
      height: 57px;
      border: solid 1px #dce0e7;
      padding: 0 40px;
      box-sizing: border-box;
      display: table;
    }
    ^ .leftPart {
      display: inline-block;
      vertical-align: middle;
      width: 50%;
      display: table-cell;
    }
    ^ .rightPart {
      display: inline-block;
      vertical-align: middle;
      width: 50%;
      display: table-cell;
    }
    ^ .accountName {
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 12px;
      font-weight: 500;
      line-height: 1.33;
      letter-spacing: 0.3px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
    }
    ^ p {
      margin: 0;
      padding: 0;
    }
    ^ .accountNo {
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 12px;
      letter-spacing: 0.3px;
      text-align: left;
      color: rgba(9, 54, 73, 0.7);
    }
    ^ .balance {
      margin-top: 4px;
      width: 100%;
      height: 30px;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 20px;
      font-weight: 300;
      line-height: 1.5;
      letter-spacing: 0.3px;
      text-align: right;
      color: /*%BLACK%*/ #1e1f21;
    }
  `,

  properties: [
    'name',
    'accountNo',
    {
      class: 'Double',
      name: 'balance',
      adapt: function(oldValue, newValue) {
        return this.addCommas((newValue * 1.0).toFixed(2));
      }
    }
  ],

  methods: [
    function init() {
      this.SUPER();
    },

    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start('div').addClass('leftPart').style({'margin-left':'44px'})
          .start('p').addClass('name').add(this.name$).end()
          .start('p').addClass('accountNo').add('Account No. ').add(this.accountNo$).end()
        .end()
        .start('div').addClass('rightPart')
          .start('p').addClass('balance').add('$').add(this.balance$).end()
        .end()
    }
  ]
})
