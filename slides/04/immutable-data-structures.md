<!-- .slide: data-background="#003d73" -->
# Immutable data structures

![Imnutability](https://miro.medium.com/max/1400/1*RxkciPHQuFv-zcWMGImtsw.png "Source: https://medium.com/@ffloven/immutability-4c8e0077fe9a") <!-- .element: style="height: 300px; float: right; rigth: -140px; bottom: -230px" -->

![AU Logo](./../img/aulogo_uk_var2_white.png "AU Logo") <!-- .element: style="width: 200px; position: absolute; bottom: 50px; left: 50px" -->


----

## Agenda

* What, Why
* How
    * Binary Search Tree (Set / map)
* Sets
    * union, intersect & difference
* Maps
    * foldBack
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

* Pros:
    * Immutable is easier to reason about
    * Automatically thread safe
    * Easier to implement :)
* Cons:
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
module BST =
    // Code for creating/addting etc.
```

##### Invariants
* An element `n` in a Node 
    * is always greater than all elements in left sub-tree
    * is always less than all elements in right sub-tree

Note:
We could also use .fsi files to declare functions

----

### Operations

```fsharp
type empty<'a>    = unit -> BST<'a>
type insert<'a>   = 'a -> BST<'a> -> BST<'a>
type remove<'a>   = 'a -> BST<'a> -> BST<'a>
type contains<'a> = 'a -> BST<'a> -> bool
```

Could be extended with
* Map
* Filter
* Fold
* etc

----

### Implementing `contains`

* **if** `Empty` return false
* **else**
    * **if** x < n then `look in left subtree`
    * **if** x > n then `look in right subtree`
    * **else** return true

----

### Implementing `insert`

* Algorithm: 
    1. Use a variation of `contains` to find correct place to insert
    2. Copy nodes as we move down through the tree
* Example
    * Inserting 9

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

## `Set<'a>`

* Finite
* Only elements where `ordering` is defined
* Elements are unique
* Internally represented as a `BBT<'a>`
* Immutable
    * All operations returns a new `set`
* Mathmatical set operations available

Note:
BBT: balanced binary three

