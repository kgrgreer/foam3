foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'ExpediteCICOApprovalRequest',
  extends: 'foam.nanos.approval.ApprovalRequest',

  documentation: 'Approval request subclass for expediting cico transactions',

  properties: [
    {
      name: 'classification',
      value: 'Expedite transaction',
      visibility: function(classification) {
        return classification ?
          foam.u2.DisplayMode.RO :
          foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      name: 'daoKey',
      value: 'localTransactionDAO',
      visibility: function(daoKey) {
        return daoKey ?
          foam.u2.DisplayMode.RO :
          foam.u2.DisplayMode.HIDDEN;
      }
    }
  ]
});
