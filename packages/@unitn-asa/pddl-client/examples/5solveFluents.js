import { localSolver } from "../index.js";
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

    let problem = await readFile('./examples/pathfindtest1010F.pddl' );
    //console.log( problem );
    let domain = await readFile('./examples/pathfindingDomainF.pddl' );

    var plan = await localSolver(domain, problem);
    console.log( plan );
    

}

main();