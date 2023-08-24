;; domain file: pathfindingDomain.pddl
(define (domain defaultFluent)
    (:requirements :strips :fluents)
    (:predicates
        (tile ?t)
        (robot ?r)
        (plant ?p)
        (refillPoint ?rp)

        (unknownplantstate ?p)
        (isDry ?p)
        (toCollect ?p)
        (isMissing ?p)
        (isOk ?p)

        (isReady ?r)
        (isAt ?x ?t)
        
        (leftof ?t1 ?t2) ;to read as "left of t1 there is t2"
        (rightof ?t1 ?t2)
        (above ?t1 ?t2)
        (under ?t1 ?t2)
        
    )
    
    (:functions
        (waterlevel ?r)
    )
    (:action goleft
        :parameters (?r ?tnow ?ttarget)
        :precondition (and (robot ?r) (tile ?tnow) (tile ?ttarget) (isAt ?r ?tnow) (leftof ?tnow ?ttarget))
        :effect (and
            (isAt ?r ?ttarget)
            (not (isAt ?r ?tnow))
        )
    )
    
    (:action goright
        :parameters (?r ?tnow ?ttarget)
        :precondition (and (robot ?r) (tile ?tnow) (tile ?ttarget) (isAt ?r ?tnow) (rightof ?tnow ?ttarget))
        :effect (and
            (isAt ?r ?ttarget)
            (not (isAt ?r ?tnow))
        )
    )

    (:action goup
        :parameters (?r ?tnow ?ttarget)
        :precondition (and (robot ?r) (tile ?tnow) (tile ?ttarget) (isAt ?r ?tnow) (above ?tnow ?ttarget))
        :effect (and
            (isAt ?r ?ttarget)
            (not (isAt ?r ?tnow))
        )
    )

    (:action godown
        :parameters (?r ?tnow ?ttarget)
        :precondition (and (robot ?r) (tile ?tnow) (tile ?ttarget) (isAt ?r ?tnow) (under ?tnow ?ttarget))
        :effect (and
            (isAt ?r ?ttarget)
            (not (isAt ?r ?tnow))
        )
    )

    (:action water
        :parameters (?r ?p ?t)
        :precondition (and (robot ?r) (plant ?p) (isAt ?p ?t) (isAt ?r ?t) (isDry ?p)  (>= (waterlevel ?r) 120) )
        :effect (and
            (not (isDry ?p) )
            (isOk ?p)
            (decrease (waterlevel ?r) 120 )
        )
    )
    
    (:action pick
        :parameters (?r ?p ?t)
        :precondition (and (robot ?r) (plant ?p) (tile ?t) (isAt ?p ?t) (isAt ?r ?t) (toCollect ?p) (isReady ?r))
        :effect (and
            (not (toCollect ?p))
            (not (isReady ?r))
            (isOk ?p)
        )
    )

    (:action seed
        :parameters (?r ?p ?t)
        :precondition (and (robot ?r) (plant ?p) (tile ?t) (isAt ?p ?t) (isAt ?r ?t) (isMissing ?p))
        :effect (and
            (not (isMissing ?p))
            (isOk ?p)
        )
    )

    (:action check
        :parameters (?r ?p ?t)
        :precondition (and (robot ?r) (plant ?p) (tile ?t) (isAt ?p ?t) (isAt ?r ?t) (unknownplantstate ?p) )
        :effect (and
            (not (unknownplantstate ?p))
            (isOk ?p)
        )
    )

    (:action dropFruit
        :parameters (?r ?rp ?t)
        :precondition (and (robot ?r) (refillPoint ?rp) (tile ?t) (isAt ?rp ?t) (isAt ?r ?t) (not (isReady ?r)))
        :effect (and
            (isReady ?r)
        )
    )

    (:action refillWater
        :parameters (?r ?rp ?t)
        :precondition (and (robot ?r) (refillPoint ?rp) (tile ?t) (isAt ?rp ?t) (isAt ?r ?t) )
        :effect (and
            (assign (waterlevel ?r) 900)
        )
    )
)