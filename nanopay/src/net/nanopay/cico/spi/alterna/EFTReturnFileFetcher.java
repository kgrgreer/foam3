package net.nanopay.cico.spi.alterna;

import com.jcraft.jsch.*;

import java.io.*;
import java.io.InputStreamReader;
import foam.lib.json.OutputterMode;
import org.apache.commons.io.IOUtils;

import java.util.Properties;
import java.util.Date;

public class EFTReturnFileFetcher{

  private final String USER = "eftcadtest2";
  private final String PASSWORD = "1a2$3d4f";
  private final String HOST = "ftp.eftcanada.com";
  private final int PORT = 22;
  private final int TIMEOUT = 5000;
  private final String DIRECTORY = "Returns";

  /**
   * Downloads the file from the SFTP service
   *
   * @param filename filename
   * @return a BufferedReader ready to read the downloaded file
   * @throws SftpException
   * @throws IOException
   */
  public BufferedReader downloadFile(String filename)
  {
    Session session = null;
    Channel channel = null;
    ChannelSftp channelSftp;

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

      InputStream is = channelSftp.get(filename);
      IOUtils.copy(is, System.out);
      //is.close();
      BufferedReader br = new BufferedReader(new InputStreamReader(is));

      channelSftp.exit();
      return br;
    } catch (Throwable t) {
      throw new RuntimeException(t);
    } finally {
      if ( channel != null ) channel.disconnect();
      if ( session != null ) session.disconnect();
    }
  }
}