Red-Black tree: [OKASAKI, C. (1999). Red-black trees in a functional setting. Journal of Functional Programming, 9(4), 471-477. doi:10.1017/S0956796899003494](https://www.cambridge.org/core/journals/journal-of-functional-programming/article/redblack-trees-in-a-functional-setting/62BC5EA75A2C95E3F6EE95AE3DADF0E5)

----

### Set Creations

```
set [1;2;3;4;5]

Set.ofList [1;2;3;4;5]

Set.add 6 (set [1;2;3;4;5])

Set.remove 3 (set [1;2;3;4;5])
```

----


### Union + Intersection + Difference

Definition

```fsharp
union:      Set<'a> -> Set<'a> -> Set<'a>
intersect:  Set<'a> -> Set<'a> -> Set<'a>
difference: Set<'a> -> Set<'a> -> Set<'a>
```

----

### Examples

```fsharp
let first = set ["a"; "b"]
let second = set ["c"; "d"]
let third = set ["a"; "d"]

Set.union first second
// val it : Set<string> = set ["a"; "b"; "c"; "d"]
Set.intersect first third
// val it : Set<string> = set ["a"]
Set.difference first third
// val it : Set<string> = set ["b"]
```

----

## Sets in general

* `map`, `filter`, `fold`, `foldBack` are all `$ O(n) $`
* complexity of recusion is in worst case `$ O(n*log(n)) $`
* Enumarations can be used to simplify and optimize this

---

## `Maps<'a>`

* Key / value pair
* Key is unique
* Look per key
* Immutable
* Implemented using `BBT<'a>`
* As Map requires ordering is defined for key type

Note:
BBT: balanced binary three

----

### Map creations

Creation is straightforward

```fsharp
let m1 = Map.empty
// From list
let m2 = Map.ofList [("k1", 1); ("k2", 2); ("k3", 3), ("k3", 4)]
// val it : Map<string,int> =
//     map [("k1", 1); ("k2", 2); ("k3", 4)]

Map.add "k5" 5 it

Map.remove "k1" it
```

----

### Search

```fsharp
find:        'Key -> Map<'Key, 'T> -> 'T
tryFind:     'Key -> Map<'Key, 'T> -> 'T option
containsKey: 'Key -> Map<'Key, 'T> -> bool
exists:      ('Key - 'T -> bool) -> Map<'Key, 'T> -> bool
```

should we try?

----

### fold and foldBack on Maps

Definition for fold, foldBack on map takes key/value pair into account

```fsharp
fold:     ('State -> 'Key -> 'T -> 'State) -> 'State
                                 -> Map<'Key, 'T> -> 'State
foldBack: ('Key -> 'T -> 'State -> 'State)
                         -> Map<'Key, 'T> -> 'State -> 'State
```

```fsharp
let m = Map.ofList [("k1", 1); ("k2", 2);
                    ("k3", 4); ("k5", 5)]
Map.fold (fun s k v -> s + v) 0 m
// val it : int = 12
```
<!-- .element: class="fragment" -->

---

## Equality

* `=` operator is defined for both `list`, `set` and `map`
* Equal is consists of same elements (structural)
    * For `list` order of elements matters

```fsharp
[1;2] = [1;2]
// val it : bool = true

[1;2] = [2;1]
// val it : bool = false

set [1;2] = set [2;1]
// val it : bool = true

set [1;2] = set [3;2]
// val it : bool = false
```

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
let nat = Seq.initInfinite (fun i -> i)
// [f 0; f 1; f 2; ...]
```

----

### Accessing

```fsharp
Seq.item 5 nat
// val it: int 5
```

* `Seq.item 5 nat` evaluates the 5th element, but not 0-4
* Calling `Seq.item 5 nat` will evaluate the 5 elements again

----

### Cache

```fsharp
// Seq.cache: seq<'a> -> seq<'a>
let cachedNat = Seq.cache nat
```

* Calling `Seq.item 5 cachedNat` will evaluate all elements from 0-5
* Calling again will not evalute elements 0-5 again

---

### Amortized bounds

* An extension to the Big-O notation from DOA
* Used to analysis avarage run time
    * Usually used when some operations are fast and other are slow

* C# List is an example, its worst case bounds
    * insert: `$ O(n) $`
    * lookup: `$ O(1) $`
    * delete: `$ O(1) $`

----

### C# List analysis over time

* `$ \rightarrow $` `n` insertions is `$ O(n^2) $`
* You can make the amortized analysis that shows <!-- .element: class="fragment"  data-fragment-index="1" -->
    * `n` insertions is `$ O(2n) $` <!-- .element: class="fragment"  data-fragment-index="1" -->
    * So amortized bounds is `$ O(1) $` for all operations <!-- .element: class="fragment"  data-fragment-index="1" -->
* Se references for detailed analysis<!-- .element: class="fragment"  data-fragment-index="1" -->

---

## Queue

![Queue](./img/queue.jpg "Queue") <!-- .element style="width:800px;" -->

----

### Definition and operation

```fsharp [5-10]
module Queue

type Queue<'a> = 'a list * 'a list

val empty: Queue<'a>
val isEmpty: Queue<'a> -> bool

val cons: 'a -> Queue<'a> -> Queue<'a>
val head: Queue<'a> -> 'a
val tail: Queue<'a> -> Queue<'a>
```

* Could be done with a single list <!-- .element: class="fragment" -->

----

### Operation implementations

```fsharp [2,7|3,8|4,9]
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


### Using lazy evaluation

To optimize our queue C. Okasaki proposes to use lazy lists (Seq in F#)

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

### Lazy queue impl (1/2)

So here we utilises that `Seq` is lazy

```fsharp
let l' = Seq.append l r
```

This do not evalute `r` before its needed

----

### Lazy queue impl (2/2)

```fsharp
let l` = Seq.append l (Seq.rev r)
```

1. since append is lazy, we need to do `Seq.rev` incrementally. 
2. so do one step of `Seq.rev` for each step of append   
3. we then need the invariant `Seq.length r <= Seq.length l`

Note:
Seq.rev - will reverse the list in one go

```fsharp
// https://github.com/fsharp/fsharp/blob/577d06b9ec7192a6adafefd09ade0ed10b13897d/src/fsharp/FSharp.Core/seq.fs#L1424
let rev source =
    checkNonNull "source" source
    mkDelayedSeq (fun () ->
        let array = source |> toArray
        Array.Reverse array
        array :> seq<_>)
```

----

### Incremental rotation

```fsharp
let rot (l, r, a) = match Seq.length l
    | 0 -> (Seq.head r) :: a    
    | 1 -> (Seq.head l) :: (rot
                (Seq.tail l, Seq.tail r, Seq.head r :: a))
```

\* Not battle tested code

\*\* Not optimized code

----

### Bounds

* Amortized bounds for all operations are still `$ O(1) $`
* Worst case `$ O(log n) $`

----

### Amortization

* Not useful in `realtime` systems
    * why?

----

### Deque idea

![Deque](./img/deque.png "Deque")


---

## References

* Complexity for F# datastructures: https://docs.microsoft.com/en-us/dotnet/fsharp/language-reference/fsharp-collection-types
* [Amortized analysis](https://www.cs.cornell.edu/courses/cs3110/2011sp/Lectures/lec20-amortized/amortized.htm)