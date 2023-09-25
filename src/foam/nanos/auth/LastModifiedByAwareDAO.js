/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'LastModifiedByAwareDAO',
  extends: 'foam.dao.ProxyDAO',

  methods: [
    {
      name: 'put_',
      code: function(x, obj) {
        if ( ! foam.nanos.auth.LastModifiedByAware.isInstance(obj) ) {
          return this.delegate.put_(x, obj);
        }
        return this.delegate.find_(x, obj).then(function(old) {
          if ( ! obj.equals(old) ) {
            obj.lastModifiedBy = x.subject.user.id;
            if ( x.subject.realUser && x.subject.user.id !== x.subject.realUser.id ) {
              obj.lastModifiedByAgent = x.subject.realUser.id;
              if ( foam.nanos.auth.LastModifiedByAgentNameAware.isInstance(obj) ) {
                obj.lastModifiedByAgentName = x.subject.realUser.toSummary();
              }
            }
          }
          return this.delegate.put_(x, obj);
        }.bind(this));
      },
      javaCode: `
        if ( obj instanceof LastModifiedByAware && ! obj.equals(getDelegate().find_(x, obj)) ) {
          var subject = (Subject) x.get("subject");
          if ( subject != null ) {
            var user     = subject.getUser();
            var realUser = subject.getRealUser();

            ((LastModifiedByAware) obj).setLastModifiedBy(user.getId());
            if ( user.getId() != realUser.getId() ) {
              ((LastModifiedByAware) obj).setLastModifiedByAgent(realUser.getId());
              if ( obj instanceof LastModifiedByAgentNameAware ) {
                ((LastModifiedByAgentNameAware) obj).setLastModifiedByAgentName(realUser.toSummary());
              }
            }
          }
        }
        return super.put_(x, obj);
      `
    }
  ]
});
