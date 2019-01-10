foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'AccountModel',

  documentation: 'model for Flinks account model',

  imports: [ 'bankAccountDAO' ],

  javaImports: [
    'foam.dao.DAO',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.CABankAccount',
    'java.util.Random'
  ],

  properties: [
    {
      class: 'String',
      name: 'Title'
    },
    {
      class: 'String',
      name: 'AccountNumber'
    },
    {
      class: 'String',
      name: 'Category'
    },
    {
      class: 'String',
      name: 'Currency'
    },
    {
      class: 'String',
      name: 'Id'
    },
    //maybe dangerous if property=null or property={}
    {
      // type: 'net.nanopay.flinks.model.BalanceModel',
      // javaInfoType: 'foam.core.AbstractFObjectPropertyInfo',
      // javaJSONParser: 'new foam.lib.json.FObjectParser(net.nanopay.flinks.model.BalanceModel.class)',
      class: 'FObjectProperty',
      of: 'net.nanopay.flinks.model.BalanceModel',
      name: 'Balance'
    }
  ],

  methods: [
    {
      name: 'generateBankAccount',
      type: 'net.nanopay.bank.BankAccount',
      javaCode:
        `DAO accountDAO = (DAO) getX().get("accountDAO");
        BankAccount account = new CABankAccount();
        account.setX(getX());
        account.setAccountNumber(getAccountNumber());
        account.setDenomination(getCurrency());
        account.setName(getTitle());
        try {
          account = (CABankAccount) accountDAO.put(account);
        } catch ( Throwable t ) {
          System.out.println("bank account same name");
        }
        return account;
        `
    }
  ]
});
