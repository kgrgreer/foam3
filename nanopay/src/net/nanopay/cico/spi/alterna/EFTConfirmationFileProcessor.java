package net.nanopay.cico.spi.alterna;

import com.jcraft.jsch.*;
import foam.core.ContextAwareSupport;
import foam.core.FObject;
import foam.core.X;
import foam.nanos.logger.Logger;
import foam.dao.DAO;
import foam.nanos.notification.email.EmailMessage;
import foam.nanos.notification.email.EmailService;
import net.nanopay.cico.model.EFTConfirmationFileRecord;
import net.nanopay.cico.model.EFTReturnFileCredentials;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import java.util.Vector;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static foam.mlang.MLang.EQ;

public class EFTConfirmationFileProcessor extends ContextAwareSupport
{
  public void process() {
    X x = getX();
    Logger logger = (Logger) x.get("logger");
    EFTReturnFileCredentials credentials = (EFTReturnFileCredentials) x.get("ETFReturnFileCredentials");

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
      session.connect();

      // open SFTP connection and download file
      channel = session.openChannel("sftp");
      channel.connect();
      channelSftp = (ChannelSftp) channel;

      Vector fileList = channelSftp.ls("/Returns/");
      Pattern pattern = Pattern.compile("UploadLog_[0-9]{8}_mintchipcashout.csv.txt");
      for ( Object entry : fileList ) {
        ChannelSftp.LsEntry e = (ChannelSftp.LsEntry) entry;
        Matcher matcher = pattern.matcher(e.getFilename());
        if ( matcher.find() ) {
          fileNames.add(matcher.group());
        }
      }

      for ( int i = 0; i < fileNames.size(); i++ ) {
        InputStream confirmationFileStream = channelSftp.get("/Returns/" + fileNames.get(i));
        List<FObject> confirmationFileList = eftConfirmationFileParser.parse(confirmationFileStream);

        // UploadLog_yyyyMMdd_mintchipcashout.csv.txt -> yyyyMMdd_mintchipcashout.csv
        String uploadCSVFileName = fileNames.get(i).substring(10, 38);
        InputStream uploadFileStream = channelSftp.get("/Archive/" + uploadCSVFileName);

        List<FObject> uploadFileList = eftUploadCSVFileParser.parse(uploadFileStream);

        for ( int j = 0; j < confirmationFileList.size(); j++ ) {
          EFTConfirmationFileRecord eftConfirmationFileRecord = (EFTConfirmationFileRecord) confirmationFileList.get(j);
          AlternaFormat eftUploadFileRecord = (AlternaFormat) uploadFileList.get(j);

          Transaction tran = (Transaction) transactionDao.find(
            EQ(Transaction.REFERENCE_NUMBER, eftUploadFileRecord.getReference()));

          if (tran != null) {
            tran.setConfirmationLineNumber(fileNames.get(i) + "_" + eftConfirmationFileRecord.getLineNumber());

            if ( eftConfirmationFileRecord.getStatus().equals("Failed") ) {
              tran.setStatus(TransactionStatus.DECLINED);
              tran.setDescription(eftConfirmationFileRecord.getReason());
              sendEmail(x, "Transaction was rejected by EFT confirmation file",
                "Transaction id: " + tran.getId() + ", Reason: " + tran.getDescription() + ", Confirmation line number: "
                  + fileNames.get(i) + "_" + eftConfirmationFileRecord.getLineNumber());
            } else if ( eftConfirmationFileRecord.getStatus().equals("OK") && tran.getStatus().equals(TransactionStatus.PENDING) ) {
              tran.setStatus(TransactionStatus.SENT);
            }

            transactionDao.put(tran);
          }
        }
      }

      Vector folderList = channelSftp.ls("/");
      boolean exist = false;
      for ( Object entry : folderList ) {
        ChannelSftp.LsEntry e = (ChannelSftp.LsEntry) entry;
        if ( e.getFilename().equals("Archive_EFTConfirmationFile") ) {
          exist = true;
        }
      }

      if (!exist) {
        channelSftp.mkdir("Archive_EFTConfirmationFile");
      }

      String srcFileDirectory = "/Returns/";
      String dstFileDirectory = "/Archive_EFTConfirmationFile/";

      // move processed files
      for ( int i = 0; i < fileNames.size(); i++ ) {
        channelSftp.rename(srcFileDirectory + fileNames.get(i), dstFileDirectory + fileNames.get(i));
      }

      System.out.println("EFT Confirmation file processing finished");
      channelSftp.exit();

    } catch ( JSchException | SftpException e ) {
      logger.error(e);
    } finally {
      if ( channel != null ) channel.disconnect();
      if ( session != null ) session.disconnect();
    }
  }

  public void sendEmail(X x, String subject, String content) {
    EmailService emailService = (EmailService) x.get("email");
    EmailMessage message = new EmailMessage();

    message.setTo(new String[]{"ops@nanopay.net"});
    message.setSubject(subject);
    message.setBody(content);
    emailService.sendEmail(message);
  }
}
