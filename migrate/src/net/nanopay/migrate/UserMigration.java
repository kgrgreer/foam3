package net.nanopay.migrate;

import com.mongodb.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import foam.core.EmptyX;
import foam.nanos.auth.Address;
import foam.nanos.auth.Phone;
import foam.nanos.auth.User;
import org.apache.commons.io.IOUtils;
import org.bson.Document;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonReader;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Function;
import java.util.stream.Collectors;

public class UserMigration
  extends AbstractMigration<User>
{
  protected static final ThreadLocal<StringBuilder> sb = new ThreadLocal<StringBuilder>() {
    @Override
    protected StringBuilder initialValue() {
      return new StringBuilder();
    }

    @Override
    public StringBuilder get() {
      StringBuilder b = super.get();
      b.setLength(0);
      return b;
    }
  };

  protected Runtime runtime_;

  public UserMigration(MongoClient client) {
    super(client);
    runtime_ = Runtime.getRuntime();
  }

  public List<User> migrate(String... args) {
    if ( args == null || args.length == 0 ) {
      throw new RuntimeException("Missing arguments");
    }

    MongoDatabase main = getClient().getDatabase("development");
    MongoDatabase crypto = getClient().getDatabase("crypto-service");

    MongoCollection<Document> userCollection = main.getCollection("user");
    MongoCollection<Document> addressCollection = main.getCollection("address");
    MongoCollection<Document> phoneCollection = main.getCollection("phone");
    MongoCollection<Document> regionCollection = main.getCollection("region");
    MongoCollection<Document> countryCollection = main.getCollection("country");
    MongoCollection<Document> aesKeyCollection = crypto.getCollection("AESKey");

    return userCollection.find(new Document("realm", "mintchip"))
        .into(new ArrayList<Document>()).stream().map(new Function<Document, User>() {
          @Override
          public User apply(Document document) {
            User user = new User.Builder(EmptyX.instance())
                .setFirstName(document.getString("firstName"))
                .setLastName(document.getString("lastName"))
                .setEmail(document.getString("email"))
                .setBirthday(document.getDate("birthday"))
                .setJobTitle(document.getString("jobTitle"))
                .setBusinessName(document.getString("businessName"))
                .setOnboarded(document.getBoolean("onboarded", false))
                .setEmailVerified(document.getBoolean("emailVerified", false))
                .setEnabled(document.getBoolean("enabled", false))
                .build();

            Document addressDocument = addressCollection.find(new Document("userId",
                document.getObjectId("_id"))).first();
            if ( addressDocument != null ) {
              Address address = new Address.Builder(EmptyX.instance())
                  .setStructured(false)
                  .setAddress1(addressDocument.getString("address"))
                  .setSuite(addressDocument.getString("suite"))
                  .setCity(addressDocument.getString("city"))
                  .setPostalCode(addressDocument.getString("postalCode"))
                  .build();

              Document regionDocument = regionCollection.find(new Document("_id",
                  addressDocument.getObjectId("regionId"))).first();
              if ( regionDocument != null ) {
                address.setRegionId(regionDocument.getString("code"));
              }

              Document countryDocument = countryCollection.find(new Document("_id",
                  addressDocument.getObjectId("countryId"))).first();
              if ( countryDocument != null ) {
                address.setCountryId(countryDocument.getString("code"));
              }

              String type = addressDocument.getString("type");
              switch ( type ) {
                case "store":
                case "work":
                  user.setBusinessAddress(address);
                  break;
                default:
                  user.setAddress(address);
                  break;
              }
            }

            Document phoneDocument = phoneCollection.find(new Document("userId",
                document.getObjectId("_id"))).first();
            if ( phoneDocument != null ) {
              Phone phone = new Phone.Builder(EmptyX.instance())
                  .setNumber(phoneDocument.getString("number"))
                  .setVerified(document.getBoolean("phoneVerified", false))
                  .build();
              user.setPhone(phone);
            }

            Document aesKeyDocument = aesKeyCollection.find(new Document("ownerId", user.getEmail())).first();
            if ( aesKeyDocument != null ) {
              try {
                String key = aesKeyDocument.getString("key");
                String iv = aesKeyDocument.getString("iv");

                Address address = user.getAddress() == null ?
                    user.getBusinessAddress() == null ? new Address.Builder(EmptyX.instance()).build() :
                        user.getBusinessAddress() :
                    user.getAddress();

                StringBuilder script = sb.get()
                    .append("node src/net/nanopay/migrate/crypto/index.js ")
                    .append(key).append(" ")
                    .append(iv).append(" ")
                    .append("{")
                    .append("\"firstName\":\"").append(user.getFirstName()).append("\",")
                    .append("\"lastName\":\"").append(user.getLastName()).append("\",")
                    .append("\"address1\":\"").append(address.getAddress1()).append("\",")
                    .append("\"city\":\"").append(address.getCity()).append("\",")
                    .append("\"postalCode\":\"").append(address.getPostalCode()).append("\"}");

                JsonObject object = null;
                Process process = runtime_.exec(script.toString());
                try ( JsonReader reader = Json.createReader(process.getInputStream()) ) {
                  object = reader.readObject();
                  user.setFirstName(object.getString("firstName", user.getFirstName()));
                  user.setLastName(object.getString("lastName", user.getLastName()));
                  address.setAddress1(object.getString("address1", address.getAddress1()));
                  address.setCity(object.getString("city", address.getCity()));
                  address.setPostalCode(object.getString("postalCode", address.getPostalCode()));
                }


              } catch (Throwable t) {
                t.printStackTrace();
              }
            }

            return user;
          }
        })
        .collect(Collectors.toList());
  }
}