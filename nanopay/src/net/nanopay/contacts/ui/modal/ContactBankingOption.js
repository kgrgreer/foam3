foam.CLASS({
  package: 'net.nanopay.contact.ui.modal',
  name: 'ContactBankingOption',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  css: `
    ^title {
      padding: 25px;
    }
    ^title p {
      font-size: 24px;
      font-weight: 900;
      color: #2b2b2b;
      margin: 0;
    }
    ^content {
      padding: 0 25px;
      padding-bottom: 25px;
    }
    ^question {
      margin: 0;
      font-size: 16px;
      color: #2b2b2b;
    }
    ^option-container {
      display: flex;
      flex-direction: row;
      justify-content: center;
      margin-top: 24px;
    }
    ^option-container .net-nanopay-ui-ActionView {
      display: inline-block;
    }
    ^option-container .net-nanopay-ui-ActionView-yes {
      margin-left: auto;
    }
  `,

  messages: [
    { name: 'TITLE', message: 'Add a Contact' },
    { name: 'QUESTION', message: 'Do you have your contact\'s banking information?' } // TODO: We should get better copy
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start().addClass(this.myClass('title'))
          .start('p').add(this.TITLE).end()
        .end()
        .start().addClass(this.myClass('content'))
          .start('p').addClass(this.myClass('question')).add(this.QUESTION).end()
          .start().addClass(this.myClass('option-container'))
            .tag(this.NO)
            .tag(this.YES)
          .end()
        .end();
    }
  ],

  actions: [
    {
      name: 'no',
      label: 'No',
      code: function(X) {
        X.viewData.isBankingProvided = false;
        X.pushToId('information');
      }
    },
    {
      name: 'yes',
      label: 'Yes',
      code: function(X) {
        X.viewData.isBankingProvided = true;
        X.pushToId('information');
      }
    }
  ]
});
