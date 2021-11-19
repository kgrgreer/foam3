/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.ENUM({
  package: 'foam.nanos.crunch',
  name: 'AssociatedEntity',
  values: [
    {
      name: 'USER',
      label: 'user',
      documentation: `
        Associate capability junction with subject.user
        Multiple ucj's per subject path. Unique to each user type.
        A ucj of this association is associated to whoever a user is acting as.
      `
    },
    {
      name: 'REAL_USER',
      label: 'realUser',
      documentation: `
        Associate capability junction with logged-in user (subject.realUser).
        Only one ucj per subject path. Unique to realUser.
      `
    },
    {
      name: 'ACTING_USER',
      label: 'acting_user',
      documentation: `
        Denotes the special case where the associatedEntity of a capability should be
        some user acting as another user.
        One ucj per subject path. Unquie to user and business pair.
        note: business = subject.user, user = subject.realUser
        `
    }
  ]
});
