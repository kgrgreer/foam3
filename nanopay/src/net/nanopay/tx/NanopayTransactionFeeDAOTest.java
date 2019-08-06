package net.nanopay.tx;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.test.TestUtils;
import java.util.List;
import net.nanopay.bank.CABankAccount;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.fx.FXQuote;
import net.nanopay.fx.FXService;
import net.nanopay.payment.PaymentService;
import foam.nanos.auth.Address;
import static foam.mlang.MLang.*;
import net.nanopay.fx.ExchangeRateStatus;
import net.nanopay.fx.FeesFields;
import net.nanopay.payment.Institution;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionFee;
import net.nanopay.tx.model.PercentageFee;
import net.nanopay.tx.TransactionQuote;
import net.nanopay.tx.alterna.AlternaCOTransaction;
import net.nanopay.tx.Transfer;
import net.nanopay.tx.TransactionLineItem;
import net.nanopay.tx.FeeLineItem;

import java.util.List;

public class NanopayTransactionFeeDAOTest
    extends foam.nanos.test.Test {

  private FXService fxService;
  protected DAO userDAO_;
  protected User payer_ ;
  protected User payee_;
  protected CABankAccount payeeBankAccount_;
  X x_;

  @Override
  public void runTest(X x) {

    userDAO_ = (DAO) x.get("localUserDAO");
    x_ = x;

    fxService = (FXService) x.get("ascendantFXService");

    setUpTest();
    testTransactionFee();
    //tearDownTest();

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
      payee_.setAddress(businessAddress);
    }
    payee_ = (User) payee_.fclone();
    payee_.setEmailVerified(true);
    payee_ = (User) (((DAO) x_.get("localUserDAO")).put_(x_, payee_)).fclone();

    payeeBankAccount_ = (CABankAccount) ((DAO) x_.get("localAccountDAO")).find(AND(EQ(CABankAccount.OWNER, payee_.getId()), INSTANCE_OF(CABankAccount.class)));
    if (payeeBankAccount_ == null) {
      payeeBankAccount_ = new CABankAccount();
      payeeBankAccount_.setAccountNumber("21314124435335");
      payeeBankAccount_.setInstitutionNumber("2131412445");
      payeeBankAccount_.setOwner(payee_.getId());
    } else {
      payeeBankAccount_ = (CABankAccount) payeeBankAccount_.fclone();
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
      institution.setName("Ascendant Test institution: transactionFeeDAOTest");
      institution.setInstitutionNumber(payeeBankAccount_.getInstitutionNumber());
      institution.setSwiftCode("22344421314124435335");
      institution.setCountryId("CA");
      institution = (Institution) institutionDAO.put(institution);
    } else {
      institution = (Institution) institutions.get(0);
    }
    payeeBankAccount_.setInstitution(institution.getId());

    payeeBankAccount_.setStatus(BankAccountStatus.VERIFIED);
    payeeBankAccount_.setIsDefault(true);
    payeeBankAccount_.setDenomination("CAD");
    payeeBankAccount_ = (CABankAccount) ((DAO) x_.get("localAccountDAO")).put_(x_, payeeBankAccount_).fclone();

    DAO feeDAO = (DAO) x_.get("transactionFeesDAO");
    TransactionFee fee = new TransactionFee.Builder(x_)
      .setName(this.getClass().getSimpleName()).build();
    List found = ((ArraySink) feeDAO.where(EQ(TransactionFee.NAME, fee.getName())).limit(1).select(new ArraySink())).getArray();
    if ( found.size() == 1 ) {
      fee = (TransactionFee) ((TransactionFee) found.get(0)).fclone();
    }
    fee.setTransactionType(AlternaCOTransaction.class.getSimpleName());
    fee.setDenomination("CAD");
    fee.setMinAmount(0L);
    fee.setMaxAmount(1000000000L);
    fee.setFeeAccount(999); // just needs to be non-null
    fee.setFee(new PercentageFee.Builder(x_).setPercentage(1).build());
    feeDAO.put(fee);
  }

  private void tearDownTest() {
    ((DAO) x_.get("localAccountDAO")).remove(payeeBankAccount_);
    userDAO_.remove(payee_);
  }

  public void testTransactionFee(){
    Logger logger = (Logger) x_.get("logger");
    TransactionQuote quote = new TransactionQuote.Builder(x_).build();
    Transaction transaction = new TestTransaction.Builder(x_).build();
    transaction.setPayerId(1002);
    transaction.setPayeeId(payee_.getId());
    transaction.setAmount(1000L);
    transaction.setSourceCurrency("CAD");
    transaction.setDestinationAccount(payeeBankAccount_.getId());
    quote.setRequestTransaction(transaction);
    TransactionQuote resultQoute = (TransactionQuote) ((DAO) x_.get("localTransactionQuotePlanDAO")).put_(x_, quote);
    test( null != resultQoute, "TransactionQuote not null");
    FeeLineItem feeApplied = null;
    for ( int i = 0; i < quote.getPlans().length; i++ ) {
      Transaction plan = quote.getPlans()[i];
      if ( null != plan ) {
        if ( plan instanceof ComplianceTransaction ) {
          plan = plan.getNext()[0];
        }
        TransactionLineItem[] lineItems = plan.getLineItems();
        for ( TransactionLineItem lineItem : lineItems ) {
          if ( lineItem instanceof FeeLineItem ) {
            feeApplied = (FeeLineItem) lineItem;
            break;
          }
        }
      }
      if ( feeApplied != null ) {
        break;
      }
    }
    if ( feeApplied != null ) {
      logger.info(this.getClass().getSimpleName(), "FeeApplied", feeApplied);
      test( feeApplied.getAmount() > 0L, "Fee was applied." );
      test( feeApplied.getAmount() == 10L, "Correct fee applied");
    } else {
      test(false, "Fee not applied");
    }
    //test( feesWasApplied, "Fee was applied." ); Commented because fees are temporaly removed.

  }
}
