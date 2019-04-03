foam.CLASS({
  package: 'net.nanopay.account.ui.addAccountModal',
  name: 'AccountDetailsModal',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  documentation: 'Modal Sub View for account details',

  requires: [
    'net.nanopay.account.ui.addAccountModal.ModalTitleBar',
    'net.nanopay.account.ui.addAccountModal.ModalProgressBar'
  ],

  messages: [
    { name: 'TITLE', message: 'Add details to this account...' }
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'isLimitRequired',
      postSet: function( o, n ) {
        this.viewData.isLimitRequired = n;
      }
    },
    {
      class: 'Boolean',
      name: 'isLiquidityRequired',
      postSet: function( o, n ) {
        this.viewData.isLiquidityRequired = n;
      }
    }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start(this.ModalTitleBar, { title: this.TITLE }).end()
        .start(this.ModalProgressBar, { percentage: 50 }).end()
        // TODO: Put view model here
        .start() //This is where the next button container is
          .start(this.NEXT, { data: this }).end()
        .end()
    }
  ],

  actions: [
    {
      name: 'next',
      code: function(X) {
        console.log(this.cls_.id);
        // Need to do a check if limits and thresholds are required
        X.viewData.isLimitRequired ? X.pushToId('limits') : X.closeDialog();
      }
    }
  ]
});
