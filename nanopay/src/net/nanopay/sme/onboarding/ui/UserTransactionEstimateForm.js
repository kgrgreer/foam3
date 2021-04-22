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
      margin-bottom: 10px;
    }
    ^ .label {
      margin-left: 0px;
      margin-top: 5px;
      margin-bottom: 8px;
      padding-bottom: 0px !important;
      font-weight: 600 !important;
    }
    ^ .foam-u2-TextField {
      width: 100%;
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
      margin-bottom: 15px;
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
    ^ .property-field {
      height: 35px;
      width: 100%;
      margin-bottom: 10px;
    }
    ^ .info-container {
      line-height: 1.5;
    }
    ^ .net-nanopay-sme-ui-InfoMessageContainer {
      margin: 15px 0px;
    }
    ^ .flag-image {
      width: 20px;
      margin-right: 10px;
    }
    ^ .transfer-container {
      position: relative;
      top: 25px;
    }
    ^ .foam-u2-DateView {
      width: 229px;
      height: 35px;
    }
    ^ .date-display-box {
      width: 227px !important;
      font-size: 14px !important;
      height: 35px !important;
      border: solid 1px #8e9090 !important;
      background: #fff !important;
      border-radius: 3px !important;
      font-weight: 400 !important;
      box-shadow: none !important;
      padding-top: 2px;
    }
    ^ .date-display-text {
      color: /*%BLACK%*/ #1e1f21 !important;
    }
    ^ .medium-header {
      margin: 25px 0px;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'revenueEstimate',
      view: {
        class: 'foam.u2.view.ChoiceView',
        placeholder: 'Please select',
        choices: [
          '$0 to $50,000',
          '$50,001 to $100,000',
          '$100,001 to $500,000',
          '$500,001 to $1,000,000',
          'Over $1,000,000'
        ]
      },
      factory: function() {
        if ( this.viewData.user.suggestedUserTransactionInfo.annualRevenue ) {
          return this.viewData.user.suggestedUserTransactionInfo.annualRevenue;
        }
      },
      postSet: function(o, n) {
        this.viewData.user.suggestedUserTransactionInfo.annualRevenue = n;
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
      name: 'annualField',
      factory: function() {
        if ( this.viewData.user.suggestedUserTransactionInfo.annualTransactionAmount ) {
          return this.viewData.user.suggestedUserTransactionInfo.annualTransactionAmount;
        }
      },
      adapt: function(oldValue, newValue) {
        if ( typeof newValue === 'string' ) {
          return newValue.replace(/\D/g, '');
        }
        return newValue;
      },
      postSet: function(o, n) {
        if ( n ) this.viewData.user.suggestedUserTransactionInfo.annualTransactionAmount = n.trim();
      }
    },
    {
      class: 'String',
      name: 'estimatedField',
      factory: function() {
        if ( this.viewData.user.suggestedUserTransactionInfo.annualVolume ) {
          return this.viewData.user.suggestedUserTransactionInfo.annualVolume;
        }
      },
      adapt: function(oldValue, newValue) {
        if ( typeof newValue === 'string' ) {
          return newValue.replace(/\D/g, '');
        }
        return newValue;
      },
      postSet: function(o, n) {
        this.viewData.user.suggestedUserTransactionInfo.annualVolume = n;
      }
    },
    {
      class: 'Date',
      name: 'firstTradeDateField',
      factory: function() {
        if ( this.viewData.user.suggestedUserTransactionInfo.firstTradeDate ) {
          return this.viewData.user.suggestedUserTransactionInfo.firstTradeDate;
        }
      },
      postSet: function(o, n) {
        this.viewData.user.suggestedUserTransactionInfo.firstTradeDate = n;
      }
    },
    {
      class: 'String',
      name: 'annualFieldDomestic',
      view: {
        class: 'foam.u2.view.ChoiceView',
        placeholder: 'Please select',
        choices: [
          '1 to 100',
          '100 to 199',
          '200 to 499',
          '500 to 999',
          'Over 1,000'
        ]
      },
      factory: function() {
        if ( this.viewData.user.suggestedUserTransactionInfo.annualDomesticTransactionAmount ) {
          return this.viewData.user.suggestedUserTransactionInfo.annualDomesticTransactionAmount;
        }
      },
      postSet: function(o, n) {
        if ( n ) this.viewData.user.suggestedUserTransactionInfo.annualDomesticTransactionAmount = n.trim();
      }
    },
    {
      class: 'String',
      name: 'estimatedFieldDomestic',
      view: {
        class: 'foam.u2.view.ChoiceView',
        placeholder: 'Please select',
        choices: [
          '$0 to $10,000',
          '$10,001 to $50,000',
          '$100,001 to $500,000',
          '$500,001 to $1,000,000',
          'Over $1,000,000'
        ]
      },
      factory: function() {
        if ( this.viewData.user.suggestedUserTransactionInfo.annualDomesticVolume ) {
          return this.viewData.user.suggestedUserTransactionInfo.annualDomesticVolume;
        }
      },
      postSet: function(o, n) {
        this.viewData.user.suggestedUserTransactionInfo.annualDomesticVolume = n;
      }
    },
    {
      class: 'Date',
      name: 'firstTradeDateFieldDomestic',
      factory: function() {
        if ( this.viewData.user.suggestedUserTransactionInfo.firstTradeDateDomestic ) {
          return this.viewData.user.suggestedUserTransactionInfo.firstTradeDateDomestic;
        }
      },
      postSet: function(o, n) {
        this.viewData.user.suggestedUserTransactionInfo.firstTradeDateDomestic = n;
      }
    },
    {
      class: 'Boolean',
      name: 'isUSABasedCompany',
      expression: function(viewData) {
        return foam.util.equals(viewData.user.Address.countryId, 'US');
      }
    },
    {
      class: 'String',
      name: 'flag',
      documentation: `This is set from baseCurrency property.`
    },
    {
      class: 'String',
      name: 'currencyTypeLabel',
      documentation: `This is set from baseCurrency property. Toggles message text.`
    },
    {
      class: 'String',
      name: 'estimatedLabel',
      documentation: `This is set from baseCurrency property. Toggles message text.`
    },
    {
      class: 'String',
      name: 'annualLabel',
      documentation: `This is set from baseCurrency property. Toggles message text.`
    }
  ],

  constants: [
    { name: 'US_FLAG', value: 'images/flags/us.png' },
    { name: 'CAD_FLAG', value: 'images/flags/cad.png' }
  ],

  messages: [
    { name: 'TITLE', message: 'Details about your transactions' },
    { name: 'REVENUE_ESTIMATE_LABEL_CA', message: 'Annual Gross Sales in CAD' },
    { name: 'REVENUE_ESTIMATE_LABEL_US', message: 'Annual Gross Sales in USD' },
    { name: 'PURPOSE_LABEL', message: 'Please provide us with the purpose of your transactions' },
    { name: 'INTERNATIONAL_PAYMENTS_LABEL', message: 'Are you sending or receiving international payments?' },
    { name: 'ANTICIPATED_TRADE_LABEL', message: 'Anticipated First Payment Date' },
    { name: 'SECOND_TITLE', message: 'International transfers' },
    { name: 'THIRD_TITLE', message: 'Domestic transfers' },
    { name: 'CURRENCY_TYPE', message: 'U.S. Dollars' },
    { name: 'ANNUAL_LABEL', message: 'Annual Number of Transactions' },
    { name: 'CA_DOLLAR_LABEL', message: 'Canadian Dollar' },
    { name: 'CA_VOLUME_LABEL', message: 'Estimated Annual Volume in CAD' },
    { name: 'US_DOLLAR_LABEL', message: 'U.S. Dollar' },
    { name: 'US_VOLUME_LABEL', message: 'Estimated Annual Volume in USD' },
    { name: 'OTHER_PURPOSE_LABEL', message: 'Please indicate below' }
  ],

  methods: [
    function initE() {
      this.nextLabel = 'Next';
      this.internationalPayments$.sub(this.clearFields);
      this.setBaseCurrency();
      var domesticFlag = this.isUSABasedCompany ? this.US_FLAG : this.CAD_FLAG;

      var userTransactionInfo = this.viewData.user.suggestedUserTransactionInfo;

      this.addClass(this.myClass())
      .start()
        .start().addClass('medium-header')
          .add(this.TITLE)
        .end()
        .start().addClass('label-input')
          .start().addClass('label').add(this.PURPOSE_LABEL).end()
          .startContext({ data: userTransactionInfo })
            .tag(userTransactionInfo.TRANSACTION_PURPOSE)
          .endContext()
        .end()
        .start()
          .addClass('label-input')
          .show(userTransactionInfo.transactionPurpose$.map((purpose) => {
            return foam.util.equals(purpose, 'Other');
          }))
          .start().addClass('label').add(this.OTHER_PURPOSE_LABEL).end()
          .startContext({ data: userTransactionInfo })
            .start(userTransactionInfo.OTHER_TRANSACTION_PURPOSE)
              .addClass('property-field')
            .end()
          .endContext()
        .end()
        .start().addClass('label-input')
          .start().addClass('label').add(this.annualLabel$).end()
          .start(this.REVENUE_ESTIMATE)
            .addClass('property-field')
          .end()
        .end()
        .start()
          .start().addClass('medium-header').add(this.THIRD_TITLE).end()
          .start().addClass('label-input')
            .start({ class: 'foam.u2.tag.Image', data: domesticFlag }).addClass('flag-image').end()
            .start().addClass('inline').addClass('bold-label').add(this.isUSABasedCompany ? this.US_DOLLAR_LABEL : this.CA_DOLLAR_LABEL).end()
          .end()
          .start().addClass('label-input').addClass('half-container').addClass('left-of-container')
            .start().addClass('label').add(this.ANNUAL_LABEL).end()
            .tag(this.ANNUAL_FIELD_DOMESTIC, { onKey: true })
          .end()
          .start().addClass('label-input').addClass('half-container')
            .start().addClass('label').add(this.isUSABasedCompany ? this.US_VOLUME_LABEL : this.CA_VOLUME_LABEL).end()
            .tag(this.ESTIMATED_FIELD_DOMESTIC, { onKey: true })
          .end()
          // NOTE: AFX RELATED, REMOVING FOR MVP RELEASE.
          //
          // .start().addClass('label-input')
          //   .start().addClass('label').add(this.ANTICIPATED_TRADE_LABEL).end()
          //   .start(this.FIRST_TRADE_DATE_FIELD_DOMESTIC).end()
          // .end()
        .end()
        // NOTE: AFX RELATED, REMOVING FOR MVP RELEASE.
        //
        // .start().addClass('label-input')
        //   .start().addClass('inline').addClass('info-width').add(this.INTERNATIONAL_PAYMENTS_LABEL).end()
        //   .start(this.INTERNATIONAL_PAYMENTS).addClass('inline').end()
        // .end()
        // .start().addClass('transfer-container').show(this.internationalPayments$.map(function(r) {
        //   return r == 'Yes';
        // }))
        //   .start().addClass('medium-header').add(this.SECOND_TITLE).end()
        //   .start().addClass('label-input')
        //     .start({ class: 'foam.u2.tag.Image', data: this.flag$ }).addClass('flag-image').end()
        //     .start().addClass('inline').addClass('bold-label').add(this.currencyTypeLabel$).end()
        //   .end()
        //   .start().addClass('label-input').addClass('half-container').addClass('left-of-container')
        //     .start().addClass('label').add(this.ANNUAL_LABEL).end()
        //     .tag(this.ANNUAL_FIELD, { onKey: true })
        //   .end()
        //   .start().addClass('label-input').addClass('half-container')
        //     .start().addClass('label').add(this.estimatedLabel$).end()
        //     .tag(this.ESTIMATED_FIELD, { onKey: true })
        //   .end()
        //   .start().addClass('label-input')
        //     .start().addClass('label').add(this.ANTICIPATED_TRADE_LABEL).end()
        //     .start(this.FIRST_TRADE_DATE_FIELD).end()
        //   .end()
        // .end()
      .end();
    },

    function setBaseCurrency() {
      var cur = this.isUSABasedCompany ? 'USD': 'CAD';
      this.viewData.user.suggestedUserTransactionInfo.baseCurrency = cur;
      // if business address is US then international payments are CAD,
      // if business address is CAD then international payments are USD,
      if ( foam.util.equals('USD', cur) ) {
        this.flag = this.CAD_FLAG;
        this.currencyTypeLabel = this.CA_DOLLAR_LABEL;
        this.estimatedLabel = this.CA_VOLUME_LABEL;
        this.annualLabel = this.REVENUE_ESTIMATE_LABEL_US;
      } else if ( foam.util.equals('CAD', cur) ) {
        this.flag = this.US_FLAG;
        this.currencyTypeLabel = this.US_DOLLAR_LABEL;
        this.estimatedLabel = this.US_VOLUME_LABEL;
        this.annualLabel = this.REVENUE_ESTIMATE_LABEL_CA;
      }
    }
  ],

  listeners: [
    function clearFields() {
      if ( this.internationalPayments == 'Yes' ) return;
      this.annualField = null;
      this.estimatedField = null;
    }
  ]
});
