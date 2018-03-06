package net.nanopay.cico.spi.alterna;

import com.jcraft.jsch.ChannelSftp;
import com.jcraft.jsch.JSch;
import com.jcraft.jsch.Session;
import foam.core.ContextAwareSupport;
import foam.lib.json.OutputterMode;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.Date;
import java.util.Properties;

public class AlternaSFTPService
    extends ContextAwareSupport
    implements SFTPService
{
  protected final String HOST = "ftp.eftcanada.com";
  protected final int PORT = 22;
  protected final String USER = "eftcadtest1";
  protected final String PASSWORD = "nLGlp8Du";
  protected final String WORKING_DIR = "/";

  @Override
  public void sendCICOFile() {
    Date now = new Date();
    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    CsvUtil.writeCsvFile(getX(), baos, OutputterMode.STORAGE);

    Session session = null;
    ChannelSftp channel = null;

    try {
      // create session with user name and password
      JSch jsch = new JSch();
      session = jsch.getSession(USER, HOST, PORT);
      session.setPassword(PASSWORD);

      // add configuration
      Properties config = new java.util.Properties();
      config.put("StrictHostKeyChecking", "no");
      session.setConfig(config);
      session.connect();

      // open SFTP connection and upload file
      channel = (ChannelSftp) session.openChannel("sftp");
      channel.connect();
      channel.cd(WORKING_DIR);
      channel.put(new ByteArrayInputStream(baos.toByteArray()), CsvUtil.generateFilename(now));
      channel.exit();
    } catch ( Exception e ) {
      e.printStackTrace();
    } finally {
      // close channels
      if ( channel != null ) channel.disconnect();
      if ( session != null ) session.disconnect();
      System.out.println("Host Session disconnected.");
    }
  }

  @Override
  public void start() {

  }
}