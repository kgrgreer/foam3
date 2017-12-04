package net.nanopay.cico.spi.alterna;

import java.io.IOException;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.PrintWriter;
import java.io.ByteArrayOutputStream;
import java.io.ByteArrayInputStream;

import com.jcraft.jsch.Channel;
import com.jcraft.jsch.ChannelSftp;
import com.jcraft.jsch.JSch;
import com.jcraft.jsch.Session;
import com.jcraft.jsch.JSchException;
import com.jcraft.jsch.SftpException;

import foam.core.X;
import foam.dao.Sink;
import foam.lib.csv.Outputter;
import foam.lib.json.OutputterMode;
import foam.nanos.auth.User;
import net.nanopay.model.Account;
import net.nanopay.model.BankAccount;
import net.nanopay.model.Branch;
import net.nanopay.tx.model.Transaction;
import net.nanopay.cico.model.TransactionStatus;
import net.nanopay.cico.model.TransactionType;;
import javax.servlet.http.HttpServletResponse;
import foam.core.ContextAwareSupport;
import foam.core.Detachable;
import foam.core.FObject;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.nanos.pm.PM;
import net.nanopay.cico.spi.alterna.SFTPService;
import net.nanopay.cico.spi.alterna.AlternaWebAgent;
import java.io.PrintWriter;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;

public class AlternaSFTPService extends ContextAwareSupport implements SFTPService {

  protected final String HOST = "ftp.eftcanada.com";
  protected final int PORT = 22;
  protected final String USER = "eftcadtest1";
  protected final String PASSWORD = "nLGlp8Du";
  protected final String WORKING_DIR = "/";
  protected DAO userDAO;
  protected DAO branchDAO;
  protected DAO bankAccountDAO;
  protected DAO transactionDAO;

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
    return filenameSdf.get().format(date) + "_mintchipcashout.csv";
  }

  /**
   * Generates a reference id by concatentating the current time in milliseconds with a randomly generated number
   * @return a reference id
   */
  public String generateReferenceId() {
    return new Date().getTime() + "" + (int) (Math.random() * (99999 - 10000) + 10000);
  }


  @Override
  public void sendCICOFile() {
    ByteArrayOutputStream  out = new ByteArrayOutputStream();

    final Sink outputter = new Outputter(out, OutputterMode.STORAGE, false);
    final Date now = new Date();

    transactionDAO.where(MLang.EQ(Transaction.CICO_STATUS, TransactionStatus.NEW)).select(new AbstractSink() {
      @Override
      public void put(FObject obj, Detachable sub) {
        try {
          User user = null;
          String txnType = null;
          Transaction t = (Transaction) obj;

          // get transaction type and user
          if ( t.getType() == TransactionType.CASHIN || t.getType() == TransactionType.VERIFICATION ) {
            txnType = "DB";
            user = (User) userDAO.find(t.getPayeeId());
          } else if ( t.getType() == TransactionType.CASHOUT ) {
            txnType = "CR";
            user = (User) userDAO.find(t.getPayerId());
          } else {
            // don't output if for whatever reason we get here and
            // the transaction is not a cash in or cash out
            return;
          }

          // get bank account
          BankAccount bankAccount = (BankAccount) bankAccountDAO.find(t.getBankAccountId());
          Branch branch = (Branch) branchDAO.find(bankAccount.getBranchId());

          AlternaFormat alternaFormat = new AlternaFormat();
          boolean isOrganization = (user.getOrganization() != null && !user.getOrganization().isEmpty());
          alternaFormat.setFirstName(!isOrganization ? user.getFirstName() : user.getOrganization());
          alternaFormat.setLastName(!isOrganization ? user.getLastName() : " ");
          alternaFormat.setTransitNumber(bankAccount.getTransitNumber());
          alternaFormat.setBankNumber(branch.getFinancialId());
          alternaFormat.setAccountNumber(bankAccount.getAccountNumber());
          alternaFormat.setAmountDollar(String.format("%.2f", (t.getAmount() / 100.0)));
          alternaFormat.setTxnType(txnType);
          alternaFormat.setProcessDate(generateProcessDate(now));
          alternaFormat.setReference(generateReferenceId());
          outputter.put(alternaFormat, sub);
          // if a verification transaction, also add a CR with same information
          if ( t.getType() == TransactionType.VERIFICATION ) {
            AlternaFormat cashout = (AlternaFormat) alternaFormat.fclone();
            cashout.setTxnType("CR");
            outputter.put(cashout, sub);
          }
        } catch (Exception e) {
          e.printStackTrace();
        }
      }
    });

    Session session = null;
    Channel channel = null;
    ChannelSftp channelSftp = null;
    try {

      JSch jsch = new JSch();
      session = jsch.getSession(USER, HOST, PORT);
      session.setPassword(PASSWORD);
      java.util.Properties config = new java.util.Properties();
      config.put("StrictHostKeyChecking", "no");
      session.setConfig(config);
      session.connect();

      channel = session.openChannel("sftp");
      channel.connect();
      channelSftp = (ChannelSftp) channel;
      channelSftp.cd(WORKING_DIR);
      channelSftp.put(new ByteArrayInputStream(out.toByteArray()), generateFilename(new Date()));
      channelSftp.exit();
      channel.disconnect();
      session.disconnect();

    }
    catch ( Exception e ) {
       e.printStackTrace();
    }
    finally {
      System.out.println("Host Session disconnected.");
    }

  }


  // @Override
  // public void setContext(X x) {
  //   super(x);
  // }

  @Override
  public void start() {
    userDAO = (DAO) getX().get("localUserDAO");
    branchDAO = (DAO) getX().get("branchDAO");
    bankAccountDAO = (DAO) getX().get("bankAccountDAO");
    transactionDAO = (DAO) getX().get("standardCICOTransactionDAO");
  }

}