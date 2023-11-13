/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'TopLevelCapabilityStatusUpdateNotification',
  extends: 'foam.nanos.notification.Notification',

  messages: [
    { name: 'NOTIFICATION_BODY_P1', message: 'Your capability \"'},
    { name: 'NOTIFICATION_BODY_P2', message: '\" has been set to the status '}
  ],

  imports: [
    'translationService'
  ],

  javaImports: [
    'static foam.i18n.TranslationService.t'
  ],

  properties: [
    {
      class: 'String',
      name: 'capabilityName'
    },
    {
      class: 'String',
      name: 'capabilitySource'
    },
    {
      class: 'String',
      name: 'junctionSource'
    },
    {
      class: 'String',
      name: 'junctionStatus'
    },
    {
      name: 'body',
      transient: true,
      javaGetter: `
        var x = foam.core.XLocator.get();
        String t1 = t(x, getClassInfo().getId()+ ".NOTIFICATION_BODY_P1", this.NOTIFICATION_BODY_P1);
        String capName = t(x, getCapabilitySource(), getCapabilityName());
        String t2 = t(x, getClassInfo().getId()+ ".NOTIFICATION_BODY_P2", this.NOTIFICATION_BODY_P2) + getJunctionStatus();
        String status = t(x, getJunctionSource(), getJunctionStatus());

        return t1 + capName + t2 + status;
      `,
      getter: function() {
        var t1 = this.translationService.getTranslation(foam.locale, `${this.id}.NOTIFICATION_BODY_P1`, this.NOTIFICATION_BODY_P1);
        var capName = this.translationService.getTranslation(foam.locale, this.capabilitySource, this.capabilityName);
        var t2 = this.translationService.getTranslation(foam.locale, `${this.id}.NOTIFICATION_BODY_P2`, this.NOTIFICATION_BODY_P2);
        var status = this.translationService.getTranslation(foam.locale, this.junctionSource, this.junctionStatus);

        return t1 + capName + t2 + status;
      }
    }
  ]
});
