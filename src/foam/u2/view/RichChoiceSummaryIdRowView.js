/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'RichChoiceSummaryIdRowView',
  extends: 'foam.u2.CitationView',

  documentation: 'Appends object id after object summary in RichChoiceViews',

  methods: [
    function render() {
      var summary = this.data.toSummary() + ' ('+this.data.id+')';
      return this
        .start()
        .addClasses([this.myClass('row'), 'p-legal-light'])
        .translate(summary || ('richChoiceSummary.' + this.data.cls_.id + '.' + this.data.id), summary)
        .end();
    }
  ]
});
