// GENERATED CODE. DO NOT MODIFY BY HAND.
import Foundation
public class Seq: AbstractFObject, Parser {

  public var parsers: [Parser] {
    get {
      
if _parsers_inited_ {
  return _parsers_!
}

return []

      
    }
set(value) {
      
self.set(key: "parsers", value: value)
      
    }
  }

  var _parsers_: [Parser]! = nil

  var _parsers_inited_: Bool = false

  public static let PARSERS: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "parsers"
  let classInfo: ClassInfo
  let transient = false
  let label = "Parsers" // TODO localize
  let visibility = Visibility.RW
  lazy private(set) public var jsonParser: Parser? = AnyParser()

  let viewFactory: ((Context) -> FObject)? = nil

  public func set(_ obj: FObject, value: Any?) {
    obj.set(key: name, value: value)
  }
  public func get(_ obj: FObject) -> Any? {
    return obj.get(key: name)
  }
  public func compareValues(_ v1: Any?, _ v2: Any?) -> Int {
    
let v1 = v1 as AnyObject
let v2 = v2 as AnyObject
if v1.isEqual(v2) { return 0 }
return v1.hash ?? 0 > v2.hash ?? 0 ? 1 : -1
        
  }
  init(_ ci: ClassInfo) { classInfo = ci }
}
return PInfo(classInfo())
      
  }()

  private lazy var parsers_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "parsers",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var parsers_Value_Sub_: Subscription?

  public var parsers$: Slot {
    get {
      return self.parsers_Value_
    }
set(value) {
      
self.parsers_Value_Sub_?.detach()
self.parsers_Value_Sub_ = self.parsers$.linkFrom(value)
self.onDetach(self.parsers_Value_Sub_!)
      
    }
  }

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

  private func `_parsers_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> [Parser] {
    return newValue as! [Parser]
  }

  private func `_parsers_preSet_`(_ oldValue: Any?, _ newValue: [Parser]) -> [Parser] {
    return newValue
  }

  private func `_parsers_postSet_`(_ oldValue: Any?, _ newValue: [Parser]) {
    
  }

  public func `parse`(_ ps: PStream, _ x: ParserContext) -> PStream? {
    
var ps: PStream? = ps
var values = [Any?](repeating: nil, count: parsers.count)
for (i, parser) in parsers.enumerated() {
  ps = parser.parse(ps!, x)
  if ps == nil { return nil }
  values[i] = ps!.value()
}
return ps!.setValue(values)
      
  }

  public override func `ownClassInfo`() -> ClassInfo {
    return Seq.classInfo_
  }

  public override class func `classInfo`() -> ClassInfo {
    return Seq.classInfo_
  }

  public override func `clearProperty`(_ key: String) {
    switch key {

  case "parsers":
    _parsers_inited_ = false
    _parsers_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "parsers"]) {
      _ = pub(["propertyChange", "parsers", parsers$])
    }
    break

  default:
    super.clearProperty(key)
}
  }

  public override func `hasOwnProperty`(_ key: String) -> Bool {
    switch key {

  case "parsers": return `_parsers_inited_`

  default:
    return super.hasOwnProperty(key)
}
  }

  public override func `get`(key: String) -> Any? {
    switch key {

  case "parsers": return `parsers`

  default:
    return super.get(key: key)
}
  }

  public override func `getSlot`(key: String) -> Slot? {
    switch key {

  case "parsers": return `parsers$`


  case "parse": return `parse$`

  default:
    return super.getSlot(key: key)
}
  }

  public override func `set`(key: String, value: Any?) {
    switch key {

  case "parsers$":
    parsers$ = value as! Slot
    return
  case "parsers":
  
    let oldValue: Any? = _parsers_inited_ ? self.`parsers` : nil
    _parsers_ = _parsers_preSet_(oldValue, _parsers_adapt_(oldValue, value))
    _parsers_inited_ = true
    _parsers_postSet_(oldValue, _parsers_)
    if hasListeners(["propertyChange", "parsers"]) && !FOAM_utils.equals(oldValue, _parsers_) {
      _ = pub(["propertyChange", "parsers", parsers$])
    }
    return

  default: break
}
super.set(key: key, value: value)
  }

  // GENERATED CODE. DO NOT MODIFY BY HAND.
  private class ClassInfo_: ClassInfo {
  
    lazy var id: String = "foam.swift.parse.parser.Seq"

    lazy var label: String = "Seq"

    lazy var parent: ClassInfo? = nil

    lazy var ownAxioms: [Axiom] = [PARSERS,PARSE]

    lazy var cls: AnyClass = Seq.self

    func `create`(args: [String:Any?] = [:], x: Context) -> Any {
      return Seq(args, x)
    }

  }

}