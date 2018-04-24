foam.CLASS({
  package: 'net.nanopay.cico.spi.alterna',
  name: 'AlternaSFTPService',

  implements: [
    'net.nanopay.cico.spi.alterna.SFTPService'
  ],

  javaImports: [
    'com.jcraft.jsch.Channel',
    'com.jcraft.jsch.ChannelSftp',
    'com.jcraft.jsch.JSch',
    'com.jcraft.jsch.Session',
    'foam.lib.json.OutputterMode',
    'foam.core.X',
    'foam.nanos.logger.Logger',
    'java.io.ByteArrayInputStream',
    'java.io.ByteArrayOutputStream',
    'java.util.Date',
    'java.util.Properties',
    'java.util.Vector',
    'net.nanopay.cico.model.EFTReturnFileCredentials'
],

  methods: [
    {
      name: 'sendCICOFile',
      javaCode:
        `Date now = new Date();
ByteArrayOutputStream baos = new ByteArrayOutputStream();

X x = getX();
EFTReturnFileCredentials credentials = (EFTReturnFileCredentials) x.get("ETFReturnFileCredentials");
CsvUtil.writeCsvFile(x, baos, OutputterMode.STORAGE);

final Logger logger = (Logger) x.get("logger");
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
  
  String filename = CsvUtil.generateFilename(now);
  
  Vector list = channelSftp.ls("/Archive/");
  boolean csvFileExist = false;
  
  for ( Object entry : list ) {
    ChannelSftp.LsEntry e = (ChannelSftp.LsEntry) entry;
    if ( e.getFilename().equals(filename) ) {
      csvFileExist = true;
    }
  }
  
  if ( ! csvFileExist ) {
    channelSftp.put(new ByteArrayInputStream(baos.toByteArray()), filename);
    logger.debug("CICO CSV file sent");
  } else {
    logger.warning("duplicate csv file not sent", filename, System.getProperty("user.name"));
  } 
  
  channelSftp.exit();
} catch ( Exception e ) {
  logger.error(e);
} finally {
  // close channels
  if ( channel != null ) channel.disconnect();
  if ( session != null ) session.disconnect();
}`
    }
  ]
});
