foam.CLASS({
  package: 'net.nanopay.account.ui.addAccountModal',
  name: 'AccountSubmissionModal',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  documentation: 'Modal Sub View for the submission of a created account',

  requires: [
    'net.nanopay.account.ui.addAccountModal.ModalTitleBar',
    'net.nanopay.account.ui.addAccountModal.ModalProgressBar'
  ],

  messages: [
    { name: 'TITLE', message: 'Creating your account...' }
  ],

  properties: [
    {
      class: 'Int',
      name: 'percentage',
      value: 0
    },
    'progressBar'
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start(this.ModalTitleBar, { title: this.TITLE }).end()
        .start(this.ModalProgressBar, { isIndefinite: true }, this.progressBar$).end()
        .start().addClass(this.myClass('outer-ring')) // Margin for outer ring + border + padding for inner circle
          .start().addClass(this.myClass('inner-ring')) // Inner circle
            .start({ class: 'foam.u2.tag.Image', data: 'images/gray-check.svg'}).end()
          .end()
        .end()
        .start() //This is where the next button container is
          .start(this.NEXT, { data: this }).end()
        .end();

      this.timer();
    },

    function timer() {
      var self = this;
      setTimeout(function(){
        self.progressBar.stopAnimation();
      }, 3500);
    }
  ],

  actions: [
    {
      name: 'next',
      code: function(X) {
        X.closeDialog();
      }
    }
  ]
});
