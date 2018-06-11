package net.nanopay.scripts;

import foam.core.ContextAwareSupport;
import foam.mlang.MLang;
import foam.dao.*;
import java.util.Date;
import java.util.ArrayList;
import java.util.List;
import java.text.SimpleDateFormat;
import foam.core.FObject;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import static foam.mlang.MLang.*;

public class AddressMigrationScript
  extends    ContextAwareSupport
  {
    protected DAO    localUserDAO_;
    protected Logger logger;

    public void start() {
      logger = (Logger) getX().get("logger");
      logger.log("Script starting...");
      localUserDAO_ = (DAO) getX().get("localUserDAO");

      users = userDAO.select().getArray();

      for ( int i = 0 ; i < users.size() ; i++ ) {
        User user = (User) users.get(i);
        User user = (User) user.fclone();
        Address address = (Address) user.getBusinessAddress();
        if ( address != null ) {
          address2 = address.getAddress2();
          address.setSuite(address2);
          address.setAddress2("");
          user.setBusinessAddress(address);
          userDAO.put(user);
        }
      }

      print("Migration complete.");
    }
  }


