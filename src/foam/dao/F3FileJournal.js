/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'F3FileJournal',
  extends: 'foam.dao.AbstractF3FileJournal',
  flags: ['java'],

  implements: [
    'foam.dao.Journal'
  ],

  javaImports: [
    'foam.core.FObject',
    'foam.lib.json.JSONParser',
    'foam.nanos.pm.PM',
    'foam.util.concurrent.AssemblyLine',
    'foam.util.SafetyUtil',
    'java.io.BufferedReader',
    'java.util.concurrent.atomic.AtomicInteger'
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao'
    },
    {
      documentation: 'Perform replay synchronously. Manual workaround for deadlock with AsyncAssemblyLine',
      class: 'Boolean',
      name: 'syncReplay'
    }
  ],

  methods: [
    {
      name: 'replay',
      documentation: 'Replays the journal file',
      args: [
        { name: 'x',   type: 'Context' },
        { name: 'dao', type: 'foam.dao.DAO' }
      ],
      javaCode: `
        // count number of entries successfully read
        AtomicInteger successReading = new AtomicInteger();

        // NOTE: explicitly calling PM constructor as create only creates
        // a percentage of PMs, but we want all replay statistics
        PM pm = new PM(dao.getOf(), "replay." + getFilename());
        AssemblyLine assemblyLine =
          ( getSyncReplay() ||
            x.get("threadPool") == null ) ?
          new foam.util.concurrent.SyncAssemblyLine() :
          new foam.util.concurrent.AsyncAssemblyLine(x, "replay");

        try ( BufferedReader reader = getReader() ) {
          if ( reader == null ) {
            return;
          }
          for (  CharSequence entry ; ( entry = getEntry(reader) ) != null ; ) {
            int length = entry.length();
            if ( length == 0 ) continue;
            if ( COMMENT.matcher(entry).matches() ) continue;
            try {
              final char operation = entry.charAt(0);
              final String strEntry = entry.subSequence(2, length - 1).toString();
              assemblyLine.enqueue(new foam.util.concurrent.AbstractAssembly() {
                FObject obj;

                public void executeJob() {
                  JSONParser parser = getParser(x);
                  obj = parser.parseString(strEntry, dao.getOf().getObjClass());
                }

                public void endJob(boolean isLast) {
                  if ( obj == null ) {
                    getLogger().error("Parse error in the jrl file " + getFilename(), getParsingErrorMessage(strEntry), "entry Object is: ", strEntry);
                    return;
                  }
                  switch ( operation ) {
                    case 'p':
                      foam.core.FObject old = dao.find(obj.getProperty("id"));
                      dao.put(old != null ? mergeFObject(old.fclone(), obj) : obj);
                      break;

                    case 'r':
                      dao.remove(obj);
                      break;
                  }
                  successReading.incrementAndGet();
                }
              });
            } catch ( Throwable t ) {
              getLogger().error("Error replaying journal", dao.getOf().getId(), entry, t);
            }
          }
        } catch ( Throwable t) {
          getLogger().error("Failed to read journal", dao.getOf().getId(), t);
        } finally {
          assemblyLine.shutdown();
          pm.log(x);
          getLogger().log("Successfully read " + successReading.get() + " entries from file: " + getFilename() + " in: " + pm.getTime() + "(ms)");
        }
      `
    }
  ]
});
