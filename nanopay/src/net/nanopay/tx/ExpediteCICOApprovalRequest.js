foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'ExpediteCICOApprovalRequest',
  extends: 'net.nanopay.approval.ApprovalRequest',

  documentation: 'Approval request subclass for expediting cico transactions',

  properties: [
    {
      name: 'classification',
      value: 'Expedite transaction',
      visibilityExpression: function(classification) {
        return classification ?
          foam.u2.Visibility.RO :
          foam.u2.Visibility.HIDDEN;
      }
    },
    {
      name: 'daoKey',
      value: 'localTransactionDAO',
      visibilityExpression: function(daoKey) {
        return daoKey ?
          foam.u2.Visibility.RO :
          foam.u2.Visibility.HIDDEN;
      }
    }
  ]
});
