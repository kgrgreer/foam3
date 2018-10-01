package net.nanopay.security.snapshooter;

import foam.core.Detachable;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.nanos.logger.Logger;
import foam.nanos.boot.NSpec;
import foam.dao.ArraySink;

import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.ObjectOutputStream;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import java.util.*;
import java.util.stream.Stream;

import net.nanopay.security.snapshooter.Snap;

public class Snapshooter {

  private static boolean snapshooting_ = false;

  protected Logger  logger_;
  protected X       x_;

  protected Snap[] snaps_ = new Snap[1024];
  protected int totalSnaps_ = 0;

  public Snapshooter(X x) {
    x_ = x;
    logger_= (Logger) x.get("logger");
  }

  protected void snap(DAO dao) {
    if ( totalSnaps_ == snaps_.length ){
      Snap[] newSnaps = new Snap[totalSnaps_ + 1024];
      System.arraycopy(snaps_, 0, newSnaps, 0, totalSnaps_);
      snaps_= newSnaps;
    }
    snaps_[totalSnaps_] = new Snap(dao, logger_);
  }

//  protected synchronized List shoot() {
//    return (List<ArraySink>) Arrays.asList(snaps_)
//      .parallelStream()
//      .flatMap(new Function<Snap, Stream<?>>() {
//        @Override
//        public Stream<?> apply(Snap snap) {
//          return snap.shoot().getArray().stream();
//        }
//      })
//      .collect(Collectors.toList());
//  }

  protected void writeToJournal() {
    // bury the bodies
  }

  public boolean createSnapshot() throws IOException {
    if ( ! snapshooting_ ) {
      snapshooting_ = true;
      logger_.info("Snapshooter :: System is preparing to take a snapshot of its state...");

      // get nSpecDAO and select all
      foam.dao.DAO nspecDAO = (foam.dao.DAO) x_.get("nSpecDAO");
      ArraySink sink = (ArraySink) nspecDAO.select(null);
      List<NSpec> nSpecs = (List<NSpec>) sink.getArray();


      ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("snapshootable"));
      nSpecs.parallelStream()
        .map(new Function<foam.nanos.boot.NSpec, Pair<String, Object>>() {
          @Override
          public Pair<String, Object> apply(NSpec nSpec) {
            return new Pair<>(nSpec.getName(), x_.get(nSpec.getName()));
          }
        })
        .filter(new Predicate<Pair<String, Object>>() {
          @Override
          public boolean test(Pair<String, Object> stringObjectPair) {
            return stringObjectPair.second instanceof foam.dao.DAO;
          }
        })
        .map(new Function<Pair<String, Object>, Pair<String, DAO>>() {
          @Override
          public Pair<String, DAO> apply(Pair<String, Object> pair) {
            return new Pair<>(pair.first, (foam.dao.DAO) pair.second);
          }
        })
        .forEach(new Consumer<Pair<String, DAO>>() {
          @Override
          public void accept(Pair<String, DAO> pair) {
            String service = pair.first;
            foam.dao.DAO dao = pair.second;

            dao.select(new AbstractSink() {
              @Override
              public void put(Object obj, Detachable sub) {
                // TODO: write out to some file with the nspec name
                synchronized ( oos ) {
                  try {
                    oos.writeChars(service);
                    oos.writeObject(obj);
                  } catch ( Throwable t ) { }
                }
              }
            });
          }
        });

//      shoot();
//
//      writeToJournal();

      snapshooting_ = false;
      logger_.error("Snapshooter :: Snapshot of the system created successfully.");

      return true;
    }

    logger_.error("Snapshooter :: Could not take a snapshot as another snapshot is already underway.");

    return false;
  }

  public static class Pair<K, V> {

    protected K first;
    protected V second;

    public Pair(K v1, V v2) {
      first = v1;
      second = v2;
    }
  }
}
