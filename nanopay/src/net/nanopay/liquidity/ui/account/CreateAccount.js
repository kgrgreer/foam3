foam.CLASS({
  package: 'net.nanopay.liquidity.ui.account',
  name: 'CreateAccount',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.dialog.Popup',
  ],
  
  // render an action that when you click it will render modal
  methods: [
    function initE() {
      this.add(this.Popup.create().tag({
        class: 'net.nanopay.account.ui.addAccountModal.AddAccountModalWizard',
      }));
    }
  ],
});
