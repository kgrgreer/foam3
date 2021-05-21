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
  package: 'net.nanopay.meter.compliance.ruler.predicate',
  name: 'BankAccountOwnerIsBusiness',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.model.Business',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        if ( ! (NEW_OBJ.f(obj) instanceof BankAccount) ) return false;
        BankAccount bankAccount = (BankAccount) NEW_OBJ.f(obj);
        Business business = (Business) ((DAO) ((X) obj).get("localBusinessDAO")).find(bankAccount.getOwner());
        return business != null 
          && ComplianceStatus.PASSED == business.getCompliance();
      `
    }
  ]
});
