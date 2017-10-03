package net.nanopay.cico.spi.alterna;

import foam.core.Detachable;
import foam.core.FObject;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.dao.Sink;
import foam.lib.csv.Outputter;
import foam.lib.json.OutputterMode;
import foam.mlang.MLang;
import foam.nanos.auth.User;
import foam.nanos.http.WebAgent;
import net.nanopay.cico.model.TransactionStatus;
import net.nanopay.cico.model.TransactionType;
import net.nanopay.model.Account;
import net.nanopay.model.BankAccountInfo;
import net.nanopay.model.Branch;
import net.nanopay.tx.model.Transaction;

import javax.servlet.http.HttpServletResponse;
import java.io.PrintWriter;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;

public class AlternaWebAgent
    implements WebAgent
{
  protected ThreadLocal<SimpleDateFormat> filenameSdf = new ThreadLocal<SimpleDateFormat>() {
    @Override
    protected SimpleDateFormat initialValue() {
      return new SimpleDateFormat("yyyyMMdd");
    }
  };

  protected ThreadLocal<SimpleDateFormat> csvSdf = new ThreadLocal<SimpleDateFormat>() {
    @Override
    protected SimpleDateFormat initialValue() {
      return new SimpleDateFormat("yyyy-MM-dd");
    }
  };

  public AlternaWebAgent() {}

  /**
   * Generates the process date based on a given date
   * @param date date used to determine the processing date
   * @return either the current date plus 1 day if current time is before 11 am
   *         or the current date plus 2 days if the current date is after 11 am
   */
  public String generateProcessDate(Date date) {
    Calendar now = Calendar.getInstance();
    now.setTime(date);
    now.add(Calendar.DAY_OF_MONTH, ( now.get(Calendar.HOUR_OF_DAY) < 11 ) ? 1 : 2);
    return csvSdf.get().format(now.getTime());
  }

  /**
   * Generates a filename based on a given date
   * @param date date to use in the filename
   * @return the filename
   */
  public String generateFilename(Date date) {
    return "mintchipcashout_" + filenameSdf.get().format(date) + ".csv";
  }

  /**
   * Generates a reference id by concatentating the current time in milliseconds with a randomly generated number
   * @return a reference id
   */
  public String generateReferenceId() {
    return new Date().getTime() + "" + (int) (Math.random() * (99999 - 10000) + 10000);
  }

  public synchronized void execute(X x) {
    DAO userDAO = (DAO) x.get("localUserDAO");
    DAO branchDAO = (DAO) x.get("branchDAO");
    DAO bankAccountDAO = (DAO) x.get("bankAccountDAO");
    DAO transactionDAO = (DAO) x.get("transactionDAO");
    PrintWriter  out = (PrintWriter) x.get(PrintWriter.class);
    final Sink outputter = new Outputter(out, OutputterMode.STORAGE, false);
    HttpServletResponse response = (HttpServletResponse) x.get(HttpServletResponse.class);

    Date now = new Date();
    response.setContentType("text/html");
    response.setHeader("Content-disposition", "attachment; filename=\"" + generateFilename(now) + "\"");

    transactionDAO.where(MLang.EQ(Transaction.CICO_STATUS, TransactionStatus.NEW)).select(new AbstractSink() {
      @Override
      public void put(FObject obj, Detachable sub) {
        try {
          User user = null;
          String txnType = null;
          Account bankAccount = null;
          BankAccountInfo bankAccountInfo = null;

          Transaction t = (Transaction) obj;

          // get transaction type and user
          if (t.getType() == TransactionType.CASHIN) {
            txnType = "DB";
            user = (User) userDAO.find(t.getPayeeId());
          } else if (t.getType() == TransactionType.CASHOUT) {
            txnType = "CR";
            user = (User) userDAO.find(t.getPayerId());
          } else {
            // don't output if for whatever reason we get here and
            // the transaction is not a cash in or cash out
            return;
          }

          // get account
          bankAccount = (Account) bankAccountDAO.find(t.getAccountId());
          if (bankAccount == null || !(bankAccount.getAccountInfo() instanceof BankAccountInfo)) {
            return;
          }

          bankAccountInfo = (BankAccountInfo) bankAccount.getAccountInfo();
          Branch branch = (Branch) branchDAO.find(bankAccountInfo.getBranchId());

          AlternaFormat alternaFormat = new AlternaFormat();
          boolean isOrganization = (user.getOrganization() != null && !user.getOrganization().isEmpty());
          alternaFormat.setFirstName(!isOrganization ? user.getFirstName() : user.getOrganization());
          alternaFormat.setLastName(!isOrganization ? user.getLastName() : " ");
          alternaFormat.setTransitNumber(bankAccountInfo.getTransitNumber());
          alternaFormat.setBankNumber(branch.getFinancialId());
          alternaFormat.setAccountNumber(bankAccountInfo.getAccountNumber());
          alternaFormat.setAmountDollar(String.format("%.2f", (t.getAmount() / 100.0)));
          alternaFormat.setTxnType(txnType);
          alternaFormat.setProcessDate(generateProcessDate(now));
          alternaFormat.setReference(generateReferenceId());
          outputter.put(alternaFormat, sub);
        } catch (Exception e) {
          e.printStackTrace();
        }
      }
    });
  }
}