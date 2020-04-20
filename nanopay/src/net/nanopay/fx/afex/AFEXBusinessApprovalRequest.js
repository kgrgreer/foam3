foam.CLASS({
  package: 'net.nanopay.fx.afex',
  name: 'AFEXBusinessApprovalRequest',

  documentation: 'Approval request to allow 5minutes delay in AFEX Client Onboarding',

  extends: 'foam.nanos.approval.ApprovalRequest',

  properties: [
    {
      class: 'String',
      name: 'afexBusinessId',
      visibility: function(afexBusinessId) {
        return afexBusinessId ?
          foam.u2.DisplayMode.RO :
          foam.u2.DisplayMode.HIDDEN;
      }
    }
  ]
});
