foam.ENUM({
  package: 'net.nanopay.tx',
  name: 'OriginatingSource',

  documentation: 'Originating source, shows where the object object originated from, and how it was created',

  values: [
    {
      name: 'MANUAL',
      label: 'Manual Entry',
      documentation: 'Transactions entered manually',
      ordinal: 0
    },
    {
      name: 'SYSTEM',
      label: 'System Generated',
      documentation: 'Transactions auto created by the system',
      ordinal: 1
    },
    {
      name: 'LIQUIDITY',
      label: 'Liquidity Service',
      documentation: 'Transactions created by the liquidity service',
      ordinal: 2
    },
    {
      name: 'UPLOAD',
      label: 'File Upload',
      documentation: 'Transactions created through File Upload',
      ordinal: 3
    },
    {
      name: 'NONE',
      label: 'None Assigned',
      documentation: 'Default. Unassigned value.',
      ordinal: 4
    }
  ]
});
