package net.nanopay.fx.ascendantfx;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.test.TestUtils;
import java.util.List;
import net.nanopay.bank.BankAccount;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.fx.FXQuote;
import net.nanopay.fx.FXService;
import net.nanopay.fx.FXUserStatus;
import net.nanopay.payment.PaymentService;
import foam.nanos.auth.Address;
import static foam.mlang.MLang.*;
import net.nanopay.fx.ExchangeRateStatus;
import net.nanopay.fx.FeesFields;
import net.nanopay.payment.Institution;
import net.nanopay.model.Branch;

public class AscendantFXServiceTest
    extends foam.nanos.test.Test {

  private FXService fxService;
  protected DAO fxQuoteDAO_;
  protected DAO userDAO_;
  protected User payer_ ;
  protected User payee_;
  protected BankAccount payeeBankAccount_;
  X x_;
  private final AscendantFX ascendantFX = new AscendantFXServiceMock();

  @Override
  public void runTest(X x) {

    fxQuoteDAO_ = (DAO) x.get("fxQuoteDAO");
    userDAO_ = (DAO) x.get("localUserDAO");
    x_ = x;


    fxService = new AscendantFXServiceProvider(x_, ascendantFX);

    setUpTest();
    testGetFXRate();
    testAcceptFXRate();
    testAddPayee();
    testSubmitDeal();
    testSubmitDealWithNoAmount();
    //testSubmit_Payment_Payee_Updated();
    //testSubmit_Payment_Payee_Not_Updated();
    testDeletePayee();
    tearDownTest();

  }

  private void setUpTest() {

    payee_ = (User) ((DAO) x_.get("localUserDAO")).find(EQ(User.EMAIL, "ascendantfxpayee@nanopay.net"));
    if (payee_ == null) {
      payee_ = new User();
      payee_.setFirstName("FXPayee");
      payee_.setLastName("AscendantFX");
      payee_.setGroup("business");
      payee_.setEmail("ascendantfxpayee@nanopay.net");
      Address businessAddress = new Address();
      businessAddress.setCity("Toronto");
      businessAddress.setCountryId("CA");
      businessAddress.setRegionId("ON");
      businessAddress.setAddress1("20 Ox Street");
      businessAddress.setPostalCode("M5V2J5");
      payee_.setAddress(businessAddress);
    }
    payee_ = (User) payee_.fclone();
    payee_.setEmailVerified(true);
    payee_ = (User) (((DAO) x_.get("localUserDAO")).put_(x_, payee_)).fclone();

    payeeBankAccount_ = (BankAccount) ((DAO) x_.get("localAccountDAO")).find(AND(EQ(BankAccount.OWNER, payee_.getId()), INSTANCE_OF(BankAccount.class)));
    if (payeeBankAccount_ == null) {
      payeeBankAccount_ = new BankAccount();
      payeeBankAccount_.setAccountNumber("2111111111");
      //payeeBankAccount_.setInstitutionNumber("210000000");
      payeeBankAccount_.setOwner(payee_.getId());

    } else {
      payeeBankAccount_ = (BankAccount) payeeBankAccount_.fclone();
    }

    Institution institution = new Institution();
    DAO institutionDAO = (DAO) x_.get("institutionDAO");
    List institutions = ((ArraySink) institutionDAO
        .where(
            EQ(Institution.INSTITUTION_NUMBER, payeeBankAccount_.getInstitutionNumber())
        )
        .select(new ArraySink())).getArray();

    if (institutions.isEmpty()) {
      institution = new Institution();
      institution.setName("TD Bank");
      institution.setInstitutionNumber(payeeBankAccount_.getInstitutionNumber());
      institution.setSwiftCode(payeeBankAccount_.getInstitutionNumber());
      institution.setCountryId("US");
      institution = (Institution) institutionDAO.put(institution);

      Address branchAddress = new Address();
      branchAddress.setCity("Auburn");
      branchAddress.setCountryId("US");
      branchAddress.setAddress1("10 G plaza");
      branchAddress.setPostalCode("04210");
      Branch branch = new Branch();
      branch.setBranchId(payeeBankAccount_.getInstitutionNumber());
      branch.setInstitution(institution.getId());
      branch.setAddress(branchAddress);
      DAO branchDAO = (DAO) x_.get("branchDAO");
      branchDAO.put(branch);

    } else {
      institution = (Institution) institutions.get(0);
    }
    payeeBankAccount_.setInstitution(institution.getId());
    payeeBankAccount_.setBranchId(payeeBankAccount_.getInstitutionNumber());
    payeeBankAccount_.setStatus(BankAccountStatus.VERIFIED);
    payeeBankAccount_.setIsDefault(true);
    payeeBankAccount_.setDenomination("USD");
    payeeBankAccount_ = (BankAccount) ((DAO) x_.get("localAccountDAO")).put_(x_, payeeBankAccount_).fclone();

    DAO ascendantFXUserDAO = (DAO) x_.get("ascendantFXUserDAO");
    AscendantFXUser ascendantFXUser = (AscendantFXUser) ascendantFXUserDAO.find(
        EQ(AscendantFXUser.USER, 1002));
    if (ascendantFXUser != null) {
      System.out.println("AscendantFXUser was found for - " + ascendantFXUser.getUser());
      ascendantFXUser = (AscendantFXUser) ascendantFXUser.fclone();
      ascendantFXUser.setUserStatus(FXUserStatus.ACTIVE);
      ascendantFXUserDAO.put(ascendantFXUser);
    }

  }

  private void tearDownTest() {
    ((DAO) x_.get("localAccountDAO")).remove(payeeBankAccount_);
    userDAO_.remove(payee_);
  }

  public void testGetFXRate() {
    FXQuote fxQuote = fxService.getFXRate("USD", "CAD", 100l, 0l, "BUY", null, 1002, null);
    test( null != fxQuote, "FX Quote was returned" );
    test( fxQuote.getId() > 0, "Quote has an ID: " + fxQuote.getId() );
    test( "USD".equals(fxQuote.getSourceCurrency()), "Quote has Source Currency" );
    test( fxQuote.getRate() > 0, "FX rate was returned: " + fxQuote.getRate() );
    test( fxQuote.getSourceAmount() == 100l, "Source Amount is correct: " + fxQuote.getSourceAmount() );
    test( fxQuote.getTargetAmount() == 133l, "Target Amount is correct: " + fxQuote.getTargetAmount() );

  }

  public void testAcceptFXRate() {

    FXQuote fxQuote = fxService.getFXRate("USD", "CAD", 100l, 0l, "BUY", null, 1002, null);
    test( fxQuote.getId() > 0, "Quote has an ID: " + fxQuote.getId() );

    fxQuote = (FXQuote) fxQuoteDAO_.find(fxQuote.getId());
    test( null != fxQuote, "FX Quote was returned" );
    if ( null != fxQuote ) {
      Boolean fxAccepted = fxService.acceptFXRate(String.valueOf(fxQuote.getId()), 1002);
      test( fxAccepted, "FX Quote was accepted" );
    }

  }

  public void testAddPayee() {
    AscendantFX ascendantFX = (AscendantFX) x_.get("ascendantFX");
    PaymentService ascendantPaymentService = new AscendantFXServiceProvider(x_, ascendantFX);
    test(TestUtils.testThrows(() -> ascendantPaymentService.addPayee(payee_.getId(), payeeBankAccount_.getId(), 1000), "User is not provisioned for foreign exchange transactions yet, please contact customer support.", RuntimeException.class),"thrown an exception");
    getAscendantUserPayeeJunction("5904960",payee_.getId());
  }

  public void testSubmit_Payment_Payee_Updated() {
    FXQuote fxQuote = fxService.getFXRate("CAD", "USD", 100l, 0l, "BUY", null, 1002, null);
    test( null != fxQuote, "FX Quote was returned" );
    Boolean fxAccepted = fxService.acceptFXRate(String.valueOf(fxQuote.getId()), 1002);
    PaymentService ascendantPaymentService = new AscendantFXServiceProvider(x_, ascendantFX);
    AscendantFXTransaction transaction = new AscendantFXTransaction.Builder(x_).build();
    transaction.setPayerId(1002);
    transaction.setPayeeId(payee_.getId());
    transaction.setAmount(fxQuote.getSourceAmount());
    transaction.setDestinationAmount(fxQuote.getTargetAmount());
    transaction.setDestinationAccount(payeeBankAccount_.getId());
    transaction.setSourceCurrency("CAD");
    transaction.setDestinationCurrency("USD");
    transaction.setFxExpiry(fxQuote.getExpiryTime());
    transaction.setFxQuoteId(String.valueOf(fxQuote.getId()));
    transaction.setFxRate(fxQuote.getRate());

    FeesFields fees = new FeesFields.Builder(x_).build();
    fees.setTotalFees(fxQuote.getFee());
    fees.setTotalFeesCurrency(fxQuote.getFeeCurrency());
    transaction.setFxFees(fees);
    if ( ExchangeRateStatus.ACCEPTED.getName().equalsIgnoreCase(fxQuote.getStatus()) )
          transaction.setAccepted(true);

    // Add Payee
    getAscendantUserPayeeJunction("5904960",payee_.getId());

    //Change account
    try{
      BankAccount bankAccount =  (BankAccount) ((DAO) x_.get("localAccountDAO")).find(payeeBankAccount_.getId()).fclone();
      bankAccount.setInstitutionNumber("210000001");
      bankAccount = (BankAccount) ((DAO) x_.get("localAccountDAO")).put_(x_, bankAccount).fclone();
      Thread.sleep(100); // So test does not fail because both account and afx payee was updated at the same time
    } catch (InterruptedException ex) {
      Thread.currentThread().interrupt();
    }

    try {
      ascendantPaymentService.submitPayment(transaction);
    } catch (Exception ex) {
      throw new RuntimeException(ex.getMessage());
    }

    DAO userPayeeJunctionDAO = (DAO) x_.get("ascendantUserPayeeJunctionDAO");
    AscendantUserPayeeJunction userPayeeJunction = (AscendantUserPayeeJunction)
    userPayeeJunctionDAO.find(
              AND(
                  EQ(AscendantUserPayeeJunction.ORG_ID, "5904960"),
                  EQ(AscendantUserPayeeJunction.ASCENDANT_PAYEE_ID, "9800")
              )
          );
    test( null != userPayeeJunction, "Payee was updated" );

  }


public void testSubmit_Payment_Payee_Not_Updated() {
      FXQuote fxQuote = fxService.getFXRate("CAD", "USD", 100l, 0l, "BUY", null, 1002, null);
      test( null != fxQuote, "FX Quote was returned" );
      Boolean fxAccepted = fxService.acceptFXRate(String.valueOf(fxQuote.getId()), 1002);
      PaymentService ascendantPaymentService = new AscendantFXServiceProvider(x_, ascendantFX);
      AscendantFXTransaction transaction = new AscendantFXTransaction.Builder(x_).build();
      transaction.setPayerId(1002);
      transaction.setPayeeId(payee_.getId());
      transaction.setAmount(fxQuote.getSourceAmount());
      transaction.setDestinationAmount(fxQuote.getTargetAmount());
      transaction.setDestinationAccount(payeeBankAccount_.getId());
      transaction.setSourceCurrency("CAD");
      transaction.setDestinationCurrency("USD");
      transaction.setFxExpiry(fxQuote.getExpiryTime());
      transaction.setFxQuoteId(String.valueOf(fxQuote.getId()));
      transaction.setFxRate(fxQuote.getRate());

      FeesFields fees = new FeesFields.Builder(x_).build();
      fees.setTotalFees(fxQuote.getFee());
      fees.setTotalFeesCurrency(fxQuote.getFeeCurrency());
      transaction.setFxFees(fees);
      if ( ExchangeRateStatus.ACCEPTED.getName().equalsIgnoreCase(fxQuote.getStatus()) )
            transaction.setAccepted(true);

      // Add Payee
      getAscendantUserPayeeJunction("5904960",payee_.getId());

      try {
        ascendantPaymentService.submitPayment(transaction);
      } catch (Exception ex) {
        throw new RuntimeException(ex.getMessage());
      }

      DAO userPayeeJunctionDAO = (DAO) x_.get("ascendantUserPayeeJunctionDAO");
      AscendantUserPayeeJunction userPayeeJunction = (AscendantUserPayeeJunction)
      userPayeeJunctionDAO.find(
                AND(
                    EQ(AscendantUserPayeeJunction.ORG_ID, "5904960"),
                    EQ(AscendantUserPayeeJunction.ASCENDANT_PAYEE_ID, "9800")
                )
            );
      test( null == userPayeeJunction, "Payee was not updated" );

    }

  private AscendantUserPayeeJunction getAscendantUserPayeeJunction(String orgId,long userId) {
    DAO userPayeeJunctionDAO = (DAO) x_.get("ascendantUserPayeeJunctionDAO");
    AscendantUserPayeeJunction userPayeeJunction = (AscendantUserPayeeJunction)
    userPayeeJunctionDAO.find(
              AND(
                  EQ(AscendantUserPayeeJunction.ORG_ID, orgId),
                  EQ(AscendantUserPayeeJunction.USER, userId)
              )
          );
    if( null == userPayeeJunction ) userPayeeJunction = new AscendantUserPayeeJunction.Builder(x_).build();
    userPayeeJunction = (AscendantUserPayeeJunction) userPayeeJunction.fclone();
    userPayeeJunction.setAscendantPayeeId("9836");
    userPayeeJunction.setOrgId(orgId);
    userPayeeJunction.setUser(userId);
    userPayeeJunctionDAO.put(userPayeeJunction);
    return userPayeeJunction;
  }

  public void testSubmitDeal(){
    FXQuote fxQuote = fxService.getFXRate("CAD", "USD", 100l, 0l, "BUY", null, 1002, null);
    test( null != fxQuote, "FX Quote was returned" );
    Boolean fxAccepted = fxService.acceptFXRate(String.valueOf(fxQuote.getId()), 1002);
    PaymentService ascendantPaymentService = new AscendantFXServiceProvider(x_, ascendantFX);
    AscendantFXTransaction transaction = new AscendantFXTransaction.Builder(x_).build();
    transaction.setPayerId(1002);
    transaction.setPayeeId(payee_.getId());
    transaction.setAmount(fxQuote.getSourceAmount());
    transaction.setDestinationAmount(fxQuote.getTargetAmount());
    transaction.setDestinationAccount(payeeBankAccount_.getId());
    transaction.setSourceCurrency("CAD");
    transaction.setDestinationCurrency("USD");
    transaction.setFxExpiry(fxQuote.getExpiryTime());
    transaction.setFxQuoteId(String.valueOf(fxQuote.getId()));
    transaction.setFxRate(fxQuote.getRate());

    FeesFields fees = new FeesFields.Builder(x_).build();
    fees.setTotalFees(fxQuote.getFee());
    fees.setTotalFeesCurrency(fxQuote.getFeeCurrency());
    transaction.setFxFees(fees);
    if ( ExchangeRateStatus.ACCEPTED.getName().equalsIgnoreCase(fxQuote.getStatus()) )
          transaction.setAccepted(true);

    try {
      ascendantPaymentService.submitPayment(transaction);
    } catch (Exception ex) {
      throw new RuntimeException(ex.getMessage());
    }

  }

    public void testSubmitDealWithNoAmount(){
      FXQuote fxQuote = fxService.getFXRate("USD", "CAD", 0l, 100l, "BUY", null, 1002, null);
      Boolean fxAccepted = fxService.acceptFXRate(String.valueOf(fxQuote.getId()), 1002);
      PaymentService ascendantPaymentService = new AscendantFXServiceProvider(x_, ascendantFX);
      AscendantFXTransaction transaction = new AscendantFXTransaction.Builder(x_).build();
      transaction.setPayerId(1002);
      transaction.setPayeeId(payee_.getId());
      transaction.setAmount(fxQuote.getSourceAmount());
      transaction.setDestinationAmount(fxQuote.getTargetAmount());
      transaction.setDestinationAccount(payeeBankAccount_.getId());
      transaction.setSourceCurrency("USD");
      transaction.setDestinationCurrency("CAD");
      transaction.setFxExpiry(fxQuote.getExpiryTime());
      transaction.setFxQuoteId(String.valueOf(fxQuote.getId()));
      transaction.setFxRate(fxQuote.getRate());

      FeesFields fees = new FeesFields.Builder(x_).build();
      fees.setTotalFees(fxQuote.getFee());
      fees.setTotalFeesCurrency(fxQuote.getFeeCurrency());
      transaction.setFxFees(fees);
      if ( ExchangeRateStatus.ACCEPTED.getName().equalsIgnoreCase(fxQuote.getStatus()) )
            transaction.setAccepted(true);

      try {
        ascendantPaymentService.submitPayment(transaction);
        test( true, "Deal submit without Amount" );
      } catch (Exception ex) {
        throw new RuntimeException(ex.getMessage());
      }

    }

  public void testDeletePayee() {
    PaymentService ascendantPaymentService = new AscendantFXServiceProvider(x_, ascendantFX);
    test(TestUtils.testThrows(() -> ascendantPaymentService.deletePayee(payee_.getId(), 1000), "User is not provisioned for foreign exchange transactions yet, please contact customer support.", RuntimeException.class),"delete payee thrown an exception");
    ascendantPaymentService.deletePayee(payee_.getId(), 1002);
  }

}
