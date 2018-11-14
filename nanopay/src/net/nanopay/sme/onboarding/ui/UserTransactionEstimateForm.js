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
      padding-left: 5px;
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
    ^ .info-label {
      width: 400px;
    }
    ^ .info-width {
      width: 300px;
    }
    ^ .small-width-input {
      width: 100px;
      display: inline-block;
      float: right;
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
      factory: function() {
        if ( this.viewData.user.suggestedUserTransactionInfo.baseCurrency ) return this.viewData.user.suggestedUserTransactionInfo.baseCurrency;
      },
      postSet: function(o, n) {
        this.viewData.user.suggestedUserTransactionInfo.baseCurrency = n;
      }
    },
    {
      class: 'String',
      name: 'revenueEstimate',
      factory: function() {
        if ( this.viewData.user.suggestedUserTransactionInfo.annualRevenue ) return this.viewData.user.suggestedUserTransactionInfo.annualRevenue;
      },
      postSet: function(o, n) {
        this.viewData.user.suggestedUserTransactionInfo.annualRevenue = n.trim();
      }
    },
    {
      name: 'internationalPayments',
      documentation: 'Radio button determining business partaking in international payments.',
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [
          'No',
          'Yes'
        ]
      },
      factory: function() {
        return this.viewData.user.suggestedUserTransactionInfo.internationalPayments ? 'Yes' : 'No';
      },
      postSet: function(o, n) {
        this.viewData.user.suggestedUserTransactionInfo.internationalPayments = n == 'Yes';
      }
    },
    {
      class: 'String',
      name: 'purposeField',
      factory: function() {
        if ( this.viewData.user.suggestedUserTransactionInfo.transactionPurpose ) return this.viewData.user.suggestedUserTransactionInfo.transactionPurpose;
      },
      postSet: function(o, n) {
        this.viewData.user.suggestedUserTransactionInfo.transactionPurpose = n.trim();
      }
    },
    {
      class: 'String',
      name: 'annualField',
      factory: function() {
        if ( this.viewData.user.suggestedUserTransactionInfo.annualTransactionAmount ) return this.viewData.user.suggestedUserTransactionInfo.annualTransactionAmount;
      },
      postSet: function(o, n) {
        this.viewData.user.suggestedUserTransactionInfo.annualTransactionAmount = n.trim();
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
        ],
        value: 'Less than $100,000'
      },
      factory: function() {
        return this.viewData.user.suggestedUserTransactionInfo.annualVolume ? this.viewData.user.suggestedUserTransactionInfo : 'Less than $100,000';
      },
      postSet: function(o, n) {
        this.viewData.user.suggestedUserTransactionInfo.annualVolume = n;
      }
    }
  ],

  messages: [
    { name: 'TITLE', message: 'Details about your transactions' },
    { name: 'BASE_CURRENCY_LABEL', message: 'Base Currency' },
    { name: 'REVENUE_ESTIMATE_LABEL', message: 'Annual revenue estimate in your base currency' },
    { name: 'INTERNATIONAL_PAYMENTS_LABEL', message: 'Are you sending or receiving international payments?' },
    { name: 'SECOND_TITLE', message: 'International transfers' },
    { name: 'CURRENCY_TYPE', message: 'U.S. Dollars' },
    { name: 'PURPOSE_LABEL', message: 'Purpose of Transactions' },
    { name: 'ANNUAL_LABEL', message: 'Annual Number of Transactions' },
    { name: 'ESTIMATED_LABEL', message: 'Estimated Annual Volume in USD' },
    { name: 'LESS_THAN', message: 'Less than $100,000' },
    { name: 'MORE_THAN', message: 'More than $100,000' }
  ],

  methods: [
    function initE() {
      this.internationalPayments$.sub(this.clearFields);

      this.addClass(this.myClass())
      .start()
        .start().addClass('subTitle').add(this.TITLE).end()
        .start().addClass('label-input')
          .start().addClass('label').add(this.BASE_CURRENCY_LABEL).end()
          .start(this.BASE_CURRENCY).end()
        .end()
        .start().addClass('label-input')
          .start().addClass('inline').add(this.REVENUE_ESTIMATE_LABEL).end()
          .start().addClass('small-width-input').add(this.REVENUE_ESTIMATE).end()
        .end()
        .start().addClass('label-input')
          .start().addClass('inline').addClass('info-width').add(this.INTERNATIONAL_PAYMENTS_LABEL).end()
          .start(this.INTERNATIONAL_PAYMENTS).addClass('inline').end()
        .end()
        .start().show(this.internationalPayments$.map(function(r) {
          return r == 'Yes';
        }))
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
        .end()
      .end();
    }
  ],

  listeners: [
    function clearFields() {
      if ( this.internationalPayments == 'Yes' ) return;
      this.purposeField = null;
      this.annualField = null;
      this.estimatedField = null;
    }
  ]
});
