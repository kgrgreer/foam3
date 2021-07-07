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
  name: 'SFBoxManager',
  
  implements: [
    'foam.nanos.NanoService',
  ],

  javaImports: [
    'foam.box.Box',
    'foam.box.ReplyBox',
    'foam.core.Agency',
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
  ],

  properties: [
    {
      class: 'Map',
      name: 'boxes',
      javaFactory: `
        return java.util.Collections.synchronizedMap(new java.util.HashMap());
      `
    },
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      transient: true,
      javaCloneProperty: '//noop',
      javaFactory: `
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, (Logger) getX().get("logger"));
      `
    }
  ],
  
  methods: [
    {
      name: 'add',
      args: [
        {
          name: 'box',
          type: 'SFBOX'
        }
      ],
      javaCode: `
        getBoxes().put(makeKey(box.getFileName()), box);
      `
    },
    {
      name: 'makeKey',
      type: 'String',
      args: [
        {
          name: 'fileName',
          type: 'String'
        }
      ],
      javaCode: `
        return fileName;
      `
    },
    {
      name: 'get',
      synchronized: true,
      type: 'foam.box.Box',
      args: [
        {
          name: 'x',
          type: 'X'
        },
        {
          name: 'fileName',
          type: 'String'
        },
        {
          name: 'stepFunction',
          type: 'SFBOX.StepFunction'
        },
        {
          name: 'maxRetryAttempts',
          type: 'int'
        }
      ],
      javaCode: `
        String key = makeKey(fileName);
        SFBOX box = (SFBOX) getBoxes().get(key);
        if ( box != null ) {
          throw new RuntimeException("SFBOX can not be reference more than once");
        }
        box = (new SFBOX.Builder(getX()))
                .setFileName(fileName)
                .setStepFunction(stepFunction)
                .setMaxRetryAttempts(maxRetryAttempts)
                .build();
        box.initReader(getX());
        add(box);
        return box;
      `
    },
    {
      name: 'start',
      javaCode: `
        return;
      `
    }
  ]
})