package net.nanopay.fx.afex;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.app.AppConfig;
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

    AppConfig appConfig = (AppConfig) x.get("appConfig");
    if ( null == appConfig || ! appConfig.getEnableInternationalPayment()) return getDelegate().put_(x, obj);

    DAO localBusinessDAO = ((DAO) x.get("localBusinessDAO")).inX(x);
    DAO localAccountDAO = ((DAO) x.get("localAccountDAO")).inX(x);
    AFEXServiceProvider afexServiceProvider = (AFEXServiceProvider) x.get("afexServiceProvider");
    
    Contact contact = (Contact) obj;
    Business business = (Business) localBusinessDAO.find(contact.getBusinessId());
    // Check if contact has a bank account
    BankAccount contactBankAccount = contact.getBankAccount() < 1 ? 
      ((BankAccount) localAccountDAO.find(AND(EQ(BankAccount.OWNER, contact.getId()), INSTANCE_OF(BankAccount.class)))) 
      : ((BankAccount) localAccountDAO.find(contact.getBankAccount()));
    if ( contactBankAccount != null ) {
      // Check if beneficiary already added
      if ( ! afexBeneficiaryExists(x, contact.getId(), contact.getOwner()) ) {
        createAFEXBeneficiary(x, contact.getId(), contactBankAccount.getId(),  contact.getOwner());
      }
    }

    // Check If Contact has business and create AFEX beneficiary for business also
    if ( business != null ) {
      BankAccount businessBankAccount = ((BankAccount) localAccountDAO.find(AND(EQ(BankAccount.OWNER, business.getId()), INSTANCE_OF(BankAccount.class))));
      if ( null != businessBankAccount ) {
        if ( ! afexBeneficiaryExists(x, business.getId(), contact.getOwner()) ) {
          createAFEXBeneficiary(x, business.getId(), businessBankAccount.getId(),  contact.getOwner());
        }
      }
    }

    return super.put_(x, obj);
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
