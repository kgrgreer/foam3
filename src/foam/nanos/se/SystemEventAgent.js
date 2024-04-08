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
  name: 'SystemEventAgent',
  implements: [ 'foam.core.ContextAgent' ],

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'static foam.mlang.MLang.*',
    'foam.nanos.logger.Loggers',
    'foam.nanos.se.SystemEvent',
    'java.util.Calendar',
    'java.util.List',
    'java.util.TimeZone'
  ],

  methods: [
    {
      name: 'execute',
      javaCode: `
    var currTime = Calendar.getInstance(TimeZone.getTimeZone("UTC")).getTime();

    DAO systemEventDAO = (DAO) x.get("systemEventDAO");
    List<SystemEvent> activate = ((ArraySink) systemEventDAO
      .where(
        AND(
          EQ(SystemEvent.ENABLED, true),
          EQ(SystemEvent.ACTIVE, false),
          LTE(SystemEvent.START_TIME, currTime)
        )
      )
      .select(new ArraySink()))
      .getArray();

    for ( SystemEvent event : activate ) {
      event = (SystemEvent) event.fclone();
      event.setActive(true);
      systemEventDAO.put(event);
      try {
        event.activate(x);
      } catch (RuntimeException e) {
        Loggers.logger(x, this).error("Failed to activate System Event", event.getName());
        event.setActive(false);
        systemEventDAO.put(event);
      }
    }

    List<SystemEvent> deactivate = ((ArraySink) systemEventDAO
      .where(
        AND(
          EQ(SystemEvent.ENABLED, true),
          EQ(SystemEvent.ACTIVE, true),
          GT(SystemEvent.END_TIME, SystemEvent.START_TIME),
          LTE(SystemEvent.END_TIME, currTime)
        )
      )
      .select(new ArraySink()))
      .getArray();

    for ( SystemEvent event : deactivate ) {
      event = (SystemEvent) event.fclone();
      event.setActive(false);
      systemEventDAO.put(event);
      try {
        event.deactivate(x);
      } catch (RuntimeException e) {
        Loggers.logger(x, this).error("Failed to deactivate System Event", event.getName());
        event.setActive(true);
      }
    }
     `
    }
  ]
})
