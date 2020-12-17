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
    { name: 'PLACE_HOLDER', message: 'Please select...' },
    { name: 'GROSS_ANNUAL_SALES_ERROR', message: 'Gross annual sales required' },
    { name: 'TRANSACTION_PURPOSE_ERROR', message: 'Transaction purpose required' },
    { name: 'ANNUAL_NUMBER_ERROR', message: 'Annual number of transactions required' },
    { name: 'ANNUAL_VOLUME_ERROR', message: 'Annual volume required' },
    { name: 'PAYABLES_PRODUCTS_SERVICES', message: 'Payables for products and/or services' },
    { name: 'WORKING_CAPITAL', message: 'Working capital' },
    { name: 'BILL_PAYMENTS', message: 'Bill payments' },
    { name: 'INTRACOMPANY_BANK_TRANSFERS', message: 'Intracompany bank transfers' },
    { name: 'GOVERNMENT_FEE_TAXES', message: 'Government fee and taxes' },
    { name: 'OTHER', message: 'Other' },
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
      label: 'Estimated gross annual sales',
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
            return e.NEQ(net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.ANNUAL_REVENUE, null);
          },
          errorMessage: 'GROSS_ANNUAL_SALES_ERROR'
        }
      ]
    },
    {
      class: 'String',
      name: 'transactionPurpose',
      label: 'Main purpose of transactions',
      documentation: `General transaction purposes.`,
      view: function(_, X) {
        return {
          class: 'foam.u2.view.ChoiceWithOtherView',
          otherKey: 'Other',
          choiceView: {
            class: 'foam.u2.view.ChoiceView',
            placeholder: X.data.PLACE_HOLDER,
            choices: [
              X.data.PAYABLES_PRODUCTS_SERVICES,
              X.data.WORKING_CAPITAL,
              X.data.BILL_PAYMENTS,
              X.data.INTRACOMPANY_BANK_TRANSFERS,
              X.data.GOVERNMENT_FEE_TAXES,
              X.data.OTHER,
            ]
          }
        };
      },
      validationPredicates: [
        {
          args: ['transactionPurpose'],
          predicateFactory: function(e) {
            return e.NEQ(net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.TRANSACTION_PURPOSE, null);
          },
          errorMessage: 'TRANSACTION_PURPOSE_ERROR'
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
      label: 'Estimated annual number of transactions',
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
          errorMessage: 'ANNUAL_NUMBER_ERROR'
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
      label: 'Estimated annual volume',
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
            return e.NEQ(net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo.ANNUAL_DOMESTIC_VOLUME, null);
          },
          errorMessage: 'ANNUAL_VOLUME_ERROR'
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
