foam.CLASS({
  package: 'net.nanopay.security',
  name: 'KeyRight',

  documentation: `Modelled class for storing rights associated with an action,
    e.g. a transaction`,

  properties: [
    {
      class: 'String',
      name: 'label',
      documentation: 'An arbitrary string that is used to identify this right.'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.security.RightCondition',
      name: 'conditions',
      documentation: `A set of conditions that must pass before the right can be
        excercised.`
    },
    {
      class: 'Int',
      name: 'fraction',
      documentation: `The threshold that must be reached before the right can be
        excercised. Useful for multi-party transactions.`
    }
  ]
});

foam.RELATIONSHIP({
  package: 'net.nanopay.security',
  sourceModel: 'net.nanopay.security.PublicKeyEntry',
  targetModel: 'net.nanopay.security.KeyRight',
  forwardName: 'conditions',
  inverseName: 'keyRight',
  cardinality: '1:*',
});
