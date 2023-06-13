foam.CLASS({
  name: 'RebindTest',
  extends: 'foam.u2.Controller',

  properties: [ 'a', 'b' ],

  methods: [
    function render() {
      this.a = 'foo'; this.b = 'a,b,c';
      this.add('A:', this.A, ' B: ', this.B).br().br();

      this.dynamic({
        pre:  function()     { console.log('pre-react'); },
        code: function(a, b) { console.log('React: ', a, b); },
        post: function()     { console.log('post-react'); }
      });


      this.add(this.dynamic(function(a, b) {
        this.add('Dynamic Test A+B a:', a, ', b:', b).br();
      }));

      this.add(function(a, b) {
        this.add('Function Test A+B a:', a, ', b:', b).br();
      });

      this.add(function(a) {
        this.add('TEST A: ', a).br();
      });

      this.add('Show (if a == "show"): ').add(function(a) {
        if ( a === 'show' ) this.add('SHOWING');
      }).br();

      this.add(function(b) {
        this.add('TEST B: ', b).br();
      });

      this.add('Dynamic OL:').start('ol').
        add(this.dynamic(function(b) {
          b.split(',').forEach(i => this.start('li').add(i).end());
        })).
      end();

      this.add('Function OL:').start('ol').
        add(function(b) {
          b.split(',').forEach(i => this.start('li').add(i).end());
        }).
      end();

      this.b$.sub(() => { console.log('****', this.b$.get(), this.b); });
      this.add('select:').tag(foam.u2.tag.Select, {choices$: this.b$.map(b => b.split(',')) });

      this.add('END').br();
    }
  ],

  listeners: [
    function invalidate() { this.clearProperty('value'); this.value; }
  ]
});
