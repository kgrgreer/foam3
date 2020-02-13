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
  