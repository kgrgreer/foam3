foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'FlinksMFAResponse',
  extends: 'net.nanopay.flinks.model.FlinksResponse',

  documentation: 'model for Flinks MFA response',

  javaImports: [
    'net.nanopay.flinks.model.SecurityChallengeModel'
  ],

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
  ],

  methods: [
    {
      name: 'validate',
      type: 'Void',
      javaThrows: [ 'java.lang.Exception' ],
      javaCode: `
        for (SecurityChallengeModel challenge : getSecurityChallenges()) {
          challenge.validate();
        }
      `
    }
  ]
  
})
