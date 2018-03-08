foam.CLASS({
  package: 'net.nanopay.invite.model',
  name: 'BusinessInvitation',
  extends: 'net.nanopay.invite.model.Invitation',

  properties: [
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