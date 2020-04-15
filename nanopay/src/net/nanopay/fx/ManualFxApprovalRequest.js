foam.CLASS({
  package: 'net.nanopay.fx',
  name: 'ManualFxApprovalRequest',

  documentation: 'Approval request that stores a CAD to INR FX rate',

  extends: 'foam.nanos.approval.ApprovalRequest',

  properties: [
    {
      class: 'String',
      name: 'dealId'
    },
    {
      class: 'Double',
      name: 'fxRate'
    },
    {
      class: 'DateTime',
      name: 'valueDate',
      visibility: function(valueDate) {
        return valueDate ?
          foam.u2.DisplayMode.RO :
          foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      class: 'DateTime',
      name: 'expiryDate',
      visibility: function(expiryDate) {
        return expiryDate ?
          foam.u2.DisplayMode.RO :
          foam.u2.DisplayMode.HIDDEN;
      }
    }
  ]
});
