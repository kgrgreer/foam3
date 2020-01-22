/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.mrac',
  name: 'ClusterClientTransactionDAO',
  extends: 'foam.nanos.mrac.ClusterClientDAO',

  documentation: 'Marshall put and remove operations to the ClusterServer.',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger',
    'net.nanopay.tx.model.Transaction'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      Logger logger = new PrefixLogger(new Object[] {
        this.getClass().getSimpleName(),
        getServiceName(),
        "put_",
      }, (Logger) x.get("logger"));

      ClusterConfigService service = (ClusterConfigService) x.get("clusterConfigService");
      if ( service != null &&
           service.getConfig() != null &&
           ! service.getIsPrimary() ) {

        foam.core.FObject old = getDelegate().find_(x, obj.getProperty("id"));
        foam.lib.json.Outputter outputter = new foam.lib.json.Outputter(x).setPropertyPredicate(new foam.lib.ClusterPropertyPredicate());
        //TODO: outputDelta has problem when output array. Fix bugs then use output delta.
        // String record = ( old != null ) ?
        //   outputter.stringifyDelta(old, obj) :
        //   outputter.stringify(obj);
        String record = outputter.stringify(obj);
        logger.debug("record", record);
        if ( foam.util.SafetyUtil.isEmpty(record) ||
            "{}".equals(record.trim()) ) {
          logger.debug("no changes");
          return obj;
        }

        ClusterCommand cmd = new ClusterCommand(x, getServiceName(), ClusterCommand.PUT, record);
        logger.debug("to primary", cmd);

        int retryAttempt = 1;
        int retryDelay = 1;

        while ( ! service.getIsPrimary() ) {
          try {
            logger.debug("retryAttempt", retryAttempt);
            FObject result = (FObject) service.getPrimaryDAO(x, getServiceName()).cmd_(x, cmd);
            logger.debug("from primary", result.getClass().getSimpleName(), result);
            obj = obj.copyFrom(result);
            logger.debug("obj after copyFrom", obj);
            return obj;
          } catch ( Throwable t ) {
            // test if local mdao updated with transaction
            Transaction txn = (Transaction) obj;
            Transaction found = (Transaction) ((DAO) x.get("localTransactionDAO")).find(txn.getId());
            if ( found != null &&
                 txn.getStatus() == found.getStatus() ) {
              logger.debug("local mdao has updated transaction.");
              return found;
            }

            if ( getMaxRetryAttempts() > -1 &&
                 retryAttempt >= getMaxRetryAttempts() ) {
              logger.debug("retryAttempt >= maxRetryAttempts", retryAttempt, getMaxRetryAttempts());
              throw t;
            }
            retryAttempt += 1;

            // delay
            try {
              logger.debug("retryDelay", retryDelay);
              Thread.sleep(retryDelay);
              retryDelay *= 2;
              if ( retryDelay > getMaxRetryDelay() ) {
                retryDelay = 1;
              }
            } catch(InterruptedException e) {
              Thread.currentThread().interrupt();
              logger.debug("InterruptedException");
              throw t;
            }
          }
        }
        // we've become primary
        logger.debug("secondary -> primary delegating");
        return getDelegate().put_(x, obj);
      } else {
        logger.debug("primary delegating");
        return getDelegate().put_(x, obj);
      }
      `
    }
  ]
});
