foam.CLASS({
  name: 'RebindTest',
  extends: 'foam.u2.Controller',

  properties: [ 'a', 'b' ],

  methods: [
    function render() {
      var self = this;
    this.a = 'foo'; this.b = 'bar';
      this.add('A:', this.A, ' B: ', this.B);
//      this.add('add a:', this.a$, ', b:', this.b$).br();
      this.recall(function(a, b) {
        this.add('recall a:', a, ', b:', b).br();
      });
      this.recall(function(a) {
        this.add('recalla ', a).br();
      });
      this.recall(function(a) {
        if ( a === 'kgr' ) this.add('kgr').br();
      });
      this.recall(function(b) {
        this.add('recallb ', b).br();
      });
      this.start('ol').
        recall(function(b) {
          b.split(',').forEach(i => this.start('li').add(i).end());
        }, self).
      end();
    }
  ]
});
