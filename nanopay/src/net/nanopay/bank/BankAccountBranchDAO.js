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
    'static foam.mlang.MLang.EQ',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.model.Branch',
    'net.nanopay.payment.Institution',
    'java.util.List'
  ],

  messages: [
    { name: 'INST_NOT_SET_ERROR_MSG', message: 'Insititution not set for BankAccount with Id: ' },
    { name: 'NO_BRANCH_ID_ERROR_MSG', message: 'No BranchId was provided for the BankAccount with Id: ' }
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
      name: 'put_',
      javaCode: `
        // no branch for digital account.
        if ( ! ( obj instanceof BankAccount ) ) {
          return super.put_(x, obj);
        }

        BankAccount bankAccount = (BankAccount) obj;

        Institution institution = bankAccount.findInstitution(x);
        Branch branch = null;
        if (bankAccount.getStatus() != BankAccountStatus.UNVERIFIED){
          branch = bankAccount.findBranch(x);
          if ( branch != null ) {
            institution = branch.findInstitution(x);
          } else {
            institution = bankAccount.findInstitution(x);
          }
        }

        if ( institution == null ) {
          //if branch isn't null, we do not have to store it again
          if ( bankAccount.getCountry() == "US" && branch == null ) {
            DAO branchDAO = (DAO) x.get("branchDAO");
            branch = (Branch) branchDAO.find(
              EQ(Branch.BRANCH_ID,bankAccount.getBranchId())
              );
            // if branch not store in branchDAO, create new one and store it
            if ( branch == null ) {
              branch = new Branch.Builder(x)
                .setBranchId(bankAccount.getBranchId())
                .build();
              branchDAO.put(branch);
            }
            bankAccount.setBranch(branch.getId());
          }
          bankAccount = (BankAccount) super.put_(x, obj);
          String message = INST_NOT_SET_ERROR_MSG + bankAccount.getId();
          // flaging the account that doesn't have an institution!
          ((Logger) x.get("logger")).error(this.getClass().getSimpleName(), message);
          return bankAccount;
        }

        if ( branch == null && ! foam.util.SafetyUtil.isEmpty(bankAccount.getBranchId()) ) {
          // add branch.
          addBranch(x, institution, bankAccount);
        }
        bankAccount = (BankAccount) super.put_(x, bankAccount);

        if ( bankAccount.findBranch(x) == null ) {
          String message = NO_BRANCH_ID_ERROR_MSG + bankAccount.getId();
          // flaging the account that doesn't have an institution!
          ((Logger) x.get("logger")).error(this.getClass().getSimpleName(), message);
        }
        return bankAccount;
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

          Branch branch = bankAccount.findBranch(x);
          if ( branch != null ) {
            bankAccount = (BankAccount) bankAccount.fclone();
            bankAccount.setBranchId(branch.getBranchId());
            return bankAccount;
          }
          getLogger().debug("Branch not found", bankAccount.getBranch(), "account", bankAccount.getId());
        }
        return fObject;
      `
    },
    {
      name: 'addBranch',
      visibility: 'protected',
      type: 'Void',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'Institution', name: 'institution' },
        { type: 'BankAccount', name: 'bankAccount' }
      ],
      javaCode: `
        ArraySink branchSink = (ArraySink) institution.getBranches(x)
          .where(EQ(
                Branch.BRANCH_ID, bankAccount.getBranchId()
          )).limit(1).select(new ArraySink());

        List branches = branchSink.getArray();

        Branch branch;

        if ( branches.size() == 0 ) {
          // create branch
          branch = createBranch(x, institution, bankAccount.getBranchId());
        } else {
          branch = (Branch) branches.get(0);
        }
        bankAccount.setBranch(branch.getId());
      `
    },
    {
      name: 'createBranch',
      visibility: 'protected',
      type: 'Branch',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'Institution', name: 'institution' },
        { type: 'String', name: 'branchId' }
      ],
      javaCode: `
        Branch newBranch = new Branch.Builder(x)
          .setBranchId(branchId)
          .setInstitution(institution.getId())
          .build();
        DAO branchDAO = (DAO) x.get("branchDAO");
        newBranch = (Branch) branchDAO.put(newBranch);

        // send notification of branch creation.
        String message = "Branch verification required for branch with id: " + newBranch.getId() +
            " and BranchId: " + newBranch.getBranchId() + " for institution with Id: " + institution.getId();

        Notification notification = new Notification.Builder(x)
            .setTemplate("NOC")
            .setBody(message)
            .build();
        ((DAO) x.get("localNotificationDAO")).put(notification);
        ((Logger) x.get("logger")).warning(this.getClass().getSimpleName(), message);
        return newBranch;
      `
    }
  ]
});
