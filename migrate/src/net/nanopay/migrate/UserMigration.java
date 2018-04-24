package net.nanopay.migrate;

import com.mongodb.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import foam.core.EmptyX;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.Address;
import foam.nanos.auth.Phone;
import foam.nanos.auth.User;
import foam.util.SafetyUtil;
import org.bson.BsonType;
import org.bson.Document;
import org.bson.types.ObjectId;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.stream.Collectors;

import static com.mongodb.client.model.Filters.*;

public class UserMigration
  extends AbstractMigration<ObjectId, User>
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

  protected DAO userDAO_;
  protected Runtime runtime_;

  public UserMigration(X x, MongoClient client) {
    super(x, client);
    userDAO_ = (DAO) x.get("userDAO");
    runtime_ = Runtime.getRuntime();
  }

  public Map<ObjectId, User> migrate() {
    MongoDatabase main = getClient().getDatabase(maindb);
    MongoDatabase crypto = getClient().getDatabase(cryptodb);

    MongoCollection<Document> userCollection = main.getCollection("user");
    MongoCollection<Document> mintchipCollection = main.getCollection("mintchipConsumer");
    MongoCollection<Document> businessCollection = main.getCollection("business");
    MongoCollection<Document> addressCollection = main.getCollection("address");
    MongoCollection<Document> phoneCollection = main.getCollection("phone");
    MongoCollection<Document> regionCollection = main.getCollection("region");
    MongoCollection<Document> countryCollection = main.getCollection("country");
    MongoCollection<Document> aesKeyCollection = crypto.getCollection("AESKey");

    // create a set of user ids that have a secure asset store
    Set<ObjectId> ids = mintchipCollection.find(and(
        exists("secureAssetStore"), type("secureAssetStore", BsonType.DOUBLE),
        exists("userId"), type("userId", BsonType.OBJECT_ID)))
        .into(new ArrayList<>()).stream().map(new Function<Document, ObjectId>() {
          @Override
          public ObjectId apply(Document document) {
            return document.getObjectId("userId");
          }
        })
        .collect(Collectors.toSet());

    Map<ObjectId, User> result = ids.stream().collect(Collectors.toMap(new Function<ObjectId, ObjectId>() {
      @Override
      public ObjectId apply(ObjectId objectId) {
        return objectId;
      }
    }, new Function<ObjectId, User>() {

      AtomicInteger i = new AtomicInteger(10000);

      @Override
      public User apply(ObjectId id) {
        Document document = userCollection.find(new Document("_id", id)).first();
        if ( document == null ) return new User.Builder(getX()).setId(-1).build();

        User user = new User.Builder(EmptyX.instance())
            .setId(i.getAndIncrement())
            .setFirstName(document.getString("firstName"))
            .setLastName(document.getString("lastName"))
            .setEmail(document.getString("email"))
            .setPassword(document.getString("password"))
            .setBirthday(document.getDate("birthday"))
            .setJobTitle(document.getString("jobTitle"))
            .setBusinessName(document.getString("businessName"))
            .setOnboarded(document.getBoolean("onboarded", false))
            .setEmailVerified(document.getBoolean("emailVerified", false))
            .setEnabled(document.getBoolean("enabled", false))
            .build();

        // set user type and group
        switch ( document.getString("realm") ) {
          case "mintchip":
            user.setType("Personal");
            user.setType("shopper");
            break;
          case "retail":
            user.setType("Merchant");
            user.setGroup("merchant");
            break;
          case "support":
            user.setType("Support");
            user.setGroup("support");
            break;
        }

        // get business information
        ObjectId businessId = document.getObjectId("businessId");
        Document businessDocument = businessCollection.find(new Document("_id", businessId)).first();

        // set business information
        if ( businessDocument != null ) {
          user.setType("Business");
          String businessName = businessDocument.getString("name");
          if ( ! SafetyUtil.isEmpty(businessName)) {
            user.setBusinessName(businessName);
            user.setOrganization(businessName);
          }
        }

        // set address information
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

          // set region code
          try {
            Document regionDocument = regionCollection.find(new Document("_id",
                addressDocument.getObjectId("regionId"))).first();
            if (regionDocument != null) {
              address.setRegionId(regionDocument.getString("code"));
            }
          } catch (Throwable ignored) {}

          // set country code
          try {
            Document countryDocument = countryCollection.find(new Document("_id",
                addressDocument.getObjectId("countryId"))).first();
            if (countryDocument != null) {
              address.setCountryId(countryDocument.getString("code"));
            }
          } catch (Throwable ignored) {}

          // set address
          if ( businessId != null ) {
            user.setBusinessAddress(address);
          } else {
            user.setAddress(address);
          }
        }

        // set phone information
        Document phoneDocument = phoneCollection.find(new Document("userId",
            document.getObjectId("_id"))).first();
        if ( phoneDocument != null ) {
          Phone phone = new Phone.Builder(EmptyX.instance())
              .setNumber(phoneDocument.getString("number"))
              .setVerified(document.getBoolean("phoneVerified", false))
              .build();
          user.setPhone(phone);
        }

        // decrypt user information
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
                .append("\"city\":\"").append(address.getCity()).append("\"}");

            JsonObject object = null;
            Process process = runtime_.exec(script.toString());
            try ( JsonReader reader = Json.createReader(new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8)) ) {
              object = reader.readObject();
              user.setFirstName(object.getString("firstName", user.getFirstName()));
              user.setLastName(object.getString("lastName", user.getLastName()));
              address.setAddress1(object.getString("address1", address.getAddress1()));
              address.setCity(object.getString("city", address.getCity()));
            }
          } catch (Throwable t) {
            t.printStackTrace();
          }
        }


        userDAO_.put(user);
        return user;
      }
    }));

    // remove null values
    result.values().removeIf(user -> user.getId() == -1);
    return result;
  }
}