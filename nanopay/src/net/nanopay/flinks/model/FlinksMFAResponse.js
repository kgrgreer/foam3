foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'FlinksMFAResponse',
  extends: 'net.nanopay.flinks.model.FlinksResponse',

  documentation: 'model for Flinks MFA response',

  properties: [
    {
      class: 'String',
      name: 'Institution'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.flinks.model.SecurityChallengeModel',
      name: 'SecurityChallenges'
    }
  ]
  
})