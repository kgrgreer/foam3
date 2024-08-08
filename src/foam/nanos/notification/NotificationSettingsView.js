/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification',
  name: 'NotificationSettingsView',
  extends: 'foam.u2.View',

  documentation: 'Settings / Personal View',

  implements: [
    'foam.mlang.Expressions',
  ],

  imports: [
    'subject',
    'stack'
  ],

  requires: [
    'foam.nanos.notification.Notification',
    'foam.nanos.notification.NotificationSettingCitationView'
  ],

  messages: [
    { name: 'TITLE', message: 'Notification Preferences' },
  ],

  css: `
    ^ {
      display: flex;
      flex-direction:column;
      gap: 1rem;
    }
  `,

  properties: [
    {
      name: 'settingsMap',
      class: 'Map'
    },
    {
      // TODO: Add topics
      // name: 'topicsMap',
      // class: 'Map'
    }
  ],

  methods: [
    async function render() {
      let self = this;
      this.stack?.setCompact(true, this);
      this.stack?.setTitle(this.TITLE, this);
      await this.getImpliedNotificationSettings();
      let label = foam.nanos.notification.NotificationSetting.model_.label
      let keys = Object.keys(this.settingsMap).sort((a, b) => {
        return a == label ? -1 : (b == label ? 1 : 0); 
      })
      this
        .addClass()
        .forEach(keys, function(label) {
          let setting = self.settingsMap[label]
          this.tag(self.NotificationSettingCitationView, { label: label, setting_: setting, of: setting?.cls_ });
        });
    }
  ],

  listeners: [
    {
      name: 'getImpliedNotificationSettings',
      code: async function() {
        this.settingsMap = await this.subject.user.getImpliedNotificationSettings(this.__subContext__);
      }
    }
  ]
});
