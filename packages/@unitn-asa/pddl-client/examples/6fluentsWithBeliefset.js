import { localSolver, PddlProblem, Beliefset} from "../index.js";
import fs from 'fs';

function readFile ( path ) {
    
    return new Promise( (res, rej) => {

        fs.readFile( path, 'utf8', (err, data) => {
            if (err) rej(err)
            else res(data)
        })

    })

}

async function main () {
    const myBeliefset = new Beliefset();
    myBeliefset.declare( 'beerCan can1' );
    myBeliefset.declareFluent( 'beerAmount can1 130' );

    var pddlProblem = new PddlProblem(
        'lights',
        myBeliefset.objects.join(' '),
        myBeliefset.toPddlString(),
        'and (finished can1)'
    )
    
    
    let problem = pddlProblem.toPddlString();


    console.log( problem );
    let domain = await readFile('./examples/domain-beer.pddl' );
    console.log ('now calling local solver');
    var plan = await localSolver(domain, problem);
    console.log( plan );
    

}

main();