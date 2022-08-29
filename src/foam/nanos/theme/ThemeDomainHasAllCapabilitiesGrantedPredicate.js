/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.theme',
  name: 'ThemeDomainHasAllCapabilitiesGrantedPredicate',

  documentation: `
  Predicate that returns true if a ThemeDomain for the active theme on X
  has all top-level capabilities granted.

  Intended to be used on Menus.
  `,
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'javax.servlet.http.HttpServletRequest',
    'java.util.List',

    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.CrunchService',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Loggers',
    'foam.util.SafetyUtil'
  ],

  properties: [
    {
      name: 'returnFalseIfNoCapabilitiesFound',
      class: 'Boolean',
      documentation: `
      If set, this predicate will return false if there are no ThemeDomainCapabilityJunctions
      associated with the current ThemeDomain. (The default behavior is to return true.)
      `
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
      X x = (X) obj;

      DAO themeDomainDAO = (DAO)x.get("themeDomainDAO");
      CrunchService crunchService = (CrunchService)x.get("crunchService");

      // grab themedomain associated with this theme, if possible.
      HttpServletRequest request = x.get(HttpServletRequest.class);
      String domain = request != null ? request.getServerName() : null;
      ThemeDomain themeDomain = ! SafetyUtil.isEmpty(domain) ? (ThemeDomain) themeDomainDAO.find(domain) : null;

      // themedomain SHOULD have been granted at this point
      if ( themeDomain != null ) {
        // grab td/capability junctions
        // this is a SELECT ALL
        DAO dao = themeDomain.getCapabilities(x).getDAO();
        List capabilities = ((ArraySink)dao.select(new ArraySink())).getArray();

        // if no capabilities have been assigned:
        // default behavior is to return true
        // (same behavior as stream allMatch() on an empty list)
        // but this can be changed to false so that predicates don't
        // need to rely on ThemeDomainCapabilityJunctions being set
        if ( capabilities.isEmpty() ) {
          return ! getReturnFalseIfNoCapabilitiesFound();
        }

        // otherwise we need to find that ALL capabilities
        // have been granted to evaluate this to true
        return capabilities.stream()
                           .allMatch(o->isCapabilityGranted(x, crunchService, (Capability)o));
      }

      Loggers.logger(x, this).warning("Could not get ThemeDomain from X, returning false.");
      return false;
      `
    },
    {
      name: 'isCapabilityGranted',
      type: 'Boolean',
      args: 'foam.core.X x, CrunchService crunchService, Capability capability',
      javaCode: `
      UserCapabilityJunction ucj = crunchService.getJunction(x, capability.getId());
      return ucj != null && ucj.getStatus() == CapabilityJunctionStatus.GRANTED;
      `
    }
  ]
});
