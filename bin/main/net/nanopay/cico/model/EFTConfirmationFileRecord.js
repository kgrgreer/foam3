foam.CLASS({
  package: 'net.nanopay.cico.model',
  name: 'EFTConfirmationFileRecord',

  properties: [
    {
      class: 'Int',
      name: 'lineNumber',
    },
    {
      class: 'String',
      name: 'status'
    },
    {
      class: 'String',
      name: 'EFTTransactionId'
    },
    {
      class: 'String',
      name: 'reason'
    },
    {
      class: 'String',
      name: 'PADType'
    },
    {
      class: 'String',
      name: 'transactionCode'
    },
    {
      class: 'String',
      name: 'firstName'
    },
    {
      class: 'String',
      name: 'lastName'
    },
    {
      class: 'String',
      name: 'referenceId'
    }
  ]
});