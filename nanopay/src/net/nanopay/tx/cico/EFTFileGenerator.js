foam.INTERFACE({
  package: 'net.nanopay.tx.cico',
  name: 'EFTFileGenerator',

  javaImports: [
    'java.util.List'
  ],

  methods: [
    {
      name: 'generate',
      type: 'net.nanopay.tx.cico.EFTFile',
      args: [
        {
          name: 'transactions',
          javaType: 'List<net.nanopay.tx.model.Transaction>',
        }
      ]
    }
  ]
});