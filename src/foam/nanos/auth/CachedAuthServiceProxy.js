/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'CachedAuthServiceProxy',
  extends: 'foam.nanos.auth.ProxyAuthService',
  documentation: `
    An auth service decorator that caches permission checks. The cache gets
    invalidated whenever the imported user's group changes.
  `,
  imports: [
    'capabilityDAO',
    'group',
    'subject',
    'userCapabilityJunctionDAO',
    'loginSuccess?'
  ],
  properties: [
    {
      class: 'Map',
      name: 'cache'
    },
  ],
  methods: [
    function init() {
      this.onDetach(this.group$.sub(this.resetCache));
      this.onDetach(this.subject$.sub(this.resetCache));
      if ( this.loginSuccess$ ) {
        this.onDetach(this.loginSuccess$.sub(this.resetCache));
      }
      this.onDetach(this.userCapabilityJunctionDAO.on.sub(
        (sub, _on, event, ucj) => {
          if ( event !== 'put' && event !== 'remove' ) return;
          this.capabilityDAO.find(ucj.targetId).then(cap => {
            cap.permissionsGranted.forEach(p => delete this.cache[p]);
            cap.permissionsIntercepted.forEach(p => delete this.cache[p]);
          });
        }
      ));
    },
    function check(x, p) {
      if ( ! this.cache[p] ) this.cache[p] = this.delegate.check(x, p);
      return this.cache[p];
    },
  ],
  listeners: [
    function resetCache() {
      this.cache = {};
    }
  ]
});
