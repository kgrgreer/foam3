/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ElectoralServiceServer',

  implements: [
    'foam.core.ContextAgent',
    'foam.nanos.medusa.ElectoralService'
  ],

  javaImports: [
    'foam.box.SessionClientBox',
    'foam.core.Agency',
    'foam.core.ContextAgent',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'static foam.mlang.MLang.*',
    'foam.net.Host',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.pm.PM',
    'foam.util.SafetyUtil',
    'java.util.ArrayList',
    'java.util.concurrent.*',
    'java.util.concurrent.Callable',
    'java.util.concurrent.LinkedBlockingQueue',
    'java.util.concurrent.ExecutorService',
    'java.util.concurrent.Executors',
    'java.util.concurrent.RejectedExecutionException',
    'java.util.concurrent.ThreadFactory',
    'java.util.concurrent.ThreadLocalRandom',
    'java.util.concurrent.ThreadPoolExecutor',
    'java.util.concurrent.TimeUnit',
    'java.util.concurrent.atomic.AtomicInteger',
    'java.util.concurrent.atomic.AtomicLong',
    'java.util.Date',
    'java.util.List',
    'java.util.Map',
    'java.util.Random'
  ],

  javaCode: `
    private Object electionLock_ = new Object();
    private Object voteLock_ = new Object();
    protected ThreadPoolExecutor pool_ = null;
    private AtomicLong winnerTime_ = new AtomicLong();
  `,

  properties: [
    {
      name: 'state',
      class: 'Enum',
      of: 'foam.nanos.medusa.ElectoralServiceState',
      value: 'foam.nanos.medusa.ElectoralServiceState.DISMISSED',
      visibility: 'RO'
    },
    {
      name: 'electionTime',
      class: 'Long',
      value: 0,
      visibility: 'RO'
    },
    {
      name: 'votes',
      class: 'Int',
      value: 0,
      visibility: 'RO'
    },
    {
      name: 'currentSeq',
      class: 'Long',
      value: 0,
      visibility: 'RO'
    },
    {
      name: 'winner',
      class: 'String',
      visibility: 'RO'
    },
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      transient: true,
      javaCloneProperty: '//noop',
      javaFactory: `
        ClusterConfigSupport support = (ClusterConfigSupport) getX().get("clusterConfigSupport");
        ClusterConfig config = support.getConfig(getX(), support.getConfigId());
          return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName(),
          config.getName()
        }, (Logger) getX().get("logger"));
      `
    },
  ],

  methods: [
    {
      name: 'start',
      javaCode: `
    getLogger().debug("start");
    ClusterConfigSupport support = (ClusterConfigSupport) getX().get("clusterConfigSupport");
    if ( support.getStandAlone() ) {
      setState(ElectoralServiceState.IN_SESSION);
    } else {
      ((Agency) getX().get(support.getThreadPoolName())).submit(getX(), this, "election");
    }
     `
    },
    {
      name: 'recordResult',
      synchronized: true,
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'result',
          type: 'Long',
        },
        {
          name: 'config',
          type: 'foam.nanos.medusa.ClusterConfig',
        }
      ],
      javaCode: `
      if ( result >= 0 ) {
        synchronized ( voteLock_ ) {
          setVotes(getVotes() + 1);
          if ( result > getCurrentSeq() ) {
            getLogger().info("recordResult", config.getName(), result, "leader");
            setCurrentSeq(result);
            setWinner(config.getId());
          }
        }
      }
      getLogger().debug("recordResult", config.getName(), result, "votes", getVotes());
    `
    },
    {
      documentation: 'Register in the electorate, if quorum already obtained, simply accept primary',
      name: 'register',
      synchronized: true,
      javaCode: `
      getLogger().debug("register", getState());
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      ClusterConfig config = support.getConfig(x, id);
      if ( config.getStatus() == Status.ONLINE &&
           support.hasQuorum(x) ) {
        setState(ElectoralServiceState.IN_SESSION);
      }
      `
    },
    {
      documentation: 'Force an election, if one not already in progress.',
      name: 'dissolve',
      synchronized: true,
      javaCode: `
      long startNano = System.nanoTime();
      getLogger().debug("dissolve", getState());
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");

      if ( ! support.hasQuorum(x) ) {
        setState(ElectoralServiceState.DISMISSED);
        ClusterConfig config = support.getConfig(getX(), support.getConfigId());
        if ( config.getIsPrimary() ) {
          config.setIsPrimary(false);
          ((DAO) x.get("clusterConfigDAO")).put(config);
        }

        getLogger().debug("dissolve", getState());
        return;
      }

      if ( getState() == ElectoralServiceState.ELECTION &&
        getElectionTime() > 0L ) {
        getLogger().debug("dissolve", getState(), "since", getElectionTime());
        return;
      }

      // run a new campaigne
      // re: random - when nodes are all restarted, the mediators can
      // complete replay at the same time.
      setElectionTime((System.currentTimeMillis() * 1000) + (System.nanoTime() - startNano));

      setState(ElectoralServiceState.ELECTION);
      getLogger().debug("dissolve", getState(), "execute");
      ((Agency) x.get(support.getThreadPoolName())).submit(x, (ContextAgent)this, this.getClass().getSimpleName());
      `
    },
    {
      name: 'execute',
      args: 'Context x',
      javaCode: `
      getLogger().debug("execute");
      String savedThreadName = Thread.currentThread().getName();
      try {
        Thread.currentThread().setName(this.getClass().getSimpleName());
        while( true ) {
          try {
            synchronized ( electionLock_ ) {
              getLogger().debug("execute", "state", getState(), "election time", getElectionTime());
              if ( getState() != ElectoralServiceState.ELECTION ) {
                break;
              }
            }
            callVote(x);
          } catch(Throwable t) {
            getLogger().error(t);
            break;
          }
          PM pm = PM.create(x, this.getClass().getSimpleName(),"execute", "sleep");
          try {
            java.util.Random r = ThreadLocalRandom.current();
            int sleep = r.nextInt(1000) + 1000;
            Thread.currentThread().sleep(sleep);
          } catch (InterruptedException e) {
            break;
          } finally {
            pm.log(x);
          }
        }
      } finally {
        getLogger().debug("execute", "exit", "state", getState(), "election time", getElectionTime());
        Thread.currentThread().setName(savedThreadName);
      }
      `
    },
    {
      name: 'callVote',
      args: 'Context x',
      javaCode: `
      getLogger().debug("callVote", getState());
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      ClusterConfig config = support.getConfig(x, support.getConfigId());
      if ( getState() != ElectoralServiceState.ELECTION ||
           config.getStatus() != Status.ONLINE ) {
        getLogger().debug("callVote", getState(), config.getStatus(), "exit");
        return;
      }
      List<ClusterConfig> voters = support.getVoters(x);

      if ( ! support.getHasNodeQuorum() ) {
        getLogger().warning("callVote aborted", getState(), "waiting for node quorum", "voters", voters.size(), "required", support.getMediatorQuorum(), "node quroum", support.getHasNodeQuorum());

        support.outputBuckets(x);
        return;
      }

      if ( ! support.getHasMediatorQuorum() ) {
        getLogger().warning("callVote aborted", getState(), "waiting for mediator quorum", "voters", voters.size(), "required", support.getMediatorQuorum(), "mediator quorum", support.getHasMediatorQuorum());
        return;
      }

      ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");
      if ( replaying.getReplaying() ) {
        getLogger().info("callVote aborted", getState(), "waiting on replay", replaying.getReplaying());
        return;
      }

      if ( voters.size() < support.getMediatorQuorum() ) {
        getLogger().info("callVote aborted", getState(), "insuficient votes", "voters", voters.size(), "required", support.getMediatorQuorum());
        return;
      }

      getLogger().info("callVote", getState(), "achieved mediator and node quorum");

      try {
        setVotes(0);

        // record own vote
        if ( voters.contains(config) ) {
          recordResult(x, generateVote(x), config);
        }

        if ( voters.size() == 1 &&
             voters.size() == support.getMediatorQuorum() ) {
          callReport(x);
          return;
        }

        Agency agency = (Agency) x.get(support.getThreadPoolName());

        // request votes from others
        for (int i = 0; i < voters.size(); i++) {
          ClusterConfig clientConfig = (ClusterConfig) voters.get(i);
          if ( clientConfig.getId().equals(config.getId())) {
            continue;
          }
          agency.submit(x, new ContextAgent() {
            long result = -1L;
            public void execute(X x) {
              // getLogger().debug("callVote", "executeJob", config.getId(), "voter", clientConfig.getId());
              ClientElectoralService electoralService =
                new ClientElectoralService.Builder(x)
                 .setDelegate(new SessionClientBox.Builder(x)
                   .setSessionID(clientConfig.getSessionId())
                   .setDelegate(support.getSocketClientBox(x, "electoralService", config, clientConfig))
                   .build())
                 .build();
              try {
                if ( getState() == ElectoralServiceState.ELECTION ) {
                  getLogger().debug("callVote", "executeJob", config.getId(), "voter", clientConfig.getId(), "request");
                  result = electoralService.vote(config.getId(), getElectionTime());
                  getLogger().debug("callVote", "executeJob", config.getId(), "voter", clientConfig.getId(), "response", result);
                  recordResult(x, result, clientConfig);
                  callReport(x);
                }
              } catch (Throwable e) {
                getLogger().debug("callVote", "executeJob", config.getId(), "voter", clientConfig.getId(), e.getMessage());
              }
            }
          }, this.getClass().getSimpleName()+":callVote");
        }
      } catch ( Exception e) {
        getLogger().error(e);
      } finally {
        getLogger().debug("callVote", getState(), "end", "votes", getVotes(), "voters", voters.size());
      }
      `
    },
    {
      documentation: 'Called by the party runing the election, requesting us to vote. A vote is simply a random number. Highest number wins. The caller also sends when they started the election. If we are also in ELECTION state, but the other party started later then we abandon our election.',
      name: 'vote',
      synchronized: true,
      javaCode: `
      ClusterConfigSupport support = (ClusterConfigSupport) getX().get("clusterConfigSupport");
      ClusterConfig config = support.getConfig(getX(), support.getConfigId());
      long v = -1L;

      getLogger().debug("vote", getState(), id, time, getElectionTime(), config.getStatus());
      if ( config.getStatus() != Status.ONLINE ) {
        return v;
      }

      try {
        if ( getState() == ElectoralServiceState.ELECTION &&
            time > 0L &&
            time >= getElectionTime() ) {
          // abandon our election.
          getLogger().info("vote", id, time, getElectionTime(), "abandon own election", getState(), "->", ElectoralServiceState.VOTING);
          setState(ElectoralServiceState.VOTING);
          setElectionTime(0L);
          winnerTime_.set(0L);
          setCurrentSeq(0L);
        } else if ( getState() == ElectoralServiceState.DISMISSED ) {
          getLogger().info("vote", id, time, getState(), "->", ElectoralServiceState.VOTING);
          setState(ElectoralServiceState.VOTING);
          setElectionTime(0L);
          winnerTime_.set(0L);
          setCurrentSeq(0L);
        } else if ( getState() == ElectoralServiceState.IN_SESSION ) {
          // TODO: an out-of-order vote request can arrive just after an
          // election has been declared.  The mediator may end up waiting
          // in state VOTING.
          if ( time <= winnerTime_.get() ) {
            getLogger().info("vote", id, time, getState(), "ignore", "wtime", winnerTime_.get());
          } else {
            getLogger().info("vote", id, time, getState(), "->", ElectoralServiceState.VOTING, "wtime", winnerTime_.get());
            setState(ElectoralServiceState.VOTING);
            setElectionTime(0L);
            setCurrentSeq(0L);
          }
        }
        if ( getState() == ElectoralServiceState.VOTING ) {
          v = generateVote(getX());
        }
      } catch (Throwable t) {
        getLogger().error("vote", getState(), id, time, "response", v, t);
      }
      getLogger().debug("vote", getState(), id, time, "response", v);
      return v;
     `
    },
    {
      name: 'generateVote',
      args: 'Context x',
      type: 'int',
      javaCode: `
      String preferredMediator = System.getProperty("MEDUSA_PREFERRED_MEDIATOR");
      if ( ! foam.util.SafetyUtil.isEmpty(preferredMediator) ) {
        ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
        if ( support.getConfigId().equals(preferredMediator) ) {
          return 254;
        }
        return 1;
      }
      return ThreadLocalRandom.current().nextInt(255);
      `
    },
    {
      name: 'callReport',
      args: 'Context x',
      javaCode: `
      getLogger().debug("callReport", getState());
      if ( getState() == ElectoralServiceState.IN_SESSION ) {
        getLogger().debug("callReport", getState(), "exit");
        return;
      }
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      ClusterConfig config = support.getConfig(x, support.getConfigId());
      List voters = support.getVoters(x);
      try {
        synchronized ( electionLock_ ) {
          if ( ! ( getState() == ElectoralServiceState.ELECTION &&
                   support.hasQuorum(x) ) ) {
            getLogger().debug("callReport", getState(), "no quorum", "votes", getVotes(), "voters", voters.size());
            return;
          }
        }

        getLogger().debug("callReport", getState(), "votes", getVotes(), "voters", voters.size());

        if ( voters.size() < support.getMediatorQuorum() ) {
          getLogger().debug("callReport", getState(), "insuficient voters", "votes", getVotes(), "voters", voters.size(), "mediatorQuorum", support.getMediatorQuorum());
          return;
        }
        int voterQuorum = (int) Math.floor((voters.size() / 2) + 1);
        if ( getVotes() < voterQuorum ) {
          getLogger().debug("callReport", getState(), "insuficient votes", "votes", getVotes(), "voters", voters.size(), "voterQuorum", voterQuorum);
          return;
        }

        report(getWinner(), getElectionTime());
        Agency agency = (Agency) x.get(support.getThreadPoolName());

        for (int j = 0; j < voters.size(); j++) {
          ClusterConfig clientConfig2 = (ClusterConfig) voters.get(j);
          if ( clientConfig2.getId().equals(config.getId())) {
            continue;
          }
          agency.submit(x, new ContextAgent() {
            public void execute(X x) {
              ClientElectoralService electoralService2 =
                new ClientElectoralService.Builder(getX())
                 .setDelegate(new SessionClientBox.Builder(x)
                   .setSessionID(clientConfig2.getSessionId())
                   .setDelegate(support.getSocketClientBox(x, "electoralService", config, clientConfig2))
                   .build())
                 .build();

              getLogger().debug("callReport", getState(), "call", clientConfig2.getId(), "report", getWinner());
              try {
                electoralService2.report(getWinner(), getElectionTime());
              } catch (Throwable e) {
                getLogger().debug(clientConfig2.getId(), "report", e.getMessage());
              }
            }
          }, this.getClass().getSimpleName()+":callReport");
        }
      } catch ( Exception e) {
        getLogger().error(e);
      }
      `
    },
    {
      documentation: 'Called by the party running the election to declare a winner.',
      name: 'report',
      synchronized: true,
      javaCode: `
      getLogger().debug("report", getState(), time);
      ClusterConfigSupport support = (ClusterConfigSupport) getX().get("clusterConfigSupport");
      ClusterConfig config = support.getConfig(getX(), support.getConfigId());
      DAO dao = (DAO) getX().get("localClusterConfigDAO");

      if ( getState() == ElectoralServiceState.IN_SESSION ) {
        if ( config.getIsPrimary() &&
             ! winnerId.equals(config.getId())) {
          getLogger().warning("report", getState(), "multiple primaries,dissolving", config.getId(), winnerId);
          dissolve(getX());
        } else {
          getLogger().debug("report", getState(), "exit");
        }
        return;
      }

      getLogger().info("report", getState(), "primary", "winner", winnerId, time);

      // NOTE: set winner time early to hopefully discard late arriving vote requests.
      winnerTime_.set(time);

      ClusterConfig winner = (ClusterConfig) dao.find(winnerId);
      ClusterConfig primary = null;
      try {
        primary = support.getPrimary(getX());
      } catch (PrimaryNotFoundException e) {
        // nop
      }

      if ( primary != null &&
           primary.getId() != winner.getId() ) {
        getLogger().info("report", getState(), "primary", "old", primary.getId());
        getLogger().info("report", getState(), "primary", "new", winner.getId(), time);
        primary = (ClusterConfig) primary.fclone();
        primary.setIsPrimary(false);
        primary = (ClusterConfig) dao.put(primary);
      } else if ( primary == null ) {
        getLogger().info("report", getState(), "primary", "new", winner.getId(), time);
      } else {
        getLogger().info("report", getState(), "primary", "no-change", winner.getId(), time);
      }

      if ( ! winner.getIsPrimary() ) {
        winner = (ClusterConfig) winner.fclone();
        winner.setIsPrimary(true);
        winner = (ClusterConfig) dao.put(winner);
      }

      setState(ElectoralServiceState.IN_SESSION);
      setElectionTime(0L);
      setCurrentSeq(0L);
     `
    }
  ]
});
