package net.nanopay.migrate;

import com.mongodb.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import foam.core.EmptyX;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.util.SafetyUtil;
import net.nanopay.retail.model.Device;
import net.nanopay.retail.model.DeviceStatus;
import net.nanopay.retail.model.DeviceType;
import org.bson.BsonType;
import org.bson.Document;
import org.bson.types.ObjectId;

import java.util.ArrayList;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.exists;
import static com.mongodb.client.model.Filters.type;

public class DeviceMigration
  extends AbstractMigration<ObjectId, Device>
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
    MongoDatabase main = getClient().getDatabase(maindb);
    MongoCollection<Document> deviceCollection = main.getCollection("device");
    MongoCollection<Document> mintchipCollection = main.getCollection("mintchipConsumer");

    // create a set of device ids that have a secure asset store
    Set<ObjectId> ids = mintchipCollection.find(and(
        exists("secureAssetStore"), type("secureAssetStore", BsonType.DOUBLE),
        exists("deviceId"), type("deviceId", BsonType.OBJECT_ID)))
        .into(new ArrayList<>()).stream().map(new Function<Document, ObjectId>() {
          @Override
          public ObjectId apply(Document document) {
            return null;
          }
        })
        .collect(Collectors.toSet());

    Map<ObjectId, Device> result = ids.stream().collect(Collectors.toMap(new Function<ObjectId, ObjectId>() {
      @Override
      public ObjectId apply(ObjectId objectId) {
        return objectId;
      }
    }, new Function<ObjectId, Device>() {
      @Override
      public Device apply(ObjectId id) {
        Document document = deviceCollection.find(new Document("_id", id)).first();
        if ( document == null ) return new Device.Builder(getX()).setId(-1).build();

        boolean active = document.getBoolean("active", false);
        boolean hasCert = ! SafetyUtil.isEmpty(document.getString("certificateId"));

        DeviceStatus status;
        if ( active && hasCert ) {
          status = DeviceStatus.ACTIVE;
        } else if ( ! active && hasCert ) {
          status = DeviceStatus.DISABLED;
        } else {
          status = DeviceStatus.PENDING;
        }

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

    // remove null values
    result.values().removeIf(device -> device.getId() == -1);
    return result;
  }
}
