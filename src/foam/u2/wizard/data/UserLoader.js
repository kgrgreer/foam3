/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'UserLoader',
  implements: ['foam.u2.wizard.data.Loader'],

  imports: [
    'auth',
    'subject',
    'userDAO',
    'wizardletOf'
  ],

  methods: [
    async function load(o) {
      let d = o.old;
      var isAnonymous = await this.auth.isUserAnonymous(null, ctrl.__subContext__.subject.user.id);
      if ( ! d ) d = this.wizardletOf.create({}, this);
      if ( ! isAnonymous ) {
        // We want the updated user from the DAO in case it was updated
        // by rules corresponding to previous UCJ updates.
        const user = await this.userDAO.find(this.subject.user.id);

        var props = this.wizardletOf.getOwnAxiomsByClass(foam.core.Property);
        props.forEach(p => {
          if ( user.hasOwnProperty(p.name) && ! p.isDefaultValue(user[p.name] ) ) {
            d.copyFrom(user);
          }
        });
      }
      return d;
    }
  ]
});
