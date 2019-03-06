package net.nanopay.integration.xero;

import com.xero.api.XeroClient;
import com.xero.model.CurrencyCode;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.Group;
import foam.nanos.auth.User;
import foam.nanos.auth.UserUserJunction;
import foam.nanos.logger.Logger;
import foam.util.SafetyUtil;

import net.nanopay.contacts.Contact;
import net.nanopay.integration.AccountingBankAccount;
import net.nanopay.integration.ContactMismatchPair;
import net.nanopay.integration.NewResultResponse;
import net.nanopay.integration.ResultResponse;
import net.nanopay.integration.xero.XeroTokenStorage;
import net.nanopay.integration.xero.XeroConfig;
import net.nanopay.integration.xero.model.XeroContact;
import net.nanopay.model.Business;

import java.util.ArrayList;
import java.util.List;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;

public class XeroIntegrationService2 extends foam.core.AbstractFObject implements net.nanopay.integration.IntegrationService{


  public XeroClient getClient(X x) {
    User user = (User) x.get("user");
    DAO store = ((DAO) x.get("xeroTokenStorageDAO")).inX(x);
    XeroTokenStorage tokenStorage = (XeroTokenStorage) store.find(user.getId());
    Group group = user.findGroup(x);
    AppConfig app = group.getAppConfig(x);
    DAO configDAO = ((DAO) x.get("xeroConfigDAO")).inX(x);
    XeroConfig config = (XeroConfig)configDAO.find(app.getUrl());
    XeroClient client = new XeroClient(config);
    if ( tokenStorage == null ) {
      return null;
    }
    client.setOAuthToken(tokenStorage.getToken(), tokenStorage.getTokenSecret());
    return client;
  }


  public ResultResponse isSignedIn(X x) {
    Logger logger = (Logger) x.get("logger");
    try {
      XeroClient client = this.getClient(x);
      if ( client == null ) {
        System.out.println("is not connected to xero");
        return new ResultResponse(false, "User has not connected to Xero");
      }
      client.getContacts();
      System.out.println("is signed in");
      return new ResultResponse(true, "User is Signed in");
    } catch ( Throwable e ) {
      logger.error(e);
      System.out.println("is not signed in");
      return new ResultResponse(false, "User is not Signed in");
    }
  }


  public String isValidContact(com.xero.model.Contact xeroContact) {
    String error = "";
    if ( SafetyUtil.isEmpty(xeroContact.getEmailAddress()) ) {
      error += "Missing Email Address.";
    }
    if ( SafetyUtil.isEmpty(xeroContact.getFirstName()) ) {
      error += " Missing First Name.";
    }
    if ( SafetyUtil.isEmpty(xeroContact.getLastName()) ) {
      error += " Missing Last Name.";
    }
    if ( SafetyUtil.isEmpty(xeroContact.getName()) ) {
      error += " Missing Contact Name.";
    }
    return error;
  }


  public ResultResponse isValidInvoice(com.xero.model.Invoice xeroInvoice) {
    if ( ! (xeroInvoice.getCurrencyCode() == CurrencyCode.CAD || xeroInvoice.getCurrencyCode() == CurrencyCode.USD) ) {
      return new ResultResponse(false,"We currently only support CAD and USD." );
    }
    return new ResultResponse(true,"");
  }

