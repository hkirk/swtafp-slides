<!-- .slide: data-background="#003d73" -->
## Reactive programming

![AU Logo](./../img/aulogo_uk_var2_white.png "AU Logo") <!-- .element style="width: 200px; position: fixed; bottom: 50px; left: 50px" -->

----

### Agenda

* Reactive programming
* Observables in F#
* Akka.NET Streams


---

<!-- .slide: style="font-size: 32px" -->

### Push vs Pull

* Two ways to get data: the consumer or the producer drives<!-- .element: class="fragment" -->

| | Pull | Push |
|---|---|---|
| Interface | `IEnumerable<'T>` | `IObservable<'T>` |
| Driver | Consumer asks for next | Producer delivers |
| Example | read lines from file | timer ticks |
<!-- .element: class="fragment" -->


----

#### The spreadsheet model

* <!-- .element: class="fragment" -->A spreadsheet cell <code>A1 = B1 + C1</code> recomputes when <code>B1</code> changes<br/>
* <!-- .element: class="fragment" -->This is <b>reactive</b>: derived values update themselves
    * producer-driven, push

----

#### Same data, pull version

```fsharp [1-3|5-12]
// Cell values over time - updates made by someone else
let b1 = [10; 11; 30]   // B1 changes twice
let c1 = [ 2;  2; 2]      // C1 never changes

// PULL: the consumer drives. Time must be reconstructed...
// ...by zipping the timelines and asking for each value
let a1 =
    Seq.zip b1 c1
    |> Seq.mapi (fun t (b, c) -> t, b, c, b + c)

for t, b, c, a in a1 do // each iteration is one Ask
    printfn "t=%d: A1 = %d" t a
```


note: 
* No recomputation, no 'when'<!-- .element: class="fragment" -->
    * consumer must zip roles and rebuild time itself<!-- .element: class="fragment" -->

----

#### Reactive programming

* Declarative paradigm<!-- .element: class="fragment" -->
    * responding to events - values pushed over time
* Libraries<!-- .element: class="fragment" -->
    * Rx family: RxJS (Angular, ...), Rx.NET, RxJava
        * F# has a small Observable module built in
* Akka.Streams (Java and .NET)<!-- .element: class="fragment" -->
    * push with backpressure

----

#### When to use

- Events arrive on their own schedule<!-- .element: class="fragment" -->
    - user input, sensor readings, network messages
rate or timing is not under your control
- You compose transformations on the stream<!-- .element: class="fragment" -->
    - filter, aggregate, merge, throttle - declaratively
- Multiple producers, one consumer (or the reverse)<!-- .element: class="fragment" -->
    - merging and splitting streams is the normal case
- View state that follows data<!-- .element: class="fragment" -->
    - e.g. a counter shown in the UI recalculated on every tick


----

### Why is this Functional Programming?

- Streams are just values<!-- .element: class="fragment" -->
    - pipelines are constructed, passed and reused
- The operators are the FP toolbox<!-- .element: class="fragment" -->
    - map, filter, scan (fold), zip - like list
- Immutable data flowing through<!-- .element: class="fragment" -->
    - events are immutable messages
- Declarative composition, not imperative loops<!-- .element: class="fragment" -->
    - describe what the pipeline is, not how it iterates


---

### Creating events

```fsharp [1-5|12-15]
let createTimer timerInterval eventHandler =
    let timer = new System.Timers.Timer(float timerInterval)
    timer.AutoReset <- true

    timer.Elapsed.Add eventHandler

    async {
        timer.Start()
        do! Async.Sleep 5000
        timer.Stop()
    }
// call createTimer
let basicHandler _ = printfn "tick1 %A" DateTime.Now
let basicTimer1 = createTimer 1000 basicHandler
Async.RunSynchronously basicTimer1
```

----

### Using the built in F# Observable

```fsharp [1-13|14-21]
let createTimerAndObservable timerInterval =
    let timer = new System.Timers.Timer(float timerInterval)
    timer.AutoReset <- true

    let observable = timer.Elapsed

    let task = async {
        timer.Start()
        do! Async.Sleep 5000
        timer.Stop()
    }

    (task,observable)
// Calling from somewhere else
let basicTimer2, timerEventStream =
        createTimerAndObservable 1000
let subscription = timerEventStream
    |> Observable.subscribe //basicHandler
            (fun _ -> printfn "tick2 %A" DateTime.Now)
Async.RunSynchronously basicTimer2
subscription.Dispose ()
```

note:

IEvent<'T> in FSharp.Core inherits from both System.IObservable<'T> and IDelegateEvent, which is why you can pipe timer.Elapsed straight into Observable.subscribe and the Observable module operators


----

### Piping events

```fsharp
let timerCount2, timerEventStream = createTimerAndObservable 500
timerEventStream
|> Observable.scan (fun count _ -> count + 1) 0
|> Observable.subscribe (fun count -> printfn "1 timer ticked with count %i" count)
|> ignore // disposable not disposed 
```

note:

- scan carries state through the stream
- scan emits at every step - fold calculate 'result'

----

### Observable contract

* A stream delivers exactly one of three things<!-- .element: class="fragment" -->
  * OnNext - zero or more values
  * OnError - the stream failed, then it is done
  * OnCompleted - the stream ended normally
* Observable.subscribe handler only wires OnNext<!-- .element: class="fragment" -->
* Full contract needs three callbacks<!-- .element: class="fragment" -->

```fsharp
let subscription =
    timerEventStream
    |> Observable.subscribe (fun t -> printfn "OnNext %A" t)
                             (fun e -> printfn "OnError %A" e)
                             (fun () -> printfn "OnCompleted")
```
<!-- .element: class="fragment" -->

