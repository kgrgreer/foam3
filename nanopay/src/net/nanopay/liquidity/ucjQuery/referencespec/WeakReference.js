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
  name: 'WeakReference',

  documentation: `
    A WeakReference is a reference with variable type. A property holding a
    WeakReference should be of class ReferenceSpec.
  `,

  properties: [
    {
      class: 'Class',
      name: 'of'
    },
    {
      class: 'String',
      name: 'targetDAOKey',
      expression: function(of) {
        if ( ! of ) {
          console.error("invalid 'of' for property with targetDAOKey", this.name);
        }
        return foam.String.daoize(of.name);
      }
    },
    {
      // TODO: If moved to foam.core, remove class and upgrade with a refinement
      class: 'foam.dao.DAOProperty',
      name: 'dao'
    },
    {
      name: 'target',
      value: null,
      preSet: function(ol, nu) {
        return this.of.isInstance(nu) ?
          nu.id : nu;
      },
      expression: function(of) {
        return of ? of.ID.value : null;
      }
    }
  ],
});
