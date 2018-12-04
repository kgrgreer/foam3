foam.CLASS({
  package: 'net.nanopay.flinks.view.modalForm',
  name: 'FlinksModalSecurityReset',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  imports: [
    'institution'
  ],

  css: `
    ^ {
      width: 504px;
    }
    ^content {
      position: relative;
      padding: 24px;
      padding-top: 0;
    }
    ^error {
      margin: 0;
      margin-top: 24px;
      font-size: 14px;
      line-height: 1.5;
    }
    ^error:first-child {
      margin-top: 0;
    }
  `,

  messages: [
    { name: 'Error1', message: 'For your security, we cannot continue this process. Please log into your institution\'s portal and rectify all security issues.' },
    { name: 'Error2', message: 'We apologize for this inconvenience.' }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start({ class: 'net.nanopay.flinks.view.element.FlinksModalHeader', institution: this.institution }).end()
        .start('div').addClass(this.myClass('content'))
          .start('p').addClass(this.myClass('error')).add(this.Error1).end()
          .start('p').addClass(this.myClass('error')).add(this.Error2).end()
        .end()
        .start({class: 'net.nanopay.sme.ui.wizardModal.WizardModalNavigationBar', next: this.NEXT}).end();
    }
  ],

  actions: [
    {
      name: 'next',
      label: 'Okay',
      code: function(X) {
        X.closeDialog();
      }
    }
  ]
});
