foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'ExpediteCICOApprovalRequest',
  extends: 'net.nanopay.approval.ApprovalRequest',

  documentation: 'Approval request subclass for expediting cico transactions',

  properties: [
    {
      name: 'classification',
      value: 'Validate Transaction for modifying status'
    },
    {
      name: 'daoKey',
      value: 'localTransactionDAO'
    }
  ]
});
