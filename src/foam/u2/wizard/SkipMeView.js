/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard',
  name: 'SkipMeView',
  extends: 'foam.u2.borders.NullBorder',
  documentation: `
    Hack to skip invisible wizardlet. Other alternative would be to cherry-pick
    the real fix for this, but that fix is based on weeks of wizard updates
    ahead of Release-v3.20 which may potentially introduce new issues.
  `,

  imports: [
    'wizardController'
  ],

  properties: [
    'callback'
  ],

  methods: [
    async function init () {
      this.callback && await this.callback();
      this.wizardController.next();
    }
  ]
});
