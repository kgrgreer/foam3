package net.nanopay.meter.cron;

import foam.core.ContextAgent;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.notification.Notification;
import java.util.*;
import net.nanopay.meter.AdminAccessConfig;

import static foam.mlang.MLang.*;

/**
 * AdminAccessConfigCron removes administrative access from all users that do not require it.
 * The cron job contains a list of users that require administrative access, and all users that 
 * are not in this list will be removed from the admin group and reverted to operations-support. 
 */

 public class AdminAccessConfigCron implements ContextAgent {
  @Override
  public void execute(X x) {
    // DAO userDAO = (DAO) x.get("localUserDAO");
    // DAO notificationDAO = (DAO) x.get("localNotificationDAO");
    // AppConfig appConfig = (AppConfig) x.get("appConfig");
    // AdminAccessConfig adminAccessConfig = (AdminAccessConfig) appConfig.getAdminAccessConfig();
    // List<Long> adminUserIds = adminAccessConfig.getAdminUserIds();
    // List<User> removeAdminUsers = new ArrayList<User>();
    // Logger logger = (Logger) x.get("logger");

    // List<User> currentAdminUsers = ((ArraySink) userDAO.where(
    //   AND(
    //     EQ(User.GROUP, "admin"),
    //     NEQ(User.EMAIL, "admin@nanopay.net"),
    //     NEQ(User.EMAIL, "system@nanopay.net")
    //   )
    // ).select(new ArraySink())).getArray();

    // for ( int i = 0; i < currentAdminUsers.size(); i++ ) {
    //   User adminUser = (User) currentAdminUsers.get(i);
    //   if ( ! adminUserIds.contains(adminUser.getId()) ) {
    //     removeAdminUsers.add(adminUser);
    //   }
    // }

    // if ( currentAdminUsers.equals(removeAdminUsers) ) {
    //   Notification notification = new Notification();
    //   notification.setGroupId("admin");
    //   notification.setNotificationType("no permanent administrators left in the system");
    //   notification.setBody("There are no permanent administrators in the system that appear to be in the Admin User Id list in appConfig -> Admin Access Config. Please update the list with the set of permanent administrators.");
    //   notification.setEmailIsEnabled(true);
    //   notificationDAO.put(notification);
    //   logger.error("AdminAccessConfigCron cannot run due to no administrators being left other than the system@nanopay.net user. The Admin User Id list in appConfig -> Admin Access Config needs to be updated with permanent administrators.");
    //   return;
    // }

    // for ( int i = 0; i < removeAdminUsers.size(); i++ ) {
    //   User removeAdminUser = (User) removeAdminUsers.get(i).fclone();
    //   removeAdminUser.setGroup(adminAccessConfig.getOpSupportGroup());
    //   userDAO.put(removeAdminUser);
    //   Notification notification = new Notification();
    //   notification.setUserId(removeAdminUser.getId());
    //   notification.setNotificationType("nanopay admin access has expired");
    //   notification.setBody("Your nanopay admin access has been revoked. Please create a ticket to request admin access when required.");
    //   notification.setEmailIsEnabled(true);
    //   notificationDAO.put(notification);
    // }
  }
 }
