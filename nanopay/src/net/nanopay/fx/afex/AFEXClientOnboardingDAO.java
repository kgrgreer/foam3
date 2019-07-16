package net.nanopay.fx.afex;

import foam.core.FObject;
import foam.mlang.MLang;
import static foam.mlang.MLang.EQ;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.notification.Notification;
import net.nanopay.fx.afex.AFEXBusiness;
import net.nanopay.fx.afex.AFEXService;
import net.nanopay.fx.afex.OnboardCorporateClientRequest;
import net.nanopay.fx.afex.OnboardCorporateClientResponse;
import net.nanopay.bank.BankAccount;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.model.Business;

import java.text.SimpleDateFormat;




/**
 * This DAO would onboard user as a client on AFEX by calling AFEX API and then c
 * reates AFEXUser if the owner of the account has the required permission 
 */
public class AFEXClientOnboardingDAO
    extends ProxyDAO {

  public AFEXClientOnboardingDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    if ( !(obj instanceof BankAccount) ) {
      return getDelegate().put_(x, obj);
    }

    Logger logger = (Logger) x.get("logger");
    logger.debug(this.getClass().getSimpleName(), "put", obj);

    AppConfig appConfig = (AppConfig) x.get("appConfig");
    if ( null == appConfig || ! appConfig.getEnableInternationalPayment() ) return getDelegate().put_(x, obj);

    BankAccount account = (BankAccount) obj;
    BankAccount existingAccount = (BankAccount) getDelegate().find(account.getId());
    if ( existingAccount != null && (existingAccount.getStatus() == BankAccountStatus.VERIFIED  
        ||  account.getStatus() == BankAccountStatus.VERIFIED) ) {
      AuthService auth = (AuthService) x.get("auth");
      DAO localBusinessDAO = (DAO) x.get("localBusinessDAO");
      Business business = (Business) localBusinessDAO.find(account.getOwner());
      if  ( null != business && business.getOnboarded() ) {
        DAO afexBusinessDAO = (DAO) x.get("afexBusinessDAO");
        AFEXBusiness afexBusiness = (AFEXBusiness) afexBusinessDAO.find(EQ(AFEXBusiness.USER, business.getId()));
        if ( afexBusiness != null ) return super.put_(x, obj);

        boolean hasFXProvisionPayerPermission = auth.checkUser(getX(), business, "fx.provision.payer");
        //boolean hasCurrencyReadUSDPermission = auth.checkUser(getX(), business, "currency.read.USD");
        if ( hasFXProvisionPayerPermission ) {
          User signingOfficer = getSigningOfficer(x, business);
          if ( signingOfficer != null ) {
            String identificationExpiryDate = null;
            try {
              identificationExpiryDate = new SimpleDateFormat("yyyy/MM/dd").format(signingOfficer.getIdentification().getExpirationDate()); 
            } catch(Throwable t) {
              logger.error("Error creating AFEX beneficiary.", t);
            } 
            AFEXService afexService = (AFEXService) x.get("afexService");
            OnboardCorporateClientRequest onboardingRequest = new OnboardCorporateClientRequest();
            onboardingRequest.setAccountPrimaryIdentificationExpirationDate(identificationExpiryDate);
            onboardingRequest.setAccountPrimaryIdentificationNumber(String.valueOf(signingOfficer.getIdentification().getIdentificationNumber()));
            onboardingRequest.setAccountPrimaryIdentificationType(getAFEXIdentificationType(signingOfficer.getIdentification().getIdentificationTypeId())); // TODO: This should ref AFEX ID type
            onboardingRequest.setBusinessAddress1(business.getAddress().getAddress());
            onboardingRequest.setBusinessCity(business.getAddress().getCity());
            onboardingRequest.setBusinessCountryCode(business.getAddress().getCountryId());
            onboardingRequest.setBusinessName(business.getBusinessName());
            onboardingRequest.setBusinessZip(business.getAddress().getPostalCode());
            onboardingRequest.setCompanyType(getAFEXCompanyType(business.getBusinessTypeId()));
            onboardingRequest.setContactBusinessPhone(business.getBusinessPhone().getNumber());
            String businessRegDate = null;
            try {
              businessRegDate = new SimpleDateFormat("yyyy/MM/dd").format(business.getBusinessRegistrationDate()); 
            } catch(Throwable t) {
              logger.error("Error creating AFEX beneficiary.", t);
            } 
            onboardingRequest.setDateOfIncorporation(businessRegDate);
            onboardingRequest.setFirstName(signingOfficer.getFirstName());
            //onboardingRequest.setGender(signingOfficer.getGender()); //TODO
            onboardingRequest.setLastName(signingOfficer.getLastName());
            onboardingRequest.setPrimaryEmailAddress(signingOfficer.getEmail());
            onboardingRequest.setTermsAndConditions("true");
            OnboardCorporateClientResponse newClient = afexService.onboardCorporateClient(onboardingRequest);
            if ( newClient != null ) {
              afexBusiness  = new AFEXBusiness();
              afexBusiness.setUser(business.getId());
              afexBusiness.setApiKey(newClient.getAPIKey());
              afexBusiness.setAccountNumber(newClient.getAccountNumber());
              afexBusinessDAO.put(afexBusiness);
            }
          }
        }
      }
    }

    return super.put_(x, obj);
  }

  protected User getSigningOfficer(X x, Business business) {
    java.util.List<User> signingOfficers = ((ArraySink) business.getSigningOfficers(x).getDAO().select(new ArraySink())).getArray();
    return signingOfficers.isEmpty() ? null : signingOfficers.get(0);
  }

  protected String getAFEXIdentificationType(long idType) {
    switch((int)idType) {
      case 1:
        return "DriversLicense";
      case 2:
        return "CitizenshipCard";
      case 3:
        return "Passport";
      default:
        return "Item";
    }
  }

  protected String getAFEXCompanyType(long companyType) {
    switch((int)companyType) {
      case 1:
        return "Sole Proprietorship";
      case 2:
        return "Partnership";
      case 3:
        return "Corporation";
      case 4:
        return "Registered Charity";
      default:
        return "";
    }
  }

}
