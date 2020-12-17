/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

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
      margin: 0px 10px 0 0;
      position: relative;
      top: 7px;
    }
    ^ .started-container {
      padding-bottom: 20px;
    }
    ^ .medium-header {
      margin: 20px 0px;
    }
    ^ .purple-checkmark {
      margin: 15px 20px 0px 0px;
    }
    ^ .body-paragraph {
      background: #fff;
      padding: 16px 24px;
      box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.16);
      border: 1px solid #e2e2e3;
      border-radius: 4px;
      color: /*%BLACK%*/ #1e1f21;
      font-size: 14px;
    }
    ^ .small-title {
      color: /*%BLACK%*/ #1e1f21;
      font-size: 14px;
      margin-top: 32px;
    }

    ^ .net-nanopay-sme-ui-InfoMessageContainer {
      padding-bottom: 19px;
    }
    
    ^ .subdued-text-why-ask {
      margin-bottom: 50px;
    }
  `,

  messages: [
    // First Section of messages
    { name: 'GETTING_STARTED', message: 'Before you get started' },
    { name: 'GUIDE_MESSAGE', message: 'It will take about 10 minutes to complete the whole profile.' },
    { name: 'GUIDE_MESSAGE_REQUIREMENTS', message: 'Here are some things you need to get this done:' },
    { name: 'BUSINESS_ADDRESS', message: 'Business Address' },
    { name: 'BUSINESS_REGISTRATION_INFO', message: 'Business Registration Information' },
    { name: 'PROOF_OF_REGISTRATION', message: 'Business Information' },
    { name: 'SIGNING_OFFICER', message: 'Signing Officer Information & Identification' },
    { name: 'COMPANY_OWNERSHIP', message: 'Company Ownership Information' },
    // Second Section of messages
    { name: 'WHY_ASK', message: 'Why do we need this?' },
    {
      name: 'WHY_ASK_EXPLANATION',
      message: `Collecting this info helps us to ensure that Ablii is safe to use for both senders 
          and receivers of payments.
      `
    },
    {
      name: 'WHY_ASK_EXPLANATION2',
      message: `Once your profile is complete, we will conduct a review to enable payments!`
    }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start().addClass('medium-header').add(this.GETTING_STARTED).end()
        .start().addClass('started-container')
          .tag({ class: 'net.nanopay.sme.ui.InfoMessageContainer', message: this.GUIDE_MESSAGE })
          .start().addClass('small-title').addClass('subdued-text')
            .start().add(this.GUIDE_MESSAGE_REQUIREMENTS).end()
          .end()
          .start().addClass('bullet-point')
            .start().addClass('purple-checkmark').end()
            .add(this.PROOF_OF_REGISTRATION)
          .end()
          .start().addClass('bullet-point')
            .start().addClass('purple-checkmark').end()
            .add(this.SIGNING_OFFICER)
          .end()
          .start().addClass('bullet-point')
            .start().addClass('purple-checkmark').end()
            .add(this.COMPANY_OWNERSHIP)
          .end()
        .end()
        .start().addClass('borderless-container')
          .start().addClass('medium-header').add(this.WHY_ASK).end()
          .start().addClass('body-paragraph').addClass('subdued-text-why-ask')
            .add(this.WHY_ASK_EXPLANATION)
            .br()
            .br()
            .add(this.WHY_ASK_EXPLANATION2)
          .end()
        .end();
    }
  ]
});
