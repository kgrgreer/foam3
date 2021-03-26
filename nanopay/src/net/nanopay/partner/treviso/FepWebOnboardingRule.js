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
  package: 'net.nanopay.partner.treviso',
  name: 'FepWebOnboardingRule',
  implements: ['foam.nanos.ruler.RuleAction'],

  documentation: `Onboards business to FEPWeb if onboarding ucj is passed.`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.alarming.Alarm',
    'foam.nanos.alarming.AlarmReason',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.crunch.UserCapabilityJunction',
    'net.nanopay.partner.treviso.TrevisoService',
    'net.nanopay.model.Business'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            Business business = (Business) obj;
            try {
              ((TrevisoService) x.get("trevisoService")).createEntity(x, business.getId());
              DAO alarmDAO = (DAO) x.get("alarmDAO");
              Alarm alarm = (Alarm) alarmDAO.find_(x, new Alarm(this.getClass().getSimpleName()));
              if ( alarm != null && alarm.getIsActive() ) {
                alarm = (Alarm) alarm.fclone();
                alarm.setIsActive(false);
                alarmDAO.put_(x, alarm);
              }
            } catch ( Throwable t ) {
              Logger logger = (Logger) x.get("logger");

              Throwable cause = t.getCause();
              while ( cause != null ) {
                if ( cause instanceof java.net.ConnectException ) {
                  Alarm alarm = new Alarm.Builder(x)
                    .setName(this.getClass().getSimpleName())
                    .setSeverity(foam.log.LogLevel.ERROR)
                    .setReason(AlarmReason.TIMEOUT)
                    .setNote(t.getMessage())
                    .build();
                  ((DAO) getX().get("alarmDAO")).put(alarm);
                  break;
                }
                cause = cause.getCause();
              }

              if ( cause == null) {
                // if not connection exception
                cause = t.getCause();
                logger.warning("FepWeb Onboarding Failed", cause);
              }
            }
          }
        }, "Onboards business to FepWeb if onboarding ucj is passed.");
      `
    }
  ]
});
