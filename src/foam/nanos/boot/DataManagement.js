/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.boot',
  name: 'DataManagement',
  extends: 'foam.u2.Router',

  documentation: 'Data Management UI for browsing all DAOs.',

  classes: [
    {
      name: 'DAOView',
      extends: 'foam.u2.Controller',

      requires: [
        'foam.comics.BrowserView',
        'foam.comics.v2.DAOBrowseControllerView',
        'foam.u2.view.AltView'
      ],

      messages: [
        { name: 'CONTROLLER1', message: 'Controller 1' },
        { name: 'CONTROLLER2', message: 'Controller 3' }
      ],

      properties: [
        'data'
      ],

      methods: [
        function render() {
          this.document.title = 'Data Management / ' + this.daoKey;

          this
          .tag(this.AltView, {
            data$: this.data$,
            views: [
              [
                { class: this.BrowserView },
                this.CONTROLLER1
              ],
              [
                { class: foam.comics.v3.DAOController, showNav: false },
                this.CONTROLLER2
              ]
            ],
              selectedView: this.CONTROLLER2
          });
        }
      ]
    },
    {
      name: 'DAOListView',
      extends: 'foam.u2.Controller',

      mixins: [ 'foam.u2.memento.Memorable' ],

      imports: [ 'nSpecDAO', 'route' ],

      css: `
        ^ {
          padding: 6px;
        }
        ^dao, ^header {
          display: inline-block;
          font-size: smaller;
          margin: 2px;
          padding: 2px;
          width: 220px;
        }
        ^dao {
          color: $grey500;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        ^dao:hover {
          background: lightgray;
        }
        ^section {
          display: inline-grid;
          vertical-align: baseline;
        }
        ^header {
          background: $grey700;
          color:$white;
          font-weight: 800;
        }
        ^footer {
          color: $grey500;
          padding-top: 12px;
        }
        /* TODO: scope this better so it doesn't affect nested AltViews also */
        .foam-u2-view-AltView .property-selectedView {
          margin-left: 32px;
        }
      `,

      properties: [
        {
          name: 'data',
          factory: function() {
           return this.nSpecDAO;
          }
        },
        {
          class: 'Int',
          name: 'daoCount'
        },
        {
          class: 'Int',
          name: 'totalDAOCount'
        },
        {
          name: 'filteredDAO',
          factory: function() {
           var dao = this.data.where(
             this.AND(
               this.CONTAINS(foam.nanos.boot.NSpec.ID, 'DAO'),
               this.EQ(foam.nanos.boot.NSpec.SERVE,     true)
             ));

           /* ignoreWarning */
           dao.select(this.COUNT()).then(c => this.totalDAOCount = this.daoCount = c.value);

           return dao;
          }
        },
        {
          class: 'String',
          name: 'search',
          view: {
           class: 'foam.u2.SearchField',
           onKey: true
          },
          memorable: true,
          preSet: function(o, n) { this.daoCount = 0; return n; }
        }
      ],

      methods: [
        function render() {
          this.SUPER();

          this.document.title = 'Data Management';

          var self          = this;
          var currentLetter = '';
          var section;

          this.addClass().
          start().
            style({ 'height': '56px'}).
            start().
              style({ 'font-size': '2.6rem', 'width': 'fit-content', 'float': 'left', 'padding-top': '10px' }).
              add('Data Management').
            end()
            .start()
            .style({ 'width': 'fit-content', 'float': 'right', 'margin-right': '40px', 'margin-top': '12px' })
                .start(this.SEARCH).focus().end()
                .addClass('foam-u2-search-TextSearchView')
                .addClass(this.myClass('foam-u2-search-TextSearchView'))
              .end()
            .end()
          .end();

          var updateSections = [];
          var i = 0;

          this.filteredDAO.select().then(function(specs) {
            specs.array.sort(function(o1, o2) { return foam.String.compare(o1.id.toUpperCase(), o2.id.toUpperCase())}).forEach(function(spec) {
              var label = foam.String.capitalize(spec.id.substring(0, spec.id.length-3));
              var l     = label.charAt(0);

              if ( l != currentLetter ) {
                let lSection;
                let showSection = foam.core.SimpleSlot.create({value: true});
                i = updateSections.length;

                var updateSlot = foam.core.SimpleSlot.create({value: false});
                updateSections.push(updateSlot);

                updateSections[i].sub(function() {
                  // first child is a header
                  for ( var j = 1 ; j < lSection.childNodes.length ; j++ ) {
                    if ( lSection.childNodes[j].shown ) {
                      showSection.set(true);
                      return;
                    }
                  }
                  showSection.set(false);
                });

                currentLetter = l;

                section = self.start('span')
                  .show(showSection)
                  .addClass(self.myClass('section'))
                  .start('span')
                    .addClass(self.myClass('header'))
                    .add(l)
                  .end();

                lSection = section;
              }

              var localI    = i.valueOf();
              var localShow = foam.core.SimpleSlot.create({value: true});

              section
                .start('span')
                  .show(localShow)
                  .addClass(self.myClass('dao'))
                  .add(label)
                  .attrs({title: spec.description})
                  .on('click', function() {
                    self.route = spec.id;
                  });

                  self.search$.sub(function() {
                    var contains = false;
                    if ( ! self.search ) {
                      contains = true;
                    } else if ( label.toLowerCase().includes(self.search.toLowerCase()) ) {
                      contains =  true;
                    } else if ( ! contains && spec.keywords && spec.keywords.length > 0 ) {
                      for ( var k in spec.keywords ) {
                        if ( k.toLowerCase().includes(self.search.toLowerCase()) ) {
                          contains  = true;
                          break;
                        }
                      }
                    }

                    if ( contains ) self.daoCount++;
                    localShow.set(contains);
                    updateSections[localI].set(! updateSections[localI].get());
                  });
            });
            self.start().addClass(self.myClass('footer')).add(self.daoCount$, ' of ', self.totalDAOCount$, ' shown').end();
          });
        }
      ]
    },
    {
      name: 'DAOUpdateControllerView',
      extends: 'foam.comics.DAOUpdateControllerView',

      documentation: 'Same as regular UpdateController except it starts in EDIT mode',

      properties: [
        {
          name: 'controllerMode',
          factory: function() {
            return this.ControllerMode.EDIT;
          }
        }
      ]
    },
  ],

  methods: [
    function render() {
      this.SUPER();

      var self = this;

      // TODO: Should move to DAOView and these sub-Models should move there also
      x.register(this.DAOUpdateControllerView, 'foam.comics.DAOUpdateControllerView');
      x.register(foam.u2.DetailView,           'foam.u2.DetailView');

      this.dynamic(function(route) {
        self.removeAllChildren(); // TODO: not needed in U3

        if ( route ) {
          this.tag(self.DAOView, {data: this.__context__[route]});
        } else {
          this.tag(self.DAOListView);
        }
      });
    }
  ]
});
