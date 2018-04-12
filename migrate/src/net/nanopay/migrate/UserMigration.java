package net.nanopay.migrate;

import com.mongodb.Mongo;
import com.mongodb.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import foam.core.EmptyX;
import foam.nanos.auth.Address;
import foam.nanos.auth.Phone;
import foam.nanos.auth.User;
import org.bson.Document;
import org.bson.types.ObjectId;

import javax.print.Doc;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

public class UserMigration
  extends AbstractMigration<User>
{
  public UserMigration(MongoClient client) {
    super(client);
  }

  public List<User> migrate(String... args) {
    if ( args == null || args.length == 0 ) {
      throw new RuntimeException("Missing arguments");
    }

    MongoDatabase prod = getClient().getDatabase("development");
    MongoCollection<Document> userCollection = prod.getCollection("user");
    MongoCollection<Document> addressCollection = prod.getCollection("address");
    MongoCollection<Document> phoneCollection = prod.getCollection("phone");
    MongoCollection<Document> regionCollection = prod.getCollection("region");
    MongoCollection<Document> countryCollection = prod.getCollection("country");

    List<User> users = userCollection.find(new Document("realm", "mintchip"))
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

            return user;
          }
        })
        .collect(Collectors.toList());
    return users;
  }
}