foam.CLASS({
  package: 'net.nanopay.fx',
  name: 'ManualFxApprovalRequest',

   documentation: 'Approval request that stores a CAD to INR FX rate',

   extends: 'net.nanopay.approval.ApprovalRequest',

   properties: [
    {
      class: 'Double',
      name: 'rate'
    }
  ]
});
