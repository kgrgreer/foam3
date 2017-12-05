package net.nanopay.cico.spi.alterna;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
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
import net.nanopay.cico.spi.alterna.CsvUtil;
import foam.core.ContextAwareSupport;
import foam.core.Detachable;
import foam.core.FObject;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.mlang.MLang;
import net.nanopay.cico.spi.alterna.SFTPService;
import net.nanopay.cico.spi.alterna.AlternaWebAgent;
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

  @Override
  public void sendCICOFile() {
    ByteArrayOutputStream  out = new ByteArrayOutputStream();

    CsvUtil util = new CsvUtil();
    Sink outputter = util.writeCsvFile(new Outputter(out, OutputterMode.STORAGE, false), transactionDAO, userDAO, bankAccountDAO, branchDAO);

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
      channelSftp.put(new ByteArrayInputStream(out.toByteArray()), util.generateFilename(new Date()));
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