;; domain file: domain-beer.pddl
(define (domain default)
    (:requirements :strips :fluents)
    (:predicates
        (beerCan ?b)
        (finished ?b)
    )
    (:functions
        (beerAmount ?b)
    )
    (:action GuzzleBeer
        :parameters (?b)
        :precondition (and (>= (beerAmount ?b) 75) (beerCan ?b) )
        :effect (and
            (decrease (beerAmount ?b) 75)
        )
    )
    (:action DrinkBeer
        :parameters (?b)
        :precondition (and (>= (beerAmount ?b) 25) (beerCan ?b) )
        :effect (and
            (decrease (beerAmount ?b) 25)
        )
    )
    (:action SipBeer
        :parameters (?b)
        :precondition (and (>= (beerAmount ?b) 1) (beerCan ?b) )
        :effect (and
            (decrease (beerAmount ?b) 1)
        )
    )
    (:action CheckBeer
        :parameters (?b)
        :precondition (and (< (beerAmount ?b) 1) (beerCan ?b) )
        :effect (and
            (finished ?b)
        )
    )
)