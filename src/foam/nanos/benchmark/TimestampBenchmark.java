/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.benchmark;

import foam.core.X;
import foam.nanos.bench.Benchmark;
import foam.util.FastTimestamper;
import foam.util.SyncFastTimestamper;

public class TimestampBenchmark
  extends Benchmark
{
  protected FastTimestamper ts_ = new SyncFastTimestamper();

  @Override
  public void execute(X x) {
    ts_.createTimestamp();
  }
}
