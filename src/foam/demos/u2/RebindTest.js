foam.CLASS({
  name: 'RebindTest',
  extends: 'foam.u2.Controller',

  properties: [ 'a', 'b' ],

  methods: [
    function render() {
    this.a = 'foo'; this.b = 'bar';
      this.add('A:', this.A, ' B: ', this.B);
//      this.add('add a:', this.a$, ', b:', this.b$).br();
      this.recall(function(a, b) {
        this.add('recall a:', a, ', b:', b).br();
      });
      this.recall(function(a) {
        this.add('recalla ', a).br();
      });
      this.recall(function(b) {
        this.add('recallb ', b).br();
      });
    }
  ]
});
