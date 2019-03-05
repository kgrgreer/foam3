package net.nanopay.integration.quick;

import com.intuit.ipp.core.Context;
import com.intuit.ipp.core.ServiceType;
import com.intuit.ipp.data.*;
import com.intuit.ipp.exception.FMSException;
import com.intuit.ipp.security.OAuth2Authorizer;
import com.intuit.ipp.services.DataService;
import com.intuit.ipp.util.Config;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.*;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.util.SafetyUtil;
import net.nanopay.contacts.Contact;
import net.nanopay.integration.*;
import net.nanopay.integration.quick.model.QuickContact;
import net.nanopay.model.Business;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;

public class NewQuickIntegrationService implements IntegrationService {

  @Override
  public ResultResponse isSignedIn(X x) {

    return new ResultResponse.Builder(x).setResult(true).build();
  }

  @Override
  public ResultResponse contactSync(X x) {

    System.out.println("good");

    try {

      List<NameBase> contacts = fetchContacts(x);

      for ( NameBase contact : contacts) {
        ContactMismatchPair mismatchPair = importContact(x, contact);
        if ( mismatchPair != null ) {

        }
      }


    } catch ( Exception e ) {

    }


    return new NewResultResponse.Builder(x).;
  }

  @Override
  public ResultResponse invoiceSync(X x) {

    return new ResultResponse.Builder(x).setResult(true).build();
  }

  @Override
  public ResultResponse syncSys(X x) {

    return new ResultResponse.Builder(x).setResult(true).build();
  }

  @Override
  public ResultResponse removeToken(X x) {

    return new ResultResponse.Builder(x).setResult(true).build();
  }

  @Override
  public List<AccountingBankAccount> pullBanks(X x) {

    return null;
  }

  public ContactMismatchPair importContact(foam.core.X x, NameBase importContact) {
    Logger logger         = (Logger) x.get("logger");
    DAO            contactDAO     = ((DAO) x.get("contactDAO")).inX(x);
    User              user         = (User) x.get("user");
    DAO            userDAO        = ((DAO) x.get("localUserUserDAO")).inX(x);
    DAO            businessDAO    = ((DAO) x.get("localBusinessDAO")).inX(x);
    DAO            agentJunctionDAO = ((DAO) x.get("agentJunctionDAO"));

    EmailAddress email = importContact.getPrimaryEmailAddr();

    Contact existContact = (Contact) contactDAO.find(AND(
      EQ(Contact.EMAIL, email.getAddress()),
      EQ(Contact.OWNER, user.getId())
    ));

    // existing user
    User existUser = (User) userDAO.find(
      EQ(User.EMAIL, email.getAddress())
    );

    //QuickContact newContact = new QuickContact();

    // If the contact is a existing contact
    if ( existContact != null ) {

      // existing user
      if ( existUser != null ) {
        return null;
      }

      if ( ! ( existContact instanceof QuickContact ) ) {
        return new ContactMismatchPair.Builder(x)
          .setExistContact(existContact)
          .setNewContact(createQuickContactFrom(x, importContact, false))
          .build();
      } else {
        QuickContact temp = createQuickContactFrom(x, importContact, false);
        temp.setId(existContact.getId());
        contactDAO.inX(x).put(temp);
      }
    }

    // If the contact is not a existing contact
    if ( existContact == null ) {

      if ( existUser != null ) {

        ArraySink sink = (ArraySink) agentJunctionDAO.where(EQ(
          UserUserJunction.SOURCE_ID, existUser.getId()
        )).select(new ArraySink());

        if ( sink.getArray().size() == 0 ) {
          //
        }

        if ( sink.getArray().size() == 1 ) {
          QuickContact temp = createQuickContactFrom(x, importContact, true);
          UserUserJunction userUserJunction = (UserUserJunction) sink.getArray().get(0);
          Business business = (Business) businessDAO.find(userUserJunction.getTargetId());
          temp.setOrganization(business.getOrganization());
          temp.setBusinessName(business.getBusinessName());
          temp.setBusinessId(business.getId());
          temp.setEmail(business.getEmail());
          contactDAO.inX(x).put(temp);
        }

        if ( sink.getArray().size() > 1) {
          QuickContact temp = createQuickContactFrom(x, importContact, true);
          temp.setChooseBusiness(true);
          temp.setEmail(email.getAddress());
          temp.setFirstName(existUser.getFirstName());
          temp.setLastName(existUser.getLastName());
          temp.setOrganization("TBD");
          temp.setBusinessName("TBD");
          return new ContactMismatchPair(temp, null);
        }
      }
    }

    return null;
  }

