/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.crunch',
  name: 'Renewable',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.OR',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'foam.time.TimeZone',
    'foam.util.SafetyUtil',
    'java.time.*',
    'java.time.temporal.*',
    'java.util.Date'
  ],

  properties: [
    {
      name: 'isExpired',
      class: 'Boolean',
      storageTransient: true,
      javaGetter: `
      if ( getExpiry() == null ) return false;
      var zone = getTimeZoneId(getX());
      return ! getExpiry().after(Date.from(LocalDateTime.now(zone).atZone(zone).toInstant()));
      `
    },
    {
      name: 'isRenewable',
      class: 'Boolean',
      storageTransient: true,
      javaGetter: `
        return getIsInGracePeriod() ||
               getIsInRenewablePeriod();
      `
    },
    {
      class: 'Reference',
      of: 'foam.time.TimeZone',
      name: 'timeZone',
      order: 0,
      value: 'Africa/Abidjan' // UTC/GMT
    },
    {
      name: 'expiry',
      class: 'DateTime',
      documentation: `Datetime of when capability is no longer valid. Explicitly set, or calculated from duration and durationTimeUnit`,
      includeInDigest: true,
    },
    {
      name: 'expiryPeriod',
      class: 'Int',
      documentation: `The number of TimeUnits to calculate expiry date.
      NOTE: existing logic - The UserCapabilityJunction object will have its expiry configured to a DateTime based on the lower value of the two, expiry and duration`,
      includeInDigest: true,
    },
    {
      documentation: 'Unit of Duration',
      name: 'expiryPeriodTimeUnit',
      class: 'Enum',
      of: 'foam.time.TimeUnit',
      value: 'DAY',
      includeInDigest: true,
    },
    {
      name: 'gracePeriod',
      class: 'Int',
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
    {
      documentation: 'After expiry, before grace',
      name: 'isInGracePeriod',
      class: 'Boolean',
      storageTransient: true,
      javaGetter: `
      if ( getExpiry() == null ) return false;
      Date grace = calculateDate(getX(), getExpiry(), getGracePeriod(), getGracePeriodTimeUnit());
      var zone = getTimeZoneId(getX());
      return grace.after(getExpiry()) &&
             ! grace.after(Date.from(LocalDateTime.now(zone).atZone(zone).toInstant()));
      `
    },
    {
      name: 'renewalPeriod',
      class: 'Int',
      documentation: `To be used in the case where capabiltiy can be renewed before expiry`,
      includeInDigest: true,
    },
    {
      documentation: 'Unit of Grace Period',
      name: 'renewalPeriodTimeUnit',
      class: 'Enum',
      of: 'foam.time.TimeUnit',
      value: 'DAY',
      includeInDigest: true,
    },
    {
      documentation: 'Before expiry, after renewable',
      name: 'isInRenewablePeriod',
      class: 'Boolean',
      storageTransient: true,
      javaCode: `
      if ( getExpiry() == null ) return false;
      Date renewable = calculateDate(getX(), getExpiry(), -1 * getRenewalPeriod(), getRenewalPeriodTimeUnit());
      return ! renewable.after(getExpiry());
      `
    },
  ],

  methods: [
    {
      name: 'getRenewalStatusChanged',
      args: 'foam.nanos.crunch.UserCapabilityJunction old',
      type: 'Boolean',
      javaCode: `
        if ( old.getIsExpired() != getIsExpired() ||
             old.getIsRenewable() != getIsRenewable() ||
             old.getIsInGracePeriod() != getIsInGracePeriod() )
          return true;
        return false;
      `
    },
    {
      name: 'calculateDate',
      args: 'X x, Date from, int increment, foam.time.TimeUnit timeUnit',
      type: 'Date',
      javaCode: `
      if ( increment == 0 ) {
        return from;
      }

      var zone = getTimeZoneId(x);

      LocalDateTime last = null;
      if ( from == null ) {
        last = LocalDate.now(zone).atStartOfDay();
      } else {
        last = LocalDateTime.ofInstant(from.toInstant(), zone);
      }
      var time = last;

      switch (timeUnit) {
        case YEAR:
          time = time.plusYears(increment);
          break;
        case MONTH:
          time = time.plusMonths(increment);
          break;
        case HOUR:
          time = time.plusHours(increment);
          break;
        default: // case DAY:
          time = time.plusDays(increment);
          break;
      }

      return Date.from(time.atZone(zone).toInstant());
      `
    },
    {
      name: 'getTimeZoneId',
      args: 'X x',
      javaType: 'java.time.ZoneId',
      javaCode: `
      var zone = ZoneId.systemDefault();
      if ( ! SafetyUtil.isEmpty(getTimeZone()) ) {
        TimeZone timeZone = (TimeZone) ((DAO) x.get("timeZoneDAO")).find(OR(EQ(TimeZone.ID, getTimeZone()), EQ(TimeZone.DISPLAY_NAME, getTimeZone())));
        if ( timeZone == null ) {
          Loggers.logger(x, this).error("TimeZone not found", getTimeZone());
        }
        zone = ZoneId.of(timeZone.getId());
      }
      return zone;
      `
    },
  ]
});
