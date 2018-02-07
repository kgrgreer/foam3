foam.CLASS({
  package: 'net.nanopay.fx.interac.model',
  name: 'Corridor',
  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      name: 'sourceCountry',
      required: true
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      name: 'targetCountry',
      required: true
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Region',
      name: 'region',
      required: true
    },
    {
      class: 'StringArray',
      name: 'currencies',
      required: true
    },
    {
      class: 'Reference',
      of: 'net.nanopay.fx.interac.model.PayoutOptions',
      name: 'payoutOptions'
    }
  ]
});
