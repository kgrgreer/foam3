/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.bench;

import foam.core.X;
import foam.dao.DAO;
import foam.dao.ArraySink;
import foam.dao.Sink;
import foam.nanos.auth.User;
import foam.nanos.bench.BenchmarkResult;

import java.util.List;

public class HashingBenchmark
  extends Benchmark
{
  List users_ = null;

  @Override
  public void setup(X x, BenchmarkResult br) {
    Sink sink = new ArraySink();
    sink = ((DAO) x.get("localUserDAO")).select(sink);
    users_ = ((ArraySink) sink).getArray();
  }

  @Override
  public void execute(X x) {
    try {
      // get random user
      int n = (int) (Math.random() * users_.size());
      ((User) users_.get(n)).hash();
    } catch (Throwable t) {
      t.printStackTrace();
    }
  }
}
