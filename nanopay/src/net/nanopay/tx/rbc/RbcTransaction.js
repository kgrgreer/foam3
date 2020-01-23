foam.INTERFACE({
  package: 'net.nanopay.tx.rbc',
  name: 'RbcTransaction',

  methods: [
    {
      name: 'setRbcReferenceNumber',
      type: 'void',
      args: [
        {
          type: 'String',
          name: 'referenceNumber',
        },
      ]
    },
    {
      name: 'getRbcReferenceNumber',
      type: 'String'
    },
    {
      name: 'setRbcFileCreationNumber',
      type: 'void',
      args: [
        {
          class: 'Long',
          name: 'referenceNumber',
        },
      ]
    },
    {
      name: 'getRbcFileCreationNumber',
      type: 'Long',
      javaType: 'long'
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
