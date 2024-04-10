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
  name: 'SystemNotification',

  properties: [
    {
      documentation: 'set to the id of the encapsulating SystemEvent. Used to managed isDismissed in localStorage on the client.',
      class: 'Reference',
      of: 'foam.nanos.se.SystemEvent',
      name: 'id',
      visibility: 'HIDDEN'
    },
    {
      class: 'String',
      name: 'message'
    },
    {
      class: 'foam.core.Enum',
      of: 'foam.log.LogLevel',
      name: 'severity',
      value: 'WARN'
    },
    {
      documentation: 'Optionally restrict Notification to a particular menu, wizard, ... ',
      class: 'String',
      name: 'key'
    },
    {
      class: 'Boolean',
      name: 'isDismissable',
      value: true
    },
    {
      // Client side only, stored in local storage
      class: 'Boolean',
      name: 'isDismissed',
      value: false
    }
  ]
});

