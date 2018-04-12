package net.nanopay.migrate;

import com.mongodb.MongoClient;
import com.mongodb.MongoCredential;
import com.mongodb.ServerAddress;
import com.mongodb.connection.Server;
import foam.util.SafetyUtil;
import org.bouncycastle.jce.provider.BouncyCastleProvider;

import java.io.FileInputStream;
import java.io.InputStream;
import java.security.Security;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Properties;
import java.util.function.Function;
import java.util.stream.Collectors;

public class Main {

  static {
    // add BC provider
    BouncyCastleProvider provider = new BouncyCastleProvider();
    if (Security.getProvider(provider.getName()) == null ) {
      Security.addProvider(provider);
    }
  }

  public static void main(String[] args) throws Throwable {
    Properties properties = new Properties();
    InputStream input = new FileInputStream("conf/credentials.properties");
    properties.load(input);

    String host = properties.getProperty("mongodb.host", null);
    String user = properties.getProperty("mongodb.user", null);
    String pass = properties.getProperty("mongodb.pass", null);

    if ( SafetyUtil.isEmpty(host) || SafetyUtil.isEmpty(user) || SafetyUtil.isEmpty(pass) ) {
      throw new RuntimeException("Invalid arguments");
    }

    MongoCredential credential = MongoCredential.createCredential(user, "admin", pass.toCharArray());
    List<ServerAddress> addresses = Arrays.stream(host.split(";")).map(s -> {
      String[] split = s.split(":");
      return new ServerAddress(split[0], Integer.parseInt(split[1]));
    }).collect(Collectors.toList());

    MongoClient client = new MongoClient(addresses, Collections.singletonList(credential));
  }
}