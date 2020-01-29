foam.CLASS({
  package: 'net.nanopay.liquidity.approvalRequest',
  name: 'PropertiesToUpdateView',
  extends: 'foam.u2.View',

  documentation: `Map objects view: Map = propObject,
  each propObject's [key value] pair is stored on propObject,
  where each key represents the property name, and
  where each corresponding value is well property value.
  
  has a max size container that adjusts to overflow scroll, with more properties.
  if propObject.value is an FObject/Object, view goes only one layer in to display `,

  css: `
    ^ .titleClass {
      text-align: center;
    }
    ^ .titlePosition {
      display: inline-block;
      padding: 1%;
    }
    ^ .valueProperty {
      text-align: left;
      display: inline-block;
    }
    ^ .nameProperty {
      text-align: left;
      margin-left: 2vw;
      margin-right: 0.5vw;
      display: inline-block;
    }
    ^ .containerFixed {
      height: 65%;
      position:relative;
    }
    ^ .boxBackground {
      width: 80vw;
      border-radius: 6px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08);
      border: solid 1px #e7eaec;
      background-color: #ffffff;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08);
      margin-left: 1vw;
      z-index: -1;
      overflow: scroll;
      max-height:100%
    }

    ^ .backPosition {
      float: left;
      margin-left: 1.2vw;
      margin-top: 4vh;
    }

  `,

  properties: [
    {
      name: 'propObject',
      postSet: function(o, n) {
        var sizeOfContainer = 0;
        var capitalize = (s) => {
          return s.charAt(0).toUpperCase() + s.slice(1);
        };
        for ( prop in n ) {
          if ( prop ) {
            let propName = capitalize(prop.split(/(?=[A-Z])/).join(' '));
            if ( typeof n[prop] === 'string' ) {
              this.propList_.push({ name: propName, value: n[prop] });
              sizeOfContainer += 50;
            } else {
              if ( n[prop].instance_ ) {
                for ( nestedProp in n[prop].instance_ ) {
                  if ( nestedProp ) {
                    let nestedPropName = capitalize(nestedProp.split(/(?=[A-Z])/).join(' '));
                    this.propList_.push({ name: `${propName} -> ${nestedPropName}`, value: n[prop][nestedProp] });
                    sizeOfContainer += 50;
                  }
                }
              } else {
                this.propList_.push({ name: propName, value: n[prop] });
                sizeOfContainer += 50;
              }
            }
          }
        };
        this.containerHeight_ = `${sizeOfContainer}px`;
      }
    },
    {
      class: 'Array',
      name: 'propList_'
    },
    {
      class: 'String',
      name: 'title',
    },
    {
      class: 'String',
      name: 'containerHeight_',
      value: '0%'
    },
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.addClass(this.myClass())
      .start().addClass('titleClass')
        .start().addClass('backPosition')
          .tag(this.BACK, {
            buttonStyle: foam.u2.ButtonStyle.TERTIARY,
            icon: 'images/back-icon.svg'
          })
        .end()
        .start('h1').addClass('titlePosition')
          .add(this.title)
        .end()
      .end()
      .start().addClass('containerFixed')
        .start().addClass('boxBackground')
          .start().style({ 'height': this.containerHeight_ })
            .add(this.propList_.map((p) => {
              return this.E()
                .start('h3').add(p.name).add(':').addClass('nameProperty').end()
                .start().add(p.value).addClass('valueProperty').end()
              .br();
            }))
          .end()
        .end()
      .end();
    }
  ],

  actions: [
    {
      name: 'back',
      code: function(x) {
        x.stack.back();
      }
    }
  ]
});
