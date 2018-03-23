package net.nanopay.cico.spi.alterna;

import com.jcraft.jsch.*;
import foam.core.FObject;
import net.nanopay.cico.model.EFTReturnFileCredentials;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import java.util.Vector;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class EFTReturnFileFetcher{

  private EFTReturnFileCredentials credentials = new EFTReturnFileCredentials.Builder(null)
    .setUser("eftcadtest2").setPassword("1a2$3d4f").setHost("ftp.eftcanada.com").setPort(22).build();

  private List<String> fileNames = new ArrayList<>();

  public List<FObject> downloadFiles()
  {
    Session session = null;
    Channel channel = null;
    ChannelSftp channelSftp;
    EFTReturnFileParser eftReturnFileParser = new EFTReturnFileParser();
    List<FObject> ret = new ArrayList<>();

    try {
      // create session with user name and password
      JSch jsch = new JSch();
      session = jsch.getSession(credentials.getUser(), credentials.getHost(), credentials.getPort());
      session.setPassword(credentials.getPassword());

      // add configuration
      Properties config = new Properties();
      config.put("StrictHostKeyChecking", "no");
      session.setConfig(config);
      session.connect(5000);

      // open SFTP connection and download file
      channel = session.openChannel("sftp");
      channel.connect(5000);

      channelSftp = (ChannelSftp) channel;
      channelSftp.cd("Returns");

      Vector v = channelSftp.ls("*.txt");
      // use regex to match file name
      Pattern pattern = Pattern.compile("[0-9]{12}.txt");
      for( int i = 0; i < v.size(); i++ ){
        Matcher matcher = pattern.matcher(v.get(i).toString());
        if ( matcher.find() ) {
          fileNames.add(matcher.group());
        }
      }

      for ( int i = 0; i < fileNames.size(); i++ ) {
        InputStream is = channelSftp.get(fileNames.get(i));
        ret.addAll(eftReturnFileParser.parse(is));
      }

      channelSftp.exit();

    } catch ( JSchException | SftpException e ) {
      e.printStackTrace();
    } finally {
      if ( channel != null ) channel.disconnect();
      if ( session != null ) session.disconnect();
    }
    return ret;
  }

  public void moveProcessedFiles()
  {
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
      session.connect(5000);

      // open SFTP connection
      channel = session.openChannel("sftp");
      channel.connect(5000);

      channelSftp = (ChannelSftp) channel;

      Vector v = channelSftp.ls("/");
      boolean exist = false;
      for ( int i = 0; i < v.size(); i++ ) {
        if ( v.get(i).toString().contains("Archive") ) {
          exist = true;
        }
      }

      if (!exist) {
        System.out.println("Archive folder does not exist, creating Archive Folder");
        channelSftp.mkdir("Archive");
      }

      String srcFileDirectory = "/Returns/";
      String dstFileDirectory = "/Archive/";

      // move processed files
      for ( int i = 0; i < fileNames.size(); i++ ) {
        channelSftp.rename(srcFileDirectory + fileNames.get(i), dstFileDirectory + fileNames.get(i));
      }

      channelSftp.exit();

    } catch ( JSchException | SftpException e ) {
      e.printStackTrace();
    } finally {
      if ( channel != null ) channel.disconnect();
      if ( session != null ) session.disconnect();
    }
  }
}