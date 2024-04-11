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
  name: 'SystemOutageTaskInitPredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  
  implements: ['foam.core.Serializable'],

  documentation: 'A predicate for checking if tasks on a system outage need to be initialized',

  javaImports: [
    'foam.nanos.so.SystemOutage',
    'foam.nanos.so.SystemOutageTask',
    'static foam.mlang.MLang.NEW_OBJ'
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        SystemOutage so = (SystemOutage) NEW_OBJ.f(obj);

        for ( SystemOutageTask task : so.getTasks() ) {
          if ( task.getId().isEmpty() || task.getSystemOutage().isEmpty() ) return true;
        }

        return false;
      `
    }
  ]
});
