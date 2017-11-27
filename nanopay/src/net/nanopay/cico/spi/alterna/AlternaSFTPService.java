import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;

import foam.core.ContextAwareSupport;
import foam.core.Detachable;
import foam.core.FObject;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.nanos.pm.PM;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.IOException;
import java.net.URL;
import java.net.URLConnection;
import java.util.Date;
import net.nanopay.fx.model.ExchangeRate;
import net.nanopay.fx.model.ExchangeRateQuote;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import org.apache.commons.net.PrintCommandListener;
import org.apache.commons.net.ftp.FTP;
import org.apache.commons.net.ftp.FTPSClient;
import org.apache.commons.net.ftp.FTPReply;

public class AlternaSFTPService extends ContextAwareSupport {

  FTPSClient ftp = null;

  public static void main(String[] args) throws Exception {
    String fileName = "test.txt";
    String SFTPHOST = "ftp.eftcanada.com";
    int SFTPPORT = 22;
    String SFTPUSER = "eftcadtest1";
    String SFTPPASS = "nLGlp8Du";
    String SFTPWORKINGDIR = "/";

    Session session = null;
    Channel channel = null;
    ChannelSftp channelSftp = null;
    System.out.println("preparing the host information for sftp.");

    JSch jsch = new JSch();
    session = jsch.getSession(SFTPUSER, SFTPHOST, SFTPPORT);
    session.setPassword(SFTPPASS);
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
    channelSftp.cd(SFTPWORKINGDIR);
    File f = new File(fileName);
    f.createNewFile();
    channelSftp.put(new FileInputStream(f), f.getName());
    System.out.println("File transfered successfully to host.");


    channelSftp.exit();
    System.out.println("sftp Channel exited.");
    channel.disconnect();
    System.out.println("Channel disconnected.");
    session.disconnect();
    System.out.println("Host Session disconnected.");
  }

}