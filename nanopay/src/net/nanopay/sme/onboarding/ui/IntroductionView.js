foam.CLASS({
  package: 'net.nanopay.sme.onboarding.ui',
  name: 'IntroductionView',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  css: `
    ^ {
      width: 488px;
    }
    ^ img {
      display: inline-block;
      margin: 15px 10px 0 0;
      position: relative;
      top: 7px;
    }
    ^ .bottom-border-container {
      padding-bottom: 20px;
      border-bottom: 1px solid lightgrey;
    }
    ^ .title {
      margin: 20px 0px;
    }
  `,

  messages: [
    // First Section of messages
    { name: 'GETTING_STARTED', message: 'Before you get started.' },
    { name: 'GUIDE_MESSAGE', message: 'It will take about 10 minutes to completed the whole profile.' },
    { name: 'GUIDE_MESSAGE_REQUIREMENTS', message: 'Here\'s what you will need on hand to get this done:' },
    { name: 'BUSINESS_ADDRESS', message: 'Business Address' },
    { name: 'BUSINESS_REGISTRATION_INFO', message: 'Business Registration Information' },
    { name: 'PROOF_OF_REGISTRATION', message: 'Proof of Business Registration' },
    { name: 'SIGNING_OFFICER', message: 'Signing Officer Information & Identification' },
    { name: 'COMPANY_OWNERSHIP', message: 'Company Ownership Information' },
    // Second Section of messages
    { name: 'WHY_ASK', message: 'Why do we ask for this?' },
    {
      name: 'WHY_ASK_EXPLANATION',
      message: `We need to know a little bit about your business and 
        transaction habits before you can send and request payments. This helps us to 
        ensure that Ablii is a safe to use for both senders and receivers of payments. 
        You will also be able to make international payments after completing the whole profile!
      `
    }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start().addClass('subTitle').add(this.GETTING_STARTED).end()
        .start().addClass('bottom-border-container')
          .start().add(this.GUIDE_MESSAGE).end()
          .start().add(this.GUIDE_MESSAGE_REQUIREMENTS).end()
          .start().addClass('bullet-point')
            .tag({ class: 'foam.u2.tag.Image', data: 'images/ic-search.svg' })
            .add(this.BUSINESS_ADDRESS)
          .end()
          .start().addClass('bullet-point')
            .tag({ class: 'foam.u2.tag.Image', data: 'images/ic-search.svg' })
            .add(this.BUSINESS_REGISTRATION_INFO)
          .end()
          .start().addClass('bullet-point')
            .tag({ class: 'foam.u2.tag.Image', data: 'images/ic-search.svg' })
            .add(this.PROOF_OF_REGISTRATION)
          .end()
          .start().addClass('bullet-point')
            .tag({ class: 'foam.u2.tag.Image', data: 'images/ic-search.svg' })
            .add(this.SIGNING_OFFICER)
          .end()
          .start().addClass('bullet-point')
            .tag({ class: 'foam.u2.tag.Image', data: 'images/ic-search.svg' })
            .add(this.COMPANY_OWNERSHIP)
          .end()
        .end()
        .start().addClass('borderless-container')
          .start().addClass('title').add(this.WHY_ASK).end()
          .start().add(this.WHY_ASK_EXPLANATION).end()
        .end();
    }
  ]
});
