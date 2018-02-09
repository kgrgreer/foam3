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
      name: 'targetCountrySubDivision',
      required: true
    }
  ]
});

foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.fx.interac.model.Corridor',
  targetModel: 'net.nanopay.model.Currency',
  forwardName: 'currencies',
  inverseName: 'corridors',
  cardinality: '1:*',
  targetProperty: {
    hidden: true
  }
});

foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.fx.interac.model.Corridor',
  targetModel: 'net.nanopay.fx.interac.model.PayoutOptions',
  forwardName: 'payoutOptions',
  inverseName: 'corridors',
  cardinality: '1:*'
});
