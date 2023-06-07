/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'AnalyticsSaver',
  extends: 'foam.u2.wizard.data.ProxySaver',

  mixins: [
    'foam.nanos.analytics.Analyticable'
  ],

  properties: [
    {
      class: 'foam.u2.wizard.PathProperty',
      name: 'logDataPath'
    },
    {
      class: 'String',
      name: 'analyticsName'
    },
    {
      class: 'StringArray',
      name: 'tags'
    }
  ],

  methods: [
    async function save(data) {
      const extra = {};
      if ( this.logDataPath ) {
        extra[this.logDataPath.name] = this.logDataPath.f(data);
      }
      this.report(this.analyticsName, this.tags,
        { extra: foam.json.stringify(extra) });

      return await this.delegate.save(data);
    }
  ]
});
