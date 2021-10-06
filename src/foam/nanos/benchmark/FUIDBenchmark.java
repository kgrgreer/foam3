/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.benchmark;

import foam.core.X;
import foam.nanos.bench.Benchmark;
import foam.util.UIDGenerator;

public class FUIDBenchmark
  extends Benchmark
{
  protected UIDGenerator generator_ = new UIDGenerator();

  @Override
  public void execute(X x) {
    generator_.generate();
  }
}
