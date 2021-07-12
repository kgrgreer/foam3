Chain of mementos is used to store state of application.

Mementos are managed by views.

Memento's head stores state (eg view name, scroll position, search term) and memento tail stores reference to the following memento.

Memento has changeIndicator to update its parent if it's value changes.
Application Controller takes care of updating window's hash if memento changed and vice versa.

Memento's chain length is calculated beforehand, so even if there is no memento value set by a certain view, which supports memento, there is memento with empty string head reserved for it in memento chain.

StackView updates memento's chain if view that's pushed to Stack has mementoHead so it's visible in url.
On Stack's back action executed there is a check if memento chain was changed with the view (which user "leaves" by going back) and if so it'll be cleaned.
