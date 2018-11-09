foam.CLASS({
  package: 'net.nanopay.sme.onboarding.ui',
  name: 'UserTransactionEstimateForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: `Third step in the business registration wizard.
      Responsible for capturing transaction business information.`,

    css: `
    ^ {
      width: 488px;
    }
    ^ .foam-u2-tag-Select {
      width: 100%;
      height: 35px;
      margin-bottom: 10px;
    }
    ^ .label {
      margin-left: 0px;
    }
    ^ .foam-u2-TextField {
      width: 100%;
      height: 35px;
      margin-bottom: 10px;
    }
    ^ .foam-u2-view-RadioView {
      display: inline-block;
      margin-right: 5px;
      float: right;
    }
    ^ .foam.u2.CheckBox {
      display: inline-block;
    }
    ^ .inline {
      margin: 15px;
    }
  `,

  properties: [
    {
      name: 'baseCurrency',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.currencyDAO,
          objToChoice: function(a) {
            return [a.id, a.name];
          }
        });
      },
      postSet: function(o, n) {
        this.viewData.userTransactionInfo.baseCurrency = n;
      }
    },
    {
      class: 'Boolean',
      name: 'defaultCurrency',
      postSet: function(o, n) {
        this.viewData.userTransactionInfo.defaultCurrency = n.trim();
      }
    },
    {
      class: 'String',
      name: 'revenueEstimate',
      postSet: function(o, n) {
        this.viewData.userTransactionInfo.annualRevenue = n.trim();
      }
    },
    {
      name: 'internationalPayments',
      documentation: 'Radio button determining business partaking in international payments.',
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [
          'Yes',
          'No'
        ],
        value: 'No'
      },
      postSet: function(o, n) {
        this.viewData.userTransactionInfo.internationalPayments = n == 'Yes';
      }
    },
    {
      class: 'String',
      name: 'purposeField',
      postSet: function(o, n) {
        this.viewData.userTransactionInfo.transactionPurpose = n.trim();
      }
    },
    {
      class: 'String',
      name: 'annualField',
      postSet: function(o, n) {
        this.viewData.userTransactionInfo.annualTransactionAmount = n.trim();
      }
    },
    {
      class: 'String',
      name: 'estimatedField',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [
          'Less than $100,000',
          'More than $100,000'
        ]
      },
      postSet: function(o, n) {
        this.viewData.userTransactionInfo.annualVolume = n;
      }
    }
  ],

  messages: [
    { name: 'TITLE', message: 'Details about your transaction' },
    { name: 'BASE_CURRENCY_LABEL', message: 'Base Currency' },
    { name: 'DEFAULT_MESSAGE', message: 'This will be the default currency for sending and receiving payments.' },
    { name: 'REVENUE_ESTIMATE_LABEL', message: 'Annual revenue estimate in your base currency' },
    { name: 'INTERNATIONAL_PAYMENTS_LABEL', message: 'Are you sending or receiving international payments' },
    { name: 'SECOND_TITLE', message: 'International transfers' },
    { name: 'CURRENCY_TYPE', message: 'U.S. Dollars' },
    { name: 'PURPOSE_LABEL', message: 'Purpose of Transactions' },
    { name: 'ANNUAL_LABEL', message: 'Annual Number of Transactions' },
    { name: 'ESTIMATED_LABEL', message: 'Estimated Annual Volume in USD' }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
      .start()
        .start().addClass('subTitle').add(this.TITLE).end()
        .start().addClass('label-input')
          .start().addClass('label').add(this.BASE_CURRENCY_LABEL).end()
          .start(this.BASE_CURRENCY).end()
        .end()
        .tag({ class: 'foam.u2.CheckBox', data$: this.defaultCurrency$ }).addClass('inline')
        .start().addClass('inline').add(this.DEFAULT_MESSAGE).end()
        .start().addClass('label-input')
          .start().addClass('inline').add(this.REVENUE_ESTIMATE_LABEL).end()
          .start().add(this.REVENUE_ESTIMATE).end()
        .end()
        .start().addClass('label-input')
          .start().addClass('inline').add(this.INTERNATIONAL_PAYMENTS_LABEL).end()
          .start(this.INTERNATIONAL_PAYMENTS).addClass('inline').end()
        .end()
        .start().addClass('subTitle').add(this.SECOND_TITLE).end()
        .start().addClass('label-input')
          .start({ class: 'foam.u2.tag.Image', data: 'images/flags/us.png' })
          .start().addClass('inline').add(this.CURRENCY_TYPE).end()
        .end()
        .start().addClass('label-input')
          .start().addClass('label').add(this.PURPOSE_LABEL).end()
          .start(this.PURPOSE_FIELD).end()
        .end()
        .start().addClass('label-input')
          .start().addClass('label').add(this.ANNUAL_LABEL).end()
          .start(this.ANNUAL_FIELD).end()
        .end()
        .start().addClass('label-input')
          .start().addClass('label').add(this.ESTIMATED_LABEL).end()
          .start(this.ESTIMATED_FIELD).end()
        .end()
      .end();
    }
  ]
});
