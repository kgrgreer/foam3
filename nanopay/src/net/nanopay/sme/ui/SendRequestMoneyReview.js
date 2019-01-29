foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'SendRequestMoneyReview',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: `The third step of the send/request payment flow. At this step,
                  it will send the request to create new invoice the
                  associate transactions`,

  requires: [
    'foam.flow.Document',
    'net.nanopay.fx.ascendantfx.AscendantFXDisclosure',
  ],

  implements: [
    'foam.mlang.Expressions',
  ],

  imports: [
    'accountDAO',
    'disclosuresDAO',
    'invoice',
    'loadingSpin',
    'notify',
    'viewData'
  ],

  properties: [
    'disclosureView'
  ],

  css: `
    ^ {
      width: 504px;
      margin-bottom: 100px;
    }
    ^ .invoice-details {
      margin-top: 25px;
    }
    ^ .net-nanopay-ui-LoadingSpinner img{
      width: 150px;
      margin: 200px;
    }
    ^ .foam-flow-Document {
      width: 465px;
      margin: 0px;
      background: #e2e2e3;
      box-shadow: inset 0 0 1px 0 rgba(0, 0, 0, 0.5);
    }
    ^ .disclosureView {
      max-height: 170px;
      overflow: scroll;
      margin-top: 15px;
    }
  `,

  methods: [
    function initE() {
      this.SUPER();
      this.invoice$.sub(this.updateDisclosure);
      this.updateDisclosure();

      // Update the next label
      this.nextLabel = 'Submit';
      this.start().addClass(this.myClass())
        .start().show(this.loadingSpin.isHidden$)
          .start({
            class: 'net.nanopay.invoice.ui.InvoiceRateView',
            isPayable: this.type,
            isReadOnly: true
          })
          .end()
          .start({
            class: 'net.nanopay.sme.ui.InvoiceDetails',
            invoice: this.invoice,
            showActions: false
          }).addClass('invoice-details')
          .end()
        .end()
        .start().add(this.loadingSpin).end()
        .start().addClass('disclosureView')
          .tag(this.disclosureView$)
        .end()
      .end();
    },
    async function updateDisclosure() {
      try {
        var srcAccount = await this.accountDAO.find(this.invoice.account);

        var disclosure = await this.disclosuresDAO.where(
          this.AND(
            this.EQ(this.AscendantFXDisclosure.COUNTRY, srcAccount.address.countryId),
            this.EQ(this.AscendantFXDisclosure.STATE, srcAccount.address.regionId)
          )
        ).select();

        disclosure = disclosure.array ? disclosure.array[0] : null;
        if ( disclosure ) this.Document.create({ markup: disclosure.text });
      } catch (error) {
        console.error(error.message);
        this.notify(error.message, 'error');
      }
    }
  ]
});
