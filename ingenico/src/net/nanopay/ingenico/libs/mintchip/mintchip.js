(function (undefined) {
  'use strict';

  function copyArray (source, offset, length) {
    if (!source) {
      return null;
    }

    if ((offset < 0) || (length < 0) || (offset + length > source.length)) {
      return null;
    }

    return new Uint8Array(source.slice(offset, offset + length));
  }

  function appendArrays (head, tail) {
    if (!tail) {
      return null;
    }

    var tailLength = tail.length;
    head = (!head) ? new Uint8Array(0) : head;
    var headLength = head.length;

    var result = new Uint8Array(headLength + tailLength);
    result.set(head, 0);
    result.set(tail, headLength);
    return result;
  }

  function getTagDataOffset (tagOffset, data) {
    var lenByteCount;
    var dataOffset;

    if (!data || tagOffset < 0) {
      return -1;
    }

    if ((tagOffset + 2) > (data.length - 1)) {
      return -1;
    }

    var firstLenByte = (0x000000FF & data[tagOffset + 1]);

    if (firstLenByte <= 127) {
      dataOffset = tagOffset + 2;
    } else {
      lenByteCount = firstLenByte & 0x0000007F;
      if ((lenByteCount > 4) || (lenByteCount === 0)) {
        return -1;
      }
      dataOffset = tagOffset + 2 + lenByteCount;
    }

    return dataOffset;
  }

  function getTagLengthBytes (dataLen) {
    if (dataLen <= 127) {
      return 2;
    } else if (dataLen < 256) {
      return 3;
    } else if (dataLen < 65536) {
      return 4;
    } else {
      return 5;
    }
  }

  function getTagLength (tagOffset, data) {
    var len = -1;
    var lenByteCount;

    if (!data || tagOffset < 0) {
      return -1;
    }
    if ((tagOffset + 1) > (data.length - 1)) {
      return -1;
    }

    var firstLenByte = (0xFF & data[tagOffset + 1]);
    if (firstLenByte <= 127) {
      len = firstLenByte;
    } else {
      lenByteCount = firstLenByte & 0x7F;

      // check to see if the length of the data is correct
      // tag offset + tag byte + tag length byte + length
      if (tagOffset + 1 + 1 + lenByteCount > data.length) {
        return -1;
      }

      switch (lenByteCount) {
        case 1:
          len = 0x000000FF & data[tagOffset + 2];
          break;

        case 2:
          len = (0x000000FF & data[tagOffset + 2]) << 8;
          len |= (0x000000FF & data[tagOffset + 3]);
          break;

        case 3:
          len = (0x000000FF & data[tagOffset + 2]) << 16;
          len |= (0x000000FF & data[tagOffset + 3]) << 8;
          len |= (0x000000FF & data[tagOffset + 4]);
          break;

        case 4:
          len = (0x000000FF & data[tagOffset + 2]) << 24;
          len |= (0x000000FF & data[tagOffset + 3]) << 16;
          len |= (0x000000FF & data[tagOffset + 4]) << 8;
          len |= (0x000000FF & data[tagOffset + 5]);
          break;

        // not supported
        default:
          return -1;
      }
    }

    // javascript performs OR & shift operations using signed 32 bit integers
    // if we get here and the length is negative, just convert back to unsigned
    return (len < 0) ? (len >>> 0) : len;
  }

  function getDateTime (data) {
    if (!data) {
      return null;
    }

    if ( data.length === 3 ) {
      var b1 = data[0];
      var b2 = data[1];
      var b3 = data[2];

      var year = ((b1 & 0xF0) >> 4) + 2010;
      var month = (b1 & 0x0F) - 1;
      var day = (b2 & 0xF8) >> 3;
      var hour = (((b2 << 5) & 0xE0) >> 3) | ((0xFF & b3) >> 6);
      var min = (b3 & 0x3F);

      return new Date(Date.UTC(year, month, day, hour, min, 0, 0));
    } else if ( data.length === 4 ) {
      var secsSince2000 = data.readUIntBE(0, 4);
      var secsSince1970 = 946684800 + secsSince2000;
      return new Date(secsSince1970 * 1000);
    } else {
      return null;
    }
  }

  function convertDateTime (date, length) {
    if ( ! date ) {
      return null;
    }

    if ( length === 3 ) {
      var year = date.getUTCFullYear() - 2010;
      var month = date.getUTCMonth() + 1;
      var day = date.getUTCDate();
      var hour = date.getUTCHours();
      var min = date.getUTCMinutes();

      var result = new Uint8Array(3);

      result[0] = (year << 4);
      result[0] |= month;

      result[1] = (day << 3);
      result[1] |= (hour >> 2);

      result[2] = (hour << 6);
      result[2] |= min;

      return result;
    } else if ( length === 4 ) {
      var secsSince1970 = date.getTime() / 1000;
      var secsSince2000 = secsSince1970 - 946684800;
      var result = new Uint8Array(4);
      result.writeUIntBE(secsSince2000, 0, 4);
      return result;
    } else {
      return null;
    }
  }

  function bytesToAsciiString (data) {
    return (data) ? String.fromCharCode.apply(null, data) : null;
  }

  function asciiStringToBytes (data) {
    if (!data) {
      return null;
    }

    var bytes = new Uint8Array(data.length);
    for (var i = 0; i < data.length; i++) {
      bytes[i] = data.charCodeAt(i);
    }
    return bytes;
  }

  function bytesToBase64String (data) {
    if (!data) {
      return null;
    }

    var binary = '';
    for (var i = 0; i < data.length; i++) {
      binary += String.fromCharCode(data[i]);
    }
    return btoa(binary);
  }

  function base64StringToBytes (data) {
    if (!data) {
      return null;
    }

    var raw = atob(data);
    var rawLength = raw.length;
    var result = new Uint8Array(new ArrayBuffer(rawLength));

    for (var i = 0; i < rawLength; i++) {
      result[i] = raw.charCodeAt(i);
    }
    return result;
  }

  function bytesToHexString (data) {
    if (!data) {
      return null;
    }

    var hexStr = '';
    for (var i = 0; i < data.length; i++) {
      var hex = (data[i] & 0xFF).toString(16);
      hex = (hex.length === 1) ? '0' + hex : hex;
      hexStr += hex;
    }

    return hexStr.toUpperCase();
  }

  function hexStringToBytes (data) {
    if (!data) {
      return null;
    }

    // if the length of the hex string is not even
    // then append a 0 at the start
    if ((data.length % 2) !== 0) {
      data = '0' + data;
    }

    var a = [];
    for (var i = 0; i < data.length; i += 2) {
      a.push(parseInt(data.substr(i, 2), 16));
    }
    return new Uint8Array(a);
  }

  function bytesToMintChipId (data) {
    if (!data) {
      return null;
    }

    if (data.length !== 8) {
      return null;
    }

    var result = '';
    for (var i = 0; i < 8; i++) {
      var d1 = (data[i] & 0xF0) >> 4;
      var d2 = data[i] & 0xF;

      result += d1.toString() + d2.toString();
    }

    if (!this.MintChipIdToBytes(result)) {
      return null;
    }

    return result;
  }

  function mintChipIdToBytes (id) {
    if (!id) {
      return null;
    }

    var cleanNumber = Number(id);
    if (isNaN(cleanNumber)) {
      return null;
    }
    if (cleanNumber.toString().length !== 16) {
      return null;
    }

    id = id.toString();

    var total = 0;
    var result = new Uint8Array(8);

    for (var i = 1; i <= 16; i++) {
      var multiplier = 1 + (i % 2);
      var digit = parseInt(id.substring(i - 1, i), 10);

      var sum = digit * multiplier;
      if (sum > 9) {
        sum -= 9;
      }
      total += sum;

      if ((i % 2) === 1) {
        result[((i - 1) / 2)] = ((digit << 4));
      } else {
        var index = parseInt(((i - 1) / 2), 10);
        var temp = result;
        temp[index] |= digit;
      }
    }

    if ((total % 10) !== 0) {
      return null;
    }

    return result;
  }

  function bytesToNumber (data, length) {
    if (!data) {
      return null;
    }

    if (!length) {
      return parseInt(bytesToHexString(data), 16);
    } else {
      if (length > data.length) {
        return null;
      }

      var hexString = '';
      for (var i = 0; i < length; i++) {
        hexString += data[i].toString(16);
      }
      return parseInt(hexString, 16);
    }
  }

  function numberToBytes (number, length) {
    if (!number) {
      return null;
    }

    // if negative, convert to unsigned 32 bit integer
    number = (number < 0) ? (number >>> 0) : number;
    var numberHex = number.toString(16);

    if (!length) {
      // If the number hex is of odd length
      // Append a 0 to make it even
      if ((numberHex.length % 2) !== 0) {
        numberHex = '0' + numberHex;
      }

      return hexStringToBytes(numberHex);
    } else {
      length *= 2;
      while (numberHex.length < length) {
        numberHex = '0' + numberHex;
      }
      return hexStringToBytes(numberHex);
    }
  }

  function bytesToVersion (data) {
    if (!data || data.length < 1) {
      return null;
    }
    return ((data[0] & 0xF0) >> 4) + '.' + (data[0] & 0x0F);
  }

  function bytesToBoolean (data) {
    if (!data || data.length < 1) {
      return null;
    }
    return (data[0] === 0xFF);
  }

  function booleanToBytes (value) {
    return (value) ? new Uint8Array([0xFF]) : new Uint8Array([0x00]);
  }

  function AsnNode (data) {
    // no data
    if (!data) {
      throw new Error('Invalid ASN Node');
    }

    if (data.tag && data.data && data.offset >= 0 && data.length > 0) {
      this.tag = data.tag;
      this.length = data.length;
      this.value = copyArray(data.data, data.offset, data.length);
    } else if (data.rawTlv) {
      this.tag = data.rawTlv[0];
      this.length = getTagLength(0, data.rawTlv);
      var offset = getTagDataOffset(0, data.rawTlv);
      this.value = copyArray(data.rawTlv, offset, this.length);
    } else if (data.tag && data.data) {
      this.tag = data.tag;
      this.length = data.data.length;
      this.value = copyArray(data.data, 0, this.length);
    } else if (data.tag) {
      this.tag = data.tag;
      this.length = 0;
    } else {
      // invalid parameters
      throw new Error('Invalid ASN Node');
    }

    this.children = [];
  }

  AsnNode.prototype.addChild = function (child) {
    this.children.push(child);
  };

  AsnNode.prototype.getDerEncoding = function () {
    var totalLen = 0;
    var childrenDer = null;
    var all;

    for (var i = 0; i < this.children.length; i++) {
      childrenDer = appendArrays(childrenDer, this.children[i].getDerEncoding());
    }

    if (childrenDer !== null) {
      totalLen = childrenDer.length;
    }

    totalLen += this.length;

    if (totalLen <= 127) {
      all = new Uint8Array(2);
      all[0] = this.tag;
      all[1] = totalLen;
    } else if (totalLen < 256) {
      all = new Uint8Array(3);
      all[0] = this.tag;
      all[1] = 0x81;
      all[2] = totalLen;
    } else if (totalLen < 65536) {
      all = new Uint8Array(4);
      all[0] = this.tag;
      all[1] = 0x82;
      all[2] = ((totalLen & 0x0000FF00) >> 8);
      all[3] = ((totalLen & 0x000000FF));
    } else if (totalLen < 16777216) {
      all = new Uint8Array(5);
      all[0] = this.tag;
      all[1] = 0x83;
      all[2] = ((totalLen & 0x00FF0000) >> 16);
      all[3] = ((totalLen & 0x0000FF00) >> 8);
      all[4] = ((totalLen & 0x000000FF));
    } else {
      all = new Uint8Array(6);
      all[0] = this.tag;
      all[1] = 0x84;
      all[2] = ((totalLen & 0xFF000000) >> 24);
      all[3] = ((totalLen & 0x00FF0000) >> 16);
      all[4] = ((totalLen & 0x0000FF00) >> 8);
      all[5] = ((totalLen & 0x000000FF));
    }

    if (this.value) {
      all = appendArrays(all, this.value);
    }

    if (childrenDer) {
      all = appendArrays(all, childrenDer);
    }

    return all;
  };

  function ValueRequestMessage (vrmb64) {
    this.parseValueRequestMessage(vrmb64);
  }

  Object.defineProperty(ValueRequestMessage.prototype, 'annotation', {
    get: function () {
      return bytesToAsciiString(this._annotation);
    },
    set: function (val) {
      this._annotation = val;
    }
  });

  Object.defineProperty(ValueRequestMessage.prototype, 'payeeId', {
    get: function () {
      return bytesToMintChipId(this._payeeId);
    },
    set: function (val) {
      this._payeeId = val;
    }
  });

  Object.defineProperty(ValueRequestMessage.prototype, 'currencyCode', {
    get: function () {
      return bytesToNumber(this._currencyCode);
    },
    set: function (val) {
      this._currencyCode = val;
    }
  });

  Object.defineProperty(ValueRequestMessage.prototype, 'amount', {
    get: function () {
      return bytesToNumber(this._amount);
    },
    set: function (val) {
      this._amount = val;
    }
  });

  Object.defineProperty(ValueRequestMessage.prototype, 'certificateRequested', {
    get: function () {
      return bytesToBoolean(this._certificateRequested);
    },
    set: function (val) {
      this._certificateRequested = val;
    }
  });

  Object.defineProperty(ValueRequestMessage.prototype, 'responseAddress', {
    get: function () {
      return bytesToAsciiString(this._responseAddress);
    },
    set: function (val) {
      this._responseAddress = val;
    }
  });

  Object.defineProperty(ValueRequestMessage.prototype, 'challenge', {
    get: function () {
      return bytesToHexString(this._challenge);
    },
    set: function (val) {
      this._challenge = val;
    }
  });

  Object.defineProperty(ValueRequestMessage.prototype, 'vrmDer', {
    get: function () {
      return this._vrmDer;
    },
    set: function (val) {
      this._vrmDer = val;
    }
  });

  ValueRequestMessage.prototype.parseValueRequestMessage = function (vrmb64) {
    var offset = 0;
    var tagLen;

    if (!vrmb64 || (vrmb64.length === 0) || (vrmb64.length > 3096)) {
      throw new Error('Invalid vrmb64');
    }

    var der = base64StringToBytes(vrmb64);

    // Check Application tag
    if (der[offset] !== 0x60) {
      throw new Error('Invalid application tag');
    }

    // get next tag and confirm it is a sequence, and then skip to next tag
    if ((offset = getTagDataOffset(offset, der)) === -1) {
      throw new Error('Invalid sequence tag');
    }
    if (der[offset] !== 0x30) {
      throw new Error('Invalid sequence tag');
    }

    // check for version and skip
    if ((offset = getTagDataOffset(offset, der)) === -1) {
      throw new Error('Invalid message version');
    }
    if (der[offset] !== 0xA0) {
      throw new Error('Invalid message version');
    }
    offset += 5;

    // annotation (optional)
    if (der[offset] === 0xA1) {
      var dataOffset;

      // get next tag and make sure it is IA5String (0x16)
      if ((offset = getTagDataOffset(offset, der)) === -1) {
        throw new Error('Invalid message annotation');
      }
      if (der[offset] !== 0x16) {
        throw new Error('Invalid message annotation');
      }

      // get the data offset and length
      if ((tagLen = getTagLength(offset, der)) === -1) {
        throw new Error('Invalid message annotation');
      }
      if ((dataOffset = getTagDataOffset(offset, der)) === -1) {
        throw new Error('Invalid message annotation');
      }
      this.annotation = copyArray(der, dataOffset, tagLen);

      offset += (dataOffset - offset + tagLen);
    }

    // Skip to inner tag and confirm it is 0xA1
    if ((offset = getTagDataOffset(offset, der)) === -1) {
      throw new Error('Invalid message choice');
    }
    if (der[offset] !== 0xA1) {
      throw new Error('Invalid message choice');
    }

    // Skip to next inner tag and confirm it is 0x30
    if ((offset = getTagDataOffset(offset, der)) === -1) {
      throw new Error('Invalid inner sequence tag');
    }
    if (der[offset] !== 0x30) {
      throw new Error('Invalid inner sequence tag');
    }

    tagLen = getTagLength(offset, der);
    var vrmTlvLen = tagLen + getTagLengthBytes(tagLen);
    this.vrmDer = copyArray(der, offset, vrmTlvLen);
    offset = 0;

    // Get payee id
    if ((offset = getTagDataOffset(offset, this.vrmDer)) === -1) {
      throw new Error('Invalid payee id');
    }
    if ((tagLen = getTagLength(offset, this.vrmDer)) === -1) {
      throw new Error('Invalid payee id');
    }
    offset += 2;
    this.payeeId = this.vrmDer.slice(offset, offset + tagLen);

    // Get currency code
    offset += tagLen;
    if ((tagLen = getTagLength(offset, this.vrmDer)) === -1) {
      throw new Error('Invalid currency code');
    }
    if ((offset = getTagDataOffset(offset, this.vrmDer)) === -1) {
      throw new Error('Invalid currency code');
    }
    this.currencyCode = this.vrmDer.slice(offset, offset + tagLen);

    // Get amount in cents
    offset += tagLen;
    if ((tagLen = getTagLength(offset, this.vrmDer)) === -1) {
      throw new Error('Invalid amount');
    }
    if ((offset = getTagDataOffset(offset, this.vrmDer)) === -1) {
      throw new Error('Invalid amount');
    }
    this.amount = this.vrmDer.slice(offset, offset + tagLen);

    // Get cert requested
    offset += tagLen;
    if ((tagLen = getTagLength(offset, this.vrmDer)) === -1) {
      throw new Error('Invalid certificate requested');
    }
    if ((offset = getTagDataOffset(offset, this.vrmDer)) === -1) {
      throw new Error('Invalid certificate requested');
    }
    this.certificateRequested = this.vrmDer.slice(offset, offset + tagLen);

    // Get response address
    offset += tagLen;
    if ((tagLen = getTagLength(offset, this.vrmDer)) === -1) {
      throw new Error('Invalid response address');
    }
    if ((offset = getTagDataOffset(offset, this.vrmDer)) === -1) {
      throw new Error('Invalid response address');
      return false;
    }
    this.responseAddress = this.vrmDer.slice(offset, offset + tagLen);

    // Get challenge if available
    offset += tagLen;
    if (this.vrmDer[offset] === 0x80) {
      if ((tagLen = getTagLength(offset, this.vrmDer)) === -1) {
        throw new Error('Invalid challenge');
      }
      if ((offset = getTagDataOffset(offset, this.vrmDer)) === -1) {
        throw new Error('Invalid challenge');
      }
      this.challenge = this.vrmDer.slice(offset, offset + tagLen);
    }
  };

  ValueRequestMessage.buildValueRequestMessagePacket = function (payeeId, currencyCode, amount, challenge, annotate) {
    // payee id validation
    if (!mintChipIdToBytes(payeeId)) {
      throw new Error('Invalid Payee ID');
    }

    // currency code validation
    if ((currencyCode < 1) || (currencyCode > 65535)) {
      throw new Error('Invalid Currency Code');
    }

    // amount validation
    if ((amount < 1) || (amount > 1099511627775)) {
      throw new Error('Invalid Amount');
    }

    // challenge validation
    if (challenge) {
      challenge = hexStringToBytes(challenge);
      if (challenge.length !== 4) {
        throw new Error('Invalid Challenge');
      }
    }

    // Version
    var innerVersion = new AsnNode({tag: 0x0A, data: new Uint8Array([1])});
    var version = new AsnNode({tag: 0xA0});
    version.addChild(innerVersion);

    // Annotation
    var annotation = null;
    if (annotate) {
      var annotateBytes = asciiStringToBytes(annotate);
      var innerAnnotate = new AsnNode({tag: 0x16, data: annotateBytes});
      annotation = new AsnNode({tag: 0xA1});
      annotation.addChild(innerAnnotate);
    }

    var seq = new AsnNode({tag: 0x30});
    // payee id (8 bytes)
    seq.addChild(new AsnNode({tag: 0x04, data: mintChipIdToBytes(payeeId)}));
    // currency code (2 bytes)
    seq.addChild(new AsnNode({tag: 0x04, data: numberToBytes(currencyCode, 1)}));
    // amount in cents (5 bytes)
    seq.addChild(new AsnNode({tag: 0x04, data: numberToBytes(amount, 3)}));
    // certificate request (always true) (1 byte)
    seq.addChild(new AsnNode({tag: 0x01, data: booleanToBytes(true)}));
    // response address (should be empty) (variable length)
    seq.addChild(new AsnNode({tag: 0x16, data: asciiStringToBytes('')}));
    if (challenge) {
      // optional challenge field (4 bytes)
      seq.addChild(new AsnNode({tag: 0x80, data: challenge}));
    }

    // Choice tag (0xA1 for VRM)
    var choice = new AsnNode({tag: 0xA1});
    choice.addChild(seq);

    // Packet tag (add packet choice)
    var packet = new AsnNode({tag: 0xA2});
    packet.addChild(choice);

    // Sequence tag for A0, A1 (optional annotation), A2
    var topSequence = new AsnNode({tag: 0x30});
    topSequence.addChild(version);
    if (annotation) {
      topSequence.addChild(annotation);
    }
    topSequence.addChild(packet);

    // Application tag
    var app = new AsnNode({tag: 0x60});
    app.addChild(topSequence);

    return bytesToBase64String(app.getDerEncoding());
  };

  function ValueTransferMessage(vtmb64) {
    this.parseValueMessage(vtmb64);
  }

  Object.defineProperty(ValueTransferMessage.prototype, 'annotation', {
    get: function () {
      return bytesToAsciiString(this._annotation);
    },
    set: function (val) {
      this._annotation = val;
    }
  });

  Object.defineProperty(ValueTransferMessage.prototype, 'version', {
    get: function () {
      return bytesToVersion(this._version);
    },
    set: function (val) {
      this._version = val;
    }
  });

  Object.defineProperty(ValueTransferMessage.prototype, 'payeeId', {
    get: function () {
      return bytesToMintChipId(this._payeeId);
    },
    set: function (val) {
      this._payeeId = val;
    }
  });

  Object.defineProperty(ValueTransferMessage.prototype, 'payerId', {
    get: function () {
      return bytesToMintChipId(this._payerId);
    },
    set: function (val) {
      this._payerId = val;
    }
  });

  Object.defineProperty(ValueTransferMessage.prototype, 'currencyCode', {
    get: function () {
      return bytesToNumber(this._currencyCode);
    },
    set: function (val) {
      this._currencyCode = val;
    }
  });

  Object.defineProperty(ValueTransferMessage.prototype, 'amount', {
    get: function () {
      return bytesToNumber(this._amount);
    },
    set: function (val) {
      this._amount = val;
    }
  });

  Object.defineProperty(ValueTransferMessage.prototype, 'challenge', {
    get: function () {
      return bytesToHexString(this._challenge);
    },
    set: function (val) {
      this._challenge = val;
    }
  });

  Object.defineProperty(ValueTransferMessage.prototype, 'createdTime', {
    get: function () {
      return getDateTime(this._createdTime);
    },
    set: function (val) {
      this._createdTime = val;
    }
  });

  Object.defineProperty(ValueTransferMessage.prototype, 'encryptedTac', {
    get: function () {
      return this._encryptedTac;
    },
    set: function (val) {
      this._encryptedTac = val;
    }
  });

  Object.defineProperty(ValueTransferMessage.prototype, 'signature', {
    get: function () {
      return this._signature;
    },
    set: function (val) {
      this._signature = val;
    }
  });

  Object.defineProperty(ValueTransferMessage.prototype, 'payerCertificate', {
    get: function () {
      return this._payerCertificate;
    },
    set: function (val) {
      this._payerCertificate = val;
    }
  });

  Object.defineProperty(ValueTransferMessage.prototype, 'vmDer', {
    get: function () {
      return this._vmDer;
    },
    set: function (val) {
      this._vmDer = val;
    }
  });

  ValueTransferMessage.prototype.parseValueMessage = function (vtmb64) {
    var offset = 0;
    var tagLen;

    if (!vtmb64 || (vtmb64.length === 0) || (vtmb64.length > 3096)) {
      throw new Error('Invalid vtmb64');
    }

    var der = base64StringToBytes(vtmb64);

    // Check Application tag
    if (der[offset] !== 0x60) {
      throw new Error('Invalid application');
    }

    // get next tag and confirm it is a sequence, and then skip to next tag
    if ((offset = getTagDataOffset(offset, der)) === -1) {
      throw new Error('Invalid sequence tag');
    }
    if (der[offset] !== 0x30) {
      throw new Error('Invalid sequence tag');
    }

    // check for version and skip
    if ((offset = getTagDataOffset(offset, der)) === -1) {
      throw new Error('Invalid message version');
    }
    if (der[offset] !== 0xA0) {
      throw new Error('Invalid message version');
    }
    offset += 5;

    // annotation (optional)
    if (der[offset] === 0xA1) {
      var dataOffset;

      // get next tag and make sure it is IA5String (0x16)
      if ((offset = getTagDataOffset(offset, der)) === -1) {
        throw new Error('Invalid message annotation');
      }
      if (der[offset] !== 0x16) {
        throw new Error('Invalid message annotation');
      }

      // get the data offset and length
      if ((tagLen = getTagLength(offset, der)) === -1) {
        throw new Error('Invalid message annotation')
      }
      if ((dataOffset = getTagDataOffset(offset, der)) === -1) {
        throw new Error('Invalid message annotation');
      }
      this.annotation = copyArray(der, dataOffset, tagLen);

      offset += (dataOffset - offset + tagLen);
    }

    if ((offset = getTagDataOffset(offset, der)) === -1) {
      throw new Error('Invalid message choice');
    }
    if (der[offset] !== 0xAB) {
      throw new Error('Invalid message choice');
    }

    // Skip to next inner tag and confirm it is sequence 0x30
    if ((offset = getTagDataOffset(offset, der)) === -1) {
      throw new Error('Invalid inner sequence tag');
    }
    if (der[offset] !== 0x30) {
      throw new Error('Invalid inner sequence tag');
    }

    // Skip to next inner tag and confirm it is sequence 0x30 (ValueMessage Type)
    if ((offset = getTagDataOffset(offset, der)) === -1) {
      throw new Error('Invalid inner sequence tag');
    }
    if (der[offset] !== 0x30) {
      throw new Error('Invalid inner sequence tag');
    }

    tagLen = getTagLength(offset, der);
    var vmTlvLen = tagLen + getTagLengthBytes(tagLen);
    this.vmDer = copyArray(der, offset, vmTlvLen);
    offset += vmTlvLen;

    if (offset < der.length) {

      // check for optional 0xA0 tag
      if (der[offset] !== 0xA0) {
        throw new Error('Invalid certificate');
      }

      this.payerCertificate = copyArray(der, offset, der.length - offset);
      this.payerCertificate[0] = 0x30;
    }

    offset = 0;

    if (this.vmDer[offset] !== 0x30) {
      throw new Error('Invalid inner sequence tag');
    }

    // Get version tag
    if ((offset = getTagDataOffset(offset, this.vmDer)) === -1) {
      throw new Error('Invalid version');
    }
    if ((tagLen = getTagLength(offset, this.vmDer)) === -1) {
      throw new Error('Invalid version');
    }
    offset += 2;
    this.version = this.vmDer.slice(offset, offset + tagLen);

    // Get payer id
    offset += tagLen;
    if ((tagLen = getTagLength(offset, this.vmDer)) === -1) {
      throw new Error('Invalid payer id');
    }
    if ((offset = getTagDataOffset(offset, this.vmDer)) === -1) {
      throw new Error('Invalid payer id');
    }
    this.payerId = this.vmDer.slice(offset, offset + tagLen);

    // get payee id
    offset += tagLen;
    if ((tagLen = getTagLength(offset, this.vmDer)) === -1) {
      throw new Error('Invalid payee id');
    }
    if ((offset = getTagDataOffset(offset, this.vmDer)) === -1) {
      throw new Error('Invalid payee id');
    }
    this.payeeId = this.vmDer.slice(offset, offset + tagLen);

    // get currency code
    offset += tagLen;
    if ((tagLen = getTagLength(offset, this.vmDer)) === -1) {
      throw new Error('Invalid currency code');
    }
    if ((offset = getTagDataOffset(offset, this.vmDer)) === -1) {
      throw new Error('Invalid currency code');
    }
    this.currencyCode = this.vmDer.slice(offset, offset + tagLen);

    // get amount in cents
    offset += tagLen;
    if ((tagLen = getTagLength(offset, this.vmDer)) === -1) {
      throw new Error('Invalid amount');
    }
    if ((offset = getTagDataOffset(offset, this.vmDer)) === -1) {
      throw new Error('Invalid amount');
    }
    this.amount = this.vmDer.slice(offset, offset + tagLen);

    // get challenge
    offset += tagLen;
    if ((tagLen = getTagLength(offset, this.vmDer)) === -1) {
      throw new Error('Invalid challenge');
    }
    if ((offset = getTagDataOffset(offset, this.vmDer)) === -1) {
      throw new Error('Invalid challenge');
    }
    this.challenge = this.vmDer.slice(offset, offset + tagLen);

    // get created time
    offset += tagLen;
    if ((tagLen = getTagLength(offset, this.vmDer)) === -1) {
      throw new Error('Invalid date time');
    }
    if ((offset = getTagDataOffset(offset, this.vmDer)) === -1) {
      throw new Error('Invalid date time');
    }
    this.createdTime = this.vmDer.slice(offset, offset + tagLen);

    // get encrypted tac
    offset += tagLen;
    if ((tagLen = getTagLength(offset, this.vmDer)) === -1) {
      throw new Error('Invalid TAC');
    }
    if ((offset = getTagDataOffset(offset, this.vmDer)) === -1) {
      throw new Error('Invalid TAC');
    }
    this.encryptedTac = this.vmDer.slice(offset, offset + tagLen);

    // get signature
    offset += tagLen;
    if ((tagLen = getTagLength(offset, this.vmDer)) === -1) {
      throw new Error('Invalid signature');
    }
    if ((offset = getTagDataOffset(offset, this.vmDer)) === -1) {
      throw new Error('Invalid signature');
    }
    this.signature = this.vmDer.slice(offset, offset + tagLen);
  };

  ValueTransferMessage.buildValueMessagePacket = function (vmDer, cert, annotate) {
    // Version
    var innerVersion = new AsnNode({tag: 0x0A, data: new Uint8Array([1])});
    var version = new AsnNode({tag: 0xA0});
    version.addChild(innerVersion);

    // Annotation
    var annotation = null;
    if (annotate) {
      var annotateBytes = asciiStringToBytes(annotate);
      var innerAnnotate = new AsnNode({tag: 0x16, data: annotateBytes});
      annotation = new AsnNode({tag: 0xA1});
      annotation.addChild(innerAnnotate);
    }

    var seq = new AsnNode({tag: 0x30});
    seq.addChild(new AsnNode({rawTlv: vmDer}));

    if (cert) {
      var len = getTagLength(0, cert);
      var offset = getTagDataOffset(0, cert);
      var payerCert = new AsnNode({tag: 0xA0, data: cert, offset: offset, length: len});
      seq.addChild(payerCert);
    }

    // Choice tag
    var choice = new AsnNode({tag: 0xAB});
    choice.addChild(seq);

    // Packet tag (add packet choice)
    var packet = new AsnNode({tag: 0xA2});
    packet.addChild(choice);

    // Sequence tag for A0, A1 (optional annotation), A2
    var topSequence = new AsnNode({tag: 0x30});
    topSequence.addChild(version);
    if (annotation) {
      topSequence.addChild(annotation);
    }
    topSequence.addChild(packet);

    // Application tag
    var app = new AsnNode({tag: 0x60});
    app.addChild(topSequence);

    return bytesToBase64String(app.getDerEncoding());
  };

  // export globals
  if ( typeof module !== 'undefined' ) {
    module.exports = {
      ValueRequestMessage: ValueRequestMessage,
      ValueTransferMessage: ValueTransferMessage
    };
  } else {
    window.ValueRequestMessage = ValueRequestMessage;
    window.ValueTransferMessage = ValueTransferMessage;
  }
})();
