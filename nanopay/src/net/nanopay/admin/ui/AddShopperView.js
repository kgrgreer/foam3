foam.CLASS({
  package: 'net.nanopay.admin.ui',
  name: 'AddShopperView',
  extends: 'foam.u2.View',

  documentation: 'View for adding a shopper through the wizard view flow',

  methods: [
    function initE() {
      this.SUPER();

      var self = this;
      
      this 
        .addClass(this.myClass())
        .start()
          .tag({ class: 'net.nanopay.admin.ui.form.AddShopperForm', title: 'Add Shopper' })
        .end();
    }
  ]
});