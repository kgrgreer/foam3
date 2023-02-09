/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.net',
  name: 'IPSupport',

  documentation: 'IP address helper/support methods',

  javaImports: [
    'foam.dao.DAO',
    'java.net.InetAddress',
    'javax.servlet.http.HttpServletRequest'
  ],

  javaCode: `
    private final static IPSupport instance__ = new IPSupport();
    public static IPSupport instance() { return instance__; }
  `,

  methods: [
    {
      // java only
      documentation: 'Retrieve remote IP from http request',
      name: 'getRemoteIp',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      type: 'String',
      javaCode: `
      HttpServletRequest req = x.get(HttpServletRequest.class);
      if ( req == null ) {
        return null;
      }
      String forwardedForHeader = req.getHeader("X-Forwarded-For");
      if ( ! foam.util.SafetyUtil.isEmpty(forwardedForHeader) ) {
            String[] addresses = forwardedForHeader.split(",");

            // Take last address in the list and check for x-forwarded-for config based on ip
            String address = addresses[addresses.length - 1].trim();

            int indexOffset = getXForwardedForIndexOffset(x, address);
            if ( indexOffset > 1 ) {
              // counting back from right most IP in list
              address = addresses[addresses.length - indexOffset].trim();
            }

            return address;
      }

      return req.getRemoteHost();
      `
    },
    {
      name: 'getXForwardedForIndexOffset',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'lookupIP',
          type: 'String'
        }
      ],
      type: 'int',
      javaCode: `
      int offset = 0;

      DAO xDAO = (DAO) x.get("xForwardedForConfigDAO");
      XForwardedForConfig config = null;
      String subnetCheck = lookupIP;

      if ( xDAO != null ) {
        // Check for ip match small subnet range to largest
        while (subnetCheck.indexOf(".") > 0 ) {
          config = (XForwardedForConfig) xDAO.find(subnetCheck);
          if ( config != null ) {
            offset = config.getIndexOffset();
            break;
          }

          subnetCheck = subnetCheck.substring(0, subnetCheck.lastIndexOf("."));
        }
      }

      // Return value must be >= 1 as we are subtracting from array length (array.length - indexOffset)
      // Last in list would be 1 + offset of 0 (default)
      // Next to last would be 1 + offset of 1
      return 1 + offset;
      `
    },
    {
      name: 'ip2long',
      args: [
        {
          name: 'ip',
          type: 'String'
        }
      ],
      type: 'Long',
      javaThrows: ['java.net.UnknownHostException'],
      javaCode: `
      InetAddress address = InetAddress.getByName(ip);
      byte[] octets = address.getAddress();
      long result = 0;
      for (byte octet : octets) {
        result <<= 8;
        result |= octet & 0xff;
      }
      return result;
      `
    },
    {
      name: 'long2ip',
      args: [
        {
          documentation: 'decimal representation of ip',
          name: 'ip',
          type: 'Long'
        }
      ],
      type: 'String',
      javaCode: `
      StringBuilder sb = new StringBuilder(15);
      for (int i = 0; i < 4; i++) {
        sb.insert(0,Long.toString(ip & 0xff));
        if (i < 3) {
          sb.insert(0,'.');
        }
        ip = ip >> 8;
      }
      return sb.toString();
      `
    }
  ]
});
