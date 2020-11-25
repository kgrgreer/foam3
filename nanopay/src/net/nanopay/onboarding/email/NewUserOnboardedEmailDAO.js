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
  package: 'net.nanopay.onboarding.email',
  name: 'NewUserOnboardedEmailDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Decorating DAO for sending email notification to enrollment-team@nanopay.net
      when user has finished the onboarding process (BusinessRegistrationWizard). 
      If user has passed the business registration we are also checking if the user has a bank account. 
      If so that fact is also included in this email.`,

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.email.EmailMessage',
    'foam.util.Emails.EmailsUtility',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.model.Business',
    'java.util.HashMap',
    'java.util.List',
    'java.util.Map'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        Business newUser = (Business) obj;
        Business oldUser = (Business) getDelegate().inX(x).find(newUser.getId());

        // Send email only when user property onboarded is changed from false to true
        if ( oldUser != null && ! oldUser.getOnboarded() && newUser.getOnboarded() ) {
          EmailMessage message = new EmailMessage();
          Map<String, Object>  args = new HashMap<>();

          args.put("subTitle1", "User(Account Owner) information: ONBOARDED");
          args.put("userId", newUser.getId());
          args.put("userEmail", newUser.getEmail());
          args.put("userCo", newUser.getOrganization());

          // For the purpose of sending an email once both onboarding and bank account added
          List accountsArray = ((ArraySink) newUser.getAccounts(x).where(
            MLang.AND(
              MLang.INSTANCE_OF(BankAccount.class),
              MLang.EQ(BankAccount.STATUS, BankAccountStatus.VERIFIED),
              MLang.EQ(BankAccount.LIFECYCLE_STATE, LifecycleState.ACTIVE)
            ))
            .limit(1).select(new ArraySink())).getArray();

          Boolean doesAccExist = (accountsArray != null && accountsArray.size() != 0);

          // checking if account has been added
          if ( doesAccExist ) {
            Account acc = (Account) accountsArray.get(0);
            // User also has bankAccount, thus add bank fields to email
            args.put("title", "User has Onboarded & previously added an Account");
            args.put("subTitle2", "BankAccount Information:");
            args.put("accDen", acc.getDenomination());
            args.put("accName", acc.getName());
            args.put("accId", acc.getId());
          } else {
            args.put("title", "User has Onboarded");
            args.put("subTitle2", "NO BankAccount Information:");
            args.put("accDen", "n/a");
            args.put("accName", "n/a");
            args.put("accId", "n/a");
          }
          
          try {
            EmailsUtility.sendEmailFromTemplate(x, newUser, message, "notification-to-onboarding-team", args);
          } catch (Throwable t) {
            String msg = String.format("Email meant for complaince team Error: Business (id = %1$s) has finished onboarding.", newUser.getId());
            ((Logger) x.get("logger")).error(msg, t);
          }
        }

        return getDelegate().inX(x).put(obj);
      `
    }
  ]
});
