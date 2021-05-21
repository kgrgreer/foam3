/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.flinks.external',
  name: 'FlinksLoginIdAsyncDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Decorating DAO for processing FlinksLoginId requests asynchronously.`,

  javaImports: [
    'foam.core.Agency',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        FlinksLoginIdAsync flinksLoginIdAsync = null;
        FlinksLoginId flinksLoginId = null;
        
        if ( obj instanceof FlinksLoginIdAsync ) {
            flinksLoginIdAsync = (FlinksLoginIdAsync) obj;

            if ( ! SafetyUtil.isEmpty(flinksLoginIdAsync.getRequestId()) ) {
                FlinksLoginIdAsync asyncResult = (FlinksLoginIdAsync) find_(x, flinksLoginIdAsync.getRequestId());
                if ( asyncResult != null ) return asyncResult;

                // Synchronize the requestId and the id
                flinksLoginIdAsync.setId(flinksLoginIdAsync.getRequestId());
            } else if ( ! SafetyUtil.isEmpty(flinksLoginIdAsync.getId()) ) {
                FlinksLoginIdAsync asyncResult = (FlinksLoginIdAsync) find_(x, flinksLoginIdAsync.getId());
                if ( asyncResult != null ) return asyncResult;
            } else {
                flinksLoginIdAsync.setId(java.util.UUID.randomUUID().toString());
            }

            if ( flinksLoginIdAsync.getFlinksLoginIdResult() == null ) {
                throw new RuntimeException("FlinksLoginIdResult required for new async requests");
            }

            flinksLoginId = (FlinksLoginId) flinksLoginIdAsync.getFlinksLoginIdResult();
            flinksLoginId.setId(flinksLoginIdAsync.getId());

            // Clear the result
            flinksLoginIdAsync.clearFlinksLoginIdResult();
            flinksLoginIdAsync.setRequestId(flinksLoginId.getId());
            flinksLoginIdAsync.setStatus(AsyncStatus.IN_PROGRESS.getLabel());
        }
        else if ( obj instanceof FlinksLoginId ) {
            flinksLoginId = (FlinksLoginId) obj;

            if ( ! SafetyUtil.isEmpty(flinksLoginId.getId()) ) {
                FlinksLoginIdAsync asyncResult = (FlinksLoginIdAsync) find_(x, flinksLoginId.getId());
                if ( asyncResult != null ) return asyncResult;
            } else {
                flinksLoginId.setId(java.util.UUID.randomUUID().toString());
            }

            flinksLoginIdAsync = new FlinksLoginIdAsync.Builder(x)
                .setId(flinksLoginId.getId())
                .setRequestId(flinksLoginId.getId())
                .setStatus(AsyncStatus.IN_PROGRESS.getLabel())
                .setCreated(flinksLoginId.getCreated())
                .setCreatedBy(flinksLoginId.getCreatedBy())
                .setCreatedByAgent(flinksLoginId.getCreatedByAgent())
                .build();
        } else {
            throw new RuntimeException("Unexpected object for PUT operation: " + obj.getClassInfo().getId());
        }
        
        flinksLoginIdAsync = (FlinksLoginIdAsync) super.put_(x, flinksLoginIdAsync);

        // Start async call
        startFlinksLoginId(x, flinksLoginId, flinksLoginIdAsync);

        try {
            // Wait less than half a second to see if the call returns immediately
            Thread.sleep(250);
            flinksLoginIdAsync = (FlinksLoginIdAsync) find_(x, flinksLoginIdAsync.getId());
        } catch ( Throwable t ) { /* ignore */ }

        return flinksLoginIdAsync;
      `
    },
    {
        name: 'startFlinksLoginId',
        args: [
          { name: 'callingX', type: 'Context' },
          { name: 'flinksLoginId', type: 'FlinksLoginId' },
          { name: 'flinksLoginIdAsync', type: 'FlinksLoginIdAsync' }
        ],
        javaCode: `
            // Start async call
            ((Agency) callingX.get("threadPool")).submit(callingX, x -> {
                try {
                    DAO flinksLoginIdDAO = (DAO) x.get("flinksLoginIdDAO");
                    try {
                        FlinksLoginId flinksLoginIdResult = (FlinksLoginId) flinksLoginIdDAO.inX(x).put(flinksLoginId);
                        flinksLoginIdAsync.setFlinksLoginIdResult(flinksLoginIdResult);
                        flinksLoginIdAsync.setStatus(AsyncStatus.COMPLETED.getLabel());
                    } catch ( foam.core.FOAMException fe ) {
                        ((Logger) x.get("logger")).error("Failure processing FlinksLoginId: " + flinksLoginId.getId(), fe);
                        flinksLoginIdAsync.setStatus(AsyncStatus.FAILURE.getLabel());
                        flinksLoginIdAsync.setErrorMessage(fe.getMessage());
                        flinksLoginIdAsync.setException(fe);
                    } catch ( Throwable t ) {
                        ((Logger) x.get("logger")).error("Unexpected failure processing FlinksLoginId: " + flinksLoginId.getId(), t);
                        flinksLoginIdAsync.setStatus(AsyncStatus.FAILURE.getLabel());
                        flinksLoginIdAsync.setErrorMessage(t.getMessage());
                    } finally {
                        // Ensure that the put_ operation runs through the RulerDAO so that any rules on the entity get fired (e.g. DUGRule)
                        new foam.nanos.ruler.RulerDAO(x, getDelegate(), "flinksLoginIdAsyncDAO").put_(x, flinksLoginIdAsync);
                    }
                } catch ( Throwable t ) {
                    ((Logger) x.get("logger")).error("Error saving async result: " + flinksLoginId.getId(), t);
                }
            }, "Async FlinksLoginId: " + flinksLoginId.getId());
        `
        
    }
  ]
})