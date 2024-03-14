/**
* @license
* Copyright 2024 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2.borders',
  name: 'AlertMessageBorder',
  extends: 'foam.u2.Element',
  documentation: ``,
  requires: ['foam.u2.dialog.InlineNotificationMessage'],
  css: `
    ^ {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
  `,
  properties: [
    // Reference to LocaleDAO? That way it can point to any message anywhere
    {
      class: 'String',
      name: 'source',
      adapt: function(_, n) {
        var lastIndex = n.lastIndexOf('.');
        var classObj = foam.lookup(n.substring(0, lastIndex));
        return classObj[n.substring(lastIndex + 1)];
      }
    },
    'futureContent_'
  ],
  methods: [
    function init() {
      this.addClass().tag('', {}, this.futureContent_$)
      .add(this.slot(function(source) {
        let e = this.E().style({ display: 'contents' });
        return source ?
        e.start(this.InlineNotificationMessage, { type: 'WARN' }).add(this.source).end() :
        e;
      }));
      this.content = this.futureContent_;
    }
  ],
});
