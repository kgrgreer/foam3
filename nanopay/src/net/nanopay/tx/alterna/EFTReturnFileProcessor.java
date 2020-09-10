package net.nanopay.tx.alterna;

import com.jcraft.jsch.*;
import foam.core.ContextAgent;
import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.alarming.Alarm;
import foam.nanos.alarming.AlarmReason;
import foam.nanos.logger.Logger;
import foam.nanos.notification.email.EmailMessage;
import foam.util.Emails.EmailsUtility;
import net.nanopay.cico.model.EFTReturnFileCredentials;
import net.nanopay.cico.model.EFTReturnRecord;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import java.io.InputStream;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static foam.mlang.MLang.*;

public class EFTReturnFileProcessor implements ContextAgent
{
  @Override
  public void execute(X x) {
    Logger logger = (Logger) x.get("logger");
    EFTReturnFileCredentials credentials = (EFTReturnFileCredentials) x.get("EFTReturnFileCredentials");

    EFTReturnFileParser eftReturnFileParser = new EFTReturnFileParser();
    DAO transactionDao = (DAO)x.get("localTransactionDAO");

    List<String> fileNames = new ArrayList<>();
    Session session = null;
    Channel channel = null;
    ChannelSftp channelSftp;

    try {
      // create session with user name and password
      JSch jsch = new JSch();
      session = jsch.getSession(credentials.getUser(), credentials.getHost(), credentials.getPort());
      session.setPassword(credentials.getPassword());

      // add configuration
      Properties config = new Properties();
      config.put("StrictHostKeyChecking", "no");
      session.setConfig(config);
      session.setTimeout(60000);
      session.connect(60000);

      // open SFTP connection and download file
      channel = session.openChannel("sftp");
      channel.connect();
      channelSftp = (ChannelSftp) channel;

      Vector fileList = channelSftp.ls("/Returns/");
      Pattern pattern = Pattern.compile("[0-9]{12}.txt");
      for ( Object entry : fileList ) {
        ChannelSftp.LsEntry e = (ChannelSftp.LsEntry) entry;
        Matcher matcher = pattern.matcher(e.getFilename());
        if ( matcher.find() ) {
          fileNames.add(matcher.group());
        }
      }

      for ( String fileName : fileNames ) {
        InputStream is = channelSftp.get("/Returns/" + fileName);
        List<FObject> returnFile = eftReturnFileParser.parse(is);

        for ( FObject record : returnFile ) {
          EFTReturnRecord eftReturnRecord = (EFTReturnRecord) record;

          processTransaction(x, transactionDao, eftReturnRecord);
        }
      }

      logger.debug("EFT Return file processing finished");

    } catch ( JSchException | SftpException e ) {
      logger.error(e);
      ((DAO) x.get("alarmDAO")).put(new Alarm.Builder(x)
        .setName("EFF Return File processing")
        .setReason(AlarmReason.CREDENTIALS)
        .setNote(e.getMessage())
        .build());
    } finally {
      if ( channel != null ) channel.disconnect();
      if ( session != null ) session.disconnect();
    }
  }

  public static void processTransaction(X x, DAO transactionDao, EFTReturnRecord eftReturnRecord) {
    Transaction tran = (Transaction) transactionDao.find(AND(
      EQ(Transaction.ID, eftReturnRecord.getExternalReference()),
      EQ(Transaction.AMOUNT, (long) (eftReturnRecord.getAmount() * 100))));

    if ( tran != null ) {
      tran = (Transaction) tran.fclone();

      String returnType = "Return";
      if ( "900".equals(eftReturnRecord.getReturnCode()) ) {
        returnType = "Reject";
      }

      // have to duplicate for CI/CO classes
      if ( tran instanceof AlternaCITransaction ) {
        AlternaCITransaction txn = (AlternaCITransaction) tran;
        txn.setReturnCode(eftReturnRecord.getReturnCode());
        txn.setReturnDate(eftReturnRecord.getReturnDate());
        txn.setReturnType(returnType);
      } else if ( tran instanceof AlternaCOTransaction ) {
        AlternaCOTransaction txn = (AlternaCOTransaction) tran;
        txn.setReturnCode(eftReturnRecord.getReturnCode());
        txn.setReturnDate(eftReturnRecord.getReturnDate());
        txn.setReturnType(returnType);
      }

      if ( tran.getStatus() == TransactionStatus.SENT ) {
        tran.setStatus(TransactionStatus.DECLINED);
        sendEmail(x, "Transaction was rejected or returned by EFT return file",
          "Transaction id: " + tran.getId() + ", Return code: " + eftReturnRecord.getReturnCode() + ", Return date: " + eftReturnRecord.getReturnDate());
        tran.setCompletionDate(new Date());
      } else if ( tran.getStatus() == TransactionStatus.COMPLETED && "Return".equals(returnType) ) {
        tran.setStatus(TransactionStatus.DECLINED);
        sendEmail(x, "Transaction was returned outside of the 2 business day return period",
          "Transaction id: " + tran.getId() + ", Return code: " + eftReturnRecord.getReturnCode() + ", Return date: " + eftReturnRecord.getReturnDate());
        tran.setCompletionDate(new Date());
      }

      transactionDao.put(tran);
    }
  }

  public static void sendEmail(X x, String subject, String content) {
    EmailMessage message = new EmailMessage();

    message.setTo(new String[]{"ops@nanopay.net"});
    message.setSubject(subject);
    message.setBody(content);
    EmailsUtility.sendEmailFromTemplate(x, null, message, null, null);
  }
}
