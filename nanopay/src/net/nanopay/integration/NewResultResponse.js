foam.CLASS({
  package: 'net.nanopay.integration',
  name: 'NewResultResponse',
  extends: 'net.nanopay.integration.ResultResponse',

  properties: [
    {
      class: 'FObjectArray',
      of: 'net.nanopay.integration.ContactMismatchPair',
      name: 'syncContactsResult'
    },
    {
      class: 'FObjectArray',
      of: 'String',
      name: 'inValidContact'
    },
    {
      class: 'FObjectArray',
      of: 'String',
      name: 'inValidInvoice'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.integration.AccountingErrorCodes',
      name: 'errorCode'
    }
  ]
});
