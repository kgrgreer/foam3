foam.CLASS({
  package: 'net.nanopay.sps',
  name: 'SPSTransaction',
  extends: 'net.nanopay.tx.model.Transaction',

  properties: [
    {
      class: 'String',
      name: 'batchId',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'itemId',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'approvalCode',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'settlementResponse',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'settleDate',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'achRequest',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'achRequestDate',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'rejectReason',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'chargebackTime',
      visibility: foam.u2.Visibility.RO
    }
  ]
});
