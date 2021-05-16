/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaUniqueDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Nodes retain the last x entries in an MDAO. Test and alarm on duplicates.`,

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.UniqueConstraintException',
    'foam.nanos.alarming.Alarm',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger'
  ],

  properties: [
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      javaFactory: `
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, (Logger) getX().get("logger"));
      `
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      MedusaEntry entry = (MedusaEntry) obj;
      if ( getDelegate().find_(x, entry.getId()) != null ) {
        Alarm alarm = new Alarm.Builder(x)
          .setName("Medusa Duplicate Index")
          .setIsActive(true)
          .setNote(entry.toString())
          .build();
        ((DAO) x.get("alarmDAO")).put(alarm);
        throw new UniqueConstraintException("Medusa Duplicate Index: "+entry.getIndex());
      }
      return getDelegate().put_(x, entry);
      `
    }
  ]
});
