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
  name: 'CancelInProgressAsyncDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Decorating DAO for cancelling 'In Progress' FlinksLoginId async requests on startup.`,

  javaImports: [
    'foam.core.Detachable',
    'foam.core.X',
    'foam.dao.AbstractSink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'static foam.mlang.MLang.EQ'
  ],
  messages: [
    { name: 'CANCELLED_ERROR_MESSAGE', message: 'Restart was required. Async job cancelled. Please resubmit.' },
  ],  

  properties: [
    {
        name: 'initialized',
        class: 'Boolean',
        value: false
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        if ( ! getInitialized() ) {
            cancelInProgressAsyncRequests(x);
        }
        return super.put_(x, obj);
      `
    },
    {
      name: 'find_',
      javaCode: `
        if ( ! getInitialized() ) {
            cancelInProgressAsyncRequests(x);
        }
        return super.find_(x, id);
      `
    },
    {
      name: 'select_',
      javaCode: `
        if ( ! getInitialized() ) {
            cancelInProgressAsyncRequests(x);
        }
        return super.select_(x, sink, skip, limit, order, predicate);
      `
    },
    {
        name: 'cancelInProgressAsyncRequests',
        synchronized: true,
        args: [
            { name: 'x', type: 'Context' }
          ],
        javaCode: `
            if ( getInitialized() ) {
                return;
            }

            getDelegate().where(
              EQ(FlinksLoginIdAsync.STATUS, AsyncStatus.IN_PROGRESS.getLabel())
            ).select(new AbstractSink() {
              public void put(Object obj, Detachable sub) {
                var flinksLoginIdAsync = (FlinksLoginIdAsync) obj;
                flinksLoginIdAsync = (FlinksLoginIdAsync) flinksLoginIdAsync.fclone();
                flinksLoginIdAsync.setStatus(AsyncStatus.CANCELLED.getLabel());
                flinksLoginIdAsync.setErrorMessage(CANCELLED_ERROR_MESSAGE);
                try { 
                  getDelegate().put_(x, flinksLoginIdAsync); 
                } catch ( Throwable t ) { 
                  ((Logger) x.get("logger")).warning("Failed to update status on cancelled async request: " + flinksLoginIdAsync.getId(), t); 
                }
            }});

            // Mark the DAO initialized
            setInitialized(true);
        `
    }
  ]
})