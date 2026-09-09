/**
 * @license
 * Copyright 2025 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.core.fs',
  name: 'Watcher',
  abstract: true,
  implements: [
    'foam.lang.ContextAgent',
    'foam.core.COREService'
  ],

  documentation: `Poll a directory for files that appear or change. Each one's
path relative to watchDir is a 'request': handleRequest gets it when
acceptRequest agrees, then postCleanup runs, which by default deletes the file.

Detection is a stat poll, not java.nio.WatchService. On macOS WatchService is
sun.nio.fs.PollingWatchService, 10s per directory by default, and with
recursive:true it would register every directory: measured on a 3245-directory
source tree that cost 19.5% of one core. A stat of the 5715 known files every
500ms costs 5%. rescanInterval:0 (the default) walks watchDir every tick, which a
single request directory needs to see new files; a large recursive tree sets
it to seconds and pays the walk that often. acceptRequest is applied at scan
time, so a file it rejects is never tracked.`,

  javaImports: [
    'foam.core.app.AppConfig',
    'foam.core.logger.Logger',
    'foam.core.logger.Loggers',
    'foam.lang.AgencyTimerTask',
    'foam.lang.X',
    'foam.util.SafetyUtil',
    'java.io.File',
    'java.io.IOException',
    'java.nio.file.FileSystems',
    'java.nio.file.FileVisitResult',
    'java.nio.file.Files',
    'java.nio.file.Path',
    'java.nio.file.Paths',
    'java.nio.file.SimpleFileVisitor',
    'java.nio.file.attribute.BasicFileAttributes',
    'java.util.Arrays',
    'java.util.HashMap',
    'java.util.HashSet',
    'java.util.Iterator',
    'java.util.Map',
    'java.util.Set',
    'java.util.Timer',
    'java.util.concurrent.atomic.AtomicBoolean'
  ],

  properties: [
    {
      name: 'tmpDir',
      class: 'String',
      javaFactory: `
      return System.getProperty("java.io.tmpdir", "tmp");
      `
    },
    {
      documentation: 'Create unique tmp directory for this watcher',
      name: 'watchDir',
      class: 'String',
      javaFactory: `
      AppConfig appConfig = (AppConfig) getX().get("appConfig");
      String appName = appConfig.getName().trim().replaceAll(" ","");
      String hostname = System.getProperty("hostname", "localhost");
      if ( hostname.equals("localhost") ) {
        hostname = System.getProperty("user.name", "localhost");
      }
      String name = getClass().getSimpleName().replace("Watcher","").toLowerCase();
      Path path = FileSystems.getDefault().getPath(getTmpDir(), hostname, appName, name);
      return path.toString();
      `
    },
    {
      documentation: 'Walk subdirectories of watchDir.',
      name: 'recursive',
      class: 'Boolean'
    },
    {
      documentation: 'Directory names not walked when recursive.',
      name: 'skipDirs',
      class: 'StringArray'
    },
    {
      documentation: 'skipDirs as a set, built once instead of per scan().',
      name: 'skipDirSet',
      class: 'Object',
      javaType: 'java.util.Set<String>',
      javaFactory: 'return new HashSet<>(Arrays.asList(getSkipDirs()));',
      visibility: 'HIDDEN',
      networkTransient: true
    },
    {
      documentation: 'Milliseconds between stats of the known files.',
      name: 'pollInterval',
      class: 'Long',
      value: 500
    },
    {
      documentation: 'Milliseconds between walks of watchDir that pick up new and deleted files. 0 walks every tick.',
      name: 'rescanInterval',
      class: 'Long'
    },
    {
      name: 'initialTimerDelay',
      class: 'Int',
      value: 5000
    },
    {
      name: 'threadPoolName',
      class: 'String',
      value: 'threadPool'
    },
    {
      documentation: 'Store reference to timer so it can be cancelled, and agent restarted.',
      name: 'timer',
      class: 'Object',
      visibility: 'HIDDEN',
      networkTransient: true
    },
    {
      name: 'running',
      class: 'Object',
      javaType: 'java.util.concurrent.atomic.AtomicBoolean',
      javaFactory: 'return new AtomicBoolean(false);',
      visibility: 'HIDDEN',
      networkTransient: true
    }
 ],

  methods: [
    {
      documentation: 'Start as a COREService',
      name: 'start',
      javaCode: `
      if ( SafetyUtil.isEmpty(getWatchDir()) ) {
        Loggers.logger(getX(), this).info("watchDir not set, not watching");
        return;
      }
      getRunning().set(true);
      Timer timer = new Timer(this.getClass().getSimpleName(), true);
      setTimer(timer);
      timer.schedule(
        new AgencyTimerTask(getX(), getThreadPoolName(), this),
        getInitialTimerDelay());
      `
    },
    {
      name: 'stop',
      javaCode: `
      getRunning().set(false);
      if ( getTimer() != null ) ((Timer) getTimer()).cancel();
      `
    },
    {
      name: 'execute',
      args: 'Context x',
      javaCode: `
      Logger logger = Loggers.logger(x, this);
      Path   root   = Paths.get(getWatchDir()).toAbsolutePath().normalize();
      logger.info("execute", root);

      try {
        mkdirs(x, getWatchDir());
        preCleanup(x);

        Map<Path, String> requests = new HashMap<>();
        Map<Path, Long>   known    = scan(x, root, requests);
        long              lastScan = System.currentTimeMillis();

        while ( getRunning().get() ) {
          try {
            Thread.sleep(getPollInterval());
          } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            break;
          }

          if ( System.currentTimeMillis() - lastScan >= getRescanInterval() ) {
            Map<Path, String> freshRequests = new HashMap<>();
            Map<Path, Long>   fresh         = scan(x, root, freshRequests);
            for ( Map.Entry<Path, Long> e : fresh.entrySet() ) {
              if ( known.putIfAbsent(e.getKey(), e.getValue()) == null ) {
                requests.put(e.getKey(), freshRequests.get(e.getKey()));
                request(x, freshRequests.get(e.getKey()));
              }
            }
            known.keySet().retainAll(fresh.keySet());
            requests.keySet().retainAll(fresh.keySet());
            lastScan = System.currentTimeMillis();
          }

          for ( Iterator<Map.Entry<Path, Long>> it = known.entrySet().iterator() ; it.hasNext() ; ) {
            Map.Entry<Path, Long> e = it.next();
            long mt;
            try {
              mt = Files.getLastModifiedTime(e.getKey()).toMillis();
            } catch (IOException ex) {
              // gone: postCleanup deleted it, or the user did
              it.remove();
              requests.remove(e.getKey());
              continue;
            }
            if ( mt == e.getValue() ) continue;
            e.setValue(mt);
            request(x, requests.get(e.getKey()));
          }
        }
      } catch (Throwable t) {
        logger.error("execute", t);
        throw t;
      } finally {
        logger.info("exit");
      }
      `
    },
    {
      documentation: 'mtime of every accepted file under root; subdirectories only when recursive, never skipDirs. requests receives, for each key this returns, the same string acceptRequest was asked about, so callers do not recompute it. requests is Map, not Map<Path, String>: a comma inside a generic in a string-form args: breaks the genJava argument split.',
      name: 'scan',
      args: 'X x, Path root, Map requests',
      javaType: 'Map<Path, Long>',
      javaCode: `
      Map<Path, Long>    files      = new HashMap<>();
      Map<Path, String>  reqsByPath = requests;
      Set<String>        skip       = getSkipDirSet();
      try {
        Files.walkFileTree(root, new SimpleFileVisitor<Path>() {
          @Override
          public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs) {
            if ( dir.equals(root) ) return FileVisitResult.CONTINUE;
            return getRecursive() && ! skip.contains(dir.getFileName().toString())
              ? FileVisitResult.CONTINUE
              : FileVisitResult.SKIP_SUBTREE;
          }
          @Override
          public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) {
            String req = toRequest(root, file);
            if ( acceptRequest(x, req) ) {
              files.put(file, attrs.lastModifiedTime().toMillis());
              reqsByPath.put(file, req);
            }
            return FileVisitResult.CONTINUE;
          }
          @Override
          public FileVisitResult visitFileFailed(Path file, IOException e) {
            return FileVisitResult.CONTINUE;
          }
        });
      } catch (IOException e) {
        Loggers.logger(x, this).warning("scan", root, e);
      }
      return files;
      `
    },
    {
      documentation: 'The request string for a file: its path relative to root with forward slashes.',
      name: 'toRequest',
      args: 'Path root, Path file',
      type: 'String',
      javaCode: `
      return root.relativize(file).toString().replace(File.separatorChar, '/');
      `
    },
    {
      documentation: 'Handle one detected file, then clean it up. A failure in either is logged and the loop goes on.',
      name: 'request',
      args: 'X x, String request',
      javaCode: `
      Logger logger = Loggers.logger(x, this);
      logger.info("Detected", request);
      try {
        handleRequest(x, request);
        postCleanup(x, request);
      } catch (Throwable t) {
        logger.warning(request, t);
      }
      `
    },
    {
      documentation: 'Return true if this agent can process the event',
      name: 'acceptRequest',
      args: 'X x, String request',
      type: 'Boolean',
      javaCode: `
        throw new UnsupportedOperationException("Abstract method not implemented: "+this.getClass().getSimpleName() + ".acceptRequest");
      `
    },
    {
      documentation: 'Process the event',
      name: 'handleRequest',
      args: 'X x, String request',
      javaCode: `
        throw new UnsupportedOperationException("Abstract method not implemented: "+this.getClass().getSimpleName() + ".handleRequest");
      `
    },
    {
      documentation: 'Cleanup on system start.',
      name: 'preCleanup',
      args: 'X x',
      javaCode: `
        // nop
      `
    },
    {
      documentation: 'Cleanup after accepting the request for processing',
      name: 'postCleanup',
      args: 'X x, String request',
      javaCode: `
      try {
        Path existing = Paths.get(getWatchDir(), request);
        Files.deleteIfExists(existing);
        existing.toFile().deleteOnExit();
      } catch ( IOException e) {
        Loggers.logger(x, this).warning(e);
      }
      `
    },
    {
      name: 'mkdirs',
      args: 'X x, String name',
      javaCode: `
      File dir = new File(name);
      if ( ! dir.exists() ) {
        if ( ! dir.mkdirs() ) {
          Loggers.logger(x, this).error("Failed directory creation", name);
          throw new RuntimeException(this.getClass().getSimpleName() + " Failed watch directory creation");
        }
      }
      `
    }
  ]
});
