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
  name: 'SystemOutageAgent',
  implements: [ 'foam.core.ContextAgent' ],

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'static foam.mlang.MLang.*',
    'foam.nanos.logger.Loggers',
    'foam.nanos.so.SystemOutage',
    'java.util.Calendar',
    'java.util.List',
    'java.util.TimeZone'
  ],

  methods: [
    {
      name: 'execute',
      javaCode: `
    var currTime = Calendar.getInstance(TimeZone.getTimeZone("UTC")).getTime();

    DAO systemOutageDAO = (DAO) x.get("systemOutageDAO");
    List<SystemOutage> activate = ((ArraySink) systemOutageDAO
      .where(
        AND(
          EQ(SystemOutage.ENABLED, true),
          EQ(SystemOutage.ACTIVE, false),
          LTE(SystemOutage.START_TIME, currTime)
        )
      )
      .select(new ArraySink()))
      .getArray();

    for ( SystemOutage outage : activate ) {
      outage = (SystemOutage) outage.fclone();
      outage.setActive(true);
      systemOutageDAO.put(outage);
      try {
        outage.activate(x);
      } catch (RuntimeException e) {
        Loggers.logger(x, this).error("Failed to activate System Outage", outage.getName());
        outage.setActive(false);
        systemOutageDAO.put(outage);
      }
    }

    List<SystemOutage> deactivate = ((ArraySink) systemOutageDAO
      .where(
        AND(
          EQ(SystemOutage.ENABLED, true),
          EQ(SystemOutage.ACTIVE, true),
          GT(SystemOutage.END_TIME, SystemOutage.START_TIME),
          LTE(SystemOutage.END_TIME, currTime)
        )
      )
      .select(new ArraySink()))
      .getArray();

    for ( SystemOutage outage : deactivate ) {
      outage = (SystemOutage) outage.fclone();
      outage.setActive(false);
      systemOutageDAO.put(outage);
      try {
        outage.deactivate(x);
      } catch (RuntimeException e) {
        Loggers.logger(x, this).error("Failed to deactivate System Outage", outage.getName());
        outage.setActive(true);
      }
    }
     `
    }
  ]
})
