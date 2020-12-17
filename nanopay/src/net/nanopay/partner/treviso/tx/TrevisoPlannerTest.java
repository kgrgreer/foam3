
package net.nanopay.partner.treviso.tx;

import static foam.mlang.MLang.EQ;

import java.util.List;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.auth.Address;
import foam.nanos.auth.Group;
import foam.nanos.auth.GroupPermissionJunction;
import foam.nanos.auth.User;
import foam.nanos.ruler.RuleGroup;
import net.nanopay.bank.BankAccount;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.bank.USBankAccount;
import net.nanopay.fx.FXSummaryTransaction;
import net.nanopay.country.br.tx.ExchangeLimitTransaction;
import net.nanopay.payment.Institution;
import net.nanopay.tx.ComplianceTransaction;
import net.nanopay.tx.TransactionQuote;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;


public class TrevisoPlannerTest
    extends foam.nanos.test.Test {

  protected DAO groupDAO_;
  protected DAO userDAO_;
  protected User user1;
  protected User user2;
  protected DAO permissionJunctionDAO_;
  BankAccount user1BankAccount;
  BankAccount user2USBankAccount;
  DAO localUserDAO;
  DAO localGroupDAO;
  DAO localAccountDAO;
  DAO planDAO;
  DAO ruleGroupDAO;
  X x_;

  @Override
  public void runTest(X x) {

    userDAO_ = (DAO) x.get("localUserDAO");
    planDAO = (DAO) x.get("localTransactionPlannerDAO");
    ruleGroupDAO = ((DAO) x.get("ruleGroupDAO"));
    x_ = x;
    RuleGroup trevisoGroup = (RuleGroup) ruleGroupDAO.find("TrevisoPlanner");
    trevisoGroup.setEnabled(true);
    ruleGroupDAO.put(trevisoGroup);

    setUpTest();
    BRLToUSD();

    trevisoGroup.setEnabled(false);
    ruleGroupDAO.put(trevisoGroup);
  }

  private void setUpTest() {
    permissionJunctionDAO_ = (DAO) x_.get("groupPermissionJunctionDAO");
    groupDAO_ = (DAO) x_.get("localGroupDAO");
    localUserDAO = (DAO) x_.get("localUserDAO");
    localAccountDAO = (DAO) x_.get("localAccountDAO");
    Address businessAddress = new Address();
    businessAddress.setCity("Toronto");
    businessAddress.setCountryId("CA");

    Group businessGroup = (Group) groupDAO_.find("business");
    if ( businessGroup == null ) {
      businessGroup = new Group.Builder(x_)
        .setId("business")
        .build();
      businessGroup = (Group) groupDAO_.put(businessGroup);
    }
    permissionJunctionDAO_.put(
      new GroupPermissionJunction.Builder(x_)
      .setSourceId("business")
      .setTargetId("digitalaccount.default.create")
      .build()
    );
    user1 = new User();
    user1.setFirstName("TrevisoPayer");
    user1.setLastName("Treviso");
    user1.setGroup("business");
    user1.setEmail("testTrevisoTransaction@nanopay.net");
    user1.setAddress(businessAddress);
    user1.setEmailVerified(true);
    localUserDAO.put(user1);

    user2 = new User();
    user2.setFirstName("TrevisoPayee");
    user2.setLastName("Treviso");
    user2.setGroup("business");
    user2.setEmail("testTrevisoTransaction1@nanopay.net");
    user2.setAddress(businessAddress);
    user2.setEmailVerified(true);
    localUserDAO.put(user2);


    user1BankAccount = new BankAccount();
    user1BankAccount.setAccountNumber("000000000004");
    user1BankAccount.setInstitutionNumber("00000000001");
    user1BankAccount.setOwner(user1.getId());
    user1BankAccount.setDenomination("BRL");
    user1BankAccount.setStatus(BankAccountStatus.VERIFIED);
    user1BankAccount.setCountry("BR");


    user2USBankAccount = new USBankAccount();
    user2USBankAccount.setAccountNumber("000000000005");
    user2USBankAccount.setInstitutionNumber("00000000001");
    user2USBankAccount.setOwner(user2.getId());
    user2USBankAccount.setDenomination("USD");
    user2USBankAccount.setStatus(BankAccountStatus.VERIFIED);

    Institution institution = new Institution();
    DAO institutionDAO = (DAO) x_.get("institutionDAO");
    List institutions = ((ArraySink) institutionDAO
        .where(
            EQ(Institution.INSTITUTION_NUMBER, user2USBankAccount.getInstitutionNumber())
        )
        .select(new ArraySink())).getArray();

    if (institutions.isEmpty()) {
      institution = new Institution();
      institution.setName("AFEX Test institution");
      institution.setInstitutionNumber(user2USBankAccount.getInstitutionNumber());
      institution.setSwiftCode("22344421314124435333");
      institution.setCountryId("US");
      institution = (Institution) institutionDAO.put(institution);
    } else {
      institution = (Institution) institutions.get(0);
    }
    user2USBankAccount.setInstitution(institution.getId());
    user1BankAccount.setInstitution(institution.getId());

    localAccountDAO.put(user1BankAccount);
    localAccountDAO.put(user2USBankAccount);

  }

  public void BRLToUSD(){
    user1BankAccount = (BankAccount) localAccountDAO.find(user1BankAccount.getId());

    TransactionQuote quote = new TransactionQuote.Builder(x_).build();
    Transaction transaction = new Transaction.Builder(x_).build();
    transaction.setPayerId(user1.getId());
    transaction.setSourceAccount(user1BankAccount.getId());
    transaction.setPayeeId(user2.getId());
    transaction.setDestinationAccount(user2USBankAccount.getId());
    transaction.setDestinationAmount(100l);
    transaction.setSourceCurrency("BRL");
    transaction.setDestinationCurrency("USD");
    quote.setRequestTransaction(transaction);
    quote.setDestinationAccount(user2USBankAccount);
    quote.setSourceAccount(user1BankAccount);
    Transaction txn = (Transaction) ((TransactionQuote) planDAO.put(quote)).getPlan();
    test( null != txn, "BRL USD quote was processed" );
    test( txn instanceof FXSummaryTransaction && txn.getStatus() == TransactionStatus.COMPLETED,
      "FXSummary Transaction is the first transaction for BRL to USD");
    
    txn = txn.getNext()[0];
    test( txn instanceof ComplianceTransaction && txn.getStatus() == TransactionStatus.PENDING_PARENT_COMPLETED,
      "BRL-USD root.next[0] instanceof ComplianceTransaction, found: "+txn.getClass().getSimpleName());
    test( txn.getNext().length > 0, "BRL-USD root.next[0] has next, found: "+txn.getNext().length);

    txn = txn.getNext()[0];
    test( txn instanceof ExchangeLimitTransaction && txn.getStatus() == TransactionStatus.PENDING_PARENT_COMPLETED,
      "BRL-USD root.next[0].next[0] instanceof ExchangeLimitTransaction, found: "+txn.getClass().getSimpleName());
    test( txn.getNext().length > 0, "BRL-USD root.next[0].next[0] has next");
    txn = txn.getNext()[0];

    test( txn instanceof TrevisoTransaction && txn.getStatus() == TransactionStatus.PENDING_PARENT_COMPLETED,
      "BRL-USD root.next[0].next[0].next[0] instanceof TrevisoTransaction, found: "+txn.getClass().getSimpleName());
    test( txn.getNext().length == 0, "BRL-USD root.next[0].next[0].next[0] does not have next, found: "+txn.getNext().length);

    user2USBankAccount = (USBankAccount) localAccountDAO.find(user2USBankAccount);
    test(txn.getSourceCurrency().equals("BRL"), "BRL USD Source Currency is BRL");
    test(txn.getDestinationCurrency().equals("USD"), "BRL USD Destination Currency is USD");
    test(txn.getAmount() == 500l, "BRL USD Source amount is correct");
    test(txn.getDestinationAmount() == 100l, "BRL USD Destination amount is correct");
    test( txn.getSourceAccount() == user1BankAccount.getId(), "Corrent source bank account");
    test( txn.getDestinationAccount() == user2USBankAccount.getId(), "Correct destination bank account");

  }

}
