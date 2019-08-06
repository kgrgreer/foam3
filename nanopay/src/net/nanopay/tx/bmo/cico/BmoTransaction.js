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
    {
      name: 'setSettled',
      args: [
        {
          type: 'Boolean',
          name: 'settled'
        }
      ],
      type: 'void'
    },
    {
      name: 'getSettled',
      type: 'Boolean'
    }
  ]
});
