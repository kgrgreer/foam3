/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
  package: 'net.nanopay.auth.ruler.predicate',
  name: 'IsUserInGroups',
  extends: 'foam.mlang.predicate.AbstractPredicate',

  implements: ['foam.core.Serializable'],

  documentation: 'Returns true if user is in one of the groups names',

  javaImports: [
    'foam.nanos.auth.User'
  ],

  properties: [
    {
      class: 'StringArray',
      name: 'groupNames'
    },
    {
      class: 'Boolean',
      name: 'ignoreSpidPrefix',
      value: true
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        var user = (User) obj;
        var group = user.getGroup();
        if ( getIgnoreSpidPrefix() && group.startsWith(user.getSpid() + "-") ) {
          group = group.substring(user.getSpid().length() + 1);
        }

        for ( var name : getGroupNames() ) {
          if ( group.equals(name) ) {
            return true;
          }
        }
        return false;
      `,
      code: function(o) {
        let group = o.group;
        if ( this.ignoreSpidPrefix && group.startsWith(user.spid + '-') ) {
          group = group.substring(user.spid.length + 1);
        }

        for ( const name in this.groupNames ) {
          if ( o.group === name ) {
            return true;
          }
        }
        return false;
      }
    }
  ]
});

