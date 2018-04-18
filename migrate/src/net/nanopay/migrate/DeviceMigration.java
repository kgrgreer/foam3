package net.nanopay.migrate;

import com.mongodb.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import foam.core.EmptyX;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;
import net.nanopay.retail.model.Device;
import net.nanopay.retail.model.DeviceStatus;
import net.nanopay.retail.model.DeviceType;
import org.bson.Document;
import org.bson.types.ObjectId;

import java.util.ArrayList;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

public class DeviceMigration
  extends AbstractMigration<Device>
{
  protected final DAO deviceDAO_;
  protected final Map<ObjectId, User> users_;

  public DeviceMigration(X x, MongoClient client, Map<ObjectId, User> users) {
    super(x, client);
    users_ = users;
    deviceDAO_ = (DAO) x.get("deviceDAO");
  }

  @Override
  public Map<ObjectId, Device> migrate() {
    String maindb;
    switch ( MODE ) {
      case STAGING:     maindb = "staging";     break;
      case PRODUCTION:  maindb = "prod";        break;
      default:          maindb = "development"; break;
    }

    MongoDatabase main = getClient().getDatabase(maindb);
    MongoCollection<Document> deviceCollection = main.getCollection("device");

    return deviceCollection.find()
        .into(new ArrayList<>()).stream().collect(Collectors.toMap(new Function<Document, ObjectId>() {
          @Override
          public ObjectId apply(Document document) {
            return new ObjectId(document.getString("merchantUserId"));
          }
        }, new Function<Document, Device>() {

          @Override
          public Device apply(Document document) {
            DeviceStatus status = document.getBoolean("active") ?
                DeviceStatus.ACTIVE : DeviceStatus.DISABLED;

            DeviceType type = null;
            switch ( document.getString("type") ) {
              case "ios":
                type = DeviceType.APPLE;
                break;
              case "android":
                type = DeviceType.ANDROID;
                break;
              case "terminal":
                type = DeviceType.INGENICO;
                break;
            }

            ObjectId merchantUserId = document.getObjectId("merchantUserId");
            long userId = users_.get(merchantUserId).getId();

            Device device = new Device.Builder(EmptyX.instance())
                .setOwner(userId)
                .setName(document.getString("name"))
                .setSerialNumber(document.getString("serialNumber"))
                .setPassword(document.getString("password"))
                .setStatus(status)
                .setType(type)
                .build();

            deviceDAO_.put(device);
            return device;
          }
        }));
  }
}
