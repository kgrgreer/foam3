foam.CLASS({
  package: 'net.nanopay.sme.onboarding.model',
  name: 'SuggestedUserTransactionInfo',

  documentation: `
    Suggested user information relating to expected transaction types,
    frequency, amount and currencies. Required for KYC purposes.
  `,

  properties: [
    {
      class: 'String',
      name: 'baseCurrency',
      documentation: `Currency based on business address.`
    },
    {
      class: 'Boolean',
      name: 'defaultCurrency',
      documentation: `Default currency user transacts in.`
    },
    {
      class: 'String',
      name: 'annualRevenue',
      label: 'Gross annual sales (estimated)',
      documentation: `Estimated annual revenue for user or business.`
    },
    {
      class: 'Boolean',
      name: 'internationalPayments',
      documentation: `User participates in international payments.`
    },
    {
      class: 'Boolean',
      name: 'paymentType',
      documentation: `States user or business primarily sends or receives payments.`
    },
    {
      class: 'String',
      name: 'transactionPurpose',
      label: 'Purpose of transactions on Ablii',
      documentation: `General transaction purposes.`,
      view: {
        class: 'foam.u2.view.ChoiceView',
        placeholder: 'Please select',
        choices: [
          'Payables for products and/or services',
          'Working capital',
          'Bill payments',
          'Intracompany bank transfers',
          'Government fee and taxes',
          'Other'
        ]
      }
    },
    {
      class: 'String',
      name: 'otherTransactionPurpose',
      documentation: `
        Field need to fill in when user select other transaction purpose.
      `,
      view: {
        class: 'foam.u2.TextField',
        placeholder: '',
        onKey: true
      },
    },
    {
      class: 'String',
      name: 'annualTransactionAmount',
      documentation: `Estimated annual number of transactions user or business conducts.
      BaseCurrency of this field which is set when user confirms that they do international transfers,
      is opposite (CAD - USD) of set base currency of this model.`
    },
    {
      class: 'String',
      name: 'annualTransactionFrequency',
      label: 'Annual number of transactions (estimated)',
      documentation: `Estimated annual frequency of transactions the user or business conducts.`
    },
    {
      class: 'String',
      name: 'annualVolume',
      documentation: `Estimated annual volume in USD of user or business.
      BaseCurrency of this field which is set when user confirms that they do international transfers,
      is opposite (CAD - USD) of set base currency of this model.`
    },
    {
      class: 'Date',
      name: 'firstTradeDate',
      documentation: `Anticipated first payment date.`
    },
    {
      class: 'String',
      name: 'annualDomesticTransactionAmount',
      documentation: `Estimated annual number of transactions user or business conducts. baseCurrency of this model.
      US-based company (the information pertains to their domestic transactions, as they will be processed through AFX)`
    },
    {
      class: 'String',
      name: 'annualDomesticVolume',
      label: 'Annual volume on Ablii (estimated)',
      documentation: `Estimated annual volume in USD of user or business. baseCurrency of this model.
      US-based company (the information pertains to their domestic transactions, as they will be processed through AFX)`
    },
    {
      class: 'Date',
      name: 'firstTradeDateDomestic',
      documentation: `Anticipated first payment date.
      US-based company (the information pertains to their domestic transactions, as they will be processed through AFX)`
    }
  ]
});
