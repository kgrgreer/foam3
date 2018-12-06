foam.CLASS({
  package: 'net.nanopay.ui.wizardModal.example',
  name: 'ExampleWizardModalSubView2',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',
  css: `
    ^ {
      width: 400px;
    }
    ^ .container1 {
      width: 100%;
      height: 100px;
      background-color: white;
    }
  `,

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start()
          .start().addClass('container1')
            .add('Data passed: ')
            .add(this.viewData.someString)
          .end()
          .end()
          .start({class: 'net.nanopay.sme.ui.wizardModal.WizardModalNavigationBar', back: this.BACK, next: this.NEXT}).end()
        .end();
    }
  ],

  actions: [
    {
      name: 'back',
      label: 'Back',
      code: function(X) {
        X.pushToId('exampleScreen1');
      }
    },
    {
      name: 'next',
      label: 'Done',
      code: function(X) {
        X.closeDialog();
      }
    }
  ]
});
