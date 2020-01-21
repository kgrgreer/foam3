foam.CLASS({
  package: 'net.nanopay.fx.afex',
  name: 'AFEXBusinessApprovalRequest',

  documentation: 'Approval request to allow 5minutes delay in AFEX Client Onboarding',

  extends: 'net.nanopay.approval.ApprovalRequest',

  properties: [
    {
      class: 'String',
      name: 'afexBusinessId',
      visibilityExpression: function(afexBusinessId) {
        return afexBusinessId ?
          foam.u2.Visibility.RO :
          foam.u2.Visibility.HIDDEN;
      }
    }
  ]
});
