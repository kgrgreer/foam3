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
  name: 'SystemOutage',

  mixins: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.EnabledAware'
  ],

  javaImports: [
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.logger.Loggers',
    'java.util.Arrays',
    'java.util.List',
    'java.util.stream.Collectors'
  ],

  tableColumns: [
    'name',
    'enabled',
    'active',
    'startTime',
    'endTime'
  ],

  properties: [
    {
      class: 'String',
      name: 'id',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO'
    },
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'description'
    },
    {
      class: 'Boolean',
      name: 'active'
    },
    {
      class: 'DateTime',
      name: 'startTime'
    },
    {
      class: 'DateTime',
      name: 'endTime'
    }
  ],

  methods: [
    {
      name: 'activate',
      args: 'X x',
      documentation: 'a facade method for executing Activate on all SystemOutageTasks',
      javaCode: `
        if ( getActive() ) {
          Loggers.logger(x, this).info("System Outage is already active. Activate aborted.", getId());
          return;
        }

        SystemOutage clone = (SystemOutage) fclone();
        clone.setActive(true);
        ((DAO) x.get("systemOutageDAO")).put(clone);
      `
    },
    {
      name: 'deactivate',
      args: 'X x',
      documentation: 'a facade method for executing Deactivate on all SystemOutageTasks',
      javaCode: `
        if ( ! getActive() ) {
          Loggers.logger(x, this).info("System Outage is already inactive. Deactivate aborted.", getId());
        }

        SystemOutage clone = (SystemOutage) fclone();
        clone.setActive(false);
        ((DAO) x.get("systemOutageDAO")).put(clone);
      `
    },
    {
      name: 'toSummary',
      type: 'String',
      code: function() { return this.name; }
    }
  ]
});
