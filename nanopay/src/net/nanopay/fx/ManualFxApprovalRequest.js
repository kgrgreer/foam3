foam.CLASS({
  package: 'net.nanopay.fx',
  name: 'ManualFxApprovalRequest',

  documentation: 'Approval request that stores a CAD to INR FX rate',

  extends: 'net.nanopay.approval.ApprovalRequest',

  properties: [
    {
      class: 'String',
      name: 'dealId',
      visibilityExpression: function(dealId) {
        return dealId ?
          foam.u2.Visibility.RO :
          foam.u2.Visibility.HIDDEN;
      }
    },
    {
      class: 'Double',
      name: 'fxRate',
      visibilityExpression: function(fxRate) {
        return fxRate ?
          foam.u2.Visibility.RO :
          foam.u2.Visibility.HIDDEN;
      }
    },
    {
      class: 'DateTime',
      name: 'valueDate',
      visibilityExpression: function(valueDate) {
        return valueDate ?
          foam.u2.Visibility.RO :
          foam.u2.Visibility.HIDDEN;
      }
    },
    {
      class: 'DateTime',
      name: 'expiryDate',
      visibilityExpression: function(expiryDate) {
        return expiryDate ?
          foam.u2.Visibility.RO :
          foam.u2.Visibility.HIDDEN;
      }
    }
  ]
});
