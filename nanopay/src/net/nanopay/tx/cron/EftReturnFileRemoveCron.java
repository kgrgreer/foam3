package net.nanopay.tx.cron;

import com.jcraft.jsch.*;
import foam.core.ContextAgent;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.alarming.Alarm;
import foam.nanos.alarming.AlarmReason;
import foam.nanos.logger.Logger;
import net.nanopay.cico.model.EFTReturnFileCredentials;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class EftReturnFileRemoveCron implements ContextAgent {

  @Override
  public void execute(X x) {
    Logger logger = (Logger) x.get("logger");
    EFTReturnFileCredentials credentials = (EFTReturnFileCredentials) x.get("EFTReturnFileCredentials");

    List<String> fileNames = new ArrayList<>();
    Session session = null;
    Channel channel = null;
    ChannelSftp channelSftp;
    SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");

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

      Vector folderList = channelSftp.ls("/");
      boolean exist = false;
      for ( Object entry : folderList ) {
        ChannelSftp.LsEntry e = (ChannelSftp.LsEntry) entry;
        if ( "Archive_EFTReturnFile".equals(e.getFilename()) ) {
          exist = true;
          break;
        }
      }

      if ( ! exist ) {
        channelSftp.mkdir("Archive_EFTReturnFile");
      }

      String srcFileDirectory = "/Returns/";
      String dstFileDirectory = "/Archive_EFTReturnFile/";

      // move old return files
      for ( String fileName : fileNames ) {
        Calendar currentDate = Calendar.getInstance();
        Calendar fileDate = Calendar.getInstance();
        fileDate.setTime(sdf.parse(fileName.substring(4)));

        if ( fileDate.get(Calendar.DAY_OF_YEAR) < currentDate.get(Calendar.DAY_OF_YEAR) - 1 ) {
          channelSftp.rename(srcFileDirectory + fileName, dstFileDirectory + fileName);
        }
      }

      logger.debug("EftReturnFileRemoveCronjob finished");

    } catch ( JSchException | SftpException | ParseException e) {
      logger.error(e);
      ((DAO) x.get("alarmDAO")).put(new Alarm.Builder(x)
        .setName("EFF Return File Remove Cron")
        .setReason(AlarmReason.CREDENTIALS)
        .setNote(e.getMessage())
        .build());
    } finally {
      if ( channel != null ) channel.disconnect();
      if ( session != null ) session.disconnect();
    }
  }
}
