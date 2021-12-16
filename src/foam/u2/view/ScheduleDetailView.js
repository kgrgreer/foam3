/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'ScheduleDetailView',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.detail.SectionedDetailPropertyView'
  ],

  properties: [
    'data',
  ],
  methods: [
    function render() {
    var self = this;
      this
        .tag(this.SectionedDetailPropertyView, { data: this.data, prop: this.data.START_DATE })
        .tag(this.SectionedDetailPropertyView, { data: this.data, prop: this.data.REPEAT })
        .tag(this.SectionedDetailPropertyView, { data: this.data, prop: this.data.FREQUENCY })
        .tag(this.SectionedDetailPropertyView, { data: this.data, prop: this.data.DAY_OF_WEEK })
        .tag(this.SectionedDetailPropertyView, { data: this.data, prop: this.data.MONTHLY_CHOICE })
        .tag(this.SectionedDetailPropertyView, { data: this.data, prop: this.data.DAY_OF_MONTH })
        .tag(this.SectionedDetailPropertyView, { data: this.data, prop: this.data.VAGUE_FREQ })
        .tag(this.SectionedDetailPropertyView, { data: this.data, prop: this.data.EXPANDED_DAY_OF_WEEK })
        .tag(this.SectionedDetailPropertyView, { data: this.data, prop: this.data.ENDS })
        .tag(this.SectionedDetailPropertyView, { data: this.data, prop: this.data.ENDS_ON })
        .tag(this.SectionedDetailPropertyView, { data: this.data, prop: this.data.ENDS_AFTER })
    }
  ]

})
