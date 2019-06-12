foam.CLASS({
  package: 'net.nanopay.tx.bmo',
  name: 'BmoAssignedClientValue',

  documentation: `Nanopay BMO account information`,

  properties: [
    {
      name: 'creditOriginatorId',
      class: 'String'
    },
    {
      name: 'debitOriginatorId',
      class: 'String'
    },
    {
      name: 'destinationDataCentre',
      class: 'String'
    },
    {
      name: 'originationControlDataAndIdentification',
      class: 'String'
    },
    {
      name: 'originatorShortName',
      class: 'String'
    },
    {
      name: 'originatorLongName',
      class: 'String'
    },
    {
      name: 'institutionIdForReturns',
      class: 'String'
    },
    {
      name: 'accountNumberForReturns',
      class: 'String'
    },
    {
      name: 'accountingInformation',
      class: 'String'
    },
    {
      name: 'fundingAccountNumber',
      class: 'String'
    },
    {
      name: 'accountNumberForRejects',
      class: 'String'
    },
    {
      name: 'accountNumberForRecalls',
      class: 'String'
    },
    {
      name: 'production',
      class: 'Boolean'
    },
    {
      name: 'fileCreationNumberOffset',
      class: 'Int'
    }
  ]

});
