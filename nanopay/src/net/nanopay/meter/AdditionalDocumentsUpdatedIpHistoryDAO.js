foam.CLASS({
  package: 'net.nanopay.meter',
  name: 'AdditionalDocumentsUpdatedIpHistoryDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Decorating dao for capturing user IP address when
      additional documents is updated.`,

  javaImports: [
    'foam.core.FObject',
    'foam.core.PropertyInfo',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ProxyDAO',
    'foam.nanos.auth.User',
    'javax.servlet.http.HttpServletRequest',
    'java.util.Arrays'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        User newUser = (User) obj;
        User oldUser = (User) getDelegate().find(newUser.getId());

        PropertyInfo prop = (PropertyInfo) User.getOwnClassInfo().getAxiomByName("additionalDocuments");
        Object[] newFiles = (Object[]) prop.get(newUser);
        Object[] oldFiles = null;
        if (oldUser != null) {
          oldFiles = (Object[]) prop.get(oldUser);
        }

        if (oldUser != null && !Arrays.deepEquals(oldFiles, newFiles)) {
          HttpServletRequest request = x.get(HttpServletRequest.class);
          String ipAddress = request.getRemoteAddr();
          String description = String.format("Upload:%s additional documents",
            getUploadAction(oldFiles.length, newFiles.length));

          IpHistory record = new IpHistory.Builder(x)
            .setUser(newUser.getId())
            .setIpAddress(ipAddress)
            .setDescription(description).build();
          ((DAO) x.get("ipHistoryDAO")).put(record);
        }

        return super.put_(x, obj);
      `
    },
    {
      name: 'getUploadAction',
      javaReturns: 'String',
      args: [
        { of: 'int', name: 'o' },
        { of: 'int', name: 'n' }
      ],
      javaCode: `
        if (n > o) return "add";
        else if (o > n) return "delete";
        else {
          return "update";
        }
      `
    }
  ]
});
