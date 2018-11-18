foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'CompanyInformationView',
  extends: 'foam.u2.View',

  documentation: `
    View detailing company/business information.
  `,

  css: `
    ^ .net-nanopay-sme-ui-TransactionLimitView {
      margin-top: 16px;
    }
    ^ .net-nanopay-sme-ui-BeneficialOwnerView {
      margin-top: 16px;
    }
    ^ .card:hover {
      box-shadow: none;
    }
  `,

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .tag({ class: 'net.nanopay.sme.ui.BusinessInformationView' })
        .tag({ class: 'net.nanopay.sme.ui.TransactionLimitView' })
        .tag({ class: 'net.nanopay.sme.ui.BeneficialOwnerView' });
    }
  ]
});
