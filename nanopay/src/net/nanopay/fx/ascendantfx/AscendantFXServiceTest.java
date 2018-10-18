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
import net.nanopay.payment.PaymentService;
import net.nanopay.tx.cron.ExchangeRatesCron;
import foam.nanos.auth.Address;
import static foam.mlang.MLang.*;
import net.nanopay.account.Account;
import net.nanopay.account.DigitalAccount;
import net.nanopay.fx.ExchangeRateStatus;
import net.nanopay.fx.FeesFields;
import net.nanopay.model.Broker;
import net.nanopay.model.Currency;
import net.nanopay.payment.Institution;
import net.nanopay.tx.Transfer;

public class AscendantFXServiceTest
    extends foam.nanos.test.Test {

  private FXService fxService;
  protected DAO fxQuoteDAO_;
  protected DAO userDAO_;
  protected User payer_ ;
  protected User payee_;
  protected BankAccount payeeBankAccount_;
  X x_;

  @Override
  public void runTest(X x) {

    fxQuoteDAO_ = (DAO) x.get("fxQuoteDAO");
    userDAO_ = (DAO) x.get("localUserDAO");
    x_ = x;

    fxService = (FXService) x.get("ascendantFXService");

    setUpTest();
    testGetFXRate();
    testAcceptFXRate();
    testAddPayee();
    testSubmitDeal();
    testDeletePayee();
    tearDownTest();

  }

  private void setUpTest() {

    payee_ = (User) ((DAO) x_.get("localUserDAO")).find(EQ(User.EMAIL, "ascendantfxpayee@nanopay.net"));
    if (payee_ == null) {
      payee_ = new User();
      payee_.setFirstName("FXPayee3");
      payee_.setLastName("AscendantFX");
      payee_.setGroup("business");
      payee_.setEmail("ascendantfxpayee@nanopay.net");
      Address businessAddress = new Address();
      businessAddress.setCity("Toronto");
      businessAddress.setCountryId("CA");
      payee_.setBusinessAddress(businessAddress);
      payee_.setAddress(businessAddress);
    }
    payee_ = (User) payee_.fclone();
    payee_.setEmailVerified(true);
    payee_ = (User) (((DAO) x_.get("localUserDAO")).put_(x_, payee_)).fclone();

    payeeBankAccount_ = (BankAccount) ((DAO) x_.get("localAccountDAO")).find(AND(EQ(BankAccount.OWNER, payee_.getId()), INSTANCE_OF(BankAccount.class)));
    if (payeeBankAccount_ == null) {
      payeeBankAccount_ = new BankAccount();
      payeeBankAccount_.setAccountNumber("21314124435333");
      payeeBankAccount_.setInstitutionNumber("2131412443");
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
      institution.setName("Ascendant Test institution");
      institution.setInstitutionNumber(payeeBankAccount_.getInstitutionNumber());
      institution.setSwiftCode("22344421314124435333");
      institution.setCountryId("CA");
      institution = (Institution) institutionDAO.put(institution);
    } else {
      institution = (Institution) institutions.get(0);
    }
    payeeBankAccount_.setInstitution(institution.getId());

    payeeBankAccount_.setStatus(BankAccountStatus.VERIFIED);
    payeeBankAccount_.setIsDefault(true);
    payeeBankAccount_.setDenomination("CAD");
    payeeBankAccount_ = (BankAccount) ((DAO) x_.get("localAccountDAO")).put_(x_, payeeBankAccount_).fclone();
  }

  private void tearDownTest() {
    ((DAO) x_.get("localAccountDAO")).remove(payeeBankAccount_);
    userDAO_.remove(payee_);
  }

  public void testGetFXRate() {
    ExchangeRatesCron cron = new ExchangeRatesCron();
    cron.execute(x_);
    FXQuote fxQuote = fxService.getFXRate("USD", "CAD", 100.0, "Buy", null, 1002, null);
    test( null != fxQuote, "FX Quote was returned" );
    test( fxQuote.getId() > 0, "Quote has an ID: " + fxQuote.getId() );
    test( "USD".equals(fxQuote.getSourceCurrency()), "Quote has Source Currency" );
    test( fxQuote.getRate() > 0, "FX rate was returned: " + fxQuote.getRate() );

  }

  public void testAcceptFXRate() {

    FXQuote fxQuote = fxService.getFXRate("USD", "CAD", 100.0, "Buy", null, 1002, null);
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
    test(TestUtils.testThrows(() -> ascendantPaymentService.addPayee(payee_.getId(), 1000), "Unable to find Ascendant Organization ID for User: 1000", RuntimeException.class),"thrown an exception");
    test(TestUtils.testThrows(() -> ascendantPaymentService.addPayee(payee_.getId(), 1002), "Unable to Add Payee to AscendantFX Organization: Exception caught: Payee opration ; Error: Payee Already Exist.", RuntimeException.class),"Payee Already exists exception");
    getAscendantUserPayeeJunction("5904960",payee_.getId());
  }

  private AscendantUserPayeeJunction getAscendantUserPayeeJunction(String orgId,long userId) {
    DAO userPayeeJunctionDAO = (DAO) x_.get("ascendantUserPayeeJunctionDAO");
    AscendantUserPayeeJunction userPayeeJunction = (AscendantUserPayeeJunction)
    userPayeeJunctionDAO.find(
              AND(
                  EQ(AscendantUserPayeeJunction.ORG_ID, orgId),
                  EQ(AscendantUserPayeeJunction.ASCENDANT_PAYEE_ID, "9836")
              )
          );
    if( null == userPayeeJunction ) userPayeeJunction = new AscendantUserPayeeJunction.Builder(x_).build();

    userPayeeJunction.setAscendantPayeeId("9836");
    userPayeeJunction.setOrgId(orgId);
    userPayeeJunction.setUser(userId);
    userPayeeJunctionDAO.put(userPayeeJunction);
    return userPayeeJunction;
  }

  public void testSubmitDeal(){
    FXQuote fxQuote = fxService.getFXRate("USD", "CAD", 100.0, "Buy", null, 1002, null);
    Boolean fxAccepted = fxService.acceptFXRate(String.valueOf(fxQuote.getId()), 1002);
    AscendantFX ascendantFX = (AscendantFX) x_.get("ascendantFX");
    PaymentService ascendantPaymentService = new AscendantFXServiceProvider(x_, ascendantFX);
    AscendantFXTransaction transaction = new AscendantFXTransaction.Builder(x_).build();
    transaction.setPayerId(1002);
    transaction.setPayeeId(payee_.getId());
    transaction.setAmount(Double.valueOf(fxQuote.getSourceAmount()).longValue());
    transaction.setSourceCurrency("USD");
    transaction.setDestinationCurrency("CAD");
    transaction.setFxExpiry(fxQuote.getExpiryTime());
    transaction.setFxQuoteId(fxQuote.getExternalId());
    transaction.setFxRate(fxQuote.getRate());
    transaction.setFxSettlementAmount(fxQuote.getTargetAmount());

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


  public void testDeletePayee() {
    AscendantFX ascendantFX = (AscendantFX) x_.get("ascendantFX");
    PaymentService ascendantPaymentService = new AscendantFXServiceProvider(x_, ascendantFX);
    test(TestUtils.testThrows(() -> ascendantPaymentService.deletePayee(payee_.getId(), 1000), "Unable to find Ascendant Organization ID for User: 1000", RuntimeException.class),"delete payee thrown an exception");
  }

}
