foam.INTERFACE({
  package: 'net.nanopay.tx.bmo.cico',
  name: 'BmoTransaction',

  methods: [
    {
      name: 'addHistory',
      type: 'void',
      args: [
        {
          type: 'String',
          name: 'history',
        },
      ]
    },
    {
      name: 'getPotentiallyUndelivered',
      type: 'Boolean'
    },
    {
      name: 'setPotentiallyUndelivered',
      type: 'void',
      args: [
        {
          type: 'Boolean',
          name: 'potentiallyUndelivered',
        },
      ]
    },
    {
      name: 'setBmoReferenceNumber',
      type: 'void',
      args: [
        {
          type: 'String',
          name: 'referenceNumber',
        },
      ]
    },
    {
      name: 'getBmoReferenceNumber',
      type: 'String'
    },
    {
      name: 'setBmoFileCreationNumber',
      type: 'void',
      args: [
        {
          class: 'Int',
          name: 'referenceNumber',
        },
      ]
    },
    {
      name: 'getBmoFileCreationNumber',
      type: 'Int',
      javaType: 'int'
    },
    {
      name: 'setRejectReason',
      args: [
        {
          type: 'String',
          name: 'rejectReason'
        }
      ],
      type: 'void'
    },
    {
      name: 'getRejectReason',
      type: 'String',
    },
  ]
});