  private XeroContact importXeroContact(com.xero.model.Contact xeroContact, User user, XeroContact existingContact) {
    XeroContact newContact;
    if ( existingContact != null ) {
      newContact = existingContact;
    } else {
      newContact = new XeroContact();
    }

     // Address integration
    if ( xeroContact.getAddresses() != null &&
      xeroContact.getAddresses().getAddress().size() != 0 ) {

      foam.nanos.auth.CountryService countryService = (foam.nanos.auth.CountryService) getX().get("countryService");
      foam.nanos.auth.RegionService regionService = (foam.nanos.auth.RegionService) getX().get("regionService");

      com.xero.model.Address xeroAddress = xeroContact.getAddresses().getAddress().get(0);

      foam.nanos.auth.Country country = null;
      if ( xeroAddress.getCountry() != null ) {
        country = countryService.getCountry(xeroAddress.getCountry());
      }

      foam.nanos.auth.Region region = null;
      if ( xeroAddress.getRegion() != null ) {
        region = regionService.getRegion(xeroAddress.getRegion());
      }

      foam.nanos.auth.Address nanoAddress = new foam.nanos.auth.Address.Builder(getX())
      .setAddress1(xeroAddress.getAddressLine1())
      .setAddress2(xeroAddress.getAddressLine2())
      .setCity(xeroAddress.getCity())
      .setPostalCode(xeroAddress.getPostalCode() != null ? xeroAddress.getPostalCode() : "")
      .setCountryId(country != null ? country.getCode() : null)
      .setRegionId(region != null ? region.getCode() : null)
      .setType(xeroAddress.getAddressType().value())
      .setVerified(true)
      .build();

      newContact.setBusinessAddress(nanoAddress);
    }


     // Phone integration
    if ( xeroContact.getPhones() != null &&
      xeroContact.getPhones().getPhone().size() != 0 ) {

      com.xero.model.Phone xeroPhone = xeroContact.getPhones().getPhone().get(1);
      com.xero.model.Phone xeroMobilePhone = xeroContact.getPhones().getPhone().get(3);

      String phoneNumber =
      (xeroPhone.getPhoneCountryCode() != null ? xeroPhone.getPhoneCountryCode() : "") +
      (xeroPhone.getPhoneAreaCode() != null ? xeroPhone.getPhoneAreaCode() : "") +
      (xeroPhone.getPhoneNumber() != null ? xeroPhone.getPhoneNumber() : "");

      String mobileNumber =
      (xeroMobilePhone.getPhoneCountryCode() != null ? xeroMobilePhone.getPhoneCountryCode() : "") +
      (xeroMobilePhone.getPhoneAreaCode() != null ? xeroMobilePhone.getPhoneAreaCode() : "") +
      (xeroMobilePhone.getPhoneNumber() != null ? xeroMobilePhone.getPhoneNumber() : "");

      foam.nanos.auth.Phone nanoPhone = new foam.nanos.auth.Phone.Builder(getX())
      .setNumber(phoneNumber)
      .setVerified(!phoneNumber.equals(""))
      .build();

      foam.nanos.auth.Phone nanoMobilePhone = new foam.nanos.auth.Phone.Builder(getX())
      .setNumber(mobileNumber)
      .setVerified(!mobileNumber.equals(""))
      .build();

      newContact.setBusinessPhone(nanoPhone);
      newContact.setMobile(nanoMobilePhone);
      newContact.setPhoneNumber(phoneNumber);
    }

    newContact.setXeroId(xeroContact.getContactID());
    newContact.setEmail(xeroContact.getEmailAddress());
    newContact.setOrganization(xeroContact.getName());
    newContact.setBusinessName(xeroContact.getName());
    newContact.setFirstName(xeroContact.getFirstName());
    newContact.setLastName(xeroContact.getLastName());
    newContact.setOwner(user.getId());
    newContact.setGroup("sme");

    return newContact;
  }

  private ContactMismatchPair syncContact(X x, com.xero.model.Contact xeroContact) {
    User user = (User) x.get("user");
    DAO agentJunctionDAO = ((DAO) x.get("agentJunctionDAO"));
    DAO contactDAO  = ((DAO) x.get("contactDAO")).inX(x);
    DAO businessDAO = ((DAO) x.get("localBusinessDAO")).inX(x);
    DAO userDAO = ((DAO) x.get("localUserUserDAO")).inX(x);
    XeroContact newContact = new XeroContact();
    ContactMismatchPair result = new ContactMismatchPair();

    Contact existingContact = (Contact) contactDAO.find(AND(
      EQ(Contact.EMAIL, xeroContact.getEmailAddress()),
      EQ(Contact.OWNER, user.getId())
    ));

    User existingUser = (User) userDAO.find(
      EQ(User.EMAIL, xeroContact.getEmailAddress())
    );

    // check if contact is already exists
    if ( existingContact != null ) {

      // Do nothing if it is an existing user ( user on our system )
      if ( existingUser != null ) {
        return null;
      }
      if (!(existingContact instanceof XeroContact) || ! ((XeroContact) existingContact).getXeroId().equals(xeroContact.getContactID())) {
        result.setExistContact(existingContact);
        result.setNewContact(importXeroContact(xeroContact, user, null));
      } else {
        newContact = importXeroContact(xeroContact, user, (XeroContact) existingContact.fclone());
      }
    } else { // Contact does not already exist

      // check if exisiting user
      if ( existingUser != null ) {

        ArraySink sink = (ArraySink) agentJunctionDAO.where(EQ(
          UserUserJunction.SOURCE_ID, existingUser.getId()
        )).select(new ArraySink());

        if ( sink.getArray().size() == 1 ) {
          UserUserJunction userUserJunction = (UserUserJunction) sink.getArray().get(0);
          Business business = (Business) businessDAO.find(userUserJunction.getTargetId());
          newContact.setOrganization(business.getOrganization());
          newContact.setBusinessName(business.getBusinessName());
          newContact.setBusinessId(business.getId());
          newContact.setEmail(business.getEmail());
        } else {
          result.setExistContact(importXeroContact(xeroContact,user,null));
        }
        newContact.setType("Contact");
        newContact.setGroup("sme");
        newContact.setOwner(user.getId());
      } else {
        newContact = importXeroContact(xeroContact,user,null);
      }
    }
    if ( ! newContact.getEmail().equals("") ) {
      contactDAO.put(newContact);
    }
    if ( result.getExistContact() == null && result.getNewContact() == null ) {
      return null;
    }
    return result;
  }


