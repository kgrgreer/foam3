foam.CLASS({
  package: 'net.nanopay.liquidity.ucjQuery.referencespec',
  name: 'ReferenceSpec',
  extends: 'Property',

  properties: [
    [ 'type', 'net.nanopay.liquidity.ucjQuery.referencespec.WeakReference' ],
    [
      'factory',
      function () {
        return net.nanopay.liquidity.ucjQuery.referencespec.WeakReference.create()
      }
    ],
    [
      'view',
      { class: 'net.nanopay.liquidity.ucjQuery.referencespec.ReferenceSpecPropertyView' }
    ],
    [
      'daoFactory',
      { class: 'Function' }
    ]
  ],

  methods: [
    function installInProto(proto) {
      if ( typeof this.daoFactory === 'function' ) {
        this.factory = function () {
          return net.nanopay.liquidity.ucjQuery.referencespec.WeakReference.create({
            dao: this.daoFactory.call(proto, this)
          })
        }
      }
      this.SUPER(proto);
      var self = this;
      Object.defineProperty(proto, self.name + '$find', {
        get: function classGetter() {
          if ( typeof this[self.name] !== 'object' ) {
            return null;
          }
          return this.__subContext__[this[self.name].targetDAOKey]
            .find(this[self.name].target);
        },
        configurable: true
      });

    }
  ]
});
