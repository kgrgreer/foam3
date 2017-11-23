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

public class FTPUploader extends ContextAwareSupport {

  FTPSClient ftp = null;

  public FTPUploader(String host, String user, String pwd) throws Exception{
    ftp = new FTPSClient();
    ftp.addProtocolCommandListener(new PrintCommandListener(new PrintWriter(System.out)));
    int reply;
    ftp.connect(host);
    reply = ftp.getReplyCode();
    if (!FTPReply.isPositiveCompletion(reply)) {
      ftp.disconnect();
      throw new Exception("Exception in connecting to FTP Server");
    }
    ftp.login(user, pwd);
    ftp.setFileType(FTP.BINARY_FILE_TYPE);
    ftp.enterLocalPassiveMode();
  }
  public void uploadFile(String localFileFullName, String fileName, String hostDir)
      throws Exception {
    try(InputStream input = new FileInputStream(new File(localFileFullName))){
    this.ftp.storeFile(hostDir + fileName, input);
    }
  }

  public void disconnect(){
    if (this.ftp.isConnected()) {
      try {
        this.ftp.logout();
        this.ftp.disconnect();
      } catch (IOException f) {
        // do nothing as file is already saved to server
      }
    }
  }
  public static void main(String[] args) throws Exception {
    System.out.println("Start");
    FTPUploader ftpUploader = new FTPUploader("ftp.journaldev.com", "ftpUser", "ftpPassword");
    //FTP server path is relative. So if FTP account HOME directory is "/home/pankaj/public_html/" and you need to upload
    // files to "/home/pankaj/public_html/wp-content/uploads/image2/", you should pass directory parameter as "/wp-content/uploads/image2/"
    ftpUploader.uploadFile("D:\\Pankaj\\images\\MyImage.png", "image.png", "/wp-content/uploads/image2/");
    ftpUploader.disconnect();
    System.out.println("Done");
  }

}