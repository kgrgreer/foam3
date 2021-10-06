/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.benchmark;

import foam.core.X;
import foam.dao.*;
import foam.nanos.auth.User;
import foam.nanos.bench.Benchmark;
import foam.nanos.bench.BenchmarkResult;

public class F3FileJournalBenchmark
  extends Benchmark
{
  protected F3FileJournal journal_;
  protected DAO         dao_;

  @Override
  public void setup(X x, BenchmarkResult br) {
    dao_ = new NullDAO();
    journal_ = new F3FileJournal.Builder(x)
      .setDao(new MDAO(User.getOwnClassInfo()))
      .setFilename("f3journalbenchmark")
      .setCreateFile(true)
      .build();
  }

  @Override
  public void execute(X x) {
    User u = new User();
    u.setId(System.currentTimeMillis());
    u.setFirstName("test");
    u.setLastName("testing");
    journal_.put(x, "", dao_, u);
  }
}
