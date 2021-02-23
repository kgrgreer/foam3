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
  package: 'net.nanopay.account',
  name: 'AbliiBankAccountAutoverifyDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.BRBankAccount',
    'net.nanopay.contacts.PersonalContact'
  ],

  constants: [
    {
      name: 'FLINKS_INSTITUTION_ID',
      type: 'int',
      value: 16 // this should change later once we add more bank verification clients to ablii
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public AbliiBankAccountAutoverifyDAO(DAO delegate) {
            setDelegate(delegate);
          }
        
          public AbliiBankAccountAutoverifyDAO(X x, DAO delegate) {
            setX(x);
            setDelegate(delegate);
          }   
        `
        );
      }
    }
  ],

  methods: [
    // we only need a put_ override in this decorator, since it only deals with the CREATION of contact bank accounts
    {
      name: 'put_',
      javaCode: `
      /**
       * 1. CONTACT BANK ACCOUNTS
       * In order to check if obj entails a Contact's bank account being added
       * We will first check if the userId is different from the bankAccountOwnerId
       * If it is then we can proceed to check if the bankAccountOwner is of type Contact
       * If the above mentioned checks pass, then we can set the "status" property of obj to VERIFIED
       * We do this because, we want ablii users to be able to send money to whomever they want so long
       * as they have their bank account information and email address
       * NOTE: If someone who has been added as a contact decides to create an ablii account,
       * this autoverified bank account WILL NOT CARRY OVER to their ablii account, as they will have to still set up an
       * account and verify it using the micro-deposit even if they are using the same bank information
       * Contact Bank Accounts are exlusively meant to just RECEIVE money from ablii users
       *
       * 2. FOR FLINKS BANK ACCOUNTS AND BRAZIL BANK ACCOUNTS
       * NOTE: MIGHT WANT TO INCLUDE THIS IN THE FUTURE FOR INSTITUTIONS IDS BETWEEN 1 to 23 SINCE THESE WILL ALL REQUIRE TO LOGIN VIA THE CLIENT
       * Since flinks bank accounts are being verified by logging in from the client,
       * we can automatically verify these bank accounts when passing them through this decorator
       */

      User user = ((Subject) x.get("subject")).getUser();
      long userId = user.getId();

      // since the bank account details are included in obj, we can grab the ownerId of the bank account
      // in the case of a contact bank account, the contact should be the OWNER of the bank account
      Account bankAccountObj = (Account) obj;
      long bankAccountOwnerId = bankAccountObj.getOwner();

      // 1. CONTACT BANK ACCOUNTS
      if ( userId != bankAccountOwnerId ) {

        // grabbing the bankAccountOwner object directly from the userDAO by looking up the bankAccountOwnerId
        // no need to typecast the bankAccountOwner to User since we just need to check if it is an instanceof Contact
        DAO userDAO = (DAO) x.get("userDAO");
        Object bankAccountOwner = userDAO.find(bankAccountOwnerId);

        if ( bankAccountOwner instanceof PersonalContact ) {
          obj.setProperty("status", BankAccountStatus.VERIFIED);
        }
      }

      // 2. FLINKS ACCOUNTS & BRAZIL ACCOUNTS
      // ! IMPORTANT: Need to update this as needed once more bank account verification via bank clients are added
      // As recommended above, should later change this to check if the institution id is between 1 and 23 (these are the current institutions on the system)
      // remember this is INSTITUTION ID and NOT INSTITUTION NUMBER
      // institution id entails our identifiers of institutions on our system
      // institution number is the actual legal bank information
      boolean isFlinksAccount = SafetyUtil.equals(obj.getProperty("institution"), FLINKS_INSTITUTION_ID);
      boolean isBrazilAccount = obj instanceof BRBankAccount;

      if ( isFlinksAccount || isBrazilAccount ) {
        obj.setProperty("status", BankAccountStatus.VERIFIED);
      }

      return super.put_(x, obj);
      `
    }
  ]
});

