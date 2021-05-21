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
  package: 'net.nanopay.partners',
  name: 'PartnerInfoDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: `
    Set the partnerId property to the appropriate value. PublicUserInfoDAO will
    use it to put the info for that user on the partnerInfo property.
  `,

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.mlang.order.Comparator',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.auth.AuthenticationException',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.auth.UserUserJunction'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public PartnerInfoDAO(X x, DAO delegate) {
            super(x, delegate);
          }  
          
          /** Used to apply the replacement logic to each item returned by a select */
          protected class DecoratedSink extends foam.dao.ProxySink {
            private User user_;
            public DecoratedSink(X x, Sink delegate) {
              super(x, delegate);
              user_ = ((Subject) x.get("subject")).getUser();
              if ( user_ == null ) {
                throw new AuthenticationException();
              }
            }

            @Override
            public void put(Object obj, foam.core.Detachable sub) {
              UserUserJunction junc = (UserUserJunction) obj;
              junc = setIdProperties(user_, junc);
              getDelegate().put(junc, sub);
            }
          }
        `
        );
      }
    }
  ],

  methods: [
    // NOTE: put_() isn't supported for now because if this decorator comes after
    // PublicUserInfoDAO, then find and select work but put doesn't. If this
    // decorator comes before PublicUserInfoDAO though, then put works and the
    // other two don't. Having find and select work seems a lot more useful for
    // our current use cases so that's why I'm going with leaving put out for now.
    {
      name: 'find_',
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();
        UserUserJunction junc = (UserUserJunction) getDelegate().find_(x, id);
        junc = this.setIdProperties(user, junc);
        return junc;
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
      name: 'setIdProperties',
      visibility: 'protected',
      type: 'UserUserJunction',
      args: [
        { type: 'User', name: 'user' },
        { type: 'UserUserJunction', name: 'junc' }
      ],
      javaCode: `
        if ( user == null ) {
          throw new AuthenticationException();
        } else if ( junc != null ) {
          junc = (UserUserJunction) junc.fclone();
          if ( user.getId() == junc.getSourceId() ) {
            junc.setPartnerId(junc.getTargetId());
            junc.setYourId(junc.getSourceId());
          } else {
            junc.setPartnerId(junc.getSourceId());
            junc.setYourId(junc.getTargetId());
          }
        }
        return junc;
      `
    }
  ]
});
