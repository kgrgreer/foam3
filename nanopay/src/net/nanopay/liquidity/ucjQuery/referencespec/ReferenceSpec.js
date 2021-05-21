/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

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
      // TODO: update factory when this is changed
    ]
  ],

  methods: [
    function installInProto(proto) {
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
