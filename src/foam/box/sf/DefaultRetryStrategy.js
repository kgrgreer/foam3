/**
* @license
* Copyright 2021 The FOAM Authors. All Rights Reserved.
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
  package: 'foam.box.sf',
  extends: 'foam.box.sf.RetryStrategy',
  name: 'DefaultRetryStrategy',

  properties: [
    {
      name: 'maxRetryAttempts',
      class: 'Int',
      documentation: 'Set to -1 to infinitely retry.',
      value: 20
    },
    {
      name: 'constantDelayTime',
      class: 'Long',
      value: 4000
    },
    {
      class: 'Int',
      name: 'maxRetryDelayMS',
      documentation: 'Unit in Millisecond',
      value: 20000
    },
  ],

  methods: [
    {
      name: 'delay',
      documentation: 'Unit: MS',
      javaType: 'long',
      args: 'long cur',
      javaCode: `
        return getConstantDelayTime();
      `
    },
    {
      name: 'maxRetryDelay',
      documentation: 'Unit: MS',
      javaType: 'long',
      javaCode: `
        return getMaxRetryDelayMS();
      `
    },
    {
      name: 'maxRetries',
      documentation: 'Unit: MS',
      javaType: 'long',
      javaCode: `
        return getMaxRetryAttempts();
      `
    }
  ],
})