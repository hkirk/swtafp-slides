<!-- .slide: data-background="#003d73" -->
# Immutable data structures

![AU Logo](./../img/aulogo_uk_var2_white.png "AU Logo") <!-- .element style="width: 200px; position: fixed; bottom: 50px; left: 50px" -->

----

## Agenda

* What, Why
* How
    * Binary Search Tree (Set / map)
* Sequence in F#
    * Queue
    * Deque

---

## What

* Mutating operations
    * Should not change structure
    * Copy
* Shares data between versions

----

## Why

Pros: 

* Immutable is easier to reason about
* Automatically thread safe
* Easier to implement :)

Cons
* Slower?
* Uses more memory
* Harder to implement :)

---

## Binary search tree

![BST](./img/bst.png "Binary search tree") <!-- .element style="height: 500px;" -->

----

### Type

```fsharp
type BST<'a> =
  | Empty
  | Node of BST<'a> * 'a * BST<'a>
```

plus invariants
* An element `n` in a Node 
    * is always greater than all elements in left sub-tree
    * is always less than all elements in right sub-tree

Note: We could also use .fsi files to declare functions

----

### Operations

```fsharp
type empty<'a> = unit -> BST<'a>
type insert<'a> = 'a -> BST<'a> -> BST<'a>
type remove<'a> = 'a -> BST<'a> -> BST<'a>
type contains<'a> 'a -> BST<'a> -> bool
```

Could be extended with
* Map
* Filter
* Fold
* etc

----

### Implementing `contains`

* If `Empty` return false
* Else
    * if x < e then `look in left subtree`
    * if x > e then `look in right subtree`
    * else return true

----

### Implementing `insert`

1. Use a variation of `contains` to find correct place to insert
2. Copy nodes as we move down through the tree

E.g.

Inserting 9

----

### Step 1 

![BST](./img/insert1.png "Binary search tree") <!-- .element style="height: 500px;" -->

----

### Step 2

![BST](./img/insert2.png "Binary search tree") <!-- .element style="height: 500px;" -->

----

### Step 3

![BST](./img/insert3.png "Binary search tree") <!-- .element style="height: 500px;" -->


---

<!-- .slide: data-background-image="./img/infinite.jpg" data-background-opacity="0.5" -->
## Sequence


----

### Lazy

* Sequences in F# are lazy
* Possibly infinite

```fsharp
// Create finite
seq [1;2;3;4;5]
// Create infinite
let nat = Seq.iniInfinite (fun i -> i)
// [f 0; f 1; f 2; ...]
```

----

### Accessing

```fsharp
Seq.nth 5 nat
// val it: int 5
```

* `Seq.nth 5 nat` evaluates the 5th element, but not 0-4
* Calling `Seq.nth 5 nat` will evaluate the 5 elements again

----

### Cache

```fsharp
// Seq.cache: seq<'a> -> seq<'a>
let cachedNat = Seq.cache nat
```

* Calling `Seq.nth 5 cachedNat` will evaluate all elements from 0-5
* Calling again will not evalute elements 0-5 again

---

## Queue

![Queue](./img/queue.png "Queue")


----

### Definition and operation

```fsharp
module Queue

type Queue<'a> = 'a list * 'a list

val empty: Queue<'a>
val isEmpty: Queue<'a> -> bool

val cons: 'a -> Queue<'a> -> Queue<'a>
val head: Queue<'a> -> 'a
val tail: Queue<'a> -> Queue<'a>
```

----

### Operation implementations

* Could be done with a single list

```fsharp
let rec head = function
    | ([], []) -> raise (ArgumentException "Empty")
    | ([], r)  -> head (List.rev r, [])
    | (l, _)   -> List.head l 
    
let rec tail = function
    | ([], []) -> raise (ArgumentException "Empty")
    | ([], r)  -> tail (List.rev r, [])
    | (l, r)   -> (List.tail l, r)
```

----

### Amortized bounds

* An extention to the Big-O notation from DOA
* Used to analysis avarage run time
    * Usually used when some operations are fast and other are slow

* C# List is an example
    * insert: `$ O(n) $`
    * lookup: `$ O(1) $`
    * delete: `$ O(1) $`

----

### C# List analysis over time

* `$ \rightarrow $` `n` insertions is `$ O(n^2) $`
* You can make the amortized analysis that shows <!-- .element: class="fragment"  data-fragment-index="1" -->
    * `n` insertions is `$ O(n) $` <!-- .element: class="fragment"  data-fragment-index="1" -->
    * So amortized bounds is `$ O(n) $` for all operations <!-- .element: class="fragment"  data-fragment-index="1" -->
* Se references for detailed analysis<!-- .element: class="fragment"  data-fragment-index="1" -->

----

### Using lazy evaluation

To optimize our queue C. Okasaki proposes to use layz lists (Seq in F#)

```fsharp
module LazyQueue

type LazyQueue<'a> = seq<'a> * seq<'a>

val empty: LazyQueue<'a>
val isEmpty: LazyQueue<'a> -> bool

val cons: 'a -> LazyQueue<'a> -> LazyQueue<'a>
val head: LazyQueue<'a> -> 'a
val tail: LazyQueue<'a> -> LazyQueue<'a>
```
<!-- .element: class="fragment" -->

----

### Lazy queue

TODO: 

----

### Amortization

* Not useful in `realtime` systems
    * why?


TODO: 

----

### Deque idea

![Deque](./img/deque.png "Deque")


---

## References

* [Amortized analysis](https://www.cs.cornell.edu/courses/cs3110/2011sp/Lectures/lec20-amortized/amortized.htm)
