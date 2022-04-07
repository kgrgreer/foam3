/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.http;

import foam.core.ContextAware;
import foam.core.X;
import foam.nanos.logger.Logger;
import java.io.*;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.*;
import java.util.concurrent.LinkedBlockingQueue;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import static java.nio.file.FileVisitResult.CONTINUE;
import static io.methvin.watcher.DirectoryChangeEvent.EventType.MODIFY;
import static io.methvin.watcher.DirectoryChangeEvent.EventType.DELETE;
import io.methvin.watcher.DirectoryWatcher;
import org.apache.commons.lang.ArrayUtils;

public class LiveScriptBundler
  implements WebAgent, ContextAware
{
  protected X x_;

  // Filesystem
  protected String path_;
  protected Set<String> fileNames_;

  // Caching
  protected String javascriptBuffer_;

  // Debounce
  protected boolean scheduled_;

  // Configuration
  protected static final String JS_BUILD_PATH = "./foam3/tools/genjs.js";
  protected static final String GENJAVA_SRC_PATH = "build/src/java";
  protected static final String GENJAVA_INPUT_PATH = "foam3/tools/genjava.js";
  protected static final String GENJAVA_OUTPUT_PATH = "tools/classes.js";
  protected String[] binFiles = { "./foam-bin.js" };

  // Modified files
  protected StringJoiner modified_;
  protected StringJoiner removed_;

  private interface FileUpdateListener {
    public void onFileUpdate();
  }

  public X getX() {
    return x_;
  }

  public void setX(X x) {
    x_ = x;
  }

  public void setBinFiles(String[] v) {
    this.binFiles = v;
  }

  public LiveScriptBundler() {
    this(System.getProperty("user.dir"));
  }

  public LiveScriptBundler(String path) {
    fileNames_ = new HashSet<>();
    path_ = path;
    modified_ = new StringJoiner("\",\"", "{\"modified\":[\"", "\"]");
    modified_.setEmptyValue("{\"modified\":[]");
    removed_ = new StringJoiner("\",\"", ",\"removed\":[\"", "\"]}");
    removed_.setEmptyValue(",\"removed\":[]}");

    try {
      // Create list of files.js locations
      var filesPaths = new HashSet<String>();

      // Walk through the project directory to find files.js files
      Files.walkFileTree(Paths.get(path_), new SimpleFileVisitor<Path>() {
        @Override
        public FileVisitResult visitFile(Path path, BasicFileAttributes attr) {
          path = Paths.get(path_).relativize(path);
          Path sourcePath = null;

          if ( ! attr.isRegularFile() ) {
            return CONTINUE;
          }

          // Find any file named pom.js
          String filename = path.getFileName().toString();
          if ( filename.equals("pom.js") ) {
            // Locate the closest `src` folder if one exists
            for ( int i = path.getNameCount()-1; i >= 0; i-- ) {
              String dirname = path.getName(i).getFileName().toString();
              if ( dirname.equals("src") ) {
                sourcePath = path.subpath(0, i+1);
                break;
              }
            }

            // Add this file if it was found inside a `src` folder
            if ( sourcePath != null ) {
              filesPaths.add(sourcePath.toString());
            }
          }
          return CONTINUE;
        }
      });

      doRebuildJavascript();

      // Read each files.js file
      for ( String currentFilesPath : filesPaths ) {
        DirectoryWatcher.builder()
          .path(Paths.get(path_, currentFilesPath))
          .listener(event -> {
            if ( event.path().getFileName().toString().endsWith(".js") ) {
              if ( event.eventType() == MODIFY ) { modified_.add(event.path().toString()); }
              if ( event.eventType() == DELETE ) { removed_.add(event.path().toString()); }
              scheduleRebuild();
            }
          })
          .build().watchAsync();
      }
    } catch ( Throwable t ) {
      t.printStackTrace();
      System.err.println("Failed to initialize filesystem watcher! :(");
      System.exit(1);
    }
  }

  private synchronized void scheduleRebuild() {
    if ( scheduled_ ) return;
    scheduled_ = true;
    new Thread(() -> {
      try {
        Thread.sleep(20);
        scheduled_ = false;
        doRebuildJavascript();
      }
      catch (Exception e){
        System.err.println(e);
      }
    }).start();
  }

  private synchronized void doRebuildJavascript() {
    try {
      log_("START", "Building javascript... (JS)");

      Process        p  = new ProcessBuilder("node", JS_BUILD_PATH).start();
      BufferedReader br = new BufferedReader(new InputStreamReader(p.getInputStream()));
      String         line;
      while ( (line = br.readLine()) != null ) {
        log_("JS", "js> " + line);
      }

      StringBuilder sb = new StringBuilder();
      for ( String path : binFiles ) {
        sb.append(new String(Files.readAllBytes(Paths.get(path))));
      }
      javascriptBuffer_ = sb.toString();
      log_("DONE", "JS");
    } catch (IOException e) {
      log_("ERROR", e.getMessage());
    }
  }

  private synchronized void doRebuildJavascript(HttpServletRequest req) {
    String queryString = req.getQueryString();
    String[] args = queryString.split("&");
    String[] command = (String[]) ArrayUtils.add(args, 0, JS_BUILD_PATH );
    
    try {
      log_("START", "Building javascript with updated flags... (JS)");

      Process        p  = new ProcessBuilder(command).start();
      BufferedReader br = new BufferedReader(new InputStreamReader(p.getInputStream()));
      String         line;
      while ( (line = br.readLine()) != null ) {
        log_("JS", "js> " + line);
      }

      StringBuilder sb = new StringBuilder();
      for ( String path : binFiles ) {
        sb.append(new String(Files.readAllBytes(Paths.get(path))));
      }
      javascriptBuffer_ = sb.toString();
      log_("DONE", "JS");
    } catch (IOException e) {
      log_("ERROR", e.getMessage());
    }
  }

  private synchronized void doRegenJava(HttpServletRequest req) {
    String[] command = { "node", "--stack_trace_limit=200", GENJAVA_INPUT_PATH, GENJAVA_OUTPUT_PATH,
                         GENJAVA_SRC_PATH, System.getProperty("user.dir"), modified_.toString() + removed_.toString() };
    try {
      log_("START", "Debugging genJava... (JS)");

      Process        p  = new ProcessBuilder(command).start();
      BufferedReader br = new BufferedReader(new InputStreamReader(p.getInputStream()));
      String         line;
      while ( (line = br.readLine()) != null ) {
        log_("JS", "js> " + line);
      }

      StringBuilder sb = new StringBuilder();
      for ( String path : binFiles ) {
        sb.append(new String(Files.readAllBytes(Paths.get(path))));
      }
      javascriptBuffer_ = sb.toString();

      modified_ = new StringJoiner("\",\"", "{\"modified\":[\"", "\"]");
      modified_.setEmptyValue("{\"modified\":[]");
      removed_ = new StringJoiner("\",\"", ",\"removed\":[\"", "\"]}");
      removed_.setEmptyValue(",\"removed\":[]}");
      log_("DONE", "JS");
    } catch (IOException e) {
      log_("ERROR", e.getMessage());
    }
  }

  @Override
  public void execute(X x) {
    PrintWriter         pw = x.get(PrintWriter.class);
    HttpServletResponse r  = x.get(HttpServletResponse.class);
    r.setHeader("Content-Type", "application/javascript");
    HttpServletRequest  req = x.get(HttpServletRequest.class);
    if ( req.getParameter("java") != null && req.getParameter("java").equals("true") ) {
      doRegenJava(req);
    }

    if (
      req.getParameter("node") != null  ||
      req.getParameter("web") != null   ||
      req.getParameter("java") != null  ||
      req.getParameter("swift") != null ||
      req.getParameter("debug") != null ||
      req.getParameter("js") != null 
    ) {
      doRebuildJavascript(req);
    }
    synchronized (this) { /* Wait for build to finish before serving */ }
    pw.println(javascriptBuffer_);
  }

  private void log_(String evt, String msg) {
    String eventStr =
        ( (evt.equals("UPDATE") ) ? "\033[32m" : "" ) +
        ( (evt.equals("IGNORE") ) ? "\033[36m" : "" ) +
        ( (evt.equals("ERROR")  ) ? "\033[31m" : "" ) +
        "[" + evt + "]" +
        ( (evt.equals("UPDATE") || evt.equals("IGNORE") || evt.equals("ERROR") )
          ? "\033[0m"
          : "" );

    // Fallback in case setX has not been called yet
    if ( x_ == null ) {
      System.err.printf(
        "NO_LOGGER,%s,%s,%s,%s\n",
        ( evt.equals("ERROR") ) ? "ERROR" : "INFO",
        this.getClass().getSimpleName(), eventStr, msg);
      return;
    }

    Logger logger = (Logger) x_.get("logger");
    if ( evt.equals("ERROR") ) {
      logger.error(this.getClass().getSimpleName(), eventStr, msg);
    }
    else {
      logger.info(this.getClass().getSimpleName(), eventStr, msg);
    }
  }

  private class Pair<K,V> {
    private K k;
    private V v;

    public Pair(K k, V v) {
      this.k = k;
      this.v = v;
    }

    public K getKey() { return k; }
    public V getValue() { return v; }
  }
}
