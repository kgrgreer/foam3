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
      margin-top: 5px;
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
      margin: 15px 0px;
    }
    ^ .info-label {
      width: 400px;
    }
    ^ .info-width {
      width: 250px;
    }
    ^ .small-width-input {
      width: 100px;
      display: inline-block;
      float: right;
    }
    ^ .property-revenueEstimate {
      width: 225px;
      position: relative;
      top: 15px;
      right: 125px;
    }
    ^ .info-container {
      width: 450px;
      height: 40px;
      padding: 24px 16px;
      border-radius: 4px;
      border: solid 1px #604aff;
      background-color: #f5f4ff;
      color: #2e227f;
    }
    ^ .net-nanopay-sme-ui-InfoMessageContainer {
      margin: 15px 0px;
    }
    ^ .flag-image {
      width: 20px;
      margin-right: 10px;
      margin-top: 30px;
    }
    ^ .transfer-container {
      position: relative;
      top: 25px;
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
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [
          '$ 10,000 /year',
          '$ 50,000 /year',
          '$ 100,000 /year',
          '$ 500,000 /year',
          '$ 1,000,000 /year',
          'Over $ 1,000,000 /year'
        ],
        placeholder: '$     /year'
      },
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
      factory: function() {
        return this.viewData.user.suggestedUserTransactionInfo.annualVolume ? this.viewData.user.suggestedUserTransactionInfo.annualVolume : 'Less than $100,000';
      },
      postSet: function (o, n) {
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
    {
      name: 'INFO_BOX',
      message: `The base currency will be your default currency for sending
          and receiving payments. You can also change this during any transaction.`
    }

  ],

  methods: [
    function initE() {
      this.hasBackOption = true;
      this.internationalPayments$.sub(this.clearFields);

      this.addClass(this.myClass())
      .start()
        .start().addClass('medium-header')
          .add(this.TITLE)
        .end()
        .tag({ class: 'net.nanopay.sme.ui.InfoMessageContainer', message: this.INFO_BOX })
        .start().addClass('label-input')
          .start().addClass('label').add(this.BASE_CURRENCY_LABEL).end()
          .start(this.BASE_CURRENCY).end()
        .end()
        .start().addClass('label-input')
          .start().addClass('inline').addClass('info-width').add(this.REVENUE_ESTIMATE_LABEL).end()
          .start().addClass('small-width-input').add(this.REVENUE_ESTIMATE).end()
        .end()
        .start().addClass('label-input')
          .start().addClass('inline').addClass('info-width').add(this.INTERNATIONAL_PAYMENTS_LABEL).end()
          .start(this.INTERNATIONAL_PAYMENTS).addClass('inline').end()
        .end()
        .start().addClass('transfer-container').show(this.internationalPayments$.map(function(r) {
          return r == 'Yes';
        }))
          .start().addClass('medium-header').add(this.SECOND_TITLE).end()
          .start().addClass('label-input')
            .start({ class: 'foam.u2.tag.Image', data: 'images/flags/us.png' }).addClass('flag-image').end()
            .start().addClass('inline').addClass('bold-label').add(this.CURRENCY_TYPE).end()
          .end()
          .start().addClass('label-input')
            .start().addClass('label').add(this.PURPOSE_LABEL).end()
            .start(this.PURPOSE_FIELD).end()
          .end()
          .start().addClass('label-input').addClass('half-container').addClass('left-of-container')
            .start().addClass('label').add(this.ANNUAL_LABEL).end()
            .start(this.ANNUAL_FIELD).end()
          .end()
          .start().addClass('label-input').addClass('half-container')
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
