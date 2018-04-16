package net.nanopay.migrate;

import com.google.common.collect.ArrayListMultimap;
import com.google.common.collect.HashMultimap;
import com.google.common.collect.Multimap;
import com.mongodb.MongoClient;
import com.mongodb.ServerAddress;
import foam.core.FObject;
import foam.lib.json.Outputter;
import foam.lib.json.OutputterMode;
import foam.nanos.auth.User;
import foam.util.SafetyUtil;
import net.nanopay.retail.model.Device;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bson.types.ObjectId;

import java.io.FileInputStream;
import java.io.InputStream;
import java.security.Security;
import java.util.*;
import java.util.stream.Collectors;

public class Main {

  static {
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

    Multimap<ObjectId, FObject> data = HashMultimap.create();

    Map<ObjectId, User>   users = new UserMigration(client).migrate("mintchip");
    for ( ObjectId id : users.keySet() ) {
      data.put(id, users.get(id));
    }

    Map<ObjectId, Device> devices = new DeviceMigration(client).migrate();
    for ( ObjectId id : devices.keySet() ) {
      data.put(id, devices.get(id));
    }
  }
}