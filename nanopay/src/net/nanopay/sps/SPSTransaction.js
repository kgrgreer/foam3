foam.CLASS({
  package: 'net.nanopay.sps',
  name: 'SPSTransaction',
  extends: 'net.nanopay.tx.model.Transaction',

  properties: [
    {
      class: 'String',
      name: 'batchId',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'itemId',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'approvalCode',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'settlementResponse',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'settleDate',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'achRequest',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'achRequestDate',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'rejectReason',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'chargebackTime',
      visibility: 'RO'
    }
  ]
});
