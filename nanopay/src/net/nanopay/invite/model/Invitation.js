foam.CLASS({
  package: 'net.nanopay.invite.model',
  name: 'Invitation',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.invite.model.InvitationStatus',
      name: 'inviteStatus'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.invite.model.ComplianceStatus',
      name: 'complianceStatus'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'user'
    },
    {
      class: 'FObjectArray',
      of: 'foam.nanos.auth.User',
      name: 'principalOwners'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.invite.model.Questionnaire',
      name: 'questionnaire'
    },
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'additionalDocuments',
      documentation: 'Additional documents for compliance verification'
    }
  ]
});
