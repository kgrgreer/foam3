package net.nanopay.cico.spi.alterna;

import com.jcraft.jsch.*;

import java.io.*;
import java.io.InputStreamReader;

import foam.lib.json.Outputter;
import foam.lib.json.OutputterMode;
import org.apache.commons.io.IOUtils;

import java.util.Properties;
import java.util.Date;
import java.util.Vector;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.*;
import foam.core.*;

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
    List<FObject> ret = new ArrayList<FObject>();

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
      Pattern pattern = Pattern.compile("[0-9]{12}.txt");
      for( int i = 0; i < v.size(); i++ ){
        //System.out.println(v.get(i));
        Matcher matcher = pattern.matcher(v.get(i).toString());
        if ( matcher.find() ) {
          System.out.println(matcher.group());
          fileNames.add(matcher.group());
        }
      }

      for ( int i = 0; i < fileNames.size(); i++ ) {
        InputStream is = channelSftp.get(fileNames.get(i));
        //InputStream is = channelSftp.get("378520180221.txt");
        ret.addAll(eftReturnFileParser.parse(is));
      }

      for (int i = 0; i < ret.size(); i++) {
        Outputter outputter = new Outputter();
        System.out.println("parsed record: " + outputter.stringify(ret.get(i)));
      }

      //InputStream is = channelSftp.get(filename);
      //IOUtils.copy(is, System.out);
      //is.close();
      //BufferedReader br = new BufferedReader(new InputStreamReader(is));

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