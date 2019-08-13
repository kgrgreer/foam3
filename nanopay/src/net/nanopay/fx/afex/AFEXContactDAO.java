package net.nanopay.fx.afex;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.notification.Notification;
import static foam.mlang.MLang.*;

import net.nanopay.bank.BankAccount;
import net.nanopay.contacts.Contact;
import net.nanopay.fx.ascendantfx.AscendantFXUser;
import net.nanopay.fx.FXUserStatus;
import net.nanopay.model.Business;

/**
 * This DAO would create Beneficiary on AFEX API
 */
public class AFEXContactDAO
    extends ProxyDAO {

  public AFEXContactDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    if ( ! (obj instanceof Contact) ) {
      return getDelegate().put_(x, obj);
    }

    DAO localBusinessDAO = ((DAO) x.get("localBusinessDAO")).inX(x);
    DAO localAccountDAO = ((DAO) x.get("localAccountDAO")).inX(x);
    AFEXServiceProvider afexServiceProvider = (AFEXServiceProvider) x.get("afexServiceProvider");
    
    Contact contact = (Contact) obj;
    
    AuthService auth = (AuthService) x.get("auth");
    Business contactOwner = (Business) localBusinessDAO.find(contact.getOwner());

    // Check if contact has a bank account
    BankAccount contactBankAccount = contact.getBankAccount() < 1 ? 
      ((BankAccount) localAccountDAO.find(AND(EQ(BankAccount.OWNER, contact.getId()), INSTANCE_OF(BankAccount.class)))) 
      : ((BankAccount) localAccountDAO.find(contact.getBankAccount()));
    if ( contactBankAccount != null ) {
       // check contact owner has currency.read.x permission
      String currencyPermission = "currency.read." + contactBankAccount.getDenomination();
      boolean hasCurrencyPermission = auth.checkUser(getX(), contactOwner, currencyPermission);
      // Check if beneficiary already added
      if ( hasCurrencyPermission && ! afexBeneficiaryExists(x, contact.getId(), contact.getOwner()) ) {
        createAFEXBeneficiary(x, contact.getId(), contactBankAccount.getId(),  contact.getOwner());
      }
    }

    // Check If Contact has business and create AFEX beneficiary for business also
    Business business = (Business) localBusinessDAO.find(contact.getBusinessId());
    if ( business != null ) {
      BankAccount businessBankAccount = ((BankAccount) localAccountDAO.find(AND(EQ(BankAccount.OWNER, business.getId()), INSTANCE_OF(BankAccount.class))));
      if ( null != businessBankAccount ) {
        String currencyPermission = "currency.read." + businessBankAccount.getDenomination();
        boolean hasCurrencyPermission = auth.checkUser(getX(), contactOwner, currencyPermission);
        if ( hasCurrencyPermission && ! afexBeneficiaryExists(x, business.getId(), contact.getOwner()) ) {
          createAFEXBeneficiary(x, business.getId(), businessBankAccount.getId(),  contact.getOwner());
        }
      }
    }

    return super.put_(x, obj);
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    Contact contact = (Contact) obj;

    if ( contact == null ) return null;

    DAO localBusinessDAO = ((DAO) x.get("localBusinessDAO")).inX(x);
    AFEXServiceProvider afexServiceProvider = (AFEXServiceProvider) x.get("afexServiceProvider");
    Business contactOwner = (Business) localBusinessDAO.find(contact.getOwner());
    if (null == contactOwner ) return super.remove_(x, obj);
    Business business = (Business) localBusinessDAO.find(contact.getBusinessId());
    long contactId = contact.getId();
    if ( business != null ) contactId = business.getId();
    
    try {
      afexServiceProvider.deletePayee(contactId, contactOwner.getId());
    } catch(Throwable t) {
      Logger l = (Logger) x.get("logger");
      l.error("Unexpected error disabling AFEX Beneficiary history record.", t);
    }
    
    return super.remove_(x, obj);
  }

  protected boolean afexBeneficiaryExists(X x, Long contactId, Long ownerId) {
    boolean beneficiaryExists = false;
    DAO afexBeneficiaryDAO = ((DAO) x.get("afexBeneficiaryDAO")).inX(x);
    AFEXServiceProvider afexServiceProvider = (AFEXServiceProvider) x.get("afexServiceProvider");
    AFEXBeneficiary afexBeneficiary = (AFEXBeneficiary) afexBeneficiaryDAO.find(
      AND(
        EQ(AFEXBeneficiary.CONTACT, contactId),
        EQ(AFEXBeneficiary.OWNER, ownerId)
      )
    );
    if ( null != afexBeneficiary ) return true;
    try {
      FindBeneficiaryResponse existingBeneficiary = afexServiceProvider.getPayeeInfo(String.valueOf(contactId), ownerId);
      if ( existingBeneficiary != null ) {
        beneficiaryExists = true;
        afexBeneficiary = new AFEXBeneficiary();
        afexBeneficiary.setContact(contactId);
        afexBeneficiary.setOwner(ownerId);
        afexBeneficiary.setStatus(existingBeneficiary.getStatus());
        afexBeneficiaryDAO.put(afexBeneficiary);
      } else {
        beneficiaryExists = false;
      }
    } catch(Throwable t) {
      // TODO: Log
    } 

    return beneficiaryExists;
  }

  protected void createAFEXBeneficiary(X x, long beneficiaryId, long bankAccountId, long beneficiaryOwnerId) {
    AFEXServiceProvider afexServiceProvider = (AFEXServiceProvider) x.get("afexServiceProvider");
    try {
      new Thread(() -> afexServiceProvider.addPayee(beneficiaryId, bankAccountId,  beneficiaryOwnerId)).start();
    } catch(Throwable t) {
      ((Logger) x.get("logger")).error("Error creating AFEX beneficiary.", t);
    }  
  }
}
