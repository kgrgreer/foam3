foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'FlinksRespMsg',

  properties: [
    {
      class: 'Int',
      name: 'httpStatus'
    },
    {
      class: 'String',
      name: 'status'
    },
    {
      class: 'String',
      name: 'errorMessage'
    },
    {
      class: 'String',
      name: 'institution'
    },
    {
      class: 'String',
      name: 'username'
    },
    {
      class: 'String',
      name: 'requestId'
    },
    {
      class: 'String',
      name: 'loginId'
    },
    {
      class: 'String',
      name: 'password',
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.flinks.model.FlinksAccount',
      name: 'accounts'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.flinks.model.SecurityChallengeModel',
      name: 'securityChallenges'
    }
  ]
})