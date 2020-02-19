foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'TransactionValidator',
  implements: ['foam.core.Validator'],

  methods: [
    {
      name: 'validate',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'foam.core.FObject'
        }
      ],
      javaCode: `
        ((net.nanopay.tx.model.Transaction) obj).validate(x);
      `
    },
  ]
})
