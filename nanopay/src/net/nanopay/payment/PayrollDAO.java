package nanopay.src.net.nanopay.payment;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.ServiceProvider;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.INSTANCE_OF;

import net.nanopay.account.DigitalAccount;
import net.nanopay.bank.BankAccount;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.bank.CABankAccount;
import net.nanopay.liquidity.Liquidity;
import net.nanopay.liquidity.LiquiditySettings;
import net.nanopay.payment.Payroll;
import net.nanopay.payment.PayrollEntry;
import net.nanopay.tx.model.Transaction;
import net.nanopay.util.Frequency;

public class PayrollDAO extends ProxyDAO {
  protected DAO serviceProviderDAO_, userDAO_, transactionDAO_, accountDAO_, liquiditySettingsDAO_;
  protected Logger logger;

  public PayrollDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
    serviceProviderDAO_ = (DAO) x.get("serviceProviderDAO");
    userDAO_ = (DAO) x.get("userDAO");
    transactionDAO_ = (DAO) x.get("transactionDAO");
    accountDAO_ = (DAO) x.get("accountDAO");
    liquiditySettingsDAO_ = (DAO) x.get("liquiditySettingsDAO");
    logger = (Logger) x.get("logger");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Payroll payroll = (Payroll) obj;
    PayrollEntry[] payees = payroll.getPayrollEntries();
    logger.log("Processing ", payees.length, " employees");
    prepareSPID(payroll);
    double totalPayroll = 0;
    int i = 0;
    String group = payroll.getGroup();
    String spid = payroll.getSpid();
    long sourceAccount = payroll.getSourceAccount();
    String note = payroll.getNote();
    String firstName, lastName, institutionNo, branchId, bankAccountNo;
    long id;
    double pay;
    Transaction transaction;
    for( PayrollEntry payee : payees ) {
      id = payee.getEmployeeId();
      pay = payee.getAmount();
      firstName = payee.getFirstName();
      lastName = payee.getLastName();
      bankAccountNo = payee.getBankAccountNo();
      institutionNo = payee.getInstitutionNo();
      branchId = payee.getBranchId();
      logger.info("Processing User ", i, ", id: ", id, ", email: ", payee.getEmail());
      ++i;

      totalPayroll += pay;
      findOrCreateUser(id, group, firstName, lastName, spid, bankAccountNo);
      transaction = createTransaction(sourceAccount, id, (long) pay, note);
      findOrCreateBankAccount(id, institutionNo, branchId, bankAccountNo, transaction.getDestinationAccount());
    }

    logger.log("Total payroll: ", totalPayroll);

    return payroll;
  }

  @Override
  public FObject remove_(X x, FObject fObject) {
    return null;
  }

  @Override
  public FObject find_(X x, Object o) {
    return super.find_(x, o);
  }

  public void prepareSPID(Payroll payroll) {
    ServiceProvider sp = new ServiceProvider();
    sp.setId(payroll.getSpid());
    sp.setEnabled(true);
    sp.setDescription("nanopay payroll");

    serviceProviderDAO_.put(sp);
  }

  public void findOrCreateUser(long id, String group, String firstName, String lastName, String spid, String bankAccountNo) {
    User user = (User) userDAO_.find(id);
    if (user == null) {
      user = new User();
      user.setId(id);
      user.setGroup(group);
      user.setFirstName(firstName);
      user.setLastName(lastName);
      user.setEmailVerified(true);
      user.setSpid(spid);
      user.setDesiredPassword("secret" + bankAccountNo);
      logger.log("Creating user: ", id);
      userDAO_.put(user);
    }
  }

  public Transaction createTransaction(long sourceAccount, long payeeId, long amount, String note) {
    Transaction transaction = new Transaction();
    transaction.setSourceAccount(sourceAccount);
    transaction.setPayeeId(payeeId);
    transaction.setAmount(amount);
    transaction.setSummary(note);
    Transaction newTransaction = (Transaction) transactionDAO_.put(transaction);
    logger.log("Created transaction: ", newTransaction.getId(), ", to: ", newTransaction.getDestinationAmount(), ", for: ", amount);
    return newTransaction;
  }

  public void findOrCreateBankAccount(long id, String institutionNo, String branchId, String bankAccountNo, long destinationAccount) {
    CABankAccount account = (CABankAccount) accountDAO_
      .where(
        AND(
          INSTANCE_OF(CABankAccount.class),
          EQ(BankAccount.OWNER, id),
          EQ(BankAccount.ACCOUNT_NUMBER, bankAccountNo),
          EQ(BankAccount.ENABLED, true)
        )
      );
    if ( account == null ) {
      logger.log("Creating account for ", id);
      account = new CABankAccount();
      account.setName("Payroll account");
      account.setOwner(id);
      account.setInstitutionNumber(institutionNo);
      account.setBranchId(branchId);
      account.setAccountNumber(bankAccountNo);
      account.setStatus(BankAccountStatus.VERIFIED);
      CABankAccount newAccount = (CABankAccount) accountDAO_.put(account);
      logger.log("Created bank account for ", id, " : ", newAccount.getId());
      setupLiquidity(newAccount, destinationAccount);
    } else {
      logger.log("Found bank account for ", id, " : ", account.getId());
    }
  }

  public void setupLiquidity(CABankAccount bankAccount, long destinationAccount) {
    DigitalAccount digitalAccount = (DigitalAccount) accountDAO_.find(destinationAccount);
    LiquiditySettings liquiditySettings = new LiquiditySettings();
    Liquidity highLiquidity = new Liquidity();
    highLiquidity.setRebalancingEnabled(true);
    highLiquidity.setEnabled(true);
    highLiquidity.setThreshold(1L);
    highLiquidity.setResetBalance(0L);
    highLiquidity.setPushPullAccount(bankAccount.getId());
    liquiditySettings.setName("Cash out for payroll");
    liquiditySettings.setCashOutFrequency(Frequency.DAILY);
    liquiditySettings.setHighLiquidity(highLiquidity);
    liquiditySettings.setUserToEmail(bankAccount.getOwner());
    LiquiditySettings newLiquiditySettings = (LiquiditySettings) liquiditySettingsDAO_.put(liquiditySettings);
    digitalAccount.setLiquiditySetting(newLiquiditySettings.getId());
    accountDAO_.put(digitalAccount);
    logger.log("Setting liquidity from ", destinationAccount, " to ", bankAccount.getId());
  }
}
