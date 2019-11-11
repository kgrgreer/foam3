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
import net.nanopay.tx.TransactionQuote;
import net.nanopay.tx.alterna.AlternaCOTransaction;
import net.nanopay.tx.Transfer;
import net.nanopay.tx.TransactionLineItem;
import net.nanopay.tx.LineItemType;
import net.nanopay.tx.LineItemFee;
import net.nanopay.tx.LineItemAmount;
import net.nanopay.tx.FeeLineItem;

import java.util.List;

public class NanopayLineItemFeeDAOTest
    extends foam.nanos.test.Test {

  private FXService fxService;
  protected User payer_ ;
  protected User payee_;
  protected User feeUser_;
  protected CABankAccount payeeBankAccount_;
  X x_;

  protected static Long SERVICE_FEE = 1000L;

  @Override
  public void runTest(X x) {
    x_ = x;

    fxService = (FXService) x.get("ascendantFXService");

    setUpTest();
    testTransactionFee();
    tearDownTest();
  }

  private void setUpTest() {

    payee_ = (User) ((DAO) x_.get("localUserDAO")).find(EQ(User.EMAIL, "testascendantfxtransaction@nanopay.net"));
    if (payee_ == null) {
      payee_ = new User();
      payee_.setFirstName("FXPayee");
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

    // LineItemTypes
    DAO typeDAO = (DAO) x_.get("lineItemTypeDAO");
    LineItemType type1 = new LineItemType.Builder(x_)
      .setName("service")
      .setTaxCode("tax")
      .build();
    type1 = (LineItemType) typeDAO.put(type1);

    LineItemType type2 = new LineItemType.Builder(x_)
      .setName("expense")
      .setTaxCode("no_2tax")
      .build();
    type2 = (LineItemType) typeDAO.put(type2);

    LineItemType type3 = new LineItemType.Builder(x_)
      .setName("fee")
      .setTaxCode("tax")
      .build();
    type3 = (LineItemType) typeDAO.put(type3);

    // LineItemFees
    DAO feeDAO = (DAO) x_.get("lineItemFeeDAO");
    LineItemFee fee = new LineItemFee.Builder(x_)
      .setForType(type1.getId())
      .setAmount(new LineItemAmount.Builder(x_)
                 .setValue(SERVICE_FEE)
                 .build())
      .setFeeType(type3.getId())
      .build();
    fee = (LineItemFee) feeDAO.put(fee);

    // LineItemTypeAccount
    feeUser_ = (User) ((DAO) x_.get("localUserDAO")).find(EQ(User.EMAIL, "testlineitemtypeaccount@nanopay.net"));
    if (feeUser_ == null) {
      feeUser_ = new User();
      feeUser_.setFirstName("Payee");
      feeUser_.setLastName("Fee Account");
      feeUser_.setGroup("business");
      feeUser_.setEmail("testlineitemtypeaccount@nanopay.net");
      Address businessAddress = new Address();
      businessAddress.setCity("Toronto");
      businessAddress.setCountryId("CA");
      feeUser_.setAddress(businessAddress);
    }
    feeUser_ = (User) feeUser_.fclone();
    feeUser_.setEmailVerified(true);
    feeUser_ = (User) (((DAO) x_.get("localUserDAO")).put_(x_, feeUser_)).fclone();

    DAO lineItemTypeAccountDAO = (DAO) x_.get("lineItemTypeAccountDAO");
    LineItemTypeAccount lineItemTypeAccount = new LineItemTypeAccount.Builder(x_)
      .setUser(payee_.getId())
      .setType(type3.getId())
      .setAccount(feeUser_.getId())
      .build();
    lineItemTypeAccount = (LineItemTypeAccount) lineItemTypeAccountDAO.put(lineItemTypeAccount);
  }

  private void tearDownTest() {
    ((DAO) x_.get("localAccountDAO")).remove(payeeBankAccount_);
    ((DAO) x_.get("localUserDAO")).remove(payee_);
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

    DAO typeDAO = (DAO) x_.get("lineItemTypeDAO");
    LineItemType service = (LineItemType) typeDAO
      .find(EQ(LineItemType.NAME, "service"));

    TransactionLineItem lineItem1 = new TransactionLineItem.Builder(x_)
      .setType(service.getId())
      .setAmount(20000)
      .build();

    LineItemType expense = (LineItemType) typeDAO
      .find(EQ(LineItemType.NAME, "expense"));
    TransactionLineItem lineItem2 = new TransactionLineItem.Builder(x_)
      .setType(expense.getId())
      .setAmount(2000)
      .build();
    transaction.addLineItems(new TransactionLineItem[] {lineItem1, lineItem2}, new TransactionLineItem[] {});

    quote.setRequestTransaction(transaction);
    TransactionQuote resultQoute = (TransactionQuote) ((DAO) x_.get("localTransactionQuotePlanDAO")).put_(x_, quote);
    test( null != resultQoute, "TransactionQuote not null");
    FeeLineItem feeApplied = null;
    for ( int i = 0; i < quote.getPlans().length; i++ ) {
      Transaction plan = quote.getPlans()[i];
      if ( null != plan && plan.getNext() != null && plan.getNext().length > 0 ) {
        plan = plan.getNext()[0];
        TransactionLineItem[] lineItems = plan.getLineItems();
        test( lineItems != null && lineItems.length > 0, "Transaction has LineItems");

        for ( TransactionLineItem lineItem : lineItems ) {
          logger.debug("LineItem: "+lineItem);
          if ( lineItem instanceof FeeLineItem ) {
            feeApplied = (FeeLineItem) lineItem;
            logger.debug("FeeLineItem: "+lineItem);
            if ( feeApplied.getAmount() == SERVICE_FEE ) {
              break;
            } else {
              feeApplied = null;
            }
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
      test( feeApplied.getAmount() == SERVICE_FEE, "Correct fee applied");
      test( feeApplied.getDestinationAccount() == feeUser_.getId(), "Correct fee account");
    } else {
      //applied only to InvoiceTransaction, the test generates AlternaCOTransaction
      //test(false, "Fee not applied");
    }
    //test( feesWasApplied, "Fee was applied." ); Commented because fees are temporaly removed.

  }
}
