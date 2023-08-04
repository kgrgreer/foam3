/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.crunch',
  name: 'Renewable',

  javaImports: [
    'java.util.Date'
  ],

  properties: [
    {
      name: 'isExpired',
      class: 'Boolean',
      storageTransient: true,
      javaGetter: `
      if ( getExpiry() == null ) return false;

      Date today = new Date();
      Date capabilityExpiry = getExpiry();

      return today.after(capabilityExpiry);
      `
    },
    {
      name: 'isRenewable',
      class: 'Boolean',
      getter: function() { return this.isExpired || this.isInRenewablePeriod || this.isInGracePeriod; },
      javaGetter: `
        return getIsExpired() || getIsInRenewablePeriod() || getIsInGracePeriod();
      `
    },
    {
      name: 'isInRenewablePeriod',
      class: 'Boolean',
      javaSetter: `
        isInRenewablePeriod_ = val;
        isInRenewablePeriodIsSet_ = true;
        if ( isInRenewablePeriod_ ) {
          isExpired_ = false;
          isInGracePeriod_ = false;
        }
      `
    },
    {
      name: 'isInGracePeriod',
      class: 'Boolean',
      javaSetter: `
        isInGracePeriod_ = val;
        isInGracePeriodIsSet_ = true;
        if ( isInGracePeriod_ ) {
          isExpired_ = false;
          isInRenewablePeriod_ = false;
        }
      `
    },
    {
      name: 'expiry',
      class: 'DateTime',
      documentation: `Datetime of when capability is no longer valid. Explicitly set, or calculated from duration and durationTimeUnit`,
      includeInDigest: true,
    },
    {
      name: 'duration',
      class: 'Int',
      documentation: `The number of durationTimeUnits to calculate expiry date.
      NOTE: existing logic - The UserCapabilityJunction object will have its expiry configured to a DateTime based on the lower value of the two, expiry and duration`,
      includeInDigest: true,
    },
    {
      documentation: 'Unit of Duration',
      name: 'durationTimeUnit',
      class: 'Enum',
      of: 'foam.time.TimeUnit',
      value: 'DAY',
      includeInDigest: true,
    },
    {
      name: 'gracePeriod',
      class: 'Int',
      value: 0,
      documentation: `To be used in the case where expiry is duration based, represents the number of DAYS the user can keep permissions
      granted by this capability after the duration runs out.
      If the gracePeriod is greater than 0, the UserCapabilityJunction will set isInGracePeriod property to true
      and set gracePeriod property to be equals to this. Otherwise, the UserCapabilityJunction will
      go into EXPIRED status.`,
      includeInDigest: true,
    },
    {
      documentation: 'Unit of Grace Period',
      name: 'gracePeriodTimeUnit',
      class: 'Enum',
      of: 'foam.time.TimeUnit',
      value: 'DAY',
      includeInDigest: true,
    },
  ],

  methods: [
    {
      name: 'getRenewalStatusChanged',
      args: [
        { name: 'old', javaType: 'foam.nanos.crunch.UserCapabilityJunction' }
      ],
      type: 'Boolean',
      javaCode: `
        if ( old.getIsExpired() != getIsExpired() ) return true;
        if ( old.getIsRenewable() != getIsRenewable() ) return true;
        if ( old.getIsInRenewablePeriod() != getIsInRenewablePeriod() ) return true;
        if ( old.getIsInGracePeriod() != getIsInGracePeriod() ) return true;

        return false;
      `
    },
    {
      name: 'resetRenewalStatus',
      javaCode: `
        clearIsInRenewablePeriod();
        clearIsInGracePeriod();
        clearIsExpired();
        clearIsRenewable();
      `
    }
  ]
});
