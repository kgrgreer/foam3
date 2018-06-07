foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'TransactionPurpose',
  documentation: 'Purpose of the transaction',
  // relationships: Processor
  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'String',
      name: 'purposeCode',
      required: true
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      name: 'country',
      documentation: 'If the format type is "Proprietary", assign it to the country it belongs to'
    },
    {
      class: 'String',
      name: 'formatType',
      documentation: 'Determines if ISO20022 or proprietary',
      required: true
    },
    {
      class: 'String',
      name: 'classificationName'
    },
    {
      class: 'String',
      name: 'classificationNumber'
    },
    {
      class: 'String',
      name: 'description',
      required: true,
      swiftName: 'desc'
    },
    {
      class: 'Boolean',
      name: 'isB2B',
      required: true,
      factory: function() {
        return true;
      }
    },
    {
      class: 'Boolean',
      name: 'isP2P',
      required: true,
      factory: function() {
        return true;
      }
    },
    {
      documentation: 'Should this purpose code be sent to Interac?',
      class: 'Boolean',
      name: 'interacApplicable',
      value: false
    },
  ]
});
