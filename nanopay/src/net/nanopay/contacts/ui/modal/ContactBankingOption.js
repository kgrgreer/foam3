foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
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
      font-size: 14px;
      color: #8e9090;
    }
    ^option-container {
      display: flex;
      flex-direction: row;
      justify-content: flex-end;

      padding: 24px;
      box-sizing: border-box;
      background-color: #fafafa;
    }
    ^option-container .net-nanopay-ui-ActionView-no {
      background-color: white;
      border: 1px solid %SECONDARYCOLOR%;
      color: %SECONDARYCOLOR%;
      margin-right: 16px;
    }
    ^option-container .net-nanopay-ui-ActionView-no:hover {
      background-color: white;
      border: 1px solid #4d38e1;
      color: %SECONDARYCOLOR%;
    }
    ^option-container .net-nanopay-ui-ActionView-yes {

    }
  `,

  messages: [
    { name: 'TITLE', message: 'Add banking info for this contact?' },
    { name: 'QUESTION', message: 'If you don\'t know this contact\'s banking information now, you will be able to add it later via the contact screen.' }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start().addClass(this.myClass('title'))
          .start('p').add(this.TITLE).end()
        .end()
        .start().addClass(this.myClass('content'))
          .start('p').addClass(this.myClass('question')).add(this.QUESTION).end()
        .end()
        .start().addClass(this.myClass('option-container'))
          .tag(this.NO)
          .tag(this.YES)
        .end();
    }
  ],

  actions: [
    {
      name: 'no',
      label: 'No, add without',
      code: function(X) {
        X.viewData.isBankingProvided = false;
        if ( X.viewData.selectedContact ) {
          X.addBusiness(X.viewData.selectedContact);
          X.closeDialog();
        } else {
          X.pushToId('information');
        }
      }
    },
    {
      name: 'yes',
      label: 'Yes, add banking info',
      code: function(X) {
        X.viewData.isBankingProvided = true;
        X.pushToId('information');
      }
    }
  ]
});
