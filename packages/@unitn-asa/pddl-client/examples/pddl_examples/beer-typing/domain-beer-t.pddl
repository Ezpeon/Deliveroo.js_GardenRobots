;; domain file: domain-beer.pddl
(define (domain defaultTypes)
    (:requirements :strips :fluents :typing)
    (:types beerCan)
    (:predicates
        (finished ?b - beerCan)
    )
    (:functions
        (beerAmount ?b)
    )
    (:action GuzzleBeer
        :parameters (?b - beerCan)
        :precondition (and (>= (beerAmount ?b) 75))
        :effect (and
            (decrease (beerAmount ?b) 75)
        )
    )
    (:action DrinkBeer
        :parameters (?b - beerCan)
        :precondition (and (>= (beerAmount ?b) 25))
        :effect (and
            (decrease (beerAmount ?b) 25)
        )
    )
    (:action SipBeer
        :parameters (?b - beerCan)
        :precondition (and (>= (beerAmount ?b) 1))
        :effect (and
            (decrease (beerAmount ?b) 1)
        )
    )
    (:action CheckBeer
        :parameters (?b - beerCan)
        :precondition (and (< (beerAmount ?b) 1))
        :effect (and
            (finished ?b)
        )
    )
)