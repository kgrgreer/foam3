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

public class JournalReplayBenchmark extends Benchmark {
  protected FileJournal journal_;
  protected DAO dao_;
  protected int userCount;

  public JournalReplayBenchmark() {
    this(1000);
  }

  public JournalReplayBenchmark(int userCount) {
    this.userCount = userCount;
  }

  @Override
  public void setup(X x, BenchmarkResult br) {
    dao_ = new NullDAO();
    journal_ = new FileJournal.Builder(x)
//      .setDao(new MDAO(User.getOwnClassInfo()))
      .setFilename("replaybenchmark")
      .setCreateFile(true)
      .build();
    for (int i = 0; i < userCount; i ++ ) {
      User u = new User();
      u.setId(System.currentTimeMillis());
      u.setFirstName("test");
      u.setLastName("testing");
      journal_.put(x, "", dao_, u);
    }
  }

  @Override
  public void execute(X x) {
    journal_.replay(x, new MDAO(User.getOwnClassInfo()));
  }
}
