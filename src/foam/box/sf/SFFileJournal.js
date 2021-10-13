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
  name: 'SFFileJournal',
  extends: 'foam.dao.F3FileJournal',
  documentation: `A implementation of Journal interface provide better support for SAF`,
  
  javaImports: [
    'foam.core.FObject',
    'foam.lib.json.JSONParser',
    'foam.nanos.pm.PM',
    'foam.util.concurrent.AssemblyLine',
    'foam.util.SafetyUtil',
    'java.io.BufferedReader',
    'java.util.concurrent.atomic.AtomicInteger',
    'foam.nanos.fs.Storage',
    'foam.nanos.fs.FileSystemStorage',
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
    }
  ],
  
  methods: [
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
      AssemblyLine assemblyLine = x.get("threadPool") == null ?
        new foam.util.concurrent.SyncAssemblyLine()   :
        new foam.util.concurrent.AsyncAssemblyLine(x, "replay") ;

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
  ],
})