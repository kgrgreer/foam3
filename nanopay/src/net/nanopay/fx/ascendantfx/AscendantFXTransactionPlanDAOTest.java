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
import net.nanopay.fx.ExchangeRateStatus;
import net.nanopay.fx.FeesFields;
import net.nanopay.payment.Institution;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.TransactionQuote;
import net.nanopay.tx.TransactionPlan;
import net.nanopay.fx.ascendantfx.AscendantFXTransaction;


public class AscendantFXTransactionPlanDAOTest
    extends foam.nanos.test.Test {

  private FXService fxService;
  protected DAO userDAO_;
  protected User payer_ ;
  protected User payee_;
  protected BankAccount payeeBankAccount_;
  X x_;

  @Override
  public void runTest(X x) {

    userDAO_ = (DAO) x.get("localUserDAO");
    x_ = x;

    fxService = (FXService) x.get("ascendantFXService");

    setUpTest();
    testTransactionQuoteFilter();
    tearDownTest();

  }

  private void setUpTest() {

    payee_ = (User) ((DAO) x_.get("localUserDAO")).find(EQ(User.EMAIL, "testascendantfxtransaction@nanopay.net"));
    if (payee_ == null) {
      payee_ = new User();
      payee_.setFirstName("FXPayee3");
      payee_.setLastName("AscendantFX");
      payee_.setGroup("business");
      payee_.setEmail("testascendantfxtransaction@nanopay.net");
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

  public void testTransactionQuoteFilter(){
    TransactionQuote quote = new TransactionQuote.Builder(x_).build();
    Transaction transaction = new Transaction.Builder(x_).build();
    transaction.setPayerId(1002);
    transaction.setPayeeId(payee_.getId());
    transaction.setAmount(100l);
    transaction.setSourceCurrency("CAD");
    transaction.setDestinationCurrency("USD");
    quote.setRequestTransaction(transaction);
    TransactionQuote resultQoute = (TransactionQuote) ((DAO) x_.get("localTransactionQuotePlanDAO")).put_(x_, quote);
    test( null != resultQoute, "TransactionQuote was processed" );
    boolean hasAscendantTransaction = false;
    double rate = 0;
    double settlementAmount = 0;
    String quoteId = null;
    TransactionPlan validPlan = null;
    for ( int i = 0; i < resultQoute.getPlans().length; i++ ) {
      TransactionPlan plan = resultQoute.getPlans()[i];
      System.out.println("Class name: " + plan.getTransaction().getClass().getSimpleName());
      if ( plan.getTransaction() instanceof AscendantFXTransaction ) {
        hasAscendantTransaction = true;
        validPlan = plan;
        AscendantFXTransaction ascendantFXTransaction = (AscendantFXTransaction) plan.getTransaction();
        rate = ascendantFXTransaction.getFxRate();
        quoteId = ascendantFXTransaction.getFxQuoteId();
        settlementAmount = ascendantFXTransaction.getFxSettlementAmount();

        break;
      }
    }

    test( settlementAmount > 0, "FX Settlement Amount was retrieved" );
    test( null != quoteId, "Contains FX Quote ID" );
    test( rate > 0, "FX Rate was retrieved" );
    test( null != validPlan, "TransactionPlan is present" );
    test( hasAscendantTransaction, "AscendantFXTransaction is present" );

  }

}
