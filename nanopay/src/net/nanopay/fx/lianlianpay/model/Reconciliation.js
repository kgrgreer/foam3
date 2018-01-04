foam.CLASS({
  package: 'net.nanopay.fx.lianlianpay.model',
  name: 'Reconciliation',

  documentation: 'Represents a reconciliation',

  properties: [
    {
      class: 'String',
      name: 'accountingDate',
      documentation: 'Accounting date, format is YYYMMDD'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.fx.lianlianpay.model.ReconciliationRecord',
      name: 'reconciliationRecords',
      documentation: 'Array of reconciliation records'
    }
  ]
});