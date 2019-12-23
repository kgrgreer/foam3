foam.INTERFACE({
  package: 'net.nanopay.liquidity.ucjQuery',
  name: 'AccountUcjQueryService',
  methods: [
      {
          name: 'getFXRate',
          type: 'foam.dao.DAO',
          async: true,
          javaThrows: ['java.lang.RuntimeException'],
          args: [
              {
                  name: 'sourceCurrency',
                  type: 'String'
              },
              {
                  name: 'targetCurrency',
                  type: 'String'
              },
              {
                  name: 'sourceAmount',
                  type: 'Long'
              },
              {
                  name: 'destinationAmount',
                  type: 'Long'
              },
              {
                  type: 'String',
                  name: 'fxDirection',
              },
              {
                  name: 'valueDate',
                  type: 'String'// TODO: investigate why java.util.dat can't be used here
              },
              {
                type: 'Long',
                name: 'user'
              },
              {
                type: 'String',
                name: 'fxProvider'
              }
          ]
      },
      {
          name: 'acceptFXRate',
          type: 'Boolean',
          async: true,
          javaThrows: ['java.lang.RuntimeException'],
          args: [
              {
                  name: 'quoteId',
                  type: 'String'
              },
              {
                type: 'Long',
                name: 'user'
              }
          ]
      }
  ]
});