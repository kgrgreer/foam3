foam.CLASS({
  package: 'net.nanopay.tx.alterna',
  name: 'AlternaSFTPService',

  implements: [
    'net.nanopay.tx.alterna.SFTPService'
  ],

  properties: [
    {
      class: 'Int',
      name: 'cutOffTime',
      value: 11
    },
    {
      class: 'Int',
      name: 'holdTimeInBusinessDays',
      value: 2
    },
    {
     class: 'Int',
     name: 'maxRetry',
     value: 5
   },
   {
     class: 'Int',
     name: 'retryCount',
     value: 0
   },
   {
     class: 'Int',
     name: 'retryDelay',
     value: 120000 // 2minutes
   },
   {
     class: 'FObjectProperty',
     javaType: 'java.util.Timer',
     name: 'timer',
     javaFactory: 'return new Timer();',
   }
  ],

  javaImports: [
    'com.jcraft.jsch.Channel',
    'com.jcraft.jsch.ChannelSftp',
    'com.jcraft.jsch.JSch',
    'com.jcraft.jsch.Session',
    'foam.lib.json.OutputterMode',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.notification.Notification',
    'java.io.ByteArrayInputStream',
    'java.io.ByteArrayOutputStream',
    'java.io.FileOutputStream',
    'java.io.PrintWriter',
    'java.io.File',
    'java.util.Date',
    'java.util.Properties',
    'java.util.Vector',
    'java.util.Timer',
    'java.util.TimerTask',
    'net.nanopay.cico.model.EFTReturnFileCredentials',
    'org.apache.commons.io.FileUtils'
],

  methods: [
    {
      name: 'sendCICOFile',
      javaCode:
        `Date now = new Date();
X x = getX();
DAO notificationDAO = (DAO) x.get("localNotificationDAO");
String SEND_FOLDER = System.getProperty("NANOPAY_HOME") + "/var" + "/alterna_eft/send/";

ByteArrayOutputStream baos = new ByteArrayOutputStream();
PrintWriter printWriter = new PrintWriter(baos);
CsvUtil.writeCsvFile(x, printWriter, OutputterMode.STORAGE);
// don't send CSV file if there is no pending transaction
if ( baos.toByteArray().length == 0 ) {
  return;
}

EFTReturnFileCredentials credentials = (EFTReturnFileCredentials) x.get("EFTReturnFileCredentials");
final Logger logger = new PrefixLogger(new String[] {"Alterna: "}, (Logger) x.get("logger"));
Session session = null;
Channel channel = null;
ChannelSftp channelSftp;
try {
  // create session with user name and password
  JSch jsch = new JSch();
  session = jsch.getSession(credentials.getUser(), credentials.getHost(), credentials.getPort());
  session.setPassword(credentials.getPassword());

  // add configuration
  Properties config = new Properties();
  config.put("StrictHostKeyChecking", "no");
  session.setConfig(config);
  session.connect();

  // open SFTP connection and upload file
  channel = session.openChannel("sftp");
  channel.connect();
  channelSftp = (ChannelSftp) channel;

  channelSftp.cd("/");

  String filename = CsvUtil.generateFilename(now, credentials.getIdentifier());

  Vector rootList = channelSftp.ls("/");
  boolean rootFolderCsvFileExist = false;
  for ( Object entry : rootList ) {
    ChannelSftp.LsEntry e = (ChannelSftp.LsEntry) entry;
    if ( e.getFilename().equals(filename) ) {
      rootFolderCsvFileExist = true;
    }
  }

  Vector archiveList = channelSftp.ls("/Archive/");
  boolean archiveFolderCsvFileExist = false;
  for ( Object entry : archiveList ) {
    ChannelSftp.LsEntry e = (ChannelSftp.LsEntry) entry;
    if ( e.getFilename().equals(filename) ) {
      archiveFolderCsvFileExist = true;
    }
  }

  if ( archiveFolderCsvFileExist ) {
    logger.warning("Same CSV file has been processed. Duplicate CSV file not sent", filename, System.getProperty("user.name"));
    Notification notification = new Notification.Builder(x)
      .setTemplate("NOC")
      .setBody("Same CSV file has been processed. Duplicate CSV file not sent. FileName: " + filename)
      .build();
    notificationDAO.put(notification);
  } else if ( rootFolderCsvFileExist ) {
    logger.warning("Same CSV file is being processed. Duplicate CSV file not sent", filename, System.getProperty("user.name"));
    Notification notification = new Notification.Builder(x)
      .setTemplate("NOC")
      .setBody("CSV file is being processed. Duplicate CSV file not sent. FileName: " + filename)
      .build();
    notificationDAO.put(notification);
  } else {
    FileUtils.touch(new File(SEND_FOLDER + filename));
    FileOutputStream fileOutputStream = new FileOutputStream(SEND_FOLDER + filename);
    baos.writeTo(fileOutputStream);
    fileOutputStream.close();
    
    // send CSV file
    channelSftp.put(new ByteArrayInputStream(baos.toByteArray()), filename);
    logger.info("CICO CSV file sent");
  }

  getTimer().cancel();
  setRetryCount(0);
  channelSftp.exit();
} catch ( Exception e ) {
  logger.error("Error during sending alterna EFT, retrying.", e);
  retry();
} finally {
  // close channels
  if ( channel != null ) channel.disconnect();
  if ( session != null ) session.disconnect();
}`
},
{
  name: 'retry',
  javaCode: `
  synchronized ( this ) {
    if ( getRetryCount() < getMaxRetry() ) {
      setRetryCount(getRetryCount() + 1);
      if ( getTimer() != null ) getTimer().cancel();
      setTimer(new Timer());
      TimerTask task = new TimerTask() {
        public void run() {
          sendCICOFile();
        }
      };
      getTimer().schedule(task, getRetryDelay());
    } else {
      if ( getTimer() != null ) getTimer().cancel();
      setRetryCount(0);
      final Logger logger = (Logger) getX().get("logger");
      logger.info("Maximum SFTP retry exceeded.");
    }
  }
  `
}
  ]
});
