foam.INTERFACE({
    package: 'net.nanopay.contacts',
    name: 'PaymentCodeServiceInterface',
  
    documentation: `
      A nanoService for retrieving a PublicBusinessInfo object from a payment code
      using the getPublicBusinessInfo method.    
    `,
  
    methods: [
      {
        name: 'getPublicBusinessInfo',
        async: true,
        type: 'net.nanopay.auth.PublicBusinessInfo',
        args: [
          {
            name: 'x',
            type: 'Context'
          },
          {
            name: 'paymentCode',
            type: 'String'
          }
        ]
      }
    ]
  });
  