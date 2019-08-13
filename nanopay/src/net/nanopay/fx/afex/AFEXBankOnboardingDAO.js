foam.CLASS({
  package: 'net.nanopay.fx.afex',
  name: 'AFEXBankOnboardingDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Decorates localAccountDAO and push business to AFEX when there is a verified bank account`,

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ProxyDAO',
    'foam.nanos.logger.Logger',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
   
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      if ( !(obj instanceof BankAccount) ) {
        return getDelegate().put_(x, obj);
      }

      Logger logger = (Logger) x.get("logger");
      logger.debug(this.getClass().getSimpleName(), "put", obj);
  
      BankAccount bankAccount = (BankAccount) getDelegate().put_(x, obj);
      if ( bankAccount.getStatus() == BankAccountStatus.VERIFIED ) {
        AFEXServiceProvider afexServiceProvider = (AFEXServiceProvider) x.get("afexServiceProvider");
        new Thread(() -> afexServiceProvider.onboardBusiness(bankAccount)).start();
      }
  
      return bankAccount;

      `
    }
  ]
});