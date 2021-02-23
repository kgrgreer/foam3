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
  name: 'P2PTxnRequestUserInfoDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'static net.nanopay.retail.utils.P2PTxnRequestUtils.getCurrentUser',
    'static net.nanopay.retail.utils.P2PTxnRequestUtils.getUserByEmail',
    'static net.nanopay.retail.utils.P2PTxnRequestUtils.isPartner',

    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.mlang.order.Comparator',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.auth.User',
    'net.nanopay.auth.PublicUserInfo',
    'net.nanopay.retail.model.P2PTxnRequest'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public P2PTxnRequestUserInfoDAO(X x, DAO delegate) {
            setX(x);
            setDelegate(delegate);
          }
        
          protected class DecoratedSink extends foam.dao.ProxySink {
            public DecoratedSink(X x, Sink delegate) {
              super(x, delegate);
            }
        
            @Override
            public void put(Object obj, foam.core.Detachable sub) {
              obj = setUsersInfo(getX(), (FObject) obj);
              getDelegate().put(obj, sub);
            }
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
        obj = getDelegate().put_(x, obj);
        return setUsersInfo(x, obj);
      `
    },
    {
      name: 'find_',
      javaCode: `
        FObject obj = getDelegate().find_(x, id);
        if ( obj != null ) {
          obj = setUsersInfo(x, obj);
        }
        return obj;
      `
    },
    {
      name: 'select_',
      javaCode: `
        Sink decoratedSink = new DecoratedSink(x, sink);
        getDelegate().select_(x, decoratedSink, skip, limit, order, predicate);
        return sink;
      `
    },
    {
      name: 'setUsersInfo',
      visibility: 'protected',
      type: 'P2PTxnRequest',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'FObject', name: 'obj' }
      ],
      javaCode: `
        User currentUser = getCurrentUser(x);
        P2PTxnRequest request = (P2PTxnRequest) obj.fclone();

        if ( currentUser.getEmail().equals(request.getRequesteeEmail()) ) {
          // current user is requestee
          request.setRequestee(new PublicUserInfo(currentUser));
          User otherUser = getUserByEmail(x, request.getRequestorEmail());

          if ( otherUser != null && isPartner(x, currentUser, otherUser) ) {
            request.setRequestor(new PublicUserInfo(otherUser));
          }
        } else {
          // current user is requestor
          request.setRequestor(new PublicUserInfo(currentUser));
          User otherUser = getUserByEmail(x, request.getRequesteeEmail());

          if ( otherUser != null && isPartner(x, currentUser, otherUser) ) {
            request.setRequestee(new PublicUserInfo(otherUser));
          }
        }
        return request;
      `
    }
  ]
});

