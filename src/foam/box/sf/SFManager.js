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
  name: 'SFManager',
  
  implements: [
    'foam.nanos.NanoService',
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.box.Box',
    'foam.box.ReplyBox',
    'foam.core.Agency',
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.util.concurrent.AssemblyLine',
    'java.util.PriorityQueue',
    'java.util.concurrent.locks.ReentrantLock',
    'java.util.concurrent.locks.Condition',
  ],

  properties: [
    {
      class: 'Object',
      javaType: 'PriorityQueue',
      name: 'prorityQueue',
      javaFactory: `
        return new PriorityQueue<SFEntry>(16, (n, p) -> {
          if ( n.getScheduledTime() < p.getScheduledTime() ) {
            return -1;
          }
          if ( n.getScheduledTime() > p.getScheduledTime() ) {
            return 1;
          }
          return 0;
        });
      `
    },
    {
      class: 'String',
      name: 'threadPoolName',
      value: 'threadPool'
    },
    {
      class: 'Map',
      name: 'boxes',
      javaFactory: `
        return java.util.Collections.synchronizedMap(new java.util.HashMap<String, Object>());
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
          name: 'id',
          type: 'String'
        },
        {
          name: 'object',
          type: 'Object'
        }
      ],
      javaCode: `
        getBoxes().put(id, object);
      `
    },
    {
      name: 'get',
      synchronized: true,
      type: 'Object',
      args: [
        {
          name: 'x',
          type: 'X'
        },
        {
          name: 'sfId',
          type: 'String'
        },
        {
          name: 'delegate',
          type: 'Object'
        }
      ],
      javaCode: `
        Object obj = getBoxes().get(sfId);
        if ( obj != null ) {
          throw new RuntimeException("SF can not be used more than once");
        }

        DAO sfDAO = (DAO) x.get("sfDAO");
        SF sf = (SF) sfDAO.find(sfId);
        if ( sf == null ) throw new RuntimeException("No SF in the DAO associated with id: " + sfId);


        //TODO: check type of delegate then assign
        Object ret = null;
        if ( delegate instanceof Box) {
          Box box = (new SFBOX.Builder(getX()))
                      .setSf(sf)
                      .build();
          ret = box;
        } else {
          throw new RuntimeException("Unsupport type");
        }

        add(sfId, ret);
        return ret;
      `
    },
    {
      name: 'enqueue',
      args: 'SFEntry e',
      javaCode: `
        PriorityQueue<SFEntry> queue = (PriorityQueue) getProrityQueue();
        lock_.lock();
        try {
          queue.offer(e);
          notEmpty_.signal();
        } finally {
          lock_.unlock();
        }
      `
    },
    {
      name: 'initForwarder',
      args: 'Context x',
      javaThrows: [],
      javaCode: `
        PriorityQueue<SFEntry> queue = (PriorityQueue) getProrityQueue();
        Agency pool = (Agency) x.get(getThreadPoolName());

        // final AssemblyLine assemblyLine = x.get("threadPool") == null ?
        //   new foam.util.concurrent.SyncAssemblyLine()   :
        //   new foam.util.concurrent.AsyncAssemblyLine(x) ;

        final AssemblyLine assemblyLine = new foam.util.concurrent.SyncAssemblyLine();

        pool.submit(x, new ContextAgent() {
          volatile long count = 0;
          @Override
          public void execute(X x) {
            lock_.lock();
            while ( true ) {
              System.out.println("$$$$ SF running: " + count++);
              if ( queue.size() < 0 ) {
                if ( queue.peek().getScheduledTime() <= System.currentTimeMillis() ) {
                  SFEntry e = queue.poll();
                  assemblyLine.enqueue(new foam.util.concurrent.AbstractAssembly() { 
                    public void executeJob() {
                      //TODO: think
                      //e.getSf()
                      try {
                        e.getSf().submit(x, e);
                        e.getSf().successForward(e);
                      } catch ( Throwable t ) {
                        getLogger().warning(t.getMessage());
                        e.getSf().failForward(e);
                      }
                    }
                  });
                }
              } else {
                try {
                  notEmpty_.await();
                } catch ( InterruptedException e ) {
                  
                }
              }
            }
          }
        }, "SFBoxManager");
      `
    },
    {
      name: 'start',
      javaCode: `
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
            private final ReentrantLock lock_ = new ReentrantLock();
            private final Condition notEmpty_ = lock_.newCondition();
        
          `
        }));
      }
    }
  ]
})