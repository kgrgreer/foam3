package net.nanopay.account;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.AuthenticationException;
import foam.nanos.auth.AuthorizationException;
import foam.nanos.auth.User;
import net.nanopay.contacts.Contact;

import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.OR;

/**
* ! this class should ONLY have a put override
* since this decorator is only designed to
* autoverify bank accounts added as CONTACTS
*/

public class AbliiContactBankAccountAutoverifyDAO
   extends ProxyDAO
{
 public AbliiContactBankAccountAutoverifyDAO(DAO delegate) {
   setDelegate(delegate);
 }

 public AbliiContactBankAccountAutoverifyDAO(X x, DAO delegate) {
   setX(x);
   setDelegate(delegate);
 }

 @Override
 public FObject put_(X x, FObject obj) {
   /**
    * 1. check if this is an add contact request
    * 2. the owner must be the contact being added
    * 3. the created by must be the business that's adding the contact
    * ! If the above mentioned are all true, then set the bank account to VERIFIED
    * ! Otherwise just pass through if this is a normal account being added
    */
   System.out.println("Hit AbliiContactBankAccountAutoverifyDAO!!!");
   System.out.println(x);
   System.out.println(obj);
   // User user = (User) x.get("user");
   // Account newAccount = (Account) obj;
   // AuthService auth = (AuthService) x.get("auth");
   // DAO userDAO_ = (DAO) x.get("bareUserDAO");

   // if ( user == null ) {
   //   throw new AuthenticationException();
   // }

   // Account oldAccount = (Account) getDelegate().find_(x, obj);
   // boolean isUpdate = oldAccount != null;

   // if ( isUpdate ) {
   //   boolean ownsAccount = newAccount.getOwner() == user.getId() && oldAccount.getOwner() == user.getId();

   //   if (
   //     ! ownsAccount &&
   //     ! auth.check(x, GLOBAL_ACCOUNT_UPDATE) &&
   //     ! ownsContactThatOwnsAccount(x, newAccount) &&
   //     ! ownsContactThatOwnsAccount(x, oldAccount)
   //   ) {
   //     throw new AuthorizationException("You do not have permission to update that account.");
   //   }
   // } else if (
   //   newAccount.getOwner() != user.getId() &&
   //   ! auth.check(x, "account.create") &&
   //   ! ownsContactThatOwnsAccount(x, newAccount)
   // ) {
   //   throw new AuthorizationException("You do not have permission to create an account for another user.");
   // }

   return super.put_(x, obj);
 }


 /**
  * Check if the user in the context owns a contact that owns the given account.
  * @param x The user context.
  * @param account The account to check.
  * @return true if the given account is owned by a contact that the user owns.
  */
 public boolean ownsContactThatOwnsAccount(X x, Account account) {
   User user = (User) x.get("user");
   User owner = account.findOwner(x);
   return owner instanceof Contact && ((Contact) owner).getOwner() == user.getId();
 }

}
