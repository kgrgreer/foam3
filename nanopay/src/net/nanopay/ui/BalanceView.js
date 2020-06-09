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
  name: 'BalanceView',
  extends: 'foam.u2.View',

  imports: [ 'addCommas' ],

  properties:[
    'data'
  ],

  css: `
    ^ {
      width: 100%;
      background: white;
      height: 60px;
      border-radius: 2px;
    }
    ^ .light-roboto-h2{
      margin: 20px 0 0 20px;
    }
    ^ .account-balance{
      font-size: 14px;
      font-weight: bold;
      position: relative;
      top: 23px;
      left: 25px;
    }
  `,

  messages: [
    { name: 'title', message: 'Digital Cash Balance'}
  ],

  methods: [
    function initE(){
      this.SUPER();

      this
      .addClass(this.myClass())
      .start().addClass('float-left').addClass('light-roboto-h2')
        .add(this.title)
      .end()
      .start().addClass('account-balance')
       .add('$ ', this.addCommas((this.data.balance/100).toFixed(2)))
      .end();
    }
  ]
});