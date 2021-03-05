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
  name: 'BankAccountInstitutionDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: `
    Create an Institution if match does not exist.
    This DAO simplifies mobile bank account additions. The mobile
    UX provides for bank institution number but not institution
    lookup.  When an institution is created a NOC Notification
    is created requesting it be verified.

  `,

  javaImports: [
    'foam.core.X',
    'foam.core.FObject',
    'foam.dao.*',
    'static foam.mlang.MLang.EQ',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.Notification',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.model.Branch',
    'net.nanopay.payment.Institution',
    'net.nanopay.tx.Transfer',
    'java.util.List'
  ],

  messages: [
    { name: 'INST_VERIFICATION_MSG', message: 'Institution verification required on institution: ' },
    { name: 'CREATED_FROM_MSG', message: 'Created from BankAccount: ' }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public BankAccountInstitutionDAO(X x, DAO delegate) {
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
      name: 'put_',
      javaCode: `
        if (!(obj instanceof BankAccount)) {
          return super.put_(x, obj);
        }

        BankAccount bankAccount = (BankAccount) obj;
        Institution institution = null;
        Branch branch = null;
        if ( bankAccount.getStatus() !=  BankAccountStatus.UNVERIFIED ) {
          branch = bankAccount.findBranch(x);
          if (branch != null) {
            institution = branch.findInstitution(x);
          } else {
            institution = bankAccount.findInstitution(x);
          }
        }
        if (institution == null && !foam.util.SafetyUtil.isEmpty(bankAccount.getInstitutionNumber())) {
          DAO institutionDAO = (DAO) x.get("institutionDAO");
          List institutions = ((ArraySink) institutionDAO
            .where(
              EQ(Institution.INSTITUTION_NUMBER, bankAccount.getInstitutionNumber())
            )
            .select(new ArraySink())).getArray();

          if (institutions.size() == 0) {
            institution = new Institution();
            institution.setName(bankAccount.getInstitutionNumber());
            institution.setInstitutionNumber(bankAccount.getInstitutionNumber());
            institution = (Institution) institutionDAO.put(institution);
          } else {
            institution = (Institution) institutions.get(0);
          }
          bankAccount.setInstitution(institution.getId());
          bankAccount = (BankAccount) getDelegate().put_(x, bankAccount);

          if (institutions.size() == 0) {
            StringBuilder sb = new StringBuilder();
            sb.append(INST_VERIFICATION_MSG);
            sb.append(institution.getId());
            sb.append(System.getProperty("line.separator"));
            sb.append(CREATED_FROM_MSG);
            sb.append(bankAccount.getId());
            String message = sb.toString();

            Notification notification = new Notification.Builder(x)
              .setTemplate("NOC")
              .setBody(message)
              .build();
            new Transfer.Builder(x).build();
            ((DAO) x.get("localNotificationDAO")).put(notification);
            getLogger().warning(message);
          } else if (institutions.size() > 1) {
            String message = "Multiple Institutions found for institutionNumber: " + bankAccount.getInstitution() + ". Using " + institution.getId() + " on BankAccount: " + bankAccount.getId();
            Notification notification = new Notification.Builder(x)
              .setTemplate("NOC")
              .setBody(message)
              .build();
            ((DAO) x.get("localNotificationDAO")).put(notification);
            getLogger().warning( message);
          }
          return bankAccount;
        } else {
          return getDelegate().put_(x, obj);
        }
      `
    },
    {
      name: 'find_',
      javaCode: `
        FObject fObject = this.getDelegate().find_(x, id);

        if ( fObject == null ) {
          return fObject;
        }

        if (fObject instanceof BankAccount) {
          BankAccount bankAccount = (BankAccount) fObject;
          Branch branch =  bankAccount.findBranch(x);
          if ( branch != null ) {
            Institution institution = branch.findInstitution(x);
            if (institution != null) {
              bankAccount = (BankAccount) bankAccount.fclone();
              bankAccount.setInstitutionNumber(institution.getInstitutionNumber());
              return bankAccount;
            }
            getLogger().debug("Institution not found", branch.getInstitution(), "account", bankAccount.getId());
          } else {
            getLogger().debug("Branch not found", bankAccount.getBranch(), "account", bankAccount.getId());
          }
        }
        return fObject;
      `
    }
  ]
});
