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
  package: 'foam.nanos.se',
  name: 'SystemNotificationServiceServer',

  implements: [ 'foam.nanos.se.SystemNotificationService' ],

  javaImports: [
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.DESC',
    'static foam.mlang.MLang.EQ',
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
      List<SystemEvent> events = (List) ((ArraySink) ((DAO) getX().get("systemEventDAO"))
        .where(AND(
          EQ(SystemEvent.ENABLED, true),
          EQ(SystemEvent.ACTIVE, true)
        ))
        .orderBy(DESC(SystemEvent.START_TIME))
        .select(new ArraySink()))
        .getArray();
      List<SystemNotification> notifications = new ArrayList();
      for ( SystemEvent event : events ) {
        Theme theme = (Theme) x.get("theme");
        for ( SystemEventTask task : event.getTasks() ) {
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
            notifications.add(sn);
          }
        }
      }
      return notifications.toArray(new SystemNotification[notifications.size()]);
      `
    }
  ]
})
