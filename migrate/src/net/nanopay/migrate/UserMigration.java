package net.nanopay.migrate;

import com.mongodb.MongoClient;
import foam.nanos.auth.User;

import java.util.Collections;
import java.util.List;

public class UserMigration<User>
  implements Migration
{
  public List<User> migrate(MongoClient client, String[] args) {
    if ( args == null || args.length != 0 ) {
      throw new RuntimeException("Missing arguments");
    }

    String realm = args[0];

    return Collections.emptyList();
  }
}