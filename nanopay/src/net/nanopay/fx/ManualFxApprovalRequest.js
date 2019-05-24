foam.CLASS({
  package: 'net.nanopay.fx',
  name: 'ManualFxApprovalRequest',

  documentation: 'Approval request that stores a CAD to INR FX rate',

  extends: 'net.nanopay.approval.ApprovalRequest',

  properties: [
    {
      class: 'String',
      name: 'dealId'
    },
    {
      class: 'Double',
      name: 'rate'
    },
    {
      class: 'DateTime',
      name: 'valueDate'
    },
    {
      class: 'DateTime',
      name: 'expiryDate'
    }
  ]
});
