;; problem file: problem-beer.pddl
(define (problem default)
    (:domain default)
    (:objects
        can1
    )
    (:init 
        (beerCan can1)
        (= (beerAmount can1) 330)
    )
    (:goal (and (finished can1)))
)
