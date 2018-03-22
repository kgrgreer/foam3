foam.CLASS({
  package: 'net.nanopay.onboarding.b2b.ui',
  name: 'ProfileSubmittedForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: 'Form to add attachments and view submitted information',

  css: ``,

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())
    }
  ]

});