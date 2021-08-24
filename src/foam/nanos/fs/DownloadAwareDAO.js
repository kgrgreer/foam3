/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.fs',
  name: 'DownloadAwareDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Decorator DAO that save download aware as file.',

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.User',
    'foam.mlang.sink.Count',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      class: 'String',
      name: 'daoKey'
    },
    {
      class: 'StringArray',
      name: 'ownerProp',
      documentation: `
        Property of the object on put_() to assign as the file owner.

        Note: Class of StringArray instead of String to support falling back.
        For example, ownerProp=['user','agent'] to try assigning the 'user' or
        'agent' as the owner of the file.
      `
    },
    {
      class: 'foam.mlang.ExprProperty',
      name: 'idPermission',
      documentation: 'The last part of the permission string. Please see getPermissionString(obj).',
      javaFactory: 'return new foam.mlang.Constant("*");'
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        var ret = getDelegate().put_(x, obj);

        var auth = (AuthService) x.get("auth");
        var owner = getOwner(x, ret);
        if ( owner != null && auth.checkUser(x, owner, getPermissionString(ret)) ) {
          if ( ret instanceof DownloadAware ) {
            var id = ret.getProperty("id");
            var file = ((DownloadAware) ret).toFile(x);
            if ( file != null ) {
              var fileDAO = ((DAO) x.get("fileDAO")).where(INSTANCE_OF(LinkedFile.class));
              var count = (Count) fileDAO.where(AND(
                EQ(LinkedFile.OBJ_ID, id),
                EQ(LinkedFile.TARGET_DAO_KEY, getDaoKey()))
              ).limit(1).select(new Count());

              if ( count.getValue() == 0 ) {
                var linkedFile = new LinkedFile.Builder(x)
                  .setOwner(owner.getId())
                  .setObjId(id)
                  .setTargetDaoKey(getDaoKey())
                  .build();
                linkedFile.copyFrom(file);
                fileDAO.put_(x, linkedFile);
              }
            }
          }
        }
        return ret;
      `
    },
    {
      name: 'getPermissionString',
      type: 'String',
      args: [ 'FObject obj' ],
      javaCode: `
        var idPerm = getIdPermission().f(obj);
        return getDaoKey() + ".downloadaware." + String.valueOf(idPerm);
      `
    },
    {
      name: 'getOwner',
      type: 'User',
      args: [ 'Context x', 'FObject obj' ],
      javaCode: `
        User owner = null;
        var  dao   = (DAO) x.get("localUserDAO");
        for ( var propName : getOwnerProp() ) {
          if ( owner != null ) break;

          var ownerId = obj.getProperty(propName);
          if ( ownerId != null ) {
            owner = (User) dao.find(ownerId);
          }
        }
        return owner;
      `
    }
  ]
});
