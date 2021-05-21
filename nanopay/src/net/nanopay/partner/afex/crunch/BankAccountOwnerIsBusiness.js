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
  package: 'net.nanopay.partner.afex.crunch',
  name: 'BankAccountOwnerIsBusiness',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.Subject',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityCategory',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.CrunchService',
    'java.util.List',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.model.Business',
    'static foam.mlang.MLang.NEW_OBJ'
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        X x = (X) obj;
        if ( ! (NEW_OBJ.f(obj) instanceof BankAccount) ) return false;
        BankAccount bankAccount = (BankAccount) NEW_OBJ.f(obj);
        Business business = (Business) ((DAO) x.get("localBusinessDAO")).find(bankAccount.getOwner());
        if ( business == null ) return false;
        
        DAO capabilityCategoryDAO = (DAO) x.get("capabilityCategoryDAO");
        CapabilityCategory afexOnboarding = (CapabilityCategory) capabilityCategoryDAO.find("AFEXOnboarding");
        if ( afexOnboarding == null ) return false;
        List<Capability> afexOnboardingCapabilities = (List<Capability>) ( (ArraySink) ( (DAO) afexOnboarding
          .getCapabilities(x)
          .getDAO())
          .select(new ArraySink()))
          .getArray();
        
        CrunchService crunchService = (CrunchService) x.get("crunchService");
        Subject businessSubject = new Subject(business);
        for ( Capability capability : afexOnboardingCapabilities ) {
          if ( crunchService.getJunctionForSubject(x, capability.getId(), businessSubject).getStatus() == CapabilityJunctionStatus.GRANTED ) 
            return true;
        }
        return false;
      `
    }
  ]
});
