package net.nanopay.iso8583.type;

import net.nanopay.iso8583.ISOBitMapFieldPackager;
import net.nanopay.iso8583.ISOComponent;

import static net.nanopay.iso8583.ISO8583Util.HEX_ASCII;

/**
 * ISO 8583 BitMap field
 */
public class ISOBitMap
  extends ISOBitMapFieldPackager
{
  public ISOBitMap(int len, String description) {
    super(len, description);
  }

  @Override
  public void pack(ISOComponent c, java.io.OutputStream out)
    throws java.io.IOException
  {
    java.util.BitSet set = (java.util.BitSet) c.getValue();
    int bytes = (getLength() >= 8 ? set.length()+62 >>6 <<3 : getLength());
    int length = bytes * 8;

    byte[] buffer = new byte[bytes];
    for ( int i = 0 ; i < length ; i++ ) {
      if ( set.get(i + 1) ) {
        buffer[i >> 3] |= 0x80 >> i % 8;
      }
    }

    // set 2nd bitmap flag
    if ( length > 64 ) {
      buffer[0] |= 0x80;
    }

    for ( byte b : buffer ) {
      out.write(HEX_ASCII[(b & 0xF0) >> 4]);
      out.write(HEX_ASCII[(b & 0x0F)]);
    }
  }

  @Override
  public void unpack(ISOComponent c, java.io.InputStream in)
    throws java.io.IOException
  {
    // read first bitmap
    java.util.BitSet set = new java.util.BitSet(64);
    readBitSet(set, 0, in);

    // read secondary bitmap if necessary
    if ( getLength() > 8 && set.get(1) ) {
      readBitSet(set, 64, in);
    }

    c.setValue(set);
  }

  protected void readBitSet(java.util.BitSet set, int offset, java.io.InputStream in)
    throws java.io.IOException
  {
    for ( int i = 0 ; i < getLength() ; i++ ) {
      int digit = foam.util.SecurityUtil.HexToInt((char) in.read());
      for ( int j = 0 ; j < 4 ; j++ ) {
        if ( ( digit & 0x08 >> j % 4 ) > 0 ) {
          set.set(offset + 1);
        }
        offset += 1;
      }
    }
  }
}
