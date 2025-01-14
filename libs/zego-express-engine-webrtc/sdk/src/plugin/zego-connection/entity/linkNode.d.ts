export declare class ListNode<K> {
    _id: number | null;
    _data: K | null;
    next: ListNode<K> | null;
    prev: ListNode<K> | null;
    constructor(id?: number | null, data?: K | null);
    set id(id: number | null);
    get id(): null | number;
    set data(data: K | null);
    get data(): K | null;
    hasNext(): null | number;
    hasPrev(): null | number;
}
export declare class LinkedList<T> {
    start: ListNode<T>;
    end: ListNode<T>;
    _idCounter: number;
    _numNodes: number;
    constructor();
    /**
     *   Inserts a node before another node in the linked list
     *   @param {Node} toInsertBefore
     *   @param {Node} node
     */
    insertBefore(toInsertBefore: ListNode<T>, data: T): ListNode<T>;
    /**
     *   Adds data wrapped in a Node object to the end of the linked list
     *   @param {object} data
     */
    addLast(data: T): ListNode<T>;
    /**
     *   Alias for addLast
     *   @param {object} data
     */
    add(data: T): ListNode<T>;
    /**
     *   Gets and returns the first node in the linked list or null
     *   @return {Node/null}
     */
    getFirst(): ListNode<T> | null;
    /**
     *   Gets and returns the last node in the linked list or null
     *   @return {Node/null}
     */
    getLast(): ListNode<T> | null;
    /**
     *   Gets and returns the size of the linked list
     *   @return {number}
     */
    size(): number;
    /**
     *   (Internal) Gets and returns the node at the specified index starting from the first in the linked list
     *   Use getAt instead of this function
     *   @param {number} index
     */
    getFromFirst(index: number): null | ListNode<T>;
    /**
     *   Gets and returns the Node at the specified index in the linked list
     *   @param {number} index
     */
    get(index: number): ListNode<T> | null;
    /**
     *   Removes and returns node from the linked list by rearranging pointers
     *   @param {Node} node
     *   @return {Node}
     */
    remove(node: ListNode<T>): ListNode<T>;
    /**
     *   Removes and returns the first node in the linked list if it exists, otherwise returns null
     *   @return {Node/null}
     */
    removeFirst(): ListNode<T> | null;
    /**
     *   Removes and returns the last node in the linked list if it exists, otherwise returns null
     *   @return {Node/null}
     */
    removeLast(): ListNode<T> | null;
    /**
     *   Removes all nodes from the list
     */
    removeAll(): void;
    /**
     *    Iterates the list calling the given fn for each node
     *    @param {function} fn
     */
    each(iterator: Function): void;
    /**
    *    Iterates the list calling the given fn for each node
    *    when fn return true, iterator exit
    *    @param {function} fn
    */
    forEach(iterator: Function): void;
    find(iterator: Function): ListNode<T> | null;
    map(iterator: Function): ListNode<T>[];
    /**
     *    Alias for addLast
     *    @param {object} data
     */
    push(data: T): ListNode<T>;
    /**
     *    Performs insertBefore on the first node
     *    @param {object} data
     */
    unshift(data: T): void;
    /**
     *    Alias for removeLast
     */
    pop(): ListNode<T> | null;
    /**
     *    Alias for removeFirst()
     */
    shift(): ListNode<T> | null;
}
