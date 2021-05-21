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
    package: 'net.nanopay.sme.ui',
    name: 'PaymentCodeView',
    extends: 'foam.u2.View',
  
    documentation: `
      View displaying company/business payment code.
    `,
  
    imports: [
      'user'
    ],
  
    css: `
      ^ {
        padding: 24px;
      }
      ^ .info-container {
        display: inline-grid;
        height: 40px;
        margin-top: 30px;
      }
      ^ .table-content {
        height: 21px;
        max-width: fit-content !important;
      }
    `,
  
    messages: [
      { name: 'TITLE', message: 'Payment code' },
      { name: 'PAYMENT_CODE_LABEL', message: 'This is your personalised code to receive payments from other businesses.' }
    ],
  
    methods: [
 
      function initE() {
        this.addClass(this.myClass()).addClass('card')
          .start().addClass('sub-heading').add(this.TITLE).end()
          .start().addClass('info-container')
            .start().addClass('table-content').add(this.PAYMENT_CODE_LABEL).end()
            .start().addClass('table-content').addClass('subdued-text')
              .select(this.user.paymentCode, (paymentCode) => {
                return this.E().start().add(paymentCode.id).end();
              })
            .end()
          .end();
      }
    ]
  });
  