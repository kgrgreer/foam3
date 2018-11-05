focus.CLASS({
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
      documentation: `Frequent currency user transacts in.`
    },
    {
      class: 'String',
      name: 'annualRevenue',
      documentation: `Estimated annual revenue for user or business.`
    },
    {
      class: 'boolean',
      name: 'paymentType',
      documentation: `States user or business primarily sends or receives payments.`
    },
    {
      class: 'String',
      name: 'transactionPurpose',
      documentation: `General transaction purposes.`
    },
    {
      class: 'Long',
      name: 'annualTransactionAmount',
      documentation: `Estimated annual number of transactions user or business conducts.`
    },
    {
      class: 'String',
      name: 'annualVolume',
      documentation: `Estimated annual volume in USD of user or business.`
    }
  ]
});
