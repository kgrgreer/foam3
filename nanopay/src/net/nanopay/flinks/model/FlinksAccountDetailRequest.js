foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'FlinksAccountDetailRequest',
  extends: 'net.nanopay.flinks.model.FlinksAccountRequest',

  documentation: 'model for Flinks Account Detail Request',

  properties: [
    {
      class: 'Boolean',
      name: 'WithAccountIdentity'
    },
    {
      class: 'String',
      name: 'DateFrom'
    },
    {
      class: 'String',
      name: 'DateTo'
    },
    {
      class: 'StringArray',
      name: 'AccountsFilter'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.flinks.model.RefreshDeltaModel',
      name: 'RefreshDelta'
    },
    {
      class: 'String',
      name: 'DaysOfTransactions'
    }
  ]
});