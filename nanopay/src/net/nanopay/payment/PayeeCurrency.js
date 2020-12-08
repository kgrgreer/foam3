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
  package: 'net.nanopay.payment',
  name: 'PayeeCurrency',

  implements: [
    'net.nanopay.payment.PayeeCurrencyService'
  ],

  javaImports: [
    'foam.core.Detachable',
    'foam.dao.AbstractSink',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'java.util.ArrayList',
    'java.util.List',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.contacts.Contact',
    'net.nanopay.model.Business',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.INSTANCE_OF',
    'static foam.mlang.MLang.OR',
    'foam.util.SafetyUtil'
  ],

  methods: [
    {
      name: 'query',
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();
        List<Contact> contacts = ((ArraySink) user.getContacts(x).select(new ArraySink())).getArray();
        List<String> currencies = new ArrayList<>();
        for ( Contact contact: contacts ) {
          currencies.addAll(getDenominations(x, contact));
        }
        return currencies;
      `
    },
    {
      name: 'queryContact',
      javaCode: `
        DAO contactDAO = (DAO) x.get("contactDAO");
        Contact contact = (Contact) contactDAO.find(contactId);
        return getDenominations(x, contact);
      `
    },
    {
      name: 'getDenominations',
      type: 'List',
      args: [
        {
          type: 'Context',
          name: 'x'
        },
        {
          type: 'net.nanopay.contacts.Contact',
          name: 'contact'
        }
      ],
      javaCode: `
        List<String> currencies = new ArrayList<>();
        if ( contact.getBusinessId() == 0 && ! SafetyUtil.isEmpty(contact.getBankAccount()) ) {
          BankAccount account = (BankAccount) contact.findBankAccount(x);
          currencies.add(account.getDenomination());
        }
        if ( contact.getBusinessId() != 0 ) {
          Business business = (Business) contact.findBusinessId(x);
          business.getAccounts(getX())
          .where(
            AND(
              INSTANCE_OF(BankAccount.class),
              EQ(BankAccount.STATUS, BankAccountStatus.VERIFIED),
              EQ(BankAccount.LIFECYCLE_STATE, LifecycleState.ACTIVE)
            ))
          .select(new AbstractSink() {
            @Override
            public void put(Object obj, Detachable sub) {
              var bankAccount = (BankAccount) obj;
              currencies.add(bankAccount.getDenomination());
            }
          });
        }
        return currencies;
      `
    }
  ]
});
