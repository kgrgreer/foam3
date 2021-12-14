/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.benchmark;

import foam.core.X;
import foam.nanos.bench.Benchmark;
import java.text.SimpleDateFormat;

public class DateFormatBenchmark
  extends Benchmark
{
  protected SimpleDateFormat format_ = new SimpleDateFormat("yyyy.MM.dd.HH.mm.ss.SSS");

  @Override
  public synchronized void execute(X x) {
    format_.format(System.currentTimeMillis());
  }
}
