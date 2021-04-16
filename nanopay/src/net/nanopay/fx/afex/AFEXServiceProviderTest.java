package net.nanopay.fx.afex;

import static foam.mlang.MLang.EQ;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.Address;
import foam.nanos.auth.Group;
import foam.nanos.auth.Permission;
import foam.nanos.auth.Region;
import foam.nanos.auth.User;
import foam.nanos.auth.UserUserJunction;
import foam.test.TestUtils;
import net.nanopay.admin.model.AccountStatus;
import net.nanopay.admin.model.ComplianceStatus;
import net.nanopay.bank.BankAccount;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.bank.CABankAccount;
import net.nanopay.bank.USBankAccount;
import net.nanopay.fx.FXQuote;
import net.nanopay.model.Business;
import net.nanopay.model.PersonalIdentification;
import net.nanopay.payment.Institution;
import net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo;
import net.nanopay.sme.onboarding.model.AnnualRevenueEnum;
import net.nanopay.sme.onboarding.model.TransactionsPurposeEnum;
import net.nanopay.sme.onboarding.model.AnnualTxnFrequencyEnum;
import foam.nanos.auth.LanguageId;

public class AFEXServiceProviderTest
    extends foam.nanos.test.Test {

  private AFEXServiceProvider afexServiceProvider;
  protected DAO fxQuoteDAO;
  protected DAO localUserDAO;
  protected DAO localAccountDAO;
  protected DAO agentJunctionDAO;
  protected DAO businessDAO;
  protected DAO regionDAO;
  protected DAO smeUserRegistrationDAO;
  protected DAO smeBusinessRegistrationDAO;
  protected DAO afexUserDAO;
  protected User user1 ;
  protected Business business ;
  protected AFEXUser afexUser;
  protected User user2;
  protected BankAccount user1CABankAccount;
  protected BankAccount user2USBankAccount;
  protected Address address;
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
    smeUserRegistrationDAO = (DAO) x.get("smeUserRegistrationDAO");
    // smeBusinessRegistrationDAO not longer used. To avoid complete
    // capability onboarding just to test AFEX, the relavant parts
    // of smeBusinessRegistrationDAO are used here.
    smeBusinessRegistrationDAO = new net.nanopay.onboarding.NewUserCreateBusinessDAO.Builder(x).setDelegate((DAO) x.get("localUserDAO")).build();
    afexUserDAO = (DAO) x.get("afexUserDAO");
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
    initAddress();
    initUser1();
    initUser2();
    initBusiness();
    initCABankAccount();
    initUSBankAccount();
  }

  private void initUser1() {
    user1 = (User) ((DAO) x.get("localUserDAO")).find(EQ(User.EMAIL, "afexpayee@nanopay.net"));
    business = null;
    if (user1 == null) {
      user1 = new User();
      user1.setUserName("afexpayee");
      user1.setEmail("afexpayee@nanopay.net");
      user1.setDesiredPassword("AFXTestPassword123$");
      user1.setLanguage(new LanguageId.Builder(null).setCode("en").build());
      user1 = (User) smeUserRegistrationDAO.put(user1).fclone();

      user1.setFirstName("AFEXTestPayer");
      user1.setLastName("AFEXTwo");
      user1.setAddress(address);
      user1.setType("Business");
      user1.setOrganization("Test Company");
      user1.setBusinessName("Test Company");
      user1.setBirthday(new Date());
      user1.setAddress(address);

      var now = LocalDateTime.now().atZone(ZoneId.systemDefault()).toInstant();
      PersonalIdentification identification = new PersonalIdentification();
      identification.setIssueDate(Date.from(now.minus(1, ChronoUnit.DAYS)));
      identification.setExpirationDate(Date.from(now.plus(1, ChronoUnit.DAYS)));
      user1.setIdentification(identification);
      user1.setPhoneNumber("1234567890");
      user1 = (User) smeBusinessRegistrationDAO.put(user1).fclone();

      // Set properties that can't be set during registration.
      user1.setEmailVerified(true);
      user1 = (User) localUserDAO.put(user1);
    } else {
      user1 = (User) user1.fclone();
    }
  }

  private void initUser2() {
    user2 = (User) ((DAO) x.get("localUserDAO")).find(EQ(User.EMAIL, "afexpayee2@nanopay.net"));
    if (user2 == null) {
      user2 = new User();
      user2.setFirstName("AFEXPayeeTwo");
      user2.setLastName("AFEX");
      user2.setGroup("afexpayee2");
      user2.setEmail("afexpayee2@nanopay.net");
      user2.setAddress(address);
      user2.setEmailVerified(true);
      localUserDAO.put(user2);
    } else {
      user2 = (User) user2.fclone();
    }
  }

  private void initBusiness() {
    if ( business == null ) {
      UserUserJunction junction = (UserUserJunction) agentJunctionDAO.find(EQ(UserUserJunction.SOURCE_ID, user1.getId()));
      business = (Business) businessDAO.find(junction.getTargetId());
      business = (Business) business.fclone();
      business.setStatus(AccountStatus.ACTIVE);
      business.setAddress(address);
      business.setOnboarded(true);
      business.setCompliance(ComplianceStatus.PASSED);
      business.setPhoneNumber("1234567890");
      business.setBusinessRegistrationDate(new Date());
      business.setBusinessTypeId(1);
      SuggestedUserTransactionInfo suggestedUserTransactionInfo = new SuggestedUserTransactionInfo();
      suggestedUserTransactionInfo.setBaseCurrency("CAD");
      suggestedUserTransactionInfo.setAnnualDomesticTransactionAmount("N/A");
      suggestedUserTransactionInfo.setAnnualRevenueEnum(AnnualRevenueEnum.LESS_THAN_10000);
      suggestedUserTransactionInfo.setTransactionPurposeEnum(TransactionsPurposeEnum.PAYABLES_PRODUCTS_SERVICES);
      suggestedUserTransactionInfo.setAnnualTransactionFrequencyEnum(AnnualTxnFrequencyEnum.LESS_THAN_100);
      suggestedUserTransactionInfo.setAnnualDomesticVolumeEnum(AnnualRevenueEnum.LESS_THAN_10000);
      business.setSuggestedUserTransactionInfo(suggestedUserTransactionInfo);
      business.setBusinessSectorId(81141);

      try {
        business = (Business) businessDAO.put(business);
      } catch (Exception e) {
      }
      Group group = (Group) ((DAO) x.get("localGroupDAO")).find(business.getGroup());
      Permission newPermission = new Permission.Builder(x).setId("fx.provision.payer").build();
      group.getPermissions(x).add(newPermission);
      business.getSigningOfficers(x).add(user1);
    }

  }

  private void initCABankAccount() {
    user1CABankAccount = (BankAccount) localAccountDAO.find(MLang
        .AND(new Predicate[] { MLang.EQ(BankAccount.OWNER, business.getId()), MLang.INSTANCE_OF(BankAccount.class) }));
    if (user1CABankAccount == null) {
      user1CABankAccount = new CABankAccount();
      user1CABankAccount.setAccountNumber("01111111000");
      user1CABankAccount.setInstitutionNumber("01211230000");
      user1CABankAccount.setOwner(business.getId());
      user1CABankAccount.setDenomination("CAD");
      user1CABankAccount.setAddress(address);
      user1CABankAccount.setInstitution(getInstitution().getId());
      user1CABankAccount.setStatus(BankAccountStatus.VERIFIED);
      localAccountDAO.put(user1CABankAccount);
    } else {
      user1CABankAccount = (BankAccount) user1CABankAccount.fclone();
    }
  }

  private void initUSBankAccount() {
    user2USBankAccount = (BankAccount) localAccountDAO.find(MLang
      .AND(new Predicate[] { MLang.EQ(BankAccount.OWNER, user2.getId()), MLang.INSTANCE_OF(BankAccount.class) }));
    if (user2USBankAccount == null) {
      user2USBankAccount = new USBankAccount();
      user2USBankAccount.setAccountNumber("000002000003");
      user2USBankAccount.setInstitutionNumber("0000000340");
      user2USBankAccount.setOwner(user2.getId());
      user2USBankAccount.setDenomination("USD");
      user2USBankAccount.setAddress(address);
      user2USBankAccount.setStatus(BankAccountStatus.VERIFIED);
      user2USBankAccount.setInstitution(getInstitution().getId());
      localAccountDAO.put(user2USBankAccount);
    } else {
      user2USBankAccount = (BankAccount) user2USBankAccount.fclone();
    }
  }

  private Address initAddress() {
    address = new Address();
    address.setCountryId("US");
    address.setStreetName("Avenue Rd");
    address.setStreetNumber("123");
    address.setPostalCode("12345");
    address.setCity("Toronto");
    address.setRegionId(((Region)regionDAO.find("US-DE")).getCode());
    return address;
  }

  private Institution getInstitution() {
    Institution institution = new Institution();
    DAO institutionDAO = (DAO) x.get("institutionDAO");
    List institutions = ((ArraySink) institutionDAO
        .where(MLang.EQ(Institution.INSTITUTION_NUMBER, "0000000340"))
        .select(new ArraySink())).getArray();
    if (institutions.isEmpty()) {
      institution = new Institution();
      institution.setName("AFX Test institution");
      institution.setInstitutionNumber("0000000340");
      institution.setSwiftCode("22349921314124435333");
      institution.setCountryId("CA");
      institution = (Institution) institutionDAO.put(institution);
    } else {
      institution = (Institution) institutions.get(0);
    }
    return institution;
  }

  private void tearDownTest() {
    localAccountDAO.remove(user1CABankAccount);
    localAccountDAO.remove(user2USBankAccount);
    AFEXUser afexUser = (AFEXUser) afexUserDAO.find(EQ(AFEXUser.USER, business.getId()));
    afexUserDAO.remove(afexUser);
    localUserDAO.inX(x).remove(user1);
    localUserDAO.inX(x).remove(user2);
  }

  private void testOnboardBusiness() {
    Business businessNoCompliance = (Business) business.fclone();
    businessNoCompliance.setCompliance(ComplianceStatus.FAILED);
    boolean onbarded = afexServiceProvider.onboardBusiness(businessNoCompliance);
    test( ! onbarded, "Business was not onboarded" );
    onbarded = afexServiceProvider.onboardBusiness(business);
    test( onbarded, "Business was onboarded" );
    AFEXUser afexUser = (AFEXUser) afexUserDAO.find(EQ(AFEXUser.USER, business.getId()));
    if ( afexUser != null ) {
      afexUser = (AFEXUser) afexUser.fclone();
      afexUser.setStatus("Active");
      afexUserDAO.put(afexUser);
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
    AFEXUser afexUser = (AFEXUser) afexUserDAO.find(EQ(AFEXUser.USER, business.getId()));
    test( afexUser != null, "AFEXUser is found" );
    FindBeneficiaryResponse beneficiaryResponse = afexServiceProvider.findBeneficiary(user2.getId(), afexUser.getApiKey(), user2.getSpid());
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
