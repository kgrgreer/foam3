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
import net.nanopay.tx.model.Transaction;
import net.nanopay.payment.Institution;
import net.nanopay.tx.alterna.AlternaCOTransaction;
import net.nanopay.tax.LineItemTax;

import java.util.List;

public class NanopayLineItemTaxDAOTest
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
      payee_.setFirstName("FXPayee");
      payee_.setLastName("AscendantFX");
      payee_.setGroup("business");
      payee_.setEmail("testascendantfxtransaction@nanopay.net");
      Address businessAddress = new Address();
      businessAddress.setCity("Toronto");
      businessAddress.setCountryId("CA");
      businessAddress.setRegionId("AB");
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
      .setName("serviceTest")
      .setTaxCode("PF050099")
      .build();
    type1 = (LineItemType) typeDAO.put(type1);

    LineItemType vatTax = new LineItemType.Builder(x_)
      .setName("VAT")
      .setTaxCode("")
      .build();
    vatTax = (LineItemType) typeDAO.put(vatTax);

    LineItemType type2 = new LineItemType.Builder(x_)
      .setName("expenseTest")
      .setTaxCode("no_2tax")
      .build();
    type2 = (LineItemType) typeDAO.put(type2);

    LineItemType type3 = new LineItemType.Builder(x_)
      .setName("feeTest")
      .setTaxCode("PF050099")
      .build();
    type3 = (LineItemType) typeDAO.put(type3);

    // LineItemTaxes
    DAO taxDAO = (DAO) x_.get("lineItemTaxDAO");
    LineItemTax tax = new LineItemTax.Builder(x_)
      .setForType(type1.getId())
      .setTaxType(vatTax.getId())
      .setTaxCode("PF050099")
      .setRate(10.0)
      .setCountryId("CA")
      .setRegionId("AB")
      .build();
      taxDAO.put(tax);

    LineItemTax tax2 = new LineItemTax.Builder(x_)
        .setForType(type3.getId())
        .setTaxType(vatTax.getId())
        .setTaxCode("PF050099")
        .setRate(10.0)
        .setCountryId("CA")
        .setRegionId("AB")
        .build();
      taxDAO.put(tax2);
  }

  private void tearDownTest() {
    ((DAO) x_.get("localAccountDAO")).remove(payeeBankAccount_);
    userDAO_.remove(payee_);
  }

  public void testTransactionFee(){
    Logger logger = (Logger) x_.get("logger");
    TransactionQuote quote = new TransactionQuote.Builder(x_).build();
    Transaction transaction = new Transaction.Builder(x_).build();
    transaction.setPayeeId(1002);
    transaction.setPayerId(payee_.getId());
    transaction.setAmount(1000L);
    transaction.setDestinationCurrency("CAD");
    transaction.setSourceAccount(payeeBankAccount_.getId());

    DAO typeDAO = (DAO) x_.get("lineItemTypeDAO");
    LineItemType service = (LineItemType) typeDAO
      .find(EQ(LineItemType.NAME, "serviceTest"));

    LineItemType fee = (LineItemType) typeDAO
        .find(EQ(LineItemType.NAME, "feeTest"));

    TransactionLineItem lineItem1 = new TransactionLineItem.Builder(x_)
      .setType(service.getId())
      .setAmount(20000)
      .build();

    LineItemType expense = (LineItemType) typeDAO
      .find(EQ(LineItemType.NAME, "expenseTest"));
    TransactionLineItem lineItem2 = new TransactionLineItem.Builder(x_)
      .setType(expense.getId())
      .setAmount(2000)
      .build();

    TransactionLineItem lineItem3 = new TransactionLineItem.Builder(x_)
        .setType(fee.getId())
        .setAmount(2000)
        .build();

    transaction.addLineItems(new TransactionLineItem[] {lineItem1, lineItem2, lineItem3}, new TransactionLineItem[] {});

    quote.setRequestTransaction(transaction);
    TransactionQuote resultQoute = (TransactionQuote) ((DAO) x_.get("localTransactionQuotePlanDAO")).put_(x_, quote);
    test( null != resultQoute, "TransactionQuote not null");
    TaxLineItem taxApplied = null;
    int taxAppliedCount = 0;
    for ( int i = 0; i < quote.getPlans().length; i++ ) {
      Transaction plan = quote.getPlans()[i];
      if ( null != plan ) {
        TransactionLineItem[] lineItems = plan.getLineItems();
        for ( TransactionLineItem lineItem : lineItems ) {
          if ( lineItem instanceof TaxLineItem ) {
            taxAppliedCount++;
            TaxLineItem item = (TaxLineItem) lineItem;
            if ( item.getAmount() == 2000 ){
              taxApplied = item;
            }

          }
        }
      }
    }
    if ( taxApplied != null ) {
      logger.info(this.getClass().getSimpleName(), "TaxApplied", taxApplied);
      test( taxApplied.getAmount() > 0L, "Tax was applied." );
      test( taxApplied.getAmount() == 2000L, "Correct fee applied");
      test( taxAppliedCount == 2, "Two TaxLinItems found");
    } else {
      test(false, "Tax not applied");
    }
    //test( feesWasApplied, "Fee was applied." ); Commented because fees are temporaly removed.

  }
}
