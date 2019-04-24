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
      class: 'Enum',
      of: 'net.nanopay.accounting.AccountingErrorCodes',
      name: 'errorCode'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.accounting.resultresponse.ContactResponseItem',
      name: 'successContact'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.accounting.resultresponse.InvoiceResponseItem',
      name: 'successInvoice'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.accounting.AccountingBankAccount',
      name: 'bankAccountList'
    },
    {
      class: 'Map',
      name: 'contactErrors',
      javaType: 'java.util.Map<String, java.util.List<net.nanopay.accounting.resultresponse.ContactResponseItem>>',
    },
    {
      class: 'Map',
      name: 'invoiceErrors',
      javaType: 'java.util.Map<String, java.util.List<net.nanopay.accounting.resultresponse.InvoiceResponseItem>>',
    }
  ]
});
