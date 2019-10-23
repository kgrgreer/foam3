foam.CLASS({
  package: 'net.nanopay.fx',
  name: 'Corridor',

  documentation: 'Agreement between two countries' +
      ' permitting specified currencies & payout options.',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      name: 'sourceCountry',
      documentation: '1st party involved in agreement.',
      required: true
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      name: 'targetCountry',
      documentation: '2nd party involved in agreement.',
      required: true
    },
    {
      class: 'StringArray',
      name: 'currencies',
      documentation: 'Agreed upon currencies.'
    },
    // {
    //   class: 'StringArray',
    //   name: 'payoutOptions',
    //   documentation: 'Agreed upon payout options.'
    // }
  ]
});

// NOTE: Commented out until relationships are supported on DIG
// foam.RELATIONSHIP({
//   sourceModel: 'net.nanopay.fx.interac.model.Corridor',
//   targetModel: 'net.nanopay.exchangeable.Currency',
//   forwardName: 'currencies',
//   inverseName: 'corridors',
//   cardinality: '1:*',
//   targetProperty: {
//     hidden: true
//   }
// });
//
// foam.RELATIONSHIP({
//   sourceModel: 'net.nanopay.fx.interac.model.Corridor',
//   targetModel: 'net.nanopay.fx.interac.model.PayoutOptions',
//   forwardName: 'payoutOptions',
//   inverseName: 'corridors',
//   cardinality: '1:*',
//   targetProperty: {
//     hidden: true
//   }
// });
