foam.CLASS({
  package: 'net.nanopay.sme.ui.dashboard',
  name: 'RequireActionView',
  extends: 'foam.u2.View',

  requires: [
    'net.nanopay.invoice.model.Invoice',
  ],

  imports: [
    'invoiceDAO',
    'user'
  ],

  css: `
  `,

  properties: [
    {
      name: 'countOverDuePayables',
    },
    {
      name: 'countOverDueReceivables',
    },
    {
      name: 'countUpcomingPayables',
    },
    {
      name: 'countDepositPayment',
    }
  ],

  messages: [
    
  ],

  methods: [
    function initE() {

      this.SUPER();
      this.addClass(this.myClass())
        .start()
          .start(this.iccon)
            .addClass('Iconnn')
          .end()
          .start().style({ 'margin-left': '40px', 'margin-top': '-22px'  })
            .start()
              .add(this.bodyMsg$).addClass('roww')
            .end()
            .start()
              .add(this.datte$)
            .end()
          .end()
        .end();
    }
  ],

});
