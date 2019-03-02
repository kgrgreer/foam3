foam.CLASS({
  package: 'net.nanopay.ui.wizardModal.example',
  name: 'ExampleWizardModal',
  extends: 'net.nanopay.ui.wizardModal.WizardModal',

  methods: [
    function init() {
      this.views = {
        'exampleScreen1' : { view: { class: 'net.nanopay.ui.wizardModal.example.ExampleWizardModalSubView1' }, startPoint: true },
        'exampleScreen2' : { view: { class: 'net.nanopay.ui.wizardModal.example.ExampleWizardModalSubView2' } }
      }
    }
  ]
});
