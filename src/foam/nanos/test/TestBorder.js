/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.test',
  name: 'TestBorder',
  extends: 'foam.u2.View',

  implements: ['foam.mlang.Expressions'],

  requires: [
    'foam.nanos.test.Test', 
    'foam.u2.view.ScrollTableView'
  ],

  css: `
    ^upper > span{
      margin: 0 10px 10px 0;
    }
    ^container{
      display: flex;
      flex-direction: column;
      height: 100%
    }
    ^upper{
      flex: 0 0 0;
      margin-bottom: 10px;
    }
    ^table{ 
      /* Add a fixed height and let flex extend to max possible */
      flex: 1;
      height: 424px;
    }
  `,

  properties: [
    'status',
    { class: 'Int', name: 'total' },
    { class: 'Int', name: 'passed' },
    { class: 'Int', name: 'failed' }
  ],

  methods: [
    function render() {
      this.SUPER();
      var self = this;
      this
        .addClass(this.myClass('container'))
        .start()
          .addClass(this.myClass('upper'))
          .start('span').add('Total: ', this.total$).end()
          .start('span').add('Passed: ', this.passed$).end()
          .start('span').add('Failed: ', this.failed$).end()
          .start('span').add('Status: ', this.status$).end()
        .end()
        .start(this.ScrollTableView, { data$: this.data$ })
          .addClass(this.myClass('table'))
        .end();
        

      this.data.select({
        put: function(t) {
          if ( t && t.enabled ) {
            self.total += 1;
          }
        }
      });
    },

    function runTests(dao) {
      var self = this;
      var startTime = Date.now();

      this.status = 'Testing...';
      this.passed = this.failed = 0;

      dao.select({
        put: function(t) {
          self.status = 'Testing: ' + t.id;
          try {
            t.run();
            self.passed += t.passed;
            self.failed += t.failed;
          } catch (e) {
            console.error('Failed testing', t.id, e);
            self.failed += 1;
          }
        },
        eof: function() {
          var duration = (Date.now() - startTime) / 1000;
          self.status = `${self.passed + self.failed} tests run in ${duration.toFixed(2)} seconds`;
        }
      });
    }
  ],

  actions: [
    function runAll() {
      this.runTests(this.data);
    },
    function runFailedTests() {
      this.runTests(this.data.where(this.GT(this.Test.FAILED, 0)));
    },
  ]
});
