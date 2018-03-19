package net.nanopay.cico.spi.alterna;

import com.jcraft.jsch.Channel;
import com.jcraft.jsch.ChannelSftp;
import com.jcraft.jsch.JSch;
import com.jcraft.jsch.Session;
import foam.core.FObject;
import foam.lib.json.Outputter;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import java.util.Vector;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class EFTReturnFileFetcher{

  private final String USER = "eftcadtest2";
  private final String PASSWORD = "1a2$3d4f";
  private final String HOST = "ftp.eftcanada.com";
  private final int PORT = 22;
  private final int TIMEOUT = 5000;
  private final String DIRECTORY = "Returns";

  /**
   * Downloads the file from the SFTP server
   */
  public List<FObject> downloadFile()
  {
    Session session = null;
    Channel channel = null;
    ChannelSftp channelSftp;
    EFTReturnFileParser eftReturnFileParser = new EFTReturnFileParser();
    List<FObject> ret = new ArrayList<>();

    try {
      // create session with user name and password
      JSch jsch = new JSch();
      session = jsch.getSession(USER, HOST, PORT);
      session.setPassword(PASSWORD);

      // add configuration
      Properties config = new Properties();
      config.put("StrictHostKeyChecking", "no");
      session.setConfig(config);
      session.connect(TIMEOUT);

      // open SFTP connection and download file
      channel = session.openChannel("sftp");
      channel.connect(TIMEOUT);

      channelSftp = (ChannelSftp) channel;
      channelSftp.cd(DIRECTORY);

      List<String> fileNames = new ArrayList<>();
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
      return ret;
    } catch (Throwable t) {
      throw new RuntimeException(t);
    } finally {
      if ( channel != null ) channel.disconnect();
      if ( session != null ) session.disconnect();
    }
  }
}