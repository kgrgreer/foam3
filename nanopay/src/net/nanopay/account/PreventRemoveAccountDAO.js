foam.CLASS({
  package: 'net.nanopay.account',
  name: 'PreventRemoveAccountDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Checks if digital account has any transactions, if so, prevents account removal',

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.sink.Count',
    'net.nanopay.tx.model.Transaction',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'remove_',
      javaCode: `
    Account account = (Account) obj.fclone();
    account.setEnabled(false);
    return super.put_(x, obj);
      `
    }
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
public PreventRemoveAccountDAO(foam.core.X x, foam.dao.DAO delegate) {
  System.err.println("Direct constructor use is deprecated. Use Builder instead.");
  setDelegate(delegate);
}
        `);
      },
    },
  ]
});
