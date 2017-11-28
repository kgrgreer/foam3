package net.nanopay.cico.spi.alterna;

import java.io.IOException;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.PrintWriter;

import com.jcraft.jsch.Channel;
import com.jcraft.jsch.ChannelSftp;
import com.jcraft.jsch.JSch;
import com.jcraft.jsch.Session;
import com.jcraft.jsch.JSchException;
import com.jcraft.jsch.SftpException;

import foam.core.ContextAwareSupport;
import foam.core.Detachable;
import foam.core.FObject;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.nanos.pm.PM;
import foam.nanos.http.WebAgent;
import net.nanopay.cico.spi.alterna.SFTPService;
import net.nanopay.cico.spi.alterna.AlternaWebAgent;

public class AlternaSFTPService extends ContextAwareSupport implements SFTPService {


  protected WebAgent agent_;

  protected final String HOST = "ftp.eftcanada.com";
  protected final int PORT = 22;
  protected final String USER = "eftcadtest1";
  protected final String PASSWORD = "nLGlp8Du";
  protected final String WORKING_DIR = "/";

  @Override
  public void sendCICOFile() {
    agent_.execute(getX());

    String fileName = "test.txt";

    Session session = null;
    Channel channel = null;
    ChannelSftp channelSftp = null;
    System.out.println("preparing the host information for sftp.");
    try {

      JSch jsch = new JSch();
      session = jsch.getSession(USER, HOST, PORT);
      session.setPassword(PASSWORD);
      java.util.Properties config = new java.util.Properties();
      config.put("StrictHostKeyChecking", "no");
      session.setConfig(config);
      System.out.println("Session:"+session);
      session.connect();
      System.out.println("Host connected.");
      channel = session.openChannel("sftp");
      channel.connect();
      System.out.println("sftp channel opened and connected.");
      channelSftp = (ChannelSftp) channel;
      channelSftp.cd(WORKING_DIR);
      File f = new File(fileName);
      f.createNewFile();
      channelSftp.put(new FileInputStream(f), f.getName());
      System.out.println("File transfered successfully to host.");
      channelSftp.exit();
      System.out.println("sftp Channel exited.");
      channel.disconnect();
      System.out.println("Channel disconnected.");
      session.disconnect();

    } catch( JSchException | IOException | SftpException e ) {
       System.out.println("Exception: " + e);
    } /*catch( IOException e ) {
      System.out.println("Exception: " + e);
    } catch( SftpException e ) {
      System.out.println("Exception: " + e);
    } */finally {
      System.out.println("Host Session disconnected.");
    }
  }

  @Override
  public void start() {
    agent_ = (WebAgent) getX().get("alterna");

  }

}