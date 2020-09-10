package net.nanopay.tx.alterna;

import com.jcraft.jsch.*;
import foam.core.ContextAgent;
import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.alarming.Alarm;
import foam.nanos.alarming.AlarmReason;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import foam.nanos.notification.email.EmailMessage;
import foam.util.Emails.EmailsUtility;
import net.nanopay.cico.model.EFTConfirmationFileRecord;
import net.nanopay.cico.model.EFTReturnFileCredentials;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;
import org.apache.commons.io.FileUtils;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import java.util.Vector;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static foam.mlang.MLang.EQ;

public class EFTConfirmationFileProcessor implements ContextAgent
{

  final static String CONFIRMATION_FILES = System.getProperty("NANOPAY_HOME") + "/var" + "/alterna_eft/confirmation/";

  @Override
  public void execute(X x) {
    Logger logger = new PrefixLogger(new String[] {"Alterna: "}, (Logger) x.get("logger"));
    logger.info("starting EFT Confirmation file processing.");

    EFTReturnFileCredentials credentials = (EFTReturnFileCredentials) x.get("EFTReturnFileCredentials");

    EFTConfirmationFileParser eftConfirmationFileParser = new EFTConfirmationFileParser();
    EFTUploadCSVFileParser eftUploadCSVFileParser = new EFTUploadCSVFileParser();

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
      Pattern pattern = Pattern.compile("UploadLog_[0-9]{8}_" + credentials.getIdentifier() + ".csv.txt");
      for ( Object entry : fileList ) {
        ChannelSftp.LsEntry e = (ChannelSftp.LsEntry) entry;
        Matcher matcher = pattern.matcher(e.getFilename());
        if ( matcher.find() ) {
          fileNames.add(matcher.group());
        }
      }

      if ( fileNames.size() == 0 ) logger.warning("No confirmation file found.");

      InputStream confirmationFileStream = null;
      for ( String fileName : fileNames ) {
        confirmationFileStream = channelSftp.get("/Returns/" + fileName);
        List<FObject> confirmationFile = eftConfirmationFileParser.parse(confirmationFileStream);

        // UploadLog_yyyyMMdd_identifier.csv.txt -> yyyyMMdd_identifier.csv
        String uploadCSVFileName = fileName.substring(10, fileName.lastIndexOf('.'));
        Vector uploadCSVList = channelSftp.ls("/Archive/");
        boolean uploadCSVExist = false;
        for ( Object entry : uploadCSVList ) {
          ChannelSftp.LsEntry e = (ChannelSftp.LsEntry) entry;
          if ( e.getFilename().equals(uploadCSVFileName) ) {
            uploadCSVExist = true;
            break;
          }
        }

        if ( uploadCSVExist ) {
          InputStream uploadFileStream = channelSftp.get("/Archive/" + uploadCSVFileName);

          List<FObject> uploadFileList = eftUploadCSVFileParser.parse(uploadFileStream);

          for ( int j = 0; j < confirmationFile.size(); j++ ) {
            EFTConfirmationFileRecord eftConfirmationFileRecord = (EFTConfirmationFileRecord) confirmationFile.get(j);
            AlternaFormat eftUploadFileRecord = (AlternaFormat) uploadFileList.get(j);

            processTransaction(x, transactionDao, eftConfirmationFileRecord, eftUploadFileRecord, fileName);
          }
        } else {
          logger.error("Can't find the corresponding upload CSV file in Archive folder", uploadCSVFileName);
        }
      }

      Vector folderList = channelSftp.ls("/");
      boolean folderExist = false;
      for ( Object entry : folderList ) {
        ChannelSftp.LsEntry e = (ChannelSftp.LsEntry) entry;
        if ( "Archive_EFTConfirmationFile".equals(e.getFilename()) ) {
          folderExist = true;
          break;
        }
      }

      if ( ! folderExist ) {
        channelSftp.mkdir("Archive_EFTConfirmationFile");
      }

      String srcFileDirectory = "/Returns/";
      String dstFileDirectory = "/Archive_EFTConfirmationFile/";

      // move processed files
      for ( String fileName : fileNames ) {
        channelSftp.rename(srcFileDirectory + fileName, dstFileDirectory + fileName);
        FileUtils.touch(new File(CONFIRMATION_FILES + fileName));
        FileUtils.copyInputStreamToFile(confirmationFileStream, new File(CONFIRMATION_FILES + fileName));
      }

      logger.info("EFT Confirmation file processing finished");

    } catch ( JSchException | SftpException | IOException e ) {
      logger.error(e);
      ((DAO) x.get("alarmDAO")).put(new Alarm.Builder(x)
        .setName("EFF Confirmation file processing")
        .setReason(AlarmReason.CREDENTIALS)
        .setNote(e.getMessage())
        .build());
    } finally {
      if ( channel != null ) channel.disconnect();
      if ( session != null ) session.disconnect();
    }
  }

  public static void processTransaction(X x, DAO transactionDao, EFTConfirmationFileRecord eftConfirmationFileRecord,
                                        AlternaFormat eftUploadFileRecord, String fileName) {
    Transaction tran = (Transaction) transactionDao.find(
      EQ(Transaction.ID, eftUploadFileRecord.getReference()));

    if ( tran != null ) {
      tran = (Transaction) tran.fclone();
      if ( tran instanceof AlternaCITransaction ) {
        AlternaCITransaction txn = (AlternaCITransaction) tran;
        txn.setConfirmationLineNumber(fileName + "_" + eftConfirmationFileRecord.getLineNumber());
        if ( "Failed".equals(eftConfirmationFileRecord.getStatus()) ) {
          txn.setStatus(TransactionStatus.FAILED);
          txn.setDescription(eftConfirmationFileRecord.getReason());
          sendEmail(x, "Transaction was rejected by EFT confirmation file",
                    "Transaction id: " + txn.getId() + ", Reason: " + txn.getDescription() + ", Confirmation line number: "
                    + fileName + "_" + eftConfirmationFileRecord.getLineNumber());
        }
      } else if ( tran instanceof AlternaCOTransaction ) {
        AlternaCOTransaction txn = (AlternaCOTransaction) tran;
        txn.setConfirmationLineNumber(fileName + "_" + eftConfirmationFileRecord.getLineNumber());
        if ( "Failed".equals(eftConfirmationFileRecord.getStatus()) ) {
          txn.setStatus(TransactionStatus.FAILED);
          txn.setDescription(eftConfirmationFileRecord.getReason());
          sendEmail(x, "Transaction was rejected by EFT confirmation file",
                    "Transaction id: " + txn.getId() + ", Reason: " + txn.getDescription() + ", Confirmation line number: "
                    + fileName + "_" + eftConfirmationFileRecord.getLineNumber());
        }
      }

      if ( "OK".equals(eftConfirmationFileRecord.getStatus()) &&
           tran.getStatus().equals(TransactionStatus.PENDING) ) {
        tran.setStatus(TransactionStatus.SENT);
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
