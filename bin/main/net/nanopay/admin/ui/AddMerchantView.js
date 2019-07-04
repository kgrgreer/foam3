foam.CLASS({
  package: 'net.nanopay.admin.ui',
  name: 'AddMerchantView',
  extends: 'foam.u2.View',

  documentation: 'View for adding a merchant through the wizard view flow',

  methods: [
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start()
          .tag({ class: 'net.nanopay.admin.ui.form.merchant.AddMerchantForm', title: 'Add Merchant' })
        .end();
    }
  ]
}); 