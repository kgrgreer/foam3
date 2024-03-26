/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.lite',
  name: 'CapableDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.FObject',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.util.SafetyUtil',
    'foam.nanos.crunch.CapabilityIntercept',
    'foam.nanos.crunch.lite.Capable',
    'foam.nanos.crunch.CapabilityJunctionPayload',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'java.util.Arrays',
    'java.util.ArrayList',
    'java.util.List'
  ],

  properties: [
    {
      class: 'String',
      name: 'daoKey'
    },
    {
      class: 'Enum',
      name: 'defaultStatus',
      of: 'foam.nanos.crunch.CapabilityJunctionStatus',
      value: foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED
    },
    {
      class: 'Boolean',
      name: 'allowActionRequiredPuts'
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        FObject currentObjectInDao = getDelegate().find_(x, obj);
        Capable toPutCapableObj =  (Capable) obj;
        DAO toUpdateCapablePayloadDAO;

        CapabilityJunctionPayload[] toPutCapablePayloadArray =
          (CapabilityJunctionPayload[]) toPutCapableObj.getCapablePayloads();

        // For both create and update,
        // we need to handle the cleaning of data if it is from the client
        // and we also need to populate the CapablePayload.daoKey and
        // CapablePayload.objId fields since they don't get filled out by client
        if ( currentObjectInDao == null ) {
          toUpdateCapablePayloadDAO = toPutCapableObj.getCapablePayloadDAO(getX());
          for (int i = 0; i < toPutCapablePayloadArray.length; i++){

            toPutCapableObj.setDAOKey(getDaoKey());

            CapabilityJunctionPayload currentCapablePayload = toPutCapablePayloadArray[i];

            if ( ! currentCapablePayload.getHasSafeStatus() ){
              currentCapablePayload.setStatus(getDefaultStatus());
            }
          }
        } else {
          Capable storedCapableObj = (Capable) currentObjectInDao.fclone();

          toPutCapableObj.setDAOKey(storedCapableObj.getDAOKey());

          // should always be sync'd with whatever is on the backend
          if (
            SafetyUtil.isEmpty(String.valueOf(storedCapableObj.getDAOKey()))
          ) {
            toPutCapableObj.setDAOKey(getDaoKey());
          }

          toUpdateCapablePayloadDAO = storedCapableObj.getCapablePayloadDAO(getX());

          for ( int i = 0; i < toPutCapablePayloadArray.length; i++ ){
            CapabilityJunctionPayload toPutCapablePayload =
              (CapabilityJunctionPayload) toPutCapablePayloadArray[i];

            if ( ! toPutCapablePayload.getHasSafeStatus() ){

              DAO capabilityDAO = (DAO) x.get("capabilityDAO");
              Capability capability = (Capability) capabilityDAO.find(toPutCapablePayload.getCapability());

              if ( capability == null ) {
                throw new RuntimeException("capability not found: " +
                  toPutCapablePayload.getCapability());
              }

              CapabilityJunctionPayload storedCapablePayload = (CapabilityJunctionPayload) toUpdateCapablePayloadDAO.find(capability.getId());

              if ( storedCapablePayload != null ){
                toPutCapablePayload.setStatus(storedCapablePayload.getStatus());
              }
            }
          }
        }

        List<CapabilityJunctionPayload> capablePayloads = new ArrayList<CapabilityJunctionPayload>(Arrays.asList(toPutCapablePayloadArray));


        for ( CapabilityJunctionPayload currentPayload : capablePayloads ){
          var afterPut = toUpdateCapablePayloadDAO.inX(x).put(currentPayload);
          if ( obj instanceof net.nanopay.contacts.CapableContact )
            foam.nanos.logger.Loggers.logger(x, this).info("PAYLOAD AFTER PUT:", "before="+currentPayload, "after="+afterPut);
        }

        // include old payloads when checking requirement status
        CapabilityJunctionPayload[] payloads = (CapabilityJunctionPayload[]) ((List) ((ArraySink) toUpdateCapablePayloadDAO.inX(getX()).select(new ArraySink())).getArray()).toArray(new CapabilityJunctionPayload[0]);
        
        if ( obj instanceof net.nanopay.contacts.CapableContact )
          foam.nanos.logger.Loggers.logger(x, this).info("PAYLOADS FROM toUpdateCapablePayloadDAO", payloads[0]);
        toPutCapableObj.setCapablePayloads(payloads);

        if ( 
          ! toPutCapableObj.checkRequirementsStatusNoThrow(x, toPutCapableObj.getCapabilityIds(), CapabilityJunctionStatus.GRANTED) &&
          ! toPutCapableObj.checkRequirementsStatusNoThrow(x, toPutCapableObj.getCapabilityIds(), CapabilityJunctionStatus.PENDING) &&
          ! toPutCapableObj.checkRequirementsStatusNoThrow(x, toPutCapableObj.getCapabilityIds(), CapabilityJunctionStatus.REJECTED) &&
          ! getAllowActionRequiredPuts()
        ) {
          CapabilityIntercept cre = new CapabilityIntercept();
          cre.setDaoKey(getDaoKey());
          cre.addCapable(toPutCapableObj);
          throw cre;
        }

        return super.put_(x, obj);
      `
    }
  ],
});
