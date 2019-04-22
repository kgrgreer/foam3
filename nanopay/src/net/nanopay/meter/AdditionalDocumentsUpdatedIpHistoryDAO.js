foam.CLASS({
  package: 'net.nanopay.meter',
  name: 'AdditionalDocumentsUpdatedIpHistoryDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Decorating DAO for capturing user IP address when
      additional documents is updated.`,

  javaImports: [
    'foam.nanos.auth.User',
    'foam.nanos.fs.File',
    'java.util.Arrays'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        User newUser = (User) obj;
        User oldUser = (User) getDelegate().find(newUser.getId());

        File[] newFiles = newUser.getAdditionalDocuments();
        File[] oldFiles = null;
        if (oldUser != null) {
          oldFiles = oldUser.getAdditionalDocuments();
        }

        if (oldUser != null && !Arrays.deepEquals(oldFiles, newFiles)) {
          IpHistoryService ipHistoryService = new IpHistoryService(x);
          String description = String.format("Upload:%s additional documents",
            getUploadAction(oldFiles.length, newFiles.length));

          ipHistoryService.record(newUser, description);
        }

        return super.put_(x, obj);
      `
    },
    {
      name: 'getUploadAction',
      type: 'String',
      args: [
        { type: 'Integer', name: 'o' },
        { type: 'Integer', name: 'n' }
      ],
      javaCode: `
        if (n > o) return "add";
        else if (o > n) return "delete";
        return "update";
      `
    }
  ]
});
