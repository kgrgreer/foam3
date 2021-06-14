/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.lite.ruler',
  name: 'CapableStatusChangeAdjustApprovalsRuleAction',

  documentation: `
    To remove ApprovalRequests upon CapablePayload.status changes
  `,

  javaImports: [
    'foam.core.ContextAwareAgent',
    'foam.core.Detachable',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.AbstractSink',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.log.LogLevel',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.alarming.Alarm',
    'foam.nanos.alarming.AlarmReason',
    'foam.nanos.approval.ApprovalStatus',
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.approval.Approvable',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CrunchService',
    'foam.nanos.crunch.lite.Capable',
    'foam.nanos.crunch.CapabilityJunctionPayload',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.dao.Operation',
    'foam.nanos.logger.Logger',
    'java.util.ArrayList',
    'java.util.Arrays',
    'java.util.HashMap',
    'java.util.List',
    'java.util.Map',
    'foam.util.SafetyUtil',
  ],

  implements: ['foam.nanos.ruler.RuleAction'],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAwareAgent() {
          @Override
          public void execute(X x) {
            User user = ((Subject) x.get("subject")).getUser();

            Logger logger = (Logger) x.get("logger");

            DAO capabilityDAO = (DAO) x.get("capabilityDAO");

            Capable capableNewObj = (Capable) obj;
            Capable capableOldObj = (Capable) oldObj;

            CapabilityJunctionPayload[] newCapablePayloads = capableNewObj.getCapablePayloads();
            CapabilityJunctionPayload[] oldCapablePayloads = capableOldObj.getCapablePayloads();

            List<CapabilityJunctionPayload> updatedApprovalPayloads = new ArrayList<>();
            CapabilityJunctionPayload grantedApprovalPayload = null;

            if ( newCapablePayloads.length != oldCapablePayloads.length ){
              logger.error("capableOldObj and capableNewObj have different capable payloads lengths");
              throw new RuntimeException("capableOldObj and capableNewObj have different capable payloads lengths");
            }

            // Identifying the capablePayloads whose status changed between capableOldObj and capableNewObj
            Map<String,CapabilityJunctionStatus> capabilityIdToStatus = new HashMap<>();

            for ( int i = 0; i < oldCapablePayloads.length; i++ ){
              CapabilityJunctionPayload oldCapablePayload = oldCapablePayloads[i];
              capabilityIdToStatus.put(oldCapablePayload.getCapability(),oldCapablePayload.getStatus());
            }

            for ( int i = 0; i < newCapablePayloads.length; i++ ){
              CapabilityJunctionPayload newCapablePayload = newCapablePayloads[i];

              CapabilityJunctionStatus oldStatus = capabilityIdToStatus.get(newCapablePayload.getCapability());

              if ( oldStatus == null ){
                logger.error("capableNewObj contains a payload that capableOldObj does not have");
                throw new RuntimeException("capableNewObj contains a payload that capableOldObj does not have");
              }

              if ( ! SafetyUtil.equals(oldStatus, newCapablePayload.getStatus()) ){
                Capability capability = (Capability) capabilityDAO.find(newCapablePayload.getCapability());

                if ( capability.getReviewRequired() ){
                  // should only be one approved request
                  if ( newCapablePayload.getStatus() == CapabilityJunctionStatus.GRANTED ) grantedApprovalPayload = newCapablePayload;
                  else updatedApprovalPayloads.add(newCapablePayload);
                }

                // handle unapproved requests for a granted minmax
                if ( capability instanceof foam.nanos.crunch.MinMaxCapability ) {
                  var crunchService = (CrunchService) x.get("crunchService");
                  var payloadDAO = (DAO) capableNewObj.getCapablePayloadDAO(x);

                  List<String> prereqIdsList = crunchService.getPrereqs(x, newCapablePayload.getCapability(), null);

                  if ( prereqIdsList != null && prereqIdsList.size() > 0 ) {
                    String[] prereqIds = prereqIdsList.toArray(new String[prereqIdsList.size()]);

                    ((ArraySink) payloadDAO.select(new ArraySink())).getArray().stream()
                    .filter(cp -> Arrays.stream(prereqIds).anyMatch(((CapabilityJunctionPayload) cp).getCapability()::equals))
                    .forEach(cp -> {
                      CapabilityJunctionPayload capableCp =
                        (CapabilityJunctionPayload) cp;
                      if  ( capableCp.getStatus() == CapabilityJunctionStatus.PENDING ) {
                        updatedApprovalPayloads.add(capableCp);
                      }
                    });
                  }
                }
              }
            }

            if (  grantedApprovalPayload == null ){
              String message = "No granted approval payload found for "  + capableNewObj.getDAOKey() 
                + ":" + String.valueOf(obj.getProperty("id"));
              
              ((DAO) getX().get("alarmDAO")).put_(getX(), new Alarm.Builder(getX())
                  .setName("Capable Status Change Adjust Approvals - Approved Request")
                  .setReason(AlarmReason.UNSPECIFIED)
                  .setSeverity(LogLevel.ERROR)
                  .setNote(message)
                  .build());
              
              throw new RuntimeException(message);
            }


            DAO approvalRequestDAO = (DAO) x.get("approvalRequestDAO");
            DAO approvableDAO = (DAO) x.get("approvableDAO");
            Long originalApproverId;

            // find approver of the granted request
            DAO approvedRequestDAO = getFilteredRequestsDAO(
              x,
              getX(),
              grantedApprovalPayload,
              obj,
              capableNewObj,
              ApprovalStatus.APPROVED,
              0
            );

            List<ApprovalRequest> approvedRequestList =  ((ArraySink) approvedRequestDAO.select(new ArraySink())).getArray();

            if ( approvedRequestList.size() != 1 ){
              String message = approvedRequestList.size() > 1
                ? "Approved Approval Request is not unique"
                : "Approved Approval Request cannot be found";
              
              ((DAO) getX().get("alarmDAO")).put_(getX(), new Alarm.Builder(getX())
                  .setName("Capable Status Change Adjust Approvals - Approved Request")
                  .setReason(AlarmReason.UNSPECIFIED)
                  .setSeverity(LogLevel.ERROR)
                  .setNote(message)
                  .build());
              
              throw new RuntimeException(message);
            }

            ApprovalRequest approvedRequest = approvedRequestList.get(0);

            originalApproverId = approvedRequest.getApprover();

            // update the status of the newly change approval payloads with the original approver
            for ( CapabilityJunctionPayload capablePayload : updatedApprovalPayloads ){
              DAO currentRequestDAO = getFilteredRequestsDAO(
                x,
                getX(),
                capablePayload, 
                obj, 
                capableNewObj, 
                ApprovalStatus.REQUESTED, 
                originalApproverId
              );

              // should only be one request
              currentRequestDAO.limit(1).select(new AbstractSink() {
                @Override
                public void put(Object obj, Detachable sub) {
                  ApprovalRequest approval = (ApprovalRequest) ((FObject) obj).fclone();
                  ApprovalStatus status =  ApprovalStatus.APPROVED;
                  if ( capablePayload.getStatus() == CapabilityJunctionStatus.REJECTED ) status  = ApprovalStatus.APPROVED;

                  approval.setStatus(status);
                  approvalRequestDAO.put(approval);
                }
              });
            }
          }
        }, "Adjusted approvals after the capable payload status changed");
      `
    },
    {
      name: 'getFilteredRequestsDAO',
      type: 'foam.dao.DAO',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'systemX',
          type: 'Context'
        },
        {
          name: 'payload',
          type: 'foam.nanos.crunch.CapabilityJunctionPayload'
        },
        {
          name: 'obj',
          type: 'FObject'
        },
        {
          name: 'capableObj',
          type: 'Capable'
        },
        {
          name: 'status',
          type: 'foam.nanos.approval.ApprovalStatus'
        },
        {
          name: 'approver',
          type: 'Long'
        }
      ],
      javaCode: `
        DAO capabilityDAO = (DAO) x.get("capabilityDAO");
        DAO approvalRequestDAO = (DAO) x.get("approvalRequestDAO");
        DAO approvableDAO = (DAO) x.get("approvableDAO");

        Capability capability = (Capability) capabilityDAO.find(payload.getCapability());

        String hashedId = new StringBuilder("d")
          .append(capableObj.getDAOKey())
          .append(":o")
          .append(String.valueOf(obj.getProperty("id")))
          .append(":c")
          .append(capability.getId())
          .toString();

        List<Approvable> approvableList = ((ArraySink)  approvableDAO.where(foam.mlang.MLang.EQ(Approvable.LOOKUP_ID, hashedId))
          .select(new ArraySink())).getArray();

        if ( approvableList.size() != 1 ){
          String message = approvableList.size() > 1
            ? "Approvable Lookup Id " + hashedId + " is not unique"
            : "Approvable Lookup Id " + hashedId + " cannot be found";
          
          ((DAO) systemX.get("alarmDAO")).put_(systemX, new Alarm.Builder(systemX)
              .setName("Capable Status Change Adjust Approvals - Appovable")
              .setReason(AlarmReason.UNSPECIFIED)
              .setSeverity(LogLevel.ERROR)
              .setNote(message)
              .build());
          
          throw new RuntimeException(message);
        }
        
        Approvable approvable = approvableList.get(0);

        List<ApprovalRequest> requests =  ((ArraySink) approvalRequestDAO.select(new ArraySink())).getArray();

        List<Predicate> predicateList = new ArrayList<>(
          Arrays.asList(
            foam.mlang.MLang.EQ(ApprovalRequest.OBJ_ID, approvable.getId()),
            foam.mlang.MLang.EQ(ApprovalRequest.DAO_KEY, "approvableDAO"),
            foam.mlang.MLang.EQ(ApprovalRequest.STATUS, status)
          )
        );

        if ( approver > 0 ) {
          predicateList.add(foam.mlang.MLang.EQ(ApprovalRequest.APPROVER, approver));
        }
        
        Predicate[] predicateArray = predicateList.toArray(new Predicate[predicateList.size()]);

        return approvalRequestDAO.where(
          foam.mlang.MLang.AND(
            predicateArray
          )
        );
      `
    }
  ]
});
