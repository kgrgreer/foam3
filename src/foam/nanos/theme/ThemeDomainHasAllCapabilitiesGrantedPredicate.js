/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.theme',
  name: 'ThemeDomainHasAllCapabilitiesGrantedPredicate',

  documentation: 'Predicate that returns true if a ThemeDomain for the active theme on X has all top-level capabilities granted',
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
    'foam.util.SafetyUtil'
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
      X x = (X) obj;

      DAO themeDomainDAO = (DAO)x.get("themeDomainDAO");
      CrunchService crunchService = (CrunchService)x.get("crunchService");
      
      // grab theme from X
      Theme theme = (Theme) x.get("theme");
      if ( theme == null ) {
        theme = ((Themes) x.get("themes")).findTheme(x);
      }

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

        // if no capabilities have been assigned,
        // we behave as if all of them have been granted
        if ( capabilities.isEmpty() ) {
          return true;
        }

        // otherwise we need to find that ALL capabilities
        // have been granted to evaluate this to true
        return capabilities.stream()
                           .allMatch(o->isCapabilityGranted(x, crunchService, (Capability)o));
      }

      throw new RuntimeException("Can't determine themeDomain!!");
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
