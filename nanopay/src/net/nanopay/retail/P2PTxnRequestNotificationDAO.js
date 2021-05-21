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
  package: 'net.nanopay.retail',
  name: 'P2PTxnRequestNotificationDAO',
  extends: 'foam.dao.ProxyDAO',
  
  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.push.PushService',
    'foam.util.SafetyUtil',
    'java.util.HashMap',
    'java.util.Map',
    'net.nanopay.retail.model.P2PTxnRequest',
    'net.nanopay.retail.model.P2PTxnRequestStatus',
    
    'static foam.mlang.MLang.EQ',
    'static net.nanopay.retail.utils.P2PTxnRequestUtils.getUserByEmail'
  ],

  messages: [
    { name: 'MONEY_REQUEST_MSG', message: 'Money request!' },
    { name: 'CAANOT_SEND_PUSH_ERROR_MSG', message: 'Can\'t send push no device Id found' }
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      name: 'logger'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public P2PTxnRequestNotificationDAO(X x, DAO delegate) {
            setX(x);
            setDelegate(delegate);
            setLogger((Logger) x.get("logger"));
          }    
        `
        );
      }
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        P2PTxnRequest request = (P2PTxnRequest) getDelegate().put_(x, obj);

        if ( request.getStatus().equals(P2PTxnRequestStatus.PENDING) ) {

          User user = getUserByEmail(x, request.getRequesteeEmail());

          if ( user != null && ! SafetyUtil.isEmpty(user.getDeviceToken()) ) {
            PushService push = (PushService) x.get("push");
            Map data = createNotificationData(request);
            push.sendPush(user, MONEY_REQUEST_MSG, data);
          } else {
            getLogger().error(CAANOT_SEND_PUSH_ERROR_MSG);
          }
        }

        return (FObject) request;
      `
    },
    {
      name: 'createNotificationData',
      visibility: 'protected',
      type: 'Map',
      args: [
        { type: 'P2PTxnRequest', name: 'request' }
      ],
      javaCode: `
        Map<String, String> data = new HashMap<String, String>();
        data.put("requestId", Long.toString(request.getId()));
        data.put("requestorEmail", request.getRequestorEmail());
        data.put("amount", Long.toString(request.getAmount()));
        data.put("status", String.valueOf(request.getStatus().getOrdinal()));
        return data;
      `
    },
    {
      name: 'isNewRequest',
      visibility: 'protected',
      type: 'boolean',
      args: [
        { type: 'P2PTxnRequest', name: 'request' }
      ],
      javaCode: `
        return this.find_(getX(), request) == null;
      `
    }
  ]
});
