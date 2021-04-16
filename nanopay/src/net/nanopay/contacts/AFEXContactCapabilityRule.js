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
  package: 'net.nanopay.contacts',
  name: 'AFEXContactCapabilityRule',

  documentation: `When a contact is created which requires additional information to onboard to AFEX,
    this rule will add the required capability to it.`,

  implements: [
      'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
      'foam.dao.DAO',
      'foam.nanos.crunch.Capability',
      'foam.nanos.crunch.CapabilityIntercept',
      'foam.util.SafetyUtil',
      'net.nanopay.bank.BankAccount',

      'static foam.mlang.MLang.*',
  ],

  constants: [
      {
          name: 'CN_CAPABILITY',
          type: 'String',
          value: 'contact.capable.afex.cn',
          documentation: `
            The user requires this capability to onboard a CNY beneficiary to AFEX.
          `
      }
  ],

  methods: [
      {
          name: 'applyAction',
          javaCode: `
          // covers both Contact and PersonalContact
          var contact = (PersonalContact) obj;
          
          BankAccount account = (BankAccount) contact.findBankAccount(x);
          if ( ! account.getDenomination().equals("CNY") ) {
            return;
          }

          String[] capabilityIds = contact.getCapabilityIds();
          for ( String cap: capabilityIds ) {
            if ( CN_CAPABILITY.equals(cap) ) {
              return;
            }
          }

          contact.addRequirement(x, CN_CAPABILITY);
          var cre = new CapabilityIntercept();
          cre.addCapable(contact);
          cre.setDaoKey("contactDAO");
          throw cre;
          `
      }
  ]
});
