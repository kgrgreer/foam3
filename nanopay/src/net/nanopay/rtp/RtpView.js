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
  package: 'net.nanopay.rtp',
  name: 'RtpView',
  extends: 'foam.u2.View',

  imports: [
    'showFooter',
    'showNav',
    'memento',
    'requestToPayDAO',
    'currencyDAO',
    'user',
    'userDAO'
  ],

  css: `
  ^ .rtp-img {
    background-color: #F69679;
    width: 100%;
    height: 20%;
    margin: 0 auto;
    border-radius: 5px;
  }
  ^ .main-container {
    padding: 5% 5% 0;
    background-color: white;
    box-shadow: 0 9px 21px #bbbbbb;
    border-radius: 2px;
  }
  ^ .info-heading {
    font-weight: bold;
    padding-bottom: 10px;
    padding-top: 20px;
    color: #1E1E1F;
  }
  ^ .rtp-item {
    display: flex;
    justify-content: space-between;
    padding-bottom: 20px;
  }
  ^ .item-label {
    color: #1E1E1F;
  }
  ^ .total {
    padding-top: 20px;
    border-top: 1px solid gray;
    border-top: 1px solid #E2E8F0;
  }
  ^ .total .item-value {
    font-size: large;
  }

  ^ .nano-logo {
    display: flex;
    justify-content: center;
    height: 50px;
    padding-top: 20px;
    align-items: center;
  }
  `,

  properties: [
    'rtp'
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this.addClass(this.myClass());
      this.currencyDAO.find('CAD').then(function(cur) {
        self
          .start('div').addClass('main-container')
            .start('img').addClass('rtp-img')
                .attrs({
                  src: '/images/rtp_invoice.png'
                })
            .end()
            .start().addClass('info-heading')
              .add('Invoice Recap')
            .end()
            .start('div').addClass('rtp-info')
              .start().addClass('rtp-item')
                .start().addClass('item-label').add(self.rtp.purpose).end()
              .end()
              .start().addClass('rtp-item')
                .start().addClass('item-label').add('Bill To').end()
                .start().addClass('item-value')
                  .add(self.user.firstName).nbsp().add(self.user.lastName).add(',').nbsp()
                  .add(self.user.organization)
                .end()
              .end()
              .start().addClass('rtp-item')
                .start().addClass('item-label').add('Recipient').end()
                .start().addClass('item-value').add('PayTechs Of Canada').end()
              .end()
              .start().addClass('rtp-item').addClass('total')
                .start().addClass('item-label').add('Total').end()
                .start().addClass('item-value').add(cur.format(self.rtp.amount)).end()
              .end()
            .end()
          .end();
          self
          .start().addClass('nano-logo')
            .add('Powered by')
            .start().addClass('logo')
              .start('img')
                .attrs({
                  src: '/images/nanopayLogo.svg'
                })
              .end()
            .end()
          .end()
      });
    }
  ]
});
