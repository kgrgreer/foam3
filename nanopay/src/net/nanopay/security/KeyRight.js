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
      class: 'Double',
      name: 'fraction',
      documentation: `The fraction of authority assigned to a public key,
      for a right. The sum of rights of authorizing keys must be greater to or equal
      to one for a transaction to execute.`
    }
  ]
});
