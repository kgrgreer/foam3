/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

/*
FYI: https://exploringjs.com/impatient-js/ch_dynamic-code-evaluation.html#eval
*/

foam.CLASS({
  package: 'foam.u2',
  name: 'ViewReloader',
  extends: 'foam.u2.Controller',

  imports: [ 'classloader' ],

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'view'
    },
    'viewArea',
    'lastModel'
  ],

  methods: [
    function render() {
      this/*.add(this.RELOAD).br().br()*/.start('span',{}, this.viewArea$).tag(this.view).end();
      //this.delayedReload();
    }
  ],

  actions: [
    function reload() {
      delete foam.__context__.__cache__[this.view.class];
      delete this.classloader.latched[this.view.class];
      delete this.classloader.pending[this.view.class];
      // TODO: remove old stylesheet

      this.classloader.load(this.view.class).then((cls)=>{

        foam.__context__.__cache__[this.view.class] = cls;
        if ( foam.json.Compact.stringify(cls.model_.instance_) != foam.json.Compact.stringify(this.lastModel && this.lastModel.instance_) ) {
          console.log('reload');
          this.lastModel = cls.model_;
          this.viewArea.removeAllChildren();
          this.viewArea.tag(this.view);
        } else {
//          console.log('no reload');
        }
      });

      this.delayedReload();
    }
  ],

  listeners: [
    {
      name: 'delayedReload',
      isMerged: true,
      mergeDelay: 200,
      code: function() { this.reload(); /*this.delayedReload();*/ }
    }
  ]
});


foam.CLASS({
  package: 'foam.demos.examples',
  name: 'CodeView',
  extends: 'foam.u2.tag.TextArea',

  properties: [
    [ 'cols', 120 ]
  ],

  methods: [
    function render() {
      this.SUPER();
      var updateRows = () => this.setAttribute('rows', Math.max(4, this.data.split('\n').length+2));
      this.data$.sub(updateRows);
      updateRows();
    }
  ]
});


foam.CLASS({
  package: 'foam.demos.examples',
  name: 'TextView',
  extends: 'foam.u2.ReadWriteView',

  methods: [
    function toReadE() {
      return foam.u2.HTMLView.create({data$: this.data$}, this);
    },

    function toWriteE() {
      this.data$.sub(this.onDataLoad);
      return foam.u2.tag.TextArea.create({rows: 20, cols: 120, escapeTextArea: false, data$: this.data$}, this);
    }
  ]
});


foam.CLASS({
  package: 'foam.demos.examples',
  name: 'Example',

  classes: [
    {
      name: 'CitationView',
      extends: 'foam.u2.View',

      requires: [
        'foam.demos.examples.Example',
        'foam.u2.Element'
      ],

      imports: [
        'globalScope',
        'selected'
      ],

      properties: [
        'dom'
      ],

      css: `
        ^ { margin-bottom: 36px; }
        ^ .property-text { border: none; padding: 10 0; }
        ^ .property-code { margin-bottom: 12px; }
        ^ .property-title { float: left; }
        ^ .property-id { float: left; margin-right: 12px; }
      `,

      methods: [
        function render() {
          this.SUPER();

          var self = this;

          this.
            addClass(this.myClass()).
            // show(this.selected$.map(s => ! s || s == self.data.id)).
            style({
              width: '100%',
              xxxborder: '2px solid black',
              'border-radius': '3px',
              'padding-bottom': '24px'
            }).
            start('hr').style({width: '47%', float: 'left', display: 'block'}).end().
            br().
            start('h3').
              start('a').attrs({name: self.data.id}).end().
              add(this.Example.ID, ' ', this.Example.TITLE).
            end().
            br().
            add(this.Example.TEXT).
            br().
            add(this.Example.CODE).
            br().
            start('span').style({'font-weight': 500}).add('Output:').end().
            start().
              style({border: '1px solid black', padding: '8px'}).
              tag('div', {}, this.dom$).
            end();

            this.onload.sub(this.run.bind(this));
            this.onDetach(this.data.code$.sub(this.run.bind(this)));
        }
      ],

      actions: [
        function run() {
          var self = this;
          this.dom.removeAllChildren();
          var scope = {
            E: function(opt_nodeName) {
              return self.Element.create({nodeName: opt_nodeName});
            },
            log: function() {
              var args = [];
              for ( var i = 0 ; i < arguments.length ; i++ ) {
                if ( i ) args.push(' ');
                if ( arguments[i] == false )
                  args.push('false');
                else
                  args.push(arguments[i]);
              }

              self.dom.add.apply(self.dom, args);
              self.dom.br();
            },
            print: function() {
              console.log('deprecated use of print(). Use log() isntead.');
              self.dom.add.apply(self.dom, arguments);
              self.dom.br();
            },
            add: function() {
              return self.dom.add.apply(self.dom, arguments);
            },
            start: function() {
              return self.dom.start.apply(self.dom, arguments);
            },
            tag: function() {
              return self.dom.start.apply(self.dom, arguments);
            }
          };

          with ( scope ) {
            with ( this.globalScope ) {
              try {
                eval(self.data.code);
              } catch (x) {
                self.data.error = true;
                scope.log(x);
              }
            }
          }
        }
      ]
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'id',
      displayWidth: 10,
      comparePropertyValues: function(id1, id2) {
        var a1 = id1.split('.'), a2 = id2.split('.');
        for ( var i = 0 ; i < Math.min(a1.length, a2.length)-1 ; i++ ) {
          var c = foam.util.compare(parseInt(a1[i]), parseInt(a2[i]));
          if ( c ) return c;
        }
        return foam.util.compare(a1.length, a2.length);
      },
      view: {
        class: 'foam.u2.ReadWriteView', nodeName: 'span'
      }
    },
    {
      class: 'String',
      name: 'title',
      displayWidth: 123,
      view: {
        class: 'foam.u2.ReadWriteView', nodeName: 'span'
      }
    },
    {
      class: 'String',
      name: 'text',
      adapt: function(_, text) { return text.trim(); },
      documentation: 'Description of the script.',
      view: 'foam.demos.examples.TextView'
    },
    {
      class: 'Boolean',
      name: 'error'
    },
    {
      class: 'Code',
      name: 'code',
      adapt: function(_, s) {
        if ( foam.String.isInstance(s) ) return s.trim();
        s         = s.toString();
        var start = s.indexOf('{');
        var end   = s.lastIndexOf('}');
        return ( start >= 0 && end >= 0 ) ? s.substring(start + 2, end) : '';
      },
      view: 'foam.demos.examples.CodeView'
    }
  ]
});