----

### Merging events

```fsharp
let fastTicks, fastStream = createTimerAndObservable 500
let slowTicks, slowStream = createTimerAndObservable 1500

fastStream
|> Observable.map (fun _ -> "A")
|> Observable.merge
    (slowStream |> Observable.map (fun _ -> "B"))
|> Observable.subscribe (printfn "tick from %s")
|> ignore
```

```
// output
tick from A
tick from A
tick from B
tick from A
...
```
<!-- .element: class="fragment" -->

---

### Akka Streams

* Streaming model built on top of Akkas actors<br/><!-- .element: class="fragment" -->
* Backpressure is handled explicitly by framework<br/><!-- .element: class="fragment" -->
    * fast sources can't drown slow sinks
* Can be distributed on different nodes<br/><!-- .element: class="fragment" -->
* Error handling uses Supervision strategy<br/><!-- .element: class="fragment" -->

----

### Building blocks

* Source - originator for data<br/><!-- .element: class="fragment" -->
* Flow - processing step<br/><!-- .element: class="fragment" -->
    * 1 input - 1 output
* Sink - Endpoint stream<br/><!-- .element: class="fragment" -->
* Graph DSL<br/><!-- .element: class="fragment" -->
    * With faning out `Broadcast` and `Balance`, ...
    * and faning in `MergePrefered`, ...


----

### Examples

```fsharp
open Akka.Streams
open Akka.Streams.Dsl

let system = ActorSystem.Create("MySteamSystem")
let materializer = system.Materializer ()

Source.From([ 1 .. 100 ])
        .Via(Flow.Create<int>().Select(fun x -> x * 2))
        .To(Sink.ForEach(fun x -> printfn "%d" x))
        .Run(materializer)
```

----

### Backpressure

* The consumer signals demand upstream<!-- .element: class="fragment" -->
    * a slow sink simply asks for fewer elements
* Built-in operators make the rate explicit<!-- .element: class="fragment" -->

```fsharp
Source.From([ 1 .. 100000 ])
        .Via(Flow.Create<int>().Select(fun x -> x * 2)
                .Throttle(2, TimeSpan.FromSeconds 1., 5, ThrottleMode.Shaping))
        .To(Sink.ForEach(fun x -> printfn "%s -- %d" (DateTime.Now.ToString "HH:mm:ss.fff") x))
        .Run(materializer)
```
<!-- .element: class="fragment" -->


----

### Why backpressure works

Mailbox flow
* Each stage is an actor<br/><!-- .element: class="fragment" -->
* Unbounded push into an actor<br/><!-- .element: class="fragment" -->
* Reactive Streams demand signaling: bounded mailbox, upstream waits<br/><!-- .element: class="fragment" -->
* Same principle as supervision: containment instead of overload<br/><!-- .element: class="fragment" -->


----

### Error handling 

- A failing stage does not kill the stream by surprise<!-- .element: class="fragment" -->
- You choose the strategy, as with actor supervision<!-- .element: class="fragment" -->

```fsharp
let decider =
      Supervision.Decider(fun cause ->
        match cause with
        | :? FormatException -> Supervision.Directive.Restart
        | _                  -> Supervision.Directive.Stop)
let parse =
    Flow.Create<string>()
        .Select(fun s -> int s) // may throw
        .WithAttributes(ActorAttributes.CreateSupervisionStrategy(decider));


let completion =
    Source.From([ "1"; "x"; "3" ])
        .Via(parse)
        .To(Sink.ForEach(fun x -> printfn "%d" x))
        .Run(materializer)
// Resume: 1, 3 are printed, "x" is skipped
```
<!-- .element: class="fragment" -->


----

### Graph shape

- Linear pipelines are a special case<br/><!-- .element: class="fragment" -->
- Fan-out: Broadcast (all), Balance (any)<br/><!-- .element: class="fragment" -->
- Fan-in: Merge (any order), MergePreferred (prefer one), Zip (paired), Concat (sequential)<br/><!-- .element: class="fragment" -->
- Built with the Graph DSL when the flow is not a straight line<br/><!-- .element: class="fragment" -->

```fsharp
// one source, two sinks: every element to both
let bcast = GraphDsl.Create(fun b ->
    let broadcast = b.Add(new Broadcast<int>(2))
    b.From(b.Add(source)).To(broadcast) |> ignore
    b.From(broadcast).To(sink1) |> ignore
    b.From(broadcast).To(sink2) |> ignore
    ClosedShape.Instance)
```
<!-- .element: class="fragment" -->


note:

```fsharp
let source = Source.From [1 .. 10]
let sink1 = Sink.ForEach(fun x -> printfn $"sink1 {x}")
let sink2 = Sink.ForEach(fun x -> printfn $"sink2 {x}")

//...

RunnableGraph.FromGraph(bcast).Run(materializer) |> ignore



output

sink1 1
sink1 1
sink1 2
sink1 2
sink1 3
sink1 3
sink1 4
sink1 4
sink1 5
sink1 5
sink1 6
sink1 6
sink1 7
sink1 7
sink1 8
sink1 8
sink1 9
sink1 9
sink1 10
sink1 10
```

----

### Difffences

* Observable<!-- .element: class="fragment" -->
    * Declarative
    * Caller thread/scheduler
    * LINQ syntax
* Akka Stream<!-- .element: class="fragment" -->
    * actor based
    * Distributed
    * Backpressure



---

### References 

* [Observable](https://fsharp.github.io/fsharp-core-docs/reference/fsharp-control-observablemodule.html)
* [F# For fun and profits](https://fsharpforfunandprofit.com/posts/concurrency-reactive/)