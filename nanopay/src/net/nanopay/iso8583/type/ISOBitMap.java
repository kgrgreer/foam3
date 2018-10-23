package net.nanopay.iso8583.type;

import net.nanopay.iso8583.FixedBitSet;
import net.nanopay.iso8583.ISOBitMapFieldPackager;
import net.nanopay.iso8583.ISOComponent;

import java.io.IOException;
import java.io.OutputStream;
import java.util.BitSet;

public class ISOBitMap
  extends ISOBitMapFieldPackager
{
  public ISOBitMap(int len, String description) {
    super(len, description);
  }

  @Override
  public void pack(ISOComponent c, OutputStream out)
    throws IOException
  {
    int sum = 0;
    int digit = 1;

    FixedBitSet b = (FixedBitSet) c.getValue();
    int bits = b.getBits();

    for ( int i = 0 ; i < bits ; i++ ) {
      int bit = b.get(i) ? 1 : 0;
      if ( digit == 1 ) {
        sum += bit * 8;
      } else if ( digit == 2 ) {
        sum += bit * 4;
      } else if ( digit == 3 ) {
        sum += bit * 2;
      } else if ( digit == 4 || i < bits + 1 ) {
        sum += bit;
        digit = 0;
        if ( sum < 10 ) {
          out.write(sum + '0');
        } else if ( sum == 10 ) {
          out.write('A');
        } else if ( sum == 11 ) {
          out.write('B');
        } else if ( sum == 12 ) {
          out.write('C');
        } else if ( sum == 13 ) {
          out.write('D');
        } else if ( sum == 14 ) {
          out.write('E');
        } else if ( sum == 15 ) {
          out.write('F');
        }

        sum = 0;
      }
      digit += 1;
    }
  }

  @Override
  public int unpack(ISOComponent c, byte[] b, int offset) {
    return 0;
  }
}
