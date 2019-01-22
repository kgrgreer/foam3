foam.INTERFACE({
  package: 'net.nanopay.fx.ascendantfx',
  name: 'AscendantFXReportsService',

  methods: [
    {
      name: 'downloadReports',
      javaReturns: 'void',
      // javaThrows: ['java.io.IOException'],
      args: [
        // {
        //   name: 'x',
        //   javaType: 'foam.core.X'
        // },
        {
          name: 'id',
          class: 'Long'
        }
      ]
    }
  ]
});
