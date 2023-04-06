foam.CLASS({
  name: 'RebindTest',
  extends: 'foam.u2.Controller',

  properties: [ 'a', 'b' ],

  methods: [
    function render() {
      this.dynamic({
        pre:  function()     { console.log('pre-react'); },
        code: function(a, b) { console.log('React: ', a, b); },
        post: function()     { console.log('post-react'); }
      });

      this.a = 'foo'; this.b = 'a,b,c,d,efg';
      this.add('A:', this.A, ' B: ', this.B).br().br();

      this.add(this.dynamic(function(a, b) {
        this.add('Test A+B a:', a, ', b:', b).br();
      }));

      this.add(function(a) {
        this.add('TEST A: ', a).br();
      });

      this.add(function(a) {
        if ( a === 'show' ) this.add('SHOW').br();
      });

      this.add(function(b) {
        this.add('TEST B: ', b).br();
      });

      this.add('OL:').start('ol').
        add(this.dynamic(function(b) {
          b.split(',').forEach(i => this.start('li').add(i).end());
        })).
      end().

      add('END').br();
    }
  ],

  listeners: [
    function invalidate() { this.clearProperty('value'); this.value; }
  ]
});
