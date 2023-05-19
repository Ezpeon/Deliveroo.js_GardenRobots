;; problem file: problem-beer.pddl
(define (problem defaultTypes)
    (:domain default)
    (:objects
        can1 - beerCan
    )
    (:init 
        (= (beerAmount can1) 330)
    )
    (:goal (and (finished can1)))
)
