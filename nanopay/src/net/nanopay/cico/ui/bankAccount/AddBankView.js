foam.CLASS({
  package: 'net.nanopay.cico.ui.bankAccount',
  name: 'AddBankView',
  extends: 'foam.u2.View',

  documentation: 'View for adding a shopper through the wizard view flow',
  
  methods: [
    function initE() {
      this.SUPER();

      var self = this;
      
      this 
        .addClass(this.myClass())
        .start()
          .start({ class: 'net.nanopay.cico.ui.bankAccount.form.BankForm', title: 'Add Bank Account' }).end()
        .end();
    }
  ]
})