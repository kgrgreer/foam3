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
        if ( ! (obj instanceof FlinksLoginId) ) {
            throw new RuntimeException("Unexpected object for PUT operation: " + obj.getClassInfo().getId());
        }

        FlinksLoginId flinksLoginId = (FlinksLoginId) obj;
        if ( SafetyUtil.isEmpty(flinksLoginId.getId()) ) {
            flinksLoginId.setId(java.util.UUID.randomUUID().toString());
        } else {
            FlinksLoginIdAsync asyncResult = (FlinksLoginIdAsync) find_(x, flinksLoginId.getId());
            if ( asyncResult != null ) return asyncResult;
        }

        FlinksLoginIdAsync flinksLoginIdAsync = new FlinksLoginIdAsync.Builder(x)
            .setId(flinksLoginId.getId())
            .setRequestId(flinksLoginId.getId())
            .setStatus(AsyncStatus.IN_PROGRESS.getLabel())
            .build();

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
                        FlinksLoginId flinksLoginIdResult = (FlinksLoginId) flinksLoginIdDAO.put(flinksLoginId);
                        flinksLoginIdAsync.setFlinksLoginIdResult(flinksLoginIdResult);
                        flinksLoginIdAsync.setStatus(AsyncStatus.COMPLETED.getLabel());
                    } catch ( Throwable t ) {
                        flinksLoginIdAsync.setStatus(AsyncStatus.FAILURE.getLabel());
                        flinksLoginIdAsync.setErrorMessage(t.getMessage());
                    } finally {
                        super.put_(x, flinksLoginIdAsync);
                    }
                } catch ( Throwable t ) {
                    ((Logger) x.get("logger")).error("Error saving async result", t);
                }
            }, "Async FlinksLoginId: " + flinksLoginId.getId());
        `
        
    }
  ]
})