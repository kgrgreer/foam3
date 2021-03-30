/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
  package: 'net.nanopay.account',
  name: 'SetBankAccountOnContact',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.ContextAwareAgent',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.contacts.PersonalContact'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        User owner = ((Account) obj).findOwner(x);
        BankAccount bankAcc = (BankAccount) obj;
        if ( ! ( owner instanceof PersonalContact ) ) return;

        PersonalContact contact = (PersonalContact) owner.fclone();
        if ( ! (  SafetyUtil.isEmpty(contact.getBankAccount()) ) ) return;

        agency.submit(x, new ContextAwareAgent() {
          @Override
          public void execute(X x) {
            contact.setBankAccount(((Account) obj).getId());
            ((DAO) x.get("localContactDAO")).put(contact);
          }
        }, "Update contact's, bank account");
      `
    }
  ]
});
