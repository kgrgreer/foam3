foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'FlinksAuthRequest',
  extends: 'net.nanopay.flinks.model.FlinksRequest',

  documentation: 'model for Flinks authorize request',

  properties: [
    {
      class: 'String',
      name: 'LoginId'
    },
    {
      class: 'String',
      name: 'Username',
      hidden: true
    },
    {
      class: 'String',
      name: 'Password',
      hidden: true
    },
    {
      class: 'String',
      name: 'Institution'
    },
    {
      class: 'String',
      name: 'Language'
    },
    {
      //key: MFA, value: MFA answer 
      class: 'Map',
      name: 'SecurityResponses',
      hidden: true
    },
    {
      class: 'Boolean',
      name: 'save'
    },
    {
      class: 'Boolean',
      name: 'ScheduleRefresh'
    },
    {
      class: 'Boolean',
      name: 'DirectRefresh'
    },
    {
      class: 'Boolean',
      name: 'MostRecentCached'
    },
    {
      class: 'Boolean',
      name: 'WithTransactions'
    },
    {
      class: 'Boolean',
      name: 'WithBalance'
    }
  ]
});