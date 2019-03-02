foam.CLASS({
  package: 'net.nanopay.ui.wizardModal.example',
  name: 'ExampleWizardModalSubView1',
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
  properties: [
    {
      class: 'String',
      name: 'infoToBePassed',
      view: {
        class: 'foam.u2.tag.Input',
        placeholder: 'String to be passed on',
        onKey: true
      },
      postSet: function(o, n) {
        this.viewData.someString = n;
      }
    }
  ],
  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start()
          .start().addClass('container1')
            .add('Input here: ')
            .tag(this.INFO_TO_BE_PASSED)
          .end()
          .start({class: 'net.nanopay.sme.ui.wizardModal.WizardModalNavigationBar', back: this.BACK, next: this.NEXT}).end()
        .end();
    }
  ],

  actions: [
    {
      name: 'back',
      label: 'Close',
      code: function(X) {
        X.closeDialog();
      }
    },
    {
      name: 'next',
      label: 'Next',
      code: function(X) {
        X.pushToId('exampleScreen2');
      }
    }
  ]
});
