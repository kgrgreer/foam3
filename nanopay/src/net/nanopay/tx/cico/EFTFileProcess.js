foam.INTERFACE({
  package: 'net.nanopay.tx.cico',
  name: 'EFTFileProcess',
  methods: [
    {
      name: 'generate',
      args: [
        {
          name: 'transactions',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ]
    }
  ]
});