  @Override
  public ResultResponse contactSync(X x) {
    User user = (User) x.get("user");
    Logger logger = (Logger) x.get("logger");
    XeroClient client = this.getClient(x);
    List<ContactMismatchPair> result = new ArrayList<>();
    List<String> contactErrors = new ArrayList<>();

    if ( client == null ) {
      return new NewResultResponse.Builder(x)
        .setResult(false)
        .setReason("Token has expired")
        .build();
    }

    try {

      for (com.xero.model.Contact xeroContact : client.getContacts()) {
        String inValidContacts = isValidContact(xeroContact);
        if ( ! inValidContacts.equals("") ) {
          contactErrors.add(xeroContact.getName() + " cannot be synced. " + inValidContacts);
          continue;
        }
        try {
         ContactMismatchPair mismatchPair = syncContact(x, xeroContact);
         if ( mismatchPair != null ) {
           result.add(mismatchPair);
         }
        } catch(Exception e) {
          System.out.println("error in syncContac inner : " +e.getMessage()+" : "+xeroContact.getEmailAddress());
          logger.error(e);
        }
      }

    } catch (Exception e) {
      System.out.print("Error in contact sync: "+e.toString());
      logger.error(e);
      return new NewResultResponse.Builder(x)
        .setResult(false)
        .setReason("Token has expired")
        .build();
    }
    return new NewResultResponse.Builder(x)
      .setResult(true)
      .setSyncContactsResult(result.toArray(new ContactMismatchPair[result.size()]))
      .setInValidContact(contactErrors.toArray(new String[contactErrors.size()]))
      .build();
  }


  private void syncInvoice() {

  }


  @Override
  public ResultResponse invoiceSync(foam.core.X x) {
    User user = (User) x.get("user");
    DAO store = ((DAO) x.get("xeroTokenStorageDAO")).inX(x);
    XeroTokenStorage tokenStorage = (XeroTokenStorage) store.find(user.getId());
    Group group = user.findGroup(x);
    AppConfig app = group.getAppConfig(x);
    DAO configDAO = ((DAO) x.get("xeroConfigDAO")).inX(x);
    XeroConfig config = (XeroConfig)configDAO.find(app.getUrl());
    XeroClient client = new XeroClient(config);
    Logger logger = (Logger) x.get("logger");

    // Check that user has accessed xero before
    if ( tokenStorage == null ) {

    }

    // Configures the client Object with the users token data
    client.setOAuthToken(tokenStorage.getToken(), tokenStorage.getTokenSecret());

    try {
      for (com.xero.model.Invoice xeroInvoice : client.getInvoices()) {


      }
    } catch (Throwable e) {

    }
  return null;
  }


  @Override
  public ResultResponse syncSys(X x) {
    return null;
  }


  @Override
  public ResultResponse removeToken(X x) {
    return null;
  }


  @Override
  public List<AccountingBankAccount> pullBanks(X x) {
    return null;
  }
}

//class contactSyncResult {
//
//  Boolean
//
//}
