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
  package: 'net.nanopay.sme.onboarding.model',
  name: 'SuggestedUserTransactionInfo',

  documentation: `
    Suggested user information relating to expected transaction types,
    frequency, amount and currencies. Required for KYC purposes.

    todo: Legacy Property-as of April 2020 needed to be removed and 
      adjustmented to at least AdcendantFXReportsWebAgent. 
      Can't test for awhile so leaving for future.
  `,

  messages: [
    { name: 'PLACE_HOLDER', message: 'Please select...' }
  ],

  properties: [
    {
      class: 'String',
      name: 'baseCurrency',
      documentation: `Currency based on business address.`,
      hidden: true
    },
    {
      class: 'String',
      name: 'annualRevenue',
      label: 'Gross annual sales (estimated)',
      documentation: `Estimated annual revenue for user or business.`,
      view: function(_, X) {
        return {
          class: 'foam.u2.view.ChoiceView',
          placeholder: X.data.PLACE_HOLDER,
          choices: [
            '$0 to $10,000',
            '$10,001 to $50,000',
            '$50,001 to $100,000',
            '$100,001 to $500,000',
            '$500,001 to $1,000,000',
            'Over $1,000,000'
          ]
        };
      },
      validationPredicates: [
        {
          args: ['annualRevenue'],
          predicateFactory: function(e) {
            return e.NEQ(net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.ANNUAL_REVENUE, '');
          },
          errorString: 'Please make a selection.'
        }
      ]
    },
    {
      class: 'String',
      name: 'transactionPurpose',
      label: 'Purpose of transactions on application',
      documentation: `General transaction purposes.`,
      view: function(_, X) {
        return {
          class: 'foam.u2.view.ChoiceWithOtherView',
          otherKey: 'Other',
          choiceView: {
            class: 'foam.u2.view.ChoiceView',
            placeholder: X.data.PLACE_HOLDER,
            choices: [
              'Payables for products and/or services',
              'Working capital',
              'Bill payments',
              'Intracompany bank transfers',
              'Government fee and taxes',
              'Other'
            ]
          }
        };
      },
      validationPredicates: [
        {
          args: ['transactionPurpose'],
          predicateFactory: function(e) {
            return e.NEQ(net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.TRANSACTION_PURPOSE, '');
          },
          errorString: 'Please provide transaction purpose.'
        }
      ]
    },
    {
      class: 'String',
      name: 'annualTransactionAmount',
      documentation: `Estimated annual number of transactions user or business conducts.
      BaseCurrency of this field which is set when user confirms that they do international transfers,
      is opposite (CAD - USD) of set base currency of this model.
      Legacy Property-as of April 2020`,
      hidden: true
    },
    {
      class: 'String',
      name: 'annualTransactionFrequency',
      label: 'Annual number of transactions (estimated)',
      documentation: `Estimated annual frequency of transactions the user or business conducts.`,
        view: function(_, X) {
        return {
          class: 'foam.u2.view.ChoiceView',
          placeholder: X.data.PLACE_HOLDER,
          choices: [
            '1 to 99',
            '100 to 199',
            '200 to 499',
            '500 to 999',
            'Over 1000'
          ]
        };
      },
      validationPredicates: [
        {
          args: ['annualTransactionFrequency'],
          predicateFactory: function(e) {
            return e.NEQ(net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.ANNUAL_TRANSACTION_FREQUENCY, '');
          },
          errorString: 'Please make a selection.'
        }
      ]
    },
    {
      class: 'String',
      name: 'annualVolume',
      documentation: `Estimated annual volume in USD of user or business.
      BaseCurrency of this field which is set when user confirms that they do international transfers,
      is opposite (CAD - USD) of set base currency of this model.
      Legacy Property-as of April 2020`,
      hidden: true
    },
    {
      class: 'Date',
      name: 'firstTradeDate',
      documentation: `Anticipated first payment date.
      Legacy Property-as of April 2020`,
      hidden: true
    },
    {
      class: 'String',
      name: 'annualDomesticTransactionAmount',
      documentation: `Estimated annual number of transactions user or business conducts. baseCurrency of this model.
      US-based company (the information pertains to their domestic transactions, as they will be processed through AFX)
      Legacy Property-as of April 2020`,
      value: 'N/A',
      hidden: true
    },
    {
      class: 'String',
      name: 'annualDomesticVolume',
      label: 'Annual volume on application (estimated)',
      documentation: `Estimated annual volume in USD of user or business. baseCurrency of this model.
      US-based company (the information pertains to their domestic transactions, as they will be processed through AFX)`,
      view: function(_, X) {
        return {
          class: 'foam.u2.view.ChoiceView',
          placeholder: X.data.PLACE_HOLDER,
          choices: [
            '$0 to $10,000',
            '$10,001 to $50,000',
            '$50,001 to $100,000',
            '$100,001 to $500,000',
            '$500,001 to $1,000,000',
            'Over $1,000,000'
          ]
        };
      },
      validationPredicates: [
        {
          args: ['annualDomesticVolume'],
          predicateFactory: function(e) {
            return e.NEQ(net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.ANNUAL_DOMESTIC_VOLUME, '');
          },
          errorString: 'Please make a selection.'
        }
      ]
    },
    {
      class: 'Date',
      name: 'firstTradeDateDomestic',
      documentation: `Anticipated first payment date.
      US-based company (the information pertains to their domestic transactions, as they will be processed through AFX)
      Legacy Property-as of April 2020`,
      hidden: true
    }
  ]
});
