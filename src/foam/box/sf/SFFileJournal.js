/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.box.sf',
  name: 'SFFileJournal',
  extends: 'foam.dao.F3FileJournal',
  documentation: `A implementation of Journal interface provide better support for SAF`,

  javaImports: [
    'foam.core.ClassInfo',
    'foam.core.FObject',
    'foam.lib.json.JSONParser',
    'foam.nanos.pm.PM',
    'foam.util.concurrent.AssemblyLine',
    'foam.util.SafetyUtil',
    'java.io.BufferedReader',
    'java.util.concurrent.atomic.AtomicInteger',
    'foam.nanos.fs.Storage',
    'foam.nanos.fs.FileSystemStorage',
    'foam.lib.formatter.JSONFObjectFormatter',
    'foam.dao.DAO',
    'java.io.File',
    'java.nio.file.Path',
    'java.nio.file.Files',
    'java.nio.file.attribute.BasicFileAttributes',
    'java.nio.file.attribute.FileTime'
  ],

  properties: [
    {
      class: 'Long',
      name: 'fileSize',
      javaGetter: `
        try {
          FileSystemStorage fileSystemStorage = (FileSystemStorage) getX().get(foam.nanos.fs.Storage.class);
          File file = fileSystemStorage.get(getFilename());
          Path path = file.toPath();
          return Files.size(path);
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }
      `
    },
    {
      class: 'Boolean',
      name: 'fileExist',
      javaGetter: `
        try {
          FileSystemStorage fileSystemStorage = (FileSystemStorage) getX().get(foam.nanos.fs.Storage.class);
          File file = fileSystemStorage.get(getFilename());
          Path path = file.toPath();
          return Files.exists(path);
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }
      `
    },
    {
      class: 'Long',
      name: 'fileLastAccessTime',
      javaGetter: `
        try {
          FileSystemStorage fileSystemStorage = (FileSystemStorage) getX().get(foam.nanos.fs.Storage.class);
          File file = fileSystemStorage.get(getFilename());
          Path path = file.toPath();
          BasicFileAttributes attr = Files.readAttributes(path, BasicFileAttributes.class);
          return attr.lastAccessTime().toMillis();
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }
      `,
      javaSetter: `
        try {
          FileSystemStorage fileSystemStorage = (FileSystemStorage) getX().get(foam.nanos.fs.Storage.class);
          File file = fileSystemStorage.get(getFilename());
          Path path = file.toPath();
          FileTime fileTime = FileTime.fromMillis(val);
          Files.setAttribute(path, "lastAccessTime", fileTime);
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }
      `
    },
    {
      class: 'Long',
      name: 'fileOffset',
      javaGetter: `
        return getFileLastAccessTime();
      `,
      javaSetter: `
        setFileLastAccessTime(val);
      `
    }
  ],

  methods: [
    {
      name: 'put',
      type: 'FObject',
      args: 'Context x, String prefix, DAO dao, FObject obj',
      javaCode: `
      final Object                 id  = obj.getProperty("id");
      final ClassInfo              of  = dao.getOf();
      final JSONFObjectFormatter fmt = formatter.get();

      getLine().enqueue(new foam.util.concurrent.AbstractAssembly() {
        FObject old;

        public Object[] requestLocks() {
          return new Object[] { id };
        }

        public void executeUnderLock() {
          dao.put_(x, obj);
        }

        public void executeJob() {
          try {
            fmt.output(obj, of);
          } catch (Throwable t) {
            getLogger().error("Failed to format put", getFilename(), of.getId(), "id", id, t);
            fmt.reset();
          }
        }

        public void endJob(boolean isLast) {
          if ( fmt.builder().length() == 0 ) return;

          try {
            writePut_(
              x,
              fmt.builder(),
              getMultiLineOutput() ? "\\n" : "",
              SafetyUtil.isEmpty(prefix) ? "" : prefix + ".");

            if ( isLast ) getWriter().flush();
          } catch (Throwable t) {
            getLogger().error("Failed to write put", getFilename(), of.getId(), "id", id, t);
          }  finally {
            fmt.reset();
          }
        }
      });

      return obj;
      `
    },
    {
      name: 'createJournalFile',
      args: '',
      javaCode: `
      try {
        FileSystemStorage fileSystemStorage = (FileSystemStorage) getX().get(foam.nanos.fs.Storage.class);
        File file = fileSystemStorage.get(getFilename());
        Path path = file.toPath();
        Files.createFile(path);
      } catch ( Throwable t ) {
        throw new RuntimeException(t);
      }
      `
    },
    {
      name: 'calculateSize',
      args: 'FObject obj',
      documentation: 'calculate entry size in the file',
      javaType: 'long',
      javaCode: `
        ClassInfo of = SFEntry.getOwnClassInfo();
        JSONFObjectFormatter fmt = formatter.get();
        fmt.output(obj, of);
        StringBuilder sb = fmt.builder();
        sb.insert(0, "p(");
        sb.append(')');
        sb.append(System.getProperty("line.separator"));
        return sb.length();
      `
    },
    {
      name: 'replayFrom',
      documentation: 'Replay the journal file from offset',
      args: 'Context x, foam.dao.DAO dao, long offset',
      javaCode: `
      // count number of entries successfully read
      AtomicInteger successReading = new AtomicInteger();

      // NOTE: explicitly calling PM constructor as create only creates
      // a percentage of PMs, but we want all replay statistics
      PM pm = new PM(dao.getOf(), "replay." + getFilename());
      AssemblyLine assemblyLine = new foam.util.concurrent.SyncAssemblyLine();

      try ( BufferedReader reader = getReader() ) {
        if ( reader == null ) {
          return;
        }
        reader.skip(offset);
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
                  getLogger().error("Parse error", getParsingErrorMessage(strEntry), "entry:", strEntry);
                  return;
                }
                switch ( operation ) {
                  case 'p':
                    dao.put(obj);
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
  ],
})
