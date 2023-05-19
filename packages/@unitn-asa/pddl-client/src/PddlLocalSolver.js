
import { exec } from 'child_process';
import fs from 'fs';

/**
 * @typedef { { parallel: boolean, action: string, args: string [] } } pddlPlanStep
 */

async function sh(cmd) {
    return new Promise(function (resolve, reject) {
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                reject(err);
            } else {
                resolve({ stdout, stderr });
            }
        });
    });
}



/**
 * @param {String} pddlDomain 
 * @param {String} pddlProblem 
 * @returns { Promise < pddlPlanStep [] > }
 */
export default async function localSolver (pddlDomain, pddlProblem) {

    if ( typeof pddlDomain !== 'string' && ! pddlDomain instanceof String ){
        throw new Error( 'pddlDomain is not a string' );
    }

    if ( typeof pddlProblem !== 'string' && ! pddlProblem instanceof String ){

        throw new Error( 'pddlProblem is not a string' );
    }

    let probFile = 'p.pddl';
    let allOkp = new Promise( (res, rej) => {

        fs.writeFile(probFile, pddlProblem, err => {
            if (err)
                rej(err)
            else // console.log("File written successfully");
                res(probFile)
        })
    })
    let domFile = 'd.pddl';
    let allOkd = new Promise( (res, rej) => {

        fs.writeFile(domFile, pddlDomain, err => {
            if (err)
                rej(err)
            else // console.log("File written successfully");
                res(domFile)
        })
    })


    let { stdout } = await sh('java -jar enhsp-20.jar -o d.pddl -f p.pddl -planner opt-hmax');
    let foundstart = false;
    let foundend = false;
    let counter = 0;
    
    var plan = []

    for (let line of stdout.split('\n')) {
        
        //console.log('enhsp: ' + line);

        if (!foundstart){
            let first = line.split(' ')[0]
            if (first == "Found"){
                foundstart = true;
                //console.log ("start ------------------------------");
            }
        } else if (foundstart && !foundend){
            let splitOnOpen = line.split('(');
            if (splitOnOpen[0] == counter + ".0: "){
                //console.log('enhsp: ' + line);//-------------------------------------------------------planner output here
                let actionplusargsstring = splitOnOpen[1].replace(')','');
                let actionplusargs = actionplusargsstring.split(' ');
                let action = actionplusargs[0];
                let args = [];
                let argcount = 0;
                for (let aa of actionplusargs){
                    if (aa != action){
                        args[argcount] = aa;
                        argcount++;
                    }
                }
                plan.push( { parallel: false/*number==previousNumber*/, action: action, args: args } );

            } else {
                foundend = true;
                //console.log ("end ------------------------------");
            }
            counter++;
        } else {
        }

    }
    
    return plan;
}