foam.CLASS({
  package: 'foam.demos.examples',
  name: 'Controller',
  extends: 'foam.u2.Controller',

  requires: [
    'foam.demos.examples.Example',
    'foam.dao.EasyDAO',
    'foam.u2.DAOList'
  ],

  css: `
    ^ { background: white; }
    ^index {
      background: #f6f6f6;
      margin-right: 20px;
      min-width: 400px;
      padding: 6px 0;
    }
    ^ .selected {
      background: #ddf;
    }
    ^ .error {
      color: red;
    }
  `,

  exports: [
    'globalScope',
    'selected'
  ],

  properties: [
    { class: 'Int', name: 'count' },
    { class: 'Int', name: 'exampleCount' },
    { class: 'Int', name: 'errorCount' },
    'selected',
    'testData',
    {
      name: 'data',
      factory: function() {
        return this.EasyDAO.create({
          of: foam.demos.examples.Example,
          daoType: 'MDAO',
          cache: true,
          testData: this.createTestData()
        }).orderBy(foam.demos.examples.Example.ID);
      },
      view: {
        class: 'foam.u2.DAOList',
        rowView: { class: 'foam.demos.examples.Example.CitationView' }
      }
    },
    {
      name: 'globalScope',
      factory: function() { return { }; }
    }
  ],

  methods: [
    async function render() {
      this.SUPER();

      this.testData += await fetch('u2').then(function(response) {
        return response.text();
      });

      this.testData += await fetch('faq').then(function(response) {
        return response.text();
      });

      this.testData = await fetch('validation').then(function(response) {
        return response.text();
      });

      this.testData += await fetch('examples').then(function(response) {
        return response.text();
      });

      this.testData += await fetch('dao').then(function(response) {
        return response.text();
      });

      var self = this;
      this.
        addClass(this.myClass()).
        start('h1').
          add('FOAM by Example').
        end().
        start().
          style({ display: 'flex' }).
          start().
            addClass(this.myClass('index')).
            start().
            select(this.data, function(e) {
              self.count++;
              if ( e.error ) self.errorCount++;
              if ( e.code ) self.exampleCount++;
              return this.E('a')
                .attrs({href: '#' + e.id})
                .enableClass('error', e.error$)
                .style({display: 'block', padding: '4px', 'padding-left': (16 * e.id.split('.').length  - 12)+ 'px'})
                .add(e.id, ' ', e.title)
                .enableClass('selected', self.selected$.map(s => s == e.id))
                .on('mouseenter', () => { self.selected = e.id; })
                .on('mouseleave', () => { if ( self.selected == e.id ) self.selected = null; })
                ;
            }).
            end().
            br().
            add(this.count$, ' sections, ', this.exampleCount$, ' examples, ', this.errorCount$, ' errors').
          end().
          start().
            addClass(this.myClass('body')).
            add(this.DATA).
          end().
        end();
    },

    function createTestData() {
      s = this.testData;
      var a  = [];
      var id = [];
      var e;
      var mode = 'text';
      s = s.split('\n').forEach(l => {
        if ( l.startsWith('##') ) {
//          e = this.Example.create({id: i++, title: l.substring(3)});
          var depth = l.substring(2).match(/^ */)[0].length;
          id.length = depth;
          id[depth-1] = (id[depth-1] || 0)+1;
          e = {id: id.join('.') + '.', title: l.substring(3), code: '', text: ''};
          a.push(e);
          mode = 'text';
        } else if ( l.startsWith('--') ) {
          mode = 'code';
        } else if ( ! e ) {
        } else if ( mode == 'text' ) {
          e.text += l + '\n';
        } else {
          e.code += l + '\n';
        }
      });
      return a;
    }
  ]
});
