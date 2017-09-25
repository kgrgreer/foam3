// GENERATED CODE. DO NOT MODIFY BY HAND.
public protocol PStream {
    func `head`() -> Character
    func `valid`() -> Bool
    func `tail`() -> PStream
    func `substring`(_ end: PStream) -> String
    func `value`() -> Any?
    func `setValue`(_ value: Any?) -> PStream
}