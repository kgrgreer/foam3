foam.CLASS({
  package: 'net.nanopay.onboarding.b2b.ui',
  name: 'ProfileSubmittedForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: 'Form to add attachments and view submitted information',

  requires: [
    'net.nanopay.admin.model.AccountStatus'
  ],

  imports: [
    'user'
  ],

  css: `
    ^ .container {
      width: 540px;
    }
    ^ .sectionTitle {
      line-height: 16px;
      font-size: 14px;
      font-weight: bold;
      margin-top: 0;
      margin-bottom: 20px;
    }
    ^ .borderContainer {
      padding: 15 0 30 0;
      border-top: solid 1px rgba(164, 179, 184, 0.5);
    }
    ^ .containerTitle {
      height: 16px;
      font-family: Roboto;
      font-size: 14px;
      font-weight: bold;
      font-style: normal;
      font-stretch: normal;
      line-height: normal;
      letter-spacing: 0.2px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
    }
    ^ .containerDesc {
      font-family: Roboto;
      font-size: 12px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.33;
      letter-spacing: 0.2px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
    }
    ^ .foam-u2-ActionView-viewProfile,
    ^ .foam-u2-ActionView-goToPortal {
      width: 135px;
      height: 40px;
      background-color: #59a5d5;
    }

    ^ .foam-u2-ActionView-viewProfile span,
    ^ .foam-u2-ActionView-goToPortal span {
      font-family: Roboto;
      font-size: 14px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 2.86;
      letter-spacing: 0.2px;
      text-align: center;
      color: #ffffff;
    }
  `,

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())
        .start().addClass('container')
          .start('p').add('Account ID ' + this.viewData.user.id).addClass('sectionTitle').end()
          .start().addClass('borderContainer')
            .tag({ class: ( this.user.status !== this.AccountStatus.ACTIVE ) ?
              'net.nanopay.onboarding.b2b.ui.UploadAdditionalDocumentsView' :
              'net.nanopay.onboarding.b2b.ui.NextStepView' })
          .end()
          .start().addClass('borderContainer')
            .tag({ class: 'net.nanopay.onboarding.b2b.ui.ViewSubmittedRegistrationView' })
          .end()
        .end()
    }
  ]
});