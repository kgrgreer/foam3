package net.nanopay.account;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import foam.util.SafetyUtil;
import net.nanopay.account.Account;
import net.nanopay.bank.USBankAccount;
import net.nanopay.contacts.Contact;
import net.nanopay.bank.BankAccountStatus;

// we only need a put_ override in this decorator, since it only deals with the CREATION of contact bank accounts
public class AbliiBankAccountAutoverifyDAO
   extends ProxyDAO
{
  public final static Integer FLINKS_INSTITUTION_ID = 16; // this should change later once we add more bank verification clients to ablii

 public AbliiBankAccountAutoverifyDAO(DAO delegate) {
   setDelegate(delegate);
 }

 public AbliiBankAccountAutoverifyDAO(X x, DAO delegate) {
   setX(x);
   setDelegate(delegate);
 }

 @Override
 public FObject put_(X x, FObject obj) {
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
     * 3. FOR FLINKS BANK ACCOUNTS
     * NOTE: MIGHT WANT TO INCLUDE THIS IN THE FUTURE FOR INSTITUTIONS IDS BETWEEN 1 to 23 SINCE THESE WILL ALL REQUIRE TO LOGIN VIA THE CLIENT
     * Since flinks bank accounts are being verified by logging in from the client, 
     * we can automatically verify these bank accounts when passing them through this decorator
     */

   User user = (User) x.get("user");
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

    if ( bankAccountOwner instanceof Contact ) {
      obj.setProperty("status", BankAccountStatus.VERIFIED);
    }
   }

   // 3. FLINKS ACCOUNTS
   // ! IMPORTANT: Need to update this as needed once more bank account verification via bank clients are added
   // As recommended above, should later change this to check if the institution id is between 1 and 23 (these are the current institutions on the system)
   // remember this is INSTITUTION ID and NOT INSTITUTION NUMBER
   // institution id entails our identifiers of institutions on our system
   // institution number is the actual legal bank information
   boolean isFlinksAccount = SafetyUtil.equals(obj.getProperty("institution"), FLINKS_INSTITUTION_ID);

   if ( isFlinksAccount ) {
     obj.setProperty("status", BankAccountStatus.VERIFIED);
   }

   return super.put_(x, obj);
 }
}
