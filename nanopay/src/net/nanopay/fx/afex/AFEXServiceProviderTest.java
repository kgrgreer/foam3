package net.nanopay.fx.afex;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import net.nanopay.model.Business;
import foam.nanos.auth.User;
import foam.nanos.auth.Permission;
import foam.nanos.auth.Region;
import foam.test.TestUtils;
import java.util.List;
import java.util.Date;
import net.nanopay.bank.BankAccount;
import net.nanopay.bank.CABankAccount;
import net.nanopay.bank.USBankAccount;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.fx.FXQuote;
import net.nanopay.payment.PaymentService;
import foam.nanos.auth.Address;
import foam.nanos.auth.Phone;
import foam.mlang.MLang;
import static foam.mlang.MLang.*;
import foam.mlang.predicate.Predicate;
import net.nanopay.fx.ExchangeRateStatus;
import net.nanopay.fx.FeesFields;
import net.nanopay.payment.Institution;
import net.nanopay.model.Branch;
import foam.nanos.auth.Group;
import net.nanopay.admin.model.ComplianceStatus;
import net.nanopay.model.PersonalIdentification;
import net.nanopay.admin.model.AccountStatus;
import net.nanopay.bank.BankAccountStatus;

public class AFEXServiceProviderTest
    extends foam.nanos.test.Test {

  private AFEXServiceProvider afexServiceProvider;
  protected DAO fxQuoteDAO;
  protected DAO localUserDAO;
  protected DAO localAccountDAO;
  protected DAO agentJunctionDAO;
  protected DAO businessDAO;
  protected DAO regionDAO;
  protected DAO smeBusinessRegistrationDAO;
  protected DAO afexBusinessDAO;
  protected User user1 ;
  protected Business business ;
  protected AFEXBusiness afexBusiness;
  protected User user2;
  protected BankAccount user1CABankAccount;
  protected BankAccount user2USBankAccount;
  X x;
  protected AFEX afexService;

  @Override
  public void runTest(X x) {

    fxQuoteDAO = (DAO) x.get("fxQuoteDAO");
    localUserDAO = (DAO) x.get("localUserDAO");
    localAccountDAO = (DAO) x.get("localAccountDAO");
    agentJunctionDAO = (DAO) x.get("agentJunctionDAO");
    businessDAO = (DAO) x.get("businessDAO");
    regionDAO = (DAO) x.get("regionDAO");
    smeBusinessRegistrationDAO = (DAO) x.get("smeBusinessRegistrationDAO");
    afexBusinessDAO = (DAO) x.get("afexBusinessDAO");
    this.x = x;

    afexService = new AFEXServiceMock(x);
    afexServiceProvider = new AFEXServiceProvider(x, afexService);

    setUpTest();
    testOnboardBusiness();
    testGetFXRate();
    testAcceptFXRate();
    testAddPayee();
    testFindBeneficiary();
    //testSubmitDeal();
    //testSubmitDealWithNoAmount();
    //testSubmit_Payment_Payee_Updated();
    //testSubmit_Payment_Payee_Not_Updated();
    tearDownTest();

  }

  private void setUpTest() {
    Address businessAddress = new Address();
    businessAddress.setCountryId("CA");
    businessAddress.setStreetName("Avenue Rd");
    businessAddress.setStreetNumber("123");
    businessAddress.setPostalCode("M1M1M1");
    businessAddress.setCity("Toronto");
    businessAddress.setRegionId(((Region)regionDAO.find("ON")).getCode());

    user1 = (User) ((DAO) x.get("localUserDAO")).find(EQ(User.EMAIL, "afexpayee@nanopay.net"));
    business = null;
    if (user1 == null) {
      user1 = new User();
      user1.setFirstName("AFEXTestPayer");
      user1.setLastName("AFEXTwo");
      user1.setGroup("business");
      user1.setEmail("afexpayee@nanopay.net");
      user1.setDesiredPassword("AFXTestPassword123$");
      user1.setGroup("sme");
      user1.setAddress(businessAddress);
      user1.setType("Business");
      user1.setOrganization("Test Company");
      user1.setBusinessName("Test Company");
      user1.setLanguage("en");
      user1.setBusinessAddress(businessAddress);
      user1.setAddress(businessAddress);
      user1.setEnabled(true);
      user1.setLoginEnabled(true);
      user1.setEmailVerified(true);
      PersonalIdentification identification = new PersonalIdentification();
      identification.setExpirationDate(new Date());
      user1.setIdentification(identification);
      Phone phone = new Phone();
      phone.setNumber("123-456-7890");
      user1.setPhone(phone);
      smeBusinessRegistrationDAO.put(user1);

      business = (Business) businessDAO.find(EQ(Business.EMAIL, user1.getEmail()));
      business = (Business) business.fclone();
      business.setStatus(AccountStatus.ACTIVE);
      business.setBusinessAddress(businessAddress);
      business.setOnboarded(true);
      business.setCompliance(ComplianceStatus.PASSED);
      business.setBusinessPhone(phone);
      business.setBusinessRegistrationDate(new Date());
      try {
        business = (Business) businessDAO.put(business);
      } catch (Exception e) {
      }
      Group group = (Group) ((DAO) x.get("localGroupDAO")).find(business.getGroup());
      Permission newPermission = new Permission.Builder(x).setId("fx.provision.payer").build();
      group.getPermissions(x).add(newPermission);
      business.getSigningOfficers(x).add(user1);

    } else {
      user1.setBusinessAddress(businessAddress);
      user1.setAddress(businessAddress);
      user1.setEnabled(true);
      user1.setEmailVerified(true);
      localUserDAO.put(user1);
    }

    user2 = (User) ((DAO) x.get("localUserDAO")).find(EQ(User.EMAIL, "afexpayee2@nanopay.net"));
    if (user2 == null) {
      user2 = new User();
      user2.setFirstName("AFEXPayeeTwo");
      user2.setLastName("AFEX");
      user2.setGroup("afexpayee2");
      user2.setEmail("testafxpayee20@nanopay.net");
    }

    user2.setBusinessAddress(businessAddress);
    user2.setAddress(businessAddress);
    user2.setEmailVerified(true);
    localUserDAO.put(user2);

    Address bankAddress = new Address();
    bankAddress.setCountryId("CA");
    bankAddress.setStreetName("Avenue Rd");
    bankAddress.setStreetNumber("123");
    bankAddress.setPostalCode("M1M1M1");
    bankAddress.setCity("Toronto");
    bankAddress.setRegionId(((Region)regionDAO.find("ON")).getCode());

    user1CABankAccount = (BankAccount) localAccountDAO.find(MLang
        .AND(new Predicate[] { MLang.EQ(BankAccount.OWNER, business.getId()), MLang.INSTANCE_OF(BankAccount.class) }));
    if (user1CABankAccount == null) {
      user1CABankAccount = new CABankAccount();
      user1CABankAccount.setAccountNumber("01111111000");
      user1CABankAccount.setInstitutionNumber("01211230000");
      user1CABankAccount.setOwner(business.getId());
      user1CABankAccount.setDenomination("CAD");

      user1CABankAccount.setAddress(bankAddress);
    }

    user1CABankAccount.setStatus(BankAccountStatus.VERIFIED);

    user2USBankAccount = (BankAccount) localAccountDAO.find(MLang
        .AND(new Predicate[] { MLang.EQ(BankAccount.OWNER, user2.getId()), MLang.INSTANCE_OF(BankAccount.class) }));
    if (user2USBankAccount == null) {
      user2USBankAccount = new USBankAccount();
      user2USBankAccount.setAccountNumber("000002000003");
      user2USBankAccount.setInstitutionNumber("0000000340");
      user2USBankAccount.setOwner(user2.getId());
      user2USBankAccount.setDenomination("USD");

      user2USBankAccount.setAddress(bankAddress);
    }
    user2USBankAccount.setStatus(BankAccountStatus.VERIFIED);

    Institution institution = new Institution();
    DAO institutionDAO = (DAO) x.get("institutionDAO");
    List institutions = ((ArraySink) institutionDAO
        .where(MLang.EQ(Institution.INSTITUTION_NUMBER, user2USBankAccount.getInstitutionNumber()))
        .select(new ArraySink())).getArray();

    if (institutions.isEmpty()) {
      institution = new Institution();
      institution.setName("AFX Test institution");
      institution.setInstitutionNumber(user2USBankAccount.getInstitutionNumber());
      institution.setSwiftCode("22349921314124435333");
      institution.setCountryId("CA");
      institution = (Institution) institutionDAO.put(institution);
    } else {
      institution = (Institution) institutions.get(0);
    }

    user2USBankAccount.setInstitution(institution.getId());
    user1CABankAccount.setInstitution(institution.getId());

    localAccountDAO.put(user1CABankAccount);
    localAccountDAO.put(user2USBankAccount);

    // AFEX Business
    // afexBusiness  = new AFEXBusiness();
    // afexBusiness.setUser(business.getId());
    // afexBusiness.setApiKey("API_KEY");
    // afexBusiness.setAccountNumber("00012022");
    // afexBusinessDAO.put(afexBusiness);
  }

  private void tearDownTest() {
    localAccountDAO.remove(user1CABankAccount);
    localAccountDAO.remove(user2USBankAccount);
    AFEXBusiness afexBusiness = (AFEXBusiness) afexBusinessDAO.find(EQ(AFEXBusiness.USER, business.getId()));
    afexBusinessDAO.remove(afexBusiness);
    localUserDAO.remove(business);
    localUserDAO.remove(user1);
    localUserDAO.remove(user2);
  }

  private void testOnboardBusiness() {
    Business businessNoCompliance = (Business) business.fclone();
    businessNoCompliance.setCompliance(ComplianceStatus.FAILED);
    boolean onbarded = afexServiceProvider.onboardBusiness(businessNoCompliance, user1CABankAccount);
    test( ! onbarded, "Business was not onboarded" );
    onbarded = afexServiceProvider.onboardBusiness(business, user1CABankAccount);
    test( onbarded, "Business was onboarded" );
    AFEXBusiness afexBusiness = (AFEXBusiness) afexBusinessDAO.find(EQ(AFEXBusiness.USER, business.getId()));
    if ( afexBusiness != null ) {
      afexBusiness = (AFEXBusiness) afexBusiness.fclone();
      afexBusiness.setStatus("Active");
      afexBusinessDAO.put(afexBusiness);
    }
    
  }

  public void testGetFXRate() {
    FXQuote fxQuote = afexServiceProvider.getFXRate("USD", "CAD", 100l, 0l, "Buy", null, business.getId(), null);
    test( null != fxQuote, "FX Quote was returned" );
    test( fxQuote.getId() > 0, "Quote has an ID: " + fxQuote.getId() );
    test( "USD".equals(fxQuote.getSourceCurrency()), "Quote has Source Currency" );
    test( fxQuote.getRate() > 0, "FX rate was returned: " + fxQuote.getRate() );
    test( fxQuote.getSourceAmount() == 100l, "Source Amount is correct: " + fxQuote.getSourceAmount() );
    test( fxQuote.getTargetAmount() == (fxQuote.getSourceAmount() * fxQuote.getRate()), "Target Amount is correct: " + fxQuote.getTargetAmount() );

  }

  public void testAcceptFXRate() {
    FXQuote fxQuote = afexServiceProvider.getFXRate("USD", "CAD", 100l, 0l, "Buy", null, business.getId(), null);
    test( fxQuote.getId() > 0, "Quote has an ID: " + fxQuote.getId() );

    fxQuote = (FXQuote) fxQuoteDAO.find(fxQuote.getId());
    test( null != fxQuote, "FX Quote was returned" );
    if ( null != fxQuote ) {
      Boolean fxAccepted = afexServiceProvider.acceptFXRate(String.valueOf(fxQuote.getId()), business.getId());
      test( fxAccepted, "FX Quote was accepted" );
    }
  }

  public void testAddPayee() {
    test(TestUtils.testThrows(() -> afexServiceProvider.addPayee(user2.getId(), user2USBankAccount.getId(), 1000),"Business as not been completely onboarded on partner system. " + 1000, RuntimeException.class),"thrown an exception");
    afexServiceProvider.addPayee(user2.getId(), user2USBankAccount.getId(), business.getId());
  }

  public void testFindBeneficiary() {
    AFEXBusiness afexBusiness = (AFEXBusiness) afexBusinessDAO.find(EQ(AFEXBusiness.USER, business.getId()));
    test( afexBusiness != null, "AFEXBusiness is found" );
    FindBeneficiaryResponse beneficiaryResponse = afexServiceProvider.findBeneficiary(user2.getId(), afexBusiness.getApiKey());
    test( beneficiaryResponse != null, "beneficiary is found" );
  }

//   public void testSubmitDeal(){
//     FXQuote fxQuote = afexServiceProvider.getFXRate("CAD", "USD", 100l, 0l, "Buy", null, 1002, null);
//     test( null != fxQuote, "FX Quote was returned" );
//     Boolean fxAccepted = afexServiceProvider.acceptFXRate(String.valueOf(fxQuote.getId()), 1002);
//     PaymentService afexPaymentService = new AFEXServiceProvider(x_, afexService);
//     AFEXTransaction transaction = new AFEXTransaction.Builder(x_).build();
//     transaction.setPayerId(1002);
//     transaction.setPayeeId(payee_.getId());
//     transaction.setAmount(fxQuote.getSourceAmount());
//     transaction.setDestinationAmount(fxQuote.getTargetAmount());
//     transaction.setDestinationAccount(payeeBankAccount_.getId());
//     transaction.setSourceCurrency("CAD");
//     transaction.setDestinationCurrency("USD");
//     transaction.setFxExpiry(fxQuote.getExpiryTime());
//     transaction.setFxQuoteId(String.valueOf(fxQuote.getId()));
//     transaction.setFxRate(fxQuote.getRate());

//     FeesFields fees = new FeesFields.Builder(x_).build();
//     fees.setTotalFees(fxQuote.getFee());
//     fees.setTotalFeesCurrency(fxQuote.getFeeCurrency());
//     transaction.setFxFees(fees);
//     if ( ExchangeRateStatus.ACCEPTED.getName().equalsIgnoreCase(fxQuote.getStatus()) )
//           transaction.setAccepted(true);

//     try {
//       afexPaymentService.submitPayment(transaction);
//     } catch (Exception ex) {
//       throw new RuntimeException(ex.getMessage());
//     }

//   }

//     public void testSubmitDealWithNoAmount(){
//       FXQuote fxQuote = afexServiceProvider.getFXRate("USD", "CAD", 0l, 100l, "Buy", null, 1002, null);
//       Boolean fxAccepted = afexServiceProvider.acceptFXRate(String.valueOf(fxQuote.getId()), 1002);
//       PaymentService afexPaymentService = new AFEXServiceProvider(x_, afexService);
//       AFEXTransaction transaction = new AFEXTransaction.Builder(x_).build();
//       transaction.setPayerId(1002);
//       transaction.setPayeeId(payee_.getId());
//       transaction.setAmount(fxQuote.getSourceAmount());
//       transaction.setDestinationAmount(fxQuote.getTargetAmount());
//       transaction.setDestinationAccount(payeeBankAccount_.getId());
//       transaction.setSourceCurrency("USD");
//       transaction.setDestinationCurrency("CAD");
//       transaction.setFxExpiry(fxQuote.getExpiryTime());
//       transaction.setFxQuoteId(String.valueOf(fxQuote.getId()));
//       transaction.setFxRate(fxQuote.getRate());

//       FeesFields fees = new FeesFields.Builder(x_).build();
//       fees.setTotalFees(fxQuote.getFee());
//       fees.setTotalFeesCurrency(fxQuote.getFeeCurrency());
//       transaction.setFxFees(fees);
//       if ( ExchangeRateStatus.ACCEPTED.getName().equalsIgnoreCase(fxQuote.getStatus()) )
//             transaction.setAccepted(true);

//       try {
//         afexPaymentService.submitPayment(transaction);
//         test( true, "Deal submit without Amount" );
//       } catch (Exception ex) {
//         throw new RuntimeException(ex.getMessage());
//       }

//     }

}
