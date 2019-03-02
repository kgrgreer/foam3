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
      documentation: `A set of conditions that must all pass before the right can be
        excercised.`
    },
    {
      class: 'Int',
      name: 'fraction',
      documentation: `The fraction of authority assigned to a public key,
      for a right. This number should lie in the range of [0,100], and represent
      the percentage of authority assigned to the associated key for 
      a KeyRight. The sum of rights of authorizing keys must be greater to or equal
      to one hundred for a right to be assigned. In the case authorisation is required
      from a single key, this number should be 100.`
    }
  ]
});