  public QuickContact createQuickContactFrom(foam.core.X x, NameBase importContact, boolean existUser) {
    User            user           = (User) x.get("user");
    CountryService  countryService = (CountryService) x.get("countryService");
    RegionService   regionService  = (RegionService) x.get("regionService");
    DAO               store        = ((DAO) x.get("quickTokenStorageDAO")).inX(x);
    QuickTokenStorage tokenStorage = (QuickTokenStorage) store.find(user.getId());

    EmailAddress email = importContact.getPrimaryEmailAddr();

    QuickContact newContact = new QuickContact();

    if ( ! existUser ) {
      /*
       * Address integration
       */
      Address           portalAddress   = new Address();
      PhysicalAddress customerAddress = importContact instanceof Customer ?
        ( (Customer) importContact ).getBillAddr() :
        ( (Vendor) importContact ).getBillAddr();

      if ( customerAddress != null ) {
        Country country =
          ! SafetyUtil.isEmpty(customerAddress.getCountry()) ?
            countryService.getCountry(customerAddress.getCountry()) : null;

        Region region =
          ! SafetyUtil.isEmpty(customerAddress.getCountrySubDivisionCode()) ?
            regionService.getRegion(customerAddress.getCountrySubDivisionCode()) : null;

        portalAddress.setAddress1(customerAddress.getLine1());
        portalAddress.setAddress2(customerAddress.getLine2());
        portalAddress.setCity(customerAddress.getCity());
        portalAddress.setPostalCode(customerAddress.getPostalCode());
        portalAddress.setRegionId(country != null ? country.getCode() : null);
        portalAddress.setCountryId(region != null ? region.getCode() : null);

        newContact.setBusinessAddress(portalAddress);
      }

      /*
       * Phone integration
       */
      String busPhoneNumber =
        importContact.getPrimaryPhone() != null ?
          importContact.getPrimaryPhone().getFreeFormNumber() : "";

      String mobilePhoneNumber =
        importContact.getMobile() != null ?
          importContact.getMobile().getFreeFormNumber() : "";

      Phone businessPhone = new Phone.Builder(x)
        .setNumber( busPhoneNumber )
        .setVerified( ! busPhoneNumber.equals("") )
        .build();

      Phone mobilePhone = new Phone.Builder(x)
        .setNumber( mobilePhoneNumber )
        .setVerified( ! mobilePhoneNumber.equals("") )
        .build();

      newContact.setOrganization(importContact.getCompanyName());
      newContact.setFirstName(importContact.getGivenName());
      newContact.setLastName(importContact.getFamilyName());
      newContact.setBusinessPhone(businessPhone);
      newContact.setMobile(mobilePhone);
    }


    newContact.setEmail(email.getAddress());
    newContact.setType("Contact");
    newContact.setGroup("sme");
    newContact.setQuickId(importContact.getId());
    newContact.setRealmId(tokenStorage.getRealmId());
    newContact.setOwner(user.getId());

    return newContact;
  }

  public List fetchContacts(foam.core.X x) throws Exception {

    List result = new ArrayList();

    String queryCustomer = "select * from customer";
    String queryVendor   = "select * from vendor";

    result.addAll(sendRequest(x, queryCustomer));
    result.addAll(sendRequest(x, queryVendor));

    return result;
  }

  public NameBase fetchContactById(foam.core.X x, String type, String id) throws Exception {
    String query = "select * from "+ type +" where id = '"+ id +"'";
    return (NameBase) sendRequest(x, query).get(0);
  }


  public List sendRequest(foam.core.X x, String query) throws Exception {
    User user       = (User) x.get("user");
    DAO store       = ((DAO) x.get("quickTokenStorageDAO")).inX(x);
    Group group     = user.findGroup(x);
    AppConfig app   = group.getAppConfig(x);
    DAO                         configDAO = ((DAO) x.get("quickConfigDAO")).inX(x);
    QuickConfig                 config    = (QuickConfig)configDAO.find(app.getUrl());
    QuickTokenStorage  tokenStorage = (QuickTokenStorage) store.find(user.getId());

    Config.setProperty(Config.BASE_URL_QBO, config.getIntuitAccountingAPIHost() + "/v3/company/");

    OAuth2Authorizer oauth = new OAuth2Authorizer(tokenStorage.getAccessToken());
    Context context = new Context(oauth, ServiceType.QBO, tokenStorage.getRealmId());
    DataService service =  new DataService(context);

    return service.executeQuery(query).getEntities();
  }
}
