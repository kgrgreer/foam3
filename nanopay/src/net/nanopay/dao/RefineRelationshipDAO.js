foam.CLASS({
  package: 'net.nanopay.dao',
  name: 'RefineRelationshipDAO',
  refines: 'foam.dao.RelationshipDAO',

  properties: [
    {
      name: 'delegate',
      javaFactory:`
      try {
        String daoKey = getTargetDAOKey();
        foam.nanos.auth.User user = (foam.nanos.auth.User) getX().get("user");
        if ( user != null &&
             user.getId() == 1L &&
             ! daoKey.startsWith("local") ) {
          // By convention 'local' DAOs are unauthenticated.
          // If invoked by system user, then avoid the unnessary
          // overhead of authentication checks
          String localDAOKey = "local"+daoKey.substring(0, 1).toUpperCase() + daoKey.substring(1);
          foam.dao.DAO dao = (foam.dao.DAO) getX().get(localDAOKey);
          if ( dao != null ) {
            foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) getX().get("logger");
            logger.debug("TargetDAOKey swapping", localDAOKey, "for", getTargetDAOKey());
            return dao.inX(getX());
          }
        }
        return ((foam.dao.DAO) getX().get(getTargetDAOKey())).inX(getX());
      } catch ( NullPointerException e ) {
        foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) getX().get("logger");
        logger.error("TargetDAOKey", getTargetDAOKey(), "not found.", e);
        throw e;
      }
      `
    }
  ]
});
