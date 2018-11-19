foam.CLASS({
  package: 'net.nanopay.bank',
  name: 'EnforceOneDefaultBankAccountPerCurrencyDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Checks default bank account with same currency already exists, if so, prevents creating another',

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.AbstractSink',
    'foam.core.Detachable',
    'foam.mlang.sink.Count',
    'static foam.mlang.MLang.*',

    'net.nanopay.bank.BankAccount',

    'java.util.List',
    'java.util.Iterator'
  ],

  methods: [
    {
      name: 'put_',
      args: [
        {
          name: 'x',
          of: 'foam.core.X'
        },
        {
          name: 'obj',
          of: 'foam.core.FObject'
        }
      ],
      javaReturns: 'foam.core.FObject',
      javaCode: `
      if ( ! ( obj instanceof BankAccount ) ) {
        return getDelegate().put_(x, obj);
      }
      BankAccount account = (BankAccount) obj;

      if ( getDelegate().find(account.getId()) == null ) {
        List data  = ((ArraySink) getDelegate()
          .where(
                 AND(
                     INSTANCE_OF(BankAccount.class),
                     EQ(BankAccount.OWNER, account.getOwner()),
                     EQ(BankAccount.DENOMINATION, account.getDenomination()),
                     EQ(BankAccount.IS_DEFAULT, true)
                     )
                 )
          .select(new ArraySink())).getArray();

          if ( data.size() == 0 ) {
            account.setIsDefault(true); // No default account for currency so make this default
          } else if ( data.size() > 0 && account.getIsDefault()) {
            Iterator i = data.iterator();
            while ( i.hasNext() ) {
              try {
                BankAccount d = (BankAccount) ((BankAccount) i.next()).deepClone();
                d.setIsDefault(false);
                getDelegate().put_(x, d);
              } catch ( Throwable ignored ) { }
            }
          }
      }

      return super.put_(x, obj);
      `
    }
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
public EnforceOneDefaultBankAccountPerCurrencyDAO(foam.core.X x, foam.dao.DAO delegate) {
  System.err.println("Direct constructor use is deprecated. Use Builder instead.");
  setDelegate(delegate);
}
        `);
      },
    },
  ]
});
