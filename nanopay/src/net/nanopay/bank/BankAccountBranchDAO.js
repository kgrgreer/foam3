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
  package: 'net.nanopay.bank',
  name: 'BankAccountBranchDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: `
Remains for backward compatibility for Accounts created before InstitutionNumber and BranchId were none storageTransient.

previously:
    Create an Institution if match does not exist.
    This DAO simplifies mobile bank account additions. The mobile
    UX provides for bank institution number but not institution
    lookup.  When an institution is created a NOC Notification
    is created requesting it be verified.
  `,

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.Notification',
    'foam.util.SafetyUtil',
    'static foam.mlang.MLang.EQ',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.model.Branch',
    'net.nanopay.payment.Institution',
    'java.util.List'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public BankAccountBranchDAO(X x, DAO delegate) {
            setX(x);
            setDelegate(delegate);
          }
        `
        );
      }
    }
  ],

  properties: [
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      javaFactory: `
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, (Logger) getX().get("logger"));
      `
    }
  ],

  methods: [
    {
      name: 'find_',
      javaCode: `
        FObject fObject = this.getDelegate().find_(x, id);

        if ( fObject == null ) {
          return fObject;
        }

        if (fObject instanceof BankAccount) {
          BankAccount bankAccount = (BankAccount) fObject;

          Branch branch = bankAccount.findBranch(x);
          if ( branch != null ) {
            bankAccount = (BankAccount) bankAccount.fclone();
            bankAccount.setBranchId(branch.getBranchId());
            return bankAccount;
          }
          // getLogger().debug("Branch not found", bankAccount.getBranch(), "account", bankAccount.getId());
        }
        return fObject;
      `
    }
  ]
});
