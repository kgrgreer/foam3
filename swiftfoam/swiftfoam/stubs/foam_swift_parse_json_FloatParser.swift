// GENERATED CODE. DO NOT MODIFY BY HAND.
import Foundation
public class FloatParser: AbstractFObject, Parser {

  lazy var parse$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    let ps = args[0] as! PStream

    let x = args[1] as! ParserContext

    
    return self!.`parse`(
        _: ps, _: x)
  }
])
      
  }()

  public static let PARSE: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "parse"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  private static var classInfo_: ClassInfo = ClassInfo_()

  public func `parse`(_ ps: PStream, _ x: ParserContext) -> PStream? {
    
var ps = ps
var n: [Character] = []
var decimalFound = false

if !ps.valid() { return nil }

var c = ps.head()

if c == "-" {
  n.append(c)
  ps = ps.tail();
  if !ps.valid() { return nil }
  c = ps.head()
}

// Float numbers must start with a digit: 0.1, 4.0
if c.isDigit() { n.append(c) }
else { return nil }

ps = ps.tail()
while ps.valid() {
  c = ps.head()
  if c.isDigit() {
    n.append(c)
  } else if c == "." { // TODO: localization
    if decimalFound {
      return nil
    }
    decimalFound = true;
    n.append(c)
  } else {
    break;
  }
  ps = ps.tail()
}


return ps.setValue(n.count > 0 ? Float(String(n)) : nil)
      
  }

  public override func `ownClassInfo`() -> ClassInfo {
    return FloatParser.classInfo_
  }

  public override class func `classInfo`() -> ClassInfo {
    return FloatParser.classInfo_
  }

  public override func `clearProperty`(_ key: String) {
    switch key {

  default:
    super.clearProperty(key)
}
  }

  public override func `hasOwnProperty`(_ key: String) -> Bool {
    switch key {

  default:
    return super.hasOwnProperty(key)
}
  }

  public override func `get`(key: String) -> Any? {
    switch key {

  default:
    return super.get(key: key)
}
  }

  public override func `getSlot`(key: String) -> Slot? {
    switch key {


  case "parse": return `parse$`

  default:
    return super.getSlot(key: key)
}
  }

  public override func `set`(key: String, value: Any?) {
    switch key {

  default: break
}
super.set(key: key, value: value)
  }

  // GENERATED CODE. DO NOT MODIFY BY HAND.
  private class ClassInfo_: ClassInfo {
  
    lazy var id: String = "foam.swift.parse.json.FloatParser"

    lazy var label: String = "Float Parser"

    lazy var parent: ClassInfo? = nil

    lazy var ownAxioms: [Axiom] = [PARSE]

    lazy var cls: AnyClass = FloatParser.self

    func `create`(args: [String:Any?] = [:], x: Context) -> Any {
      return FloatParser(args, x)
    }

  }

}