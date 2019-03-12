foam.CLASS({
  package: 'net.nanopay.accounting',
  name: 'ResultResponse',
  documentation: 'Allows the system to return a message from a Stub',
  properties: [
    {
      class: 'Boolean',
      name: 'result'
    },
    {
      class: 'String',
      name: 'reason'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.accounting.ContactMismatchPair',
      name: 'contactSyncMismatches'
    },
    {
      class: 'Array',
      of: 'String',
      name: 'contactSyncErrors'
    },
    {
      class: 'Array',
      of: 'String',
      name: 'invoiceSyncErrors'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.accounting.AccountingErrorCodes',
      name: 'errorCode'
    }
  ]
});
