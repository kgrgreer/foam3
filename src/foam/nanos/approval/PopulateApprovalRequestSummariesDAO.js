/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.approval',
  name: 'PopulateApprovalRequestSummariesDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `
    Adds referenceSummary and createdForSummary to ApprovalRequest
  `,

  javaImports: [
    'foam.core.Detachable',
    'foam.core.FObject',
    'foam.dao.AbstractSink',
    'foam.dao.DAO',
    'foam.dao.ProxySink',
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Loggers',
    'foam.util.SafetyUtil'
  ],

  methods: [
    {
      name: 'find_',
      javaCode: `
        ApprovalRequest approval = (ApprovalRequest) getDelegate().find_(x, id);
        if ( approval == null ) {
          return approval;
        }

        populateSummaries(x, approval);

        return approval;
      `
    },
    {
      name: 'select_',
      javaCode: `
        if (sink != null) {
          ProxySink refinedSink = new ProxySink(x, sink) {
            @Override
            public void put(Object obj, foam.core.Detachable sub) {
              ApprovalRequest approval = (ApprovalRequest) ((FObject) obj).fclone();

              populateSummaries(x, approval);

              super.put(approval, sub);
            }
          };
          return ((ProxySink) super.select_(x, refinedSink, skip, limit, order, predicate)).getDelegate();
        }
        return super.select_(x, sink, skip, limit, order, predicate);
      `
    },
    {
      name: 'populateSummaries',
      args: [
        { name: 'x', javaType: 'foam.core.X' },
        { name: 'approval', javaType: 'foam.nanos.approval.ApprovalRequest' }
      ],
      type: 'Void',
      javaCode:`
        DAO userDAO = (DAO) x.get("userDAO");
        DAO referenceDAO = (DAO) x.get(approval.getDaoKey());

        // handle createdForSummary
        String createdForSummaryString = approval.getCreatedFor() != 0
          ? "ID:" + Long.toString(approval.getCreatedFor())
          : "N/A";

        User createdForUser = (User) userDAO.find(approval.getCreatedFor());
        if ( createdForUser != null ) {
          createdForUser.setX(x);

          if ( ! SafetyUtil.isEmpty(createdForUser.toSummary()) ){
            createdForSummaryString = createdForUser.toSummary();
          }
        }

        // handle referenceSummaryString
        String referenceSummaryString = "ID:" + (approval.getObjId() == null ? "N/A" : approval.getObjId().toString());
        if ( referenceDAO != null ) {
          FObject referenceObject = (FObject) referenceDAO.find(approval.getObjId());
          if ( referenceObject != null ) {
            referenceObject.setX(x);

            String referenceObjectToSummary = referenceObject.toSummary();

            if ( ! SafetyUtil.isEmpty(referenceObjectToSummary) ){
              referenceSummaryString = referenceObjectToSummary;
            }
          } else {
            Loggers.logger(x, this).debug("Cannot find reference object", approval.getObjId(), approval);
          }
        } else {
          Loggers.logger(x, this).debug("Cannot find reference DAO", approval.getDaoKey(), approval);
        }

        approval.setCreatedForSummary(createdForSummaryString);
        approval.setReferenceSummary(referenceSummaryString);

        populateSummariesDecorator(x, approval);
      `
    },
        {
      name: 'populateSummariesDecorator',
      documentation: `
        An optional decorator to override in subclasses for more
        customized summaries
      `,
      args: [
        { name: 'x', javaType: 'foam.core.X' },
        { name: 'approval', javaType: 'foam.nanos.approval.ApprovalRequest' }
      ],
      type: 'Void',
      javaCode:`
        // TODO: override in a subclass to add
      `
    }
  ]
});
