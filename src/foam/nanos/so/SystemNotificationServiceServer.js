/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
  package: 'foam.nanos.so',
  name: 'SystemNotificationServiceServer',
  implements: [ 'foam.nanos.so.SystemNotificationService' ],

  documentations: `Retrieve SystemNotifications defined by SystemOutages with SystemNotificiationTasks. SystemNotifications are optionally filtered by context Theme and argument 'key'. The message itself is also goes through translation.`,

  javaImports: [
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.i18n.TranslationService',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.DESC',
    'static foam.mlang.MLang.EQ',
    'foam.nanos.pm.PM',
    'foam.nanos.theme.Theme',
    'foam.util.SafetyUtil',
    'java.util.ArrayList',
    'java.util.Arrays',
    'java.util.List'
  ],

  methods: [
    {
      name: 'getSystemNotifications',
      javaCode: `
      PM pm = PM.create(getX(), "SystemNotificationServer", "getSystemNotifications");
      try {
        TranslationService translationService = (TranslationService) x.get("translationService");
        String locale = (String) x.get("locale.language");
        if ( locale == null ) {
          locale = "en";
        }

        List<SystemOutage> events = (List) ((ArraySink) ((DAO) getX().get("systemEventDAO"))
          .where(AND(
            EQ(SystemOutage.ENABLED, true),
            EQ(SystemOutage.ACTIVE, true)
          ))
          .orderBy(DESC(SystemOutage.START_TIME))
          .select(new ArraySink()))
          .getArray();
        List<SystemNotification> notifications = new ArrayList();
        for ( SystemOutage event : events ) {
          Theme theme = (Theme) x.get("theme");
          for ( SystemOutageTask task : event.getTasks() ) {
            if ( task instanceof SystemNotificationTask ) {
              SystemNotificationTask snt = (SystemNotificationTask) task;
              if ( snt.getThemes() != null &&
                   snt.getThemes().length > 0 ) {
                boolean match = false;
                if ( theme != null ) {
                  for ( String id : snt.getThemes() ) {
                    if ( id.equals(theme.getId()) ) {
                      match = true;
                      break;
                    }
                  }
                }
                if ( ! match ) continue;
              }
              SystemNotification sn = (SystemNotification) ((SystemNotificationTask)task).getSystemNotification().fclone();
              if ( key != null &&
                   ! key.equals(sn.getKey()) ) {
                continue;
              }
              if ( translationService != null ) {
                sn.setMessage(translationService.getTranslation(locale, sn.getMessage(), sn.getMessage()));
              }
              notifications.add(sn);
            }
          }
        }
        return notifications.toArray(new SystemNotification[notifications.size()]);
      } finally {
        pm.log(getX());
      }
      `
    }
  ]
})
