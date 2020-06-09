/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

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
