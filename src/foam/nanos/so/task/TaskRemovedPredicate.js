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
  package: 'foam.nanos.so.task',
  name: 'TaskRemovedPredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  
  implements: ['foam.core.Serializable'],

  documentation: `
    A predicate for checking if tasks are removed from system outage.
    Set 'of' property to check for specific task class
  `,

  javaImports: [
    'foam.core.XLocator',
    'foam.nanos.so.SystemOutage',
    'foam.nanos.so.SystemOutageTask',
    'java.util.Arrays',

    'static foam.mlang.MLang.INSTANCE_OF',
    'static foam.mlang.MLang.NEW_OBJ',
    'static foam.mlang.MLang.OLD_OBJ'
  ],

  properties: [
    {
      class: 'Class',
      name: 'of',
      javaFactory: `
        return SystemOutage.getOwnClassInfo();
      `
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        SystemOutage newSo = (SystemOutage) NEW_OBJ.f(obj);
        SystemOutage oldSo = (SystemOutage) OLD_OBJ.f(obj);

        long numRemovedTasks = Arrays.asList(oldSo.findNonOverlappingTasks(XLocator.get(), newSo))
          .stream()
          .filter(t -> INSTANCE_OF(getOf()).f(t))
          .count();

        return numRemovedTasks > 0;
      `
    }
  ]
});
