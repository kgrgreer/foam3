foam.CLASS({
  refines: 'foam.nanos.auth.User',

  documentation: `Find the a DigitalAccount of the requested currency,
else create one.`,

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.account.DigitalAccountService',
    'foam.core.FObject',
    'foam.nanos.logger.Logger',
  ],

  imports: [
    'digitalAccount'
  ],

  requires: [
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
  ],

  methods: [
    {
      // TODO:  synchronize with threadLocal
      name: 'findDigitalAccount',
      args: [
        {
          name: 'x',
          of: 'foam.core.X'
        },
        {
          name: 'currency',
          of: 'String'
        }
      ],
      code: function findDigitalAccount(x, currency) {
        currency = currency || 'CAD';
        return new Promise(function(resolve, reject) {
          console.log('findDigitalAccount');
          this.digitalAccount.getDefault(currency)
            .then(function(account) {
              if ( account != null ) {
                resolve(account);
              } else {
                console.error('findDigitalAccount', 'NOT FOUND');
                resolve(null);
              }
            });
        }.bind(this));
      },
      javaReturns: 'net.nanopay.account.DigitalAccount',
      javaCode: `
        Logger logger = (Logger) x.get("logger");
        logger.info("User.findDigitalAccount");
        DigitalAccountService service = (DigitalAccountService) x.get("digitalAccount");
        DigitalAccount account = service.getDefault(currency);
        return account;
`
    }
  ]
});
