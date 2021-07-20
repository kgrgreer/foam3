/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.bench.benchmarks;

import foam.core.X;
import foam.nanos.bench.Benchmark;
import foam.util.UIDGenerator;
import foam.nanos.app.AppConfig;

public class FUIDBenchmark
  implements Benchmark
{
  protected UIDGenerator generator_ = new UIDGenerator();

  @Override
  public void setup(X x) {
  }

  @Override
  public void teardown(X x, java.util.Map stats) {
  }

  @Override
  public void execute(X x) {
    AppConfig config = (AppConfig) x.get("appConfig");

    if ( config.getMode() == foam.nanos.app.Mode.PRODUCTION ) {
      return;
    }

    generator_.generate();
  }
}
