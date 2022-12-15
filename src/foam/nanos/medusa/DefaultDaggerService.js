/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'DefaultDaggerService',

  implements: [
    'foam.nanos.medusa.DaggerService',
    'foam.nanos.NanoService'
  ],

  axioms: [
    foam.pattern.Singleton.create()
  ],

  documentation: `Manage global indexes and hashes`,

  javaImports: [
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.log.LogLevel',
    'static foam.mlang.MLang.*',
    'foam.nanos.er.EventRecord',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'foam.nanos.om.OMLogger',
    'foam.nanos.pm.PM',
    'foam.nanos.security.KeyStoreManager',
    'foam.util.SafetyUtil',
    'java.nio.charset.StandardCharsets',
    'java.security.MessageDigest',
    'java.util.ArrayList',
    'java.util.Arrays',
    'java.util.List'
  ],

  javaCode: `
    public static String byte2Hex(byte[] bytes) {
      StringBuffer stringBuffer = new StringBuffer();
      String temp = null;
      for ( int i=0; i<bytes.length; i++ ) {
        temp = Integer.toHexString(bytes[i] & 0xFF);
        if ( temp.length() == 1 ) {
          stringBuffer.append("0");
        }
        stringBuffer.append(temp);
      }
      return stringBuffer.toString();
    }
  `,

  constants: [
    {
      name: 'BOOTSTRAP_ID',
      type: 'String',
      value: 'BOOTSTRAP_ID'
    },
    {
      name: 'BOOTSTRAP_ID_DEFAULT',
      type: 'String',
      value: "1"
    },
    {
      name: 'BOOTSTRAP_HASH',
      type: 'String',
      value: 'BOOTSTRAP_HASH'
    },
    {
      name: 'BOOTSTRAP_HASH_DEFAULT',
      type: 'String',
      value: '466c58623cd600209e95a981bad03e5d899ea6d6905cebee5ea0746bf16e1534'
    },
    {
      name: 'BOOTSTRAP_HASHES',
      type: 'String',
      value: 'BOOTSTRAP_HASHES'
    },
    {
      name: 'BOOTSTRAP_HASHES_DEFAULT',
      type: 'String',
      value: '466c58623cd600209e95a981bad03e5d899ea6d6905cebee5ea0746bf16e1534,466c58623cd600209e95a981bad03e5d899ea6d6905cebee5ea0746bf16e1534'
    }
  ],

  properties: [
    {
      documentation: 'Bootstrap which configured this service',
      name: 'bootstrap',
      class: 'FObjectProperty',
      of: 'foam.nanos.medusa.DaggerBootstrap',
      javaFactory: 'return new DaggerBootstrap();'
    },
    {
      documentation: 'Indexes with values less than minIndex are involved in bootstrapping and should not be deleted.',
      name: 'minIndex',
      class: 'Long',
      value: 2
    },
    {
      documentation: 'Current max promoted index',
      name: 'index',
      label: 'Global Index',
      class: 'Long',
      visibility: 'RO'
    },
    {
      documentation: `Current links[] index to use. linksIndex flips back forth between 0 and 1.`,
      name: 'linksIndex',
      class: 'Int',
      value: 1,
      visibility: 'HIDDEN'
    },
    {
      name: 'links',
      class: 'Array',
      javaFactory: 'return new foam.nanos.medusa.DaggerLink[getBootstrap().getBootstrapHashEntries()];',
      visibility: 'HIDDEN'
    },
    {
      name: 'initialized',
      class: 'Boolean',
      value: false,
      visibility: 'HIDDEN'
    },
    {
      name: 'dao',
      class: 'foam.dao.DAOProperty',
      javaFactory: `
      return (DAO) getX().get("internalMedusaDAO");
      `,
      visibility: 'HIDDEN'
    },
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      transient: true,
      javaCloneProperty: '//noop',
      javaFactory: `
      return Loggers.logger(getX(), this);
      `
    }
  ],

  methods: [
    {
      name: 'start',
      javaCode: `
      X x = getX();
      Logger logger = Loggers.logger(x, this);
      logger.info("start");

      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      ClusterConfig config = support.getConfig(x, support.getConfigId());
      if ( config == null ||
           config.getType() == MedusaType.NODE ||
           config.getZone() > 0L ) {
        logger.debug("start", "exit");
      }

      DAO dao = (DAO) x.get("daggerBootstrapDAO");
      ArrayList list = (ArrayList) ((ArraySink) dao.orderBy(new foam.mlang.order.Desc(DaggerBootstrap.ID)).limit(1).select(new ArraySink())).getArray();
      DaggerBootstrap bootstrap = null;
      if ( list.size() > 0 ) {
        bootstrap = (DaggerBootstrap) list.get(0);
      }
      if ( bootstrap == null ) {
        Long id = Long.parseLong(System.getProperty(BOOTSTRAP_ID, BOOTSTRAP_ID_DEFAULT));
        bootstrap = (DaggerBootstrap) dao.find(id);
      }
      reconfigure(x, bootstrap);
      `
    },
    {
      documentation: 'Update DAG with new root entries. Return new global index',
      name: 'reconfigure',
      synchronized: true,
      args: 'X x, foam.nanos.medusa.DaggerBootstrap bootstrap',
      type: 'foam.nanos.medusa.DaggerBootstrap',
      javaCode: `
      Logger logger = Loggers.logger(x, this, "reconfigure");

      if ( bootstrap != null ) {
        setBootstrap(bootstrap);
      }
      bootstrap = getBootstrap();

      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      ClusterConfig config = support.getConfig(x, support.getConfigId());
      if ( config == null ||
           config.getType() == MedusaType.NODE ||
           config.getZone() > 0L ) {
        logger.debug("exit");
        return bootstrap;
      }

      logger.info("start", "index", getIndex(), "bootstrap", bootstrap);

      if ( bootstrap.getBootstrapIndex() > getIndex() ) {
        setIndex(bootstrap.getBootstrapIndex());
      } else if ( bootstrap.getBootstrapIndex() < getIndex() ) {
        bootstrap = (DaggerBootstrap) bootstrap.fclone();
        bootstrap.setBootstrapIndex(getIndex());
      }

      clearProperty("links");
      for ( int i = 0; i < getLinks().length; i++ ) {
        String hash = getBootstrapHash(x, i);
        bootstrap.getBootstrapHashes()[i] = hash.substring(0, 7);
        logger.debug("bootstrap,links", i, hash.substring(0, 7));
        getLinks()[i] = new MedusaEntry.Builder(x).setIndex(0L).setHash(hash).build();
      }

      for ( int i = 0; i < bootstrap.getBootstrapHashEntries(); i++ ) {
        MedusaEntry entry = new MedusaEntry();
        entry = link(x, entry);
        logger.info("link", "entry", i, entry.toDebugSummary());
        try {
          entry = hash(x, entry);
          logger.info("hash", "entry", i, entry.toDebugSummary());
          bootstrap.getBootstrapDAGHashes()[i] = entry.getHash().substring(0, 7);
        } catch ( java.security.NoSuchAlgorithmException e ) {
          throw new DaggerException(e.getMessage(), e);
        }
        entry.setNSpecName("bootstrap");
        entry.setNode(support.getConfigId());
        entry.setPromoted(true);
        entry = (MedusaEntry) getDao().put_(x, entry);

        // NOTE: Normally the Primary is coordinating the entry hashes,
        // and updateLinks is called on promote which occurs in the same
        // sequential order on all mediators.
        // During Compaction, each mediator is reconfiguring and calling
        // updateLinks and it's possible the linksIndex_ is not the same on all
        // mediators at the time of compaction - the primary may be ahead
        // for example.
        // It is critical that the bootstrap entries are created identically
        // on all mediators, obviously, so explicit control over linksIndex_
        // is taken.
        setLinksIndex(i);
        updateLinks(x, entry);
        logger.info("entry", i, entry.toDebugSummary());
      }
      logger.info("end", "index", getIndex());
      setBootstrap(bootstrap);
      setMinIndex(getIndex());
      return bootstrap;
     `
    },
    {
      documentation: `Initial hash to prime the system. Provide via:
    - JAVA_OPTS property:  -DBOOTSTRAP_HASHES=
    - Explicitly set in DaggerService NSpec
    - // TODO: HSM`,
      name: 'getBootstrapHash',
      args: 'Context x, int index',
      type: 'String',
      javaCode: `
      String alias = BOOTSTRAP_HASHES.toLowerCase();
      try {
        KeyStoreManager manager = (KeyStoreManager) x.get("keyStoreManager");
        String entry = manager.getSecret(x, alias, "PBEWithHmacSHA256AndAES_128");
        String[] hashes = null;
        if ( entry != null ) {
          hashes = entry.split(",");
          // getLogger().debug("hashes", "keystore", hashes.length, Arrays.toString(hashes));
        } else {
          getLogger().warning("Keystore alias not found", alias, "trying System");
          entry = System.getProperty(
                BOOTSTRAP_HASHES,
                BOOTSTRAP_HASHES_DEFAULT
             );
          if ( entry != null ) {
            hashes = entry.split(",");
            // getLogger().debug("hashes", "system", hashes.length, Arrays.toString(hashes));
          }
        }

        index += getBootstrap().getBootstrapHashOffset(); // add offset
        try {
          return hashes[index];
        } catch (ArrayIndexOutOfBoundsException e) {
          getLogger().warning("Keystore error", alias, "expected", index, "found", hashes.length);
          ((DAO) x.get("eventRecordDAO")).put(new EventRecord(x, this, "bootstrap", "hash exhaustion", LogLevel.ERROR, null));
        }
      } catch (java.security.GeneralSecurityException | java.io.IOException e) {
        getLogger().warning("Keystore error", alias, e.getMessage());
      } catch (IllegalArgumentException e) {
        getLogger().warning("Keystore alias not found", alias, e.getMessage());
      }
      try {
        alias = BOOTSTRAP_HASH.toLowerCase();
        KeyStoreManager manager = (KeyStoreManager) x.get("keyStoreManager");
        return manager.getSecret(x, alias, "PBEWithHmacSHA256AndAES_128");
      } catch (java.security.GeneralSecurityException | java.io.IOException e) {
        getLogger().warning("Keystore error", alias, e.getMessage());
      } catch (IllegalArgumentException e) {
        getLogger().warning("Keystore alias not found", alias, e.getMessage());
      }
      return System.getProperty(
                BOOTSTRAP_HASH,
                BOOTSTRAP_HASH_DEFAULT
             );
      `
    },
    {
      name: 'link',
      javaCode: `
      DaggerLinks links = getNextLinks(x);
      entry.setIndex(links.getGlobalIndex());
      entry.setIndex1(links.getLink1().getIndex());
      entry.setHash1(links.getLink1().getHash());
      entry.setIndex2(links.getLink2().getIndex());
      entry.setHash2(links.getLink2().getHash());
      return entry;
      `
    },
    {
      documentation: 'This is the only function used by the Nodes to create the hash for the MedusaEntry',
      name: 'hash',
      javaCode: `
      PM pm = PM.create(x, DefaultDaggerService.getOwnClassInfo(), "hash");
      if ( ! getBootstrap().getHashingEnabled() ) {
        entry.setHash(byte2Hex(Long.toString(entry.getIndex()).getBytes(StandardCharsets.UTF_8)));
        entry.setAlgorithm("NONE");
        return entry;
      }

      try {
        MessageDigest md = MessageDigest.getInstance(getBootstrap().getAlgorithm());
        md.update(Long.toString(entry.getIndex1()).getBytes(StandardCharsets.UTF_8));
        md.update(entry.getHash1().getBytes(StandardCharsets.UTF_8));
        md.update(Long.toString(entry.getIndex2()).getBytes(StandardCharsets.UTF_8));
        md.update(entry.getHash2().getBytes(StandardCharsets.UTF_8));
        if ( ! SafetyUtil.isEmpty(entry.getData()) ) {
          md.update(entry.getData().getBytes(StandardCharsets.UTF_8));
        }
        String hash = byte2Hex(md.digest());
        entry.setHash(hash);
        entry.setAlgorithm(getBootstrap().getAlgorithm());

        return entry;
      } finally {
        pm.log(x);
      }
      `
    },
    {
      documentation: 'Verify entry hash, and compare hashes of parent indexes.',
      name: 'verify',
      javaCode: `
      PM pm = PM.create(x, DefaultDaggerService.getOwnClassInfo(), "verify");
      try {
        if ( ! getBootstrap().getHashingEnabled() ) {
          return;
        }

        MedusaEntry parent1 = (MedusaEntry) getDao().find(EQ(MedusaEntry.INDEX, entry.getIndex1()));
        if ( parent1 == null ) {
          if ( entry.getIndex1() <= getLinks().length &&
               entry.getIndex2() <= getLinks().length &&
               entry.getIndex() <= getLinks().length ) {
             // ok - bootstrapping non zone 0 mediator
            getLogger().info("verify", "bootstrap", entry.getIndex());
            return;
          }
          getLogger().error("Hash verification failed", "verify", entry.getIndex(), "parent1 not found", entry.getIndex1(), "entry", entry.toSummary(), entry.getNode());
          throw new DaggerException("Hash verification failed, parent not found on: "+entry.toSummary()+" from: "+entry.getNode());
        }
        MedusaEntry parent2 = (MedusaEntry) getDao().find(EQ(MedusaEntry.INDEX, entry.getIndex2()));
        if ( parent2 == null ) {
          if ( entry.getIndex1() <= getLinks().length &&
               entry.getIndex2() <= getLinks().length &&
               entry.getIndex() <= getLinks().length ) {
            // ok - bootstrapping non zone 0 mediator
            getLogger().info("verify", "bootstrap", entry.getIndex());
            return;
          }
          getLogger().error("Hash verification failed", "verify", entry.getIndex(), "parent2 not found", entry.getIndex2(), "entry", entry.toSummary(), entry.getNode());
          throw new DaggerException("Hash verification failed, parent not found on: "+entry.toSummary()+" from: "+entry.getNode());
        }

        try {
          MessageDigest md = MessageDigest.getInstance(entry.getAlgorithm());
          md.update(Long.toString(parent1.getIndex()).getBytes(StandardCharsets.UTF_8));
          md.update(parent1.getHash().getBytes(StandardCharsets.UTF_8));
          md.update(Long.toString(parent2.getIndex()).getBytes(StandardCharsets.UTF_8));
          md.update(parent2.getHash().getBytes(StandardCharsets.UTF_8));
          if ( entry.getData() != null ) {
            md.update(entry.getData().getBytes(StandardCharsets.UTF_8));
          }
          String calculatedHash = byte2Hex(md.digest());
          if ( ! calculatedHash.equals(entry.getHash()) ) {
            getLogger().error("Hash verification failed", "verify", entry.getIndex(), "hash", "fail", entry.toDebugSummary(), "parent1", parent1.toDebugSummary(), "parent2", parent2.toDebugSummary());

            java.util.List<MedusaEntry> entries = (java.util.List) ((foam.dao.ArraySink) ((DAO) x.get("medusaEntryDAO")).where(IN(MedusaEntry.INDEX, new String[] { Long.toString(entry.getIndex1()), Long.toString(entry.getIndex2()) })).select(new foam.dao.ArraySink())).getArray();
            for ( MedusaEntry e : entries ) {
              getLogger().debug(e.toDebugSummary());
            }
            throw new DaggerException("Hash verification failed on: "+entry.toSummary());
          }
        } catch ( java.security.NoSuchAlgorithmException e ) {
          getLogger().error(e);
          throw new DaggerException(e);
        }
      } finally {
        pm.log(x);
      }
      `
    },
    {
      name: 'sign',
      javaCode: `
      return null;
      `
    },
    {
      name: 'getNextLinks',
      synchronized: true,
      type: 'foam.nanos.medusa.DaggerLinks',
      javaCode: `
      return new DaggerLinks(
        x,
        getNextGlobalIndex(x),
        (DaggerLink)getLinks()[0],
        (DaggerLink)getLinks()[1]
      );
      `
    },
    {
      name: 'updateLinks',
      synchronized: true,
      javaCode: `
      DaggerLink other = (DaggerLink) getLinks()[linksIndex_];
      // ensure links remain different.
      if ( other != null &&
           other.getIndex() == link.getIndex() ) {
        return;
      }
      linksIndex_ ^= 1;
      getLinks()[linksIndex_] = link;
      `
    },
    {
      name: 'setGlobalIndex',
      synchronized: true,
      javaCode: `
      if ( index > getIndex() ) {
        setIndex(index);
      }
      return getIndex();
      `
    },
    {
      name: 'getGlobalIndex',
      javaCode: `
      return getIndex();
      `
    },
    {
      name: 'getNextGlobalIndex',
      synchronized: true,
      javaCode: `
      setIndex(getIndex() + 1);
      return getIndex();
      `
    }
  ]
});
