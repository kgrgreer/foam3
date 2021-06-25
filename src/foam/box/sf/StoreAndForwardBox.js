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

//TODO: retry, reader and writer, persistance, writer and reader async work.
foam.CLASS({
  package: 'foam.box.sf',
  name: 'StoreAndForwardBox',
  extends: 'foam.box.ProxyBox',

  javaImports: [
    'foam.dao.DAO',
    'net.nanopay.security.HashingReplayJournal',
    'net.nanopay.security.HashingJDAO',
    'foam.dao.java.JDAO',
    'foam.dao.NullDAO',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.core.X'
  ],
  
  properties: [
    {
      class: 'String',
      name: 'fileName'
    },
    {
      class: 'Long',
      name: 'maxFileSize'
    },
    {
      class: 'Object',
      name: 'storeDAO',
      javaFactory: `
        // get dao from context
        if ( getIsHashEntry() ) {
          return new HashingJDAO(
            getX(), 
            "SHA-256", 
            true, 
            false, 
            new NullDAO.Builder(getX())
              .setOf(SFEntry.getOwnClassInfo())
              .build(), 
            getFileName()
          );
        } else {
          return new JDAO(
            getX(),
            new NullDAO.Builder(getX())
              .setOf(SFEntry.getOwnClassInfo())
              .build(),
            getFileName(),
            false
          );
        }
      `
    },
    {
      class: 'String',
      name: 'url'
    },
    {
      class: 'Boolean',
      name: 'isHashEntry',
      value: false
    },
    {
      name: 'replayJournal',
      class: 'FObjectProperty',
      of: 'foam.dao.Journal',
      javaFactory: `
        return null;
      `
    },
    {
      class: 'Int',
      name: 'initialValue',
      value: 10
    },
    {
      class: 'Object',
      javaType: 'StepFunction',
      name: 'stepFunction',
      javaFactory: `
        return x -> x*2;
      `
    },
    {
      class: 'Int',
      name: 'maxRetryDelay',
      value: 20000
    },
    {
      name: 'maxRetryAttempts',
      class: 'Int',
      documentation: 'Set to -1 to infinitely retry.',
      value: 20
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
          this.getClass().getSimpleName(),
          this.getUrl()
        }, (Logger) getX().get("logger"));
      `
    }
  ],

  methods: [
    {
      name: 'send',
      javaCode: `
        //persist
        //send delegate
        //if sucess
        //if fail - retry
        //how to know the fail
        //becarefull of replay box. and error

        int retryAttempt = 0;
        int delay = getInitialValue();

        SFEntry entry = new SFEntry.Builder(getX())
                              .setMessage(msg)
                              .build();
      
        /* Create store entry and persist it. */
        entry = (SFEntry)(((DAO) getStoreDAO()).put(entry));

        while ( true ) {
          try {
            getDelegate().send(msg);

            /* Forward success. */
            entry.setIsSent(true);
            ((DAO) getStoreDAO()).put(entry);
            break;
          } catch ( Throwable t ) {
            getLogger().warning(t.getMessage());

            /* Reach retry limit. */
            if ( getMaxRetryAttempts() > -1 &&
              retryAttempt >= getMaxRetryAttempts() ) {
              getLogger().warning("retryAttempt >= maxRetryAttempts", retryAttempt, getMaxRetryAttempts());
              //TODO: set entry to cancel.
              throw new RuntimeException("Rejected, retry limit reached.");
            }

            retryAttempt += 1;

            /* Delay and retry */
            try {
              delay = getStepFunction().next(delay);
              if ( delay > getMaxRetryDelay() ) {
                delay = getMaxRetryDelay();
              }
              getLogger().info("retry attempt", retryAttempt, "delay", delay);
              Thread.sleep(delay);
            } catch(InterruptedException e) {
              Thread.currentThread().interrupt();
              throw t;
            }
          } 
        }

        /* Forward success */

        /* Forward fail - retry */
      `
    },
    {
      documentation: `Read unsend entries from file and send`,
      name: 'initReader',
      javaCode: `
        //TODO: search latest modify file
        //Using: Async AssemblyLine.
        return;
      `
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
            static private interface StepFunction {
              public int next(int cur);
            }

            /* Initial Reader. */
            {
              initReader();
            }
          `
        }));
      }
    }
  ]
});