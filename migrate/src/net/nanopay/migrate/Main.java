package net.nanopay.migrate;

import com.mongodb.MongoClient;
import com.mongodb.ServerAddress;
import foam.lib.json.Outputter;
import foam.lib.json.OutputterMode;
import foam.nanos.auth.User;
import foam.util.SafetyUtil;
import net.nanopay.retail.model.Device;
import org.bouncycastle.jce.provider.BouncyCastleProvider;

import java.io.FileInputStream;
import java.io.InputStream;
import java.security.Security;
import java.util.Arrays;
import java.util.List;
import java.util.Properties;
import java.util.stream.Collectors;

public class Main {

  static {
    BouncyCastleProvider provider = new BouncyCastleProvider();
    if (Security.getProvider(provider.getName()) == null ) {
      Security.addProvider(provider);
    }
  }

  public static final String CWD = System.getProperty("user.dir");

  public static void main(String[] args) throws Throwable {
    Properties properties = new Properties();
    InputStream input = new FileInputStream("conf/credentials.properties");
    properties.load(input);

    String host = properties.getProperty("mongodb.host", null);
    String user = properties.getProperty("mongodb.user", null);
    String pass = properties.getProperty("mongodb.pass", null);
    boolean authenticate = SafetyUtil.isEmpty(user) && SafetyUtil.isEmpty(pass);

    if ( SafetyUtil.isEmpty(host) ) {
      throw new RuntimeException("Missing host");
    }

//    MongoCredential credential = MongoCredential.createCredential(user, "admin", pass.toCharArray());
    List<ServerAddress> addresses = Arrays.stream(host.split(";")).map(s -> {
      String[] split = s.split(":");
      return new ServerAddress(split[0], Integer.parseInt(split[1]));
    }).collect(Collectors.toList());

    MongoClient client = new MongoClient(addresses);
    Outputter outputter = new Outputter(OutputterMode.STORAGE);

    List<User> users = new UserMigration(client).migrate("mintchip");
    for ( User o : users ) {
//      System.out.println(outputter.stringify(o));
    }

    List<Device> devices = new DeviceMigration(client).migrate();
    for ( Device o : devices ) {
//      System.out.println(outputter.stringify(o));
    }
  }
}