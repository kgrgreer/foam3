/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.dig.drivers',
  name: 'DigFormatDriver',
  abstract: true,
  flags: ['java'],

  javaImports: [
    'foam.core.*',
    'foam.dao.AbstractDAO',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.lib.csv.CSVOutputter',
    'foam.lib.json.OutputterMode',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.boot.NSpec',
    'foam.nanos.dig.*',
    'foam.nanos.dig.exception.*',
    'foam.nanos.http.*',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger',
    'foam.mlang.MLang',
    'foam.mlang.predicate.Predicate',
    'foam.util.SafetyUtil',
    'java.io.PrintWriter',
    'java.util.ArrayList',
    'java.util.Arrays',
    'java.util.List',
    'javax.servlet.http.HttpServletResponse'
  ],

  constants: [
    {
      name: 'MAX_PAGE_SIZE',
      type: 'Long',
      value: 1000
    }
  ],

  properties: [
    {
      name: 'format',
      class: 'Enum',
      of: 'foam.nanos.http.Format'
    },
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      transient: true,
      javaCloneProperty: '//noop',
      javaFactory: `
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, (Logger) getX().get("logger"));
      `
    }
  ],

  methods: [
    {
      name: 'parseFObjects',
      type: 'List',
      javaThrows: [
        'java.lang.Exception'
      ],
      args: [
        { name: 'x', type: 'X' },
        { name: 'dao', type: 'DAO' },
        { name: 'data', type: 'String' }
      ],
      javaCode: `
        throw new RuntimeException("Unimplemented parse method");
      `
    },
    {
      name: 'outputFObjects',
      args: [
        { name: 'x', type: 'X' },
        { name: 'dao', type: 'DAO' },
        { name: 'fobjects', type: 'List' }
      ],
      javaCode: `
        throw new RuntimeException("Unimplemented output method");
      `
    },
    {
      name: 'put',
      args: [ { name: 'x', type: 'X' } ],
      javaThrows: [
        'java.lang.Exception'
      ],
      javaCode: `
        DAO dao = getDAO(x);
        if ( dao == null )
          return;

        HttpParameters p = x.get(HttpParameters.class);
        String data = p.getParameter("data");

        // Check if the data is empty
        if ( SafetyUtil.isEmpty(data) ) {
          DigUtil.outputException(x, new EmptyDataException.Builder(x).build(), getFormat());
          return;
        }

        List fobjects = parseFObjects(x, dao, data);
        if ( fobjects == null )
          return;

        for ( int i = 0 ; i < fobjects.size() ; i++ ) {
          fobjects.set(i, daoPut(dao, (FObject) fobjects.get(i)));
        }

        outputFObjects(x, dao, fobjects);

        PrintWriter out = x.get(PrintWriter.class);
        out.println();
        out.flush();
        getLogger().debug("put.success");

        HttpServletResponse resp = x.get(HttpServletResponse.class);
        resp.setStatus(HttpServletResponse.SC_OK);
      `
    },
    {
      name: 'select',
      args: [ { name: 'x', type: 'X' } ],
      javaCode: `
      HttpParameters p = x.get(HttpParameters.class);
      HttpServletResponse resp = x.get(HttpServletResponse.class);
      Command command = (Command) p.get(Command.class);
      String id = p.getParameter("id");
      String q = p.getParameter("q");
      String limit = p.getParameter("limit");
      String skip = p.getParameter("skip");
      String daoName = p.getParameter("dao");

      if ( SafetyUtil.isEmpty(daoName) ) {
        return;
      }

      DAO dao = getDAO(x);
      if ( dao == null )
        return;

      ClassInfo cInfo = dao.getOf();
      Predicate pred = new WebAgentQueryParser(cInfo).parse(x, q);
      getLogger().debug(pred.toString());
      dao = dao.where(pred);

      PropertyInfo idProp = (PropertyInfo) cInfo.getAxiomByName("id");
      dao = ! SafetyUtil.isEmpty(id) ? dao.where(MLang.EQ(idProp, id)) : dao;

      if ( ! SafetyUtil.isEmpty(skip) ) {
        long s = Long.valueOf(skip);
        if ( s > 0 && s != AbstractDAO.MAX_SAFE_INTEGER ) {
          dao = dao.skip(s);
        }
      }

      long pageSize = DigFormatDriver.MAX_PAGE_SIZE;
      if ( ! SafetyUtil.isEmpty(limit) ) {
        long l = Long.valueOf(limit);
        if ( l != AbstractDAO.MAX_SAFE_INTEGER && l < pageSize) {
          pageSize = l;
        }
      }
      dao = dao.limit(pageSize);

      List fobjects = ((ArraySink) dao.select(new ArraySink())).getArray();
      getLogger().debug("Number of FObjects selected: " + fobjects.size());

      outputFObjects(x, dao, fobjects);

      PrintWriter out = x.get(PrintWriter.class);
      out.println();
      out.flush();
      getLogger().debug("select.success");

      resp.setStatus(HttpServletResponse.SC_OK);
      `
    },
    {
      name: 'remove',
      args: [ { name: 'x', type: 'X' } ],
      javaCode: `
      HttpParameters p = x.get(HttpParameters.class);
      String id = p.getParameter("id");

      DAO dao = getDAO(x);
      if ( dao == null )
        return;

      if ( SafetyUtil.isEmpty(id) ) {
        DigUtil.outputException(x, new UnknownIdException(), getFormat());
        return;
      }

      ClassInfo cInfo = dao.getOf();
      PropertyInfo idProp = (PropertyInfo) cInfo.getAxiomByName("id");
      Object idObj = idProp.fromString(id);
      FObject targetFobj = dao.find(idObj);

      if ( targetFobj == null ) {
        DigUtil.outputException(x, new UnknownIdException(), getFormat());
        return;
      }

      dao.remove(targetFobj);
      DigUtil.outputException(x, new DigSuccessMessage("Success"), getFormat());

      getLogger().debug("remove.success");
      `
    },
    {
      name: 'getDAO',
      type: 'DAO',
      args: [ { name: 'x', type: 'X' } ],
      javaCode: `
      HttpParameters p = x.get(HttpParameters.class);
      String daoName = p.getParameter("dao");

      if ( SafetyUtil.isEmpty(daoName) ) {
        DigUtil.outputException(x, new DAORequiredException(), getFormat());
        return null;
      }

      DAO nSpecDAO = (DAO) x.get("AuthenticatedNSpecDAO");
      NSpec nspec = (NSpec) nSpecDAO.find(daoName);
      if ( nspec == null || ! nspec.getServe() ) {
        DigUtil.outputException(x, new DAONotFoundException(daoName), getFormat());
        return null;
      }

      // Check if the user is authorized to access the DAO.
      try {
        nspec.checkAuthorization(x);
      } catch (AuthorizationException e) {
        DigUtil.outputFObject(x, e, 403, getFormat());
        return null;
      }

      DAO dao = (DAO) x.get(daoName);
      if ( dao == null ) {
        DigUtil.outputException(x, new DAONotFoundException(daoName), getFormat());
        return null;
      }

      return dao.inX(x);
      `
    },
    {
      name: 'daoPut',
      type: 'FObject',
      args: [ { name: 'dao', type: 'DAO' }, { name: 'obj', type: 'FObject' } ],
      synchronized: true,
      javaCode: `
      FObject nu = obj;
      
      // adding system context in case if user has permission to update but not to read
      FObject old = dao.inX(getX()).find(obj);
      if ( old != null ) {
        nu = old.fclone();
        nu.copyFrom(obj);
      }

      try {
        return dao.put(nu);
      } catch ( ValidationException ve ) {
        throw new DAOPutException(ve.getMessage(), ve);
      } catch ( CompoundException ce ) {
        // FObject.validate(x) can collect all validation exceptions into a
        // CompoundException but we just need to return the first to preserve
        // the existing behavior.
        var clientEx = ce.getClientRethrowException();
        if ( clientEx instanceof ValidationException ) {
          throw new DAOPutException(clientEx.getMessage(), clientEx);
        }
        throw ce;
      }
      `
    }
  ]
});
