foam.CLASS({
  package: 'net.nanopay.meter.clearing',
  name: 'ClearingTime',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'Class',
      name: 'of'
    },
    {
      class: 'String',
      name: 'objId'
    },
    {
      class: 'String',
      name: 'description'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.predicate.Predicate',
      name: 'predicate',
      javaFactory: `
        return foam.mlang.MLang.FALSE;
      `
    },
    {
      class: 'Int',
      name: 'duration',
      value: 2
    }
  ]
});
