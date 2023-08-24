const Observable =  require('./Observable')
const Xy =  require('./Xy')
const Grid =  require('./Grid')
const Tile =  require('./Tile');
const Parcel =  require('./Parcel');
const config =  require('../../config');
const BulletinBoard = require('./BulletinBoard');


const numberofbots = 4;
const MOVEMENT_DURATION = process.env.MOVEMENT_DURATION || config.MOVEMENT_DURATION || 500;
const AGENTS_OBSERVATION_DISTANCE = process.env.AGENTS_OBSERVATION_DISTANCE || config.AGENTS_OBSERVATION_DISTANCE || 5;
const PARCELS_OBSERVATION_DISTANCE = process.env.PARCELS_OBSERVATION_DISTANCE || config.PARCELS_OBSERVATION_DISTANCE || 5;
const MAX_GROWTH_TIME = config.MAX_GROWTH_TIME || 4500;
const MAX_WATER_LEVEL_PLANT = config.MAX_WATER_LEVEL_PLANT || 300;
const WATER_STORAGE = 840 * numberofbots;
const WATER_LEVEL_LIMIT = config.PARCEL_REWARD_AVG || 240;


/**
 * @class Agent
 * @extends Observable
 * @property {Set<Agent>} sensing agents in the sensed area
 */
class Agent extends Xy {

    static #lastId = 0;
    
    /** @type {Grid} #grid */
    #grid;
    /** @type {string} id */
    id;
    /** @type {string} name */
    name;
    /** @type {Set<Agent>} sensing agents in the sensed area */
    sensing;
    /** @type {Number} score */
    score = 0;
    /** @type {Set<Parcel>} #carryingParcels *///-----------------------------------------------remove-----------------------------------
    #carryingParcels = new Set();

    // get carrying () {
    //     return Array.from(this.#carryingParcels);
    // }

    //resourceLevel = 0; //--------------------score-----------------------------------
    //fuel = 0;//----------------------------------------------------------------------------------------------------------------
    collectedPotato = false;

    /**
     * @constructor Agent
     * @param {Grid} grid
     * @param {{id:number,name:string}} options
     */
    constructor ( grid, options) {
        
        {
            let x, y, found=false;
            for (x=0; x<10 && !found; x++)
                for (y=0; y<10 && !found; y++) {
                    found = ( grid.getTile(x, y).blocked ? false : grid.getTile(x, y).lock() );
                    // console.log( x, y, (found?'found':'occupied') )
                }
            // if ( !found )
            //     throw new Error('No unlocked tiles available on the grid')
            
            super(--x, --y);
        }
        //--------------------------------------------------------remove----------------------------------------------------------------------
        Object.defineProperty (this, 'carrying', {
            get: () => Array.from(this.#carryingParcels).map( ({id, reward}) => { return {id, reward}; } ), // Recursion on carriedBy->agent->carrying->carriedBy ... 
            enumerable: false
        });

        // Emit score on score assignment
        this.interceptValueSet('score', 'score')

        // Group 'xy', 'score', 'pickup', 'putdown' => into 'agent' event
        this.on('xy', this.emitOnePerTick.bind(this, 'agent') );
        this.on('score', this.emitOnePerTick.bind(this, 'agent') );
        // this.on('pickup', this.emitOnePerTick.bind(this, 'agent') );
        // this.on('putdown', this.emitOnePerTick.bind(this, 'agent') );

        this.#grid = grid;
        this.id = options.id || 'a' + Agent.#lastId++;
        this.name = options.name || this.id;
        this.sensing = new Set();
        this.score = 1;

        this.emitOnePerTick( 'xy', this ); // emit agent when spawning

    }



    /**
     * Agents sensend on the grid
     * @type {function(Agent,Array<Parcel>): void}
     */
    emitAgentSensing () {

        var agents = [];
        for ( let agent of this.#grid.getAgents() ) {
            if ( agent != this && Xy.distance(agent, this) < AGENTS_OBSERVATION_DISTANCE ) {
                const {id, name, x, y, score} = agent
                agents.push( {id, name, x, y, score} )
            }
        }
        this.emitOnePerTick( 'agents sensing', agents )
        
        // this.emitOnePerTick( 'agents sensing',
        //     Array.from( this.#grid.getAgents() ).filter( a => a != this && Xy.distance(a, this) < 5 ).map( ( {id, name, x, y, score} ) => { return {id, name, x, y, score} } )
        // );

        // TO-DO How to emit an empty array when no agents ?
        // for ( let agent of this.#grid.getAgents() ) {
        //     if ( Xy.distance(agent, this) < 5 ) {
        //         let {id, name, x, y, score} = agent;
        //         this.emitAccumulatedAtNextTick( 'agents sensing', {id, name, x, y, score} )
        //     }
        // }

    }



    /**
     * Parcels sensend on the grid
     *///---------------------------------------------------change-----------------------------------------------------------
    emitParcelSensing () {

        var parcels = [];
        for ( const parcel of this.#grid.getParcels() ) {
            if ( Xy.distance(parcel, this) < PARCELS_OBSERVATION_DISTANCE ) {
                let {id, x, y, carriedBy, reward} = parcel;
                parcels.push( {id, x, y, carriedBy: ( parcel.carriedBy ? parcel.carriedBy.id : null ), reward} )
            }
        }
        this.emit( 'parcels sensing', parcels )
        
        // this.emitOnePerTick( 'parcels sensing',
        //     Array.from( this.#grid.getParcels() ).filter( p => Xy.distance(p, this) < 5 ).map( p => {
        //         return {
        //             id: p.id,
        //             x: p.x,
        //             y: p.y,
        //             carriedBy: ( p.carriedBy ? p.carriedBy.id : null ),
        //             reward: p.reward
        //         };
        //     } )
        // );

        // TO-DO How to emit an empty array when no parcels ?
        // for ( let parcel of this.#grid.getParcels() ) {
        //     if ( Xy.distance(parcel, this) < 5 ) {
        //         this.emitAccumulatedAtNextTick( 'parcels sensing', {
        //             id: parcel.id,
        //             x: parcel.x,
        //             y: parcel.y,
        //             carriedBy: ( parcel.carriedBy ? parcel.carriedBy.id : null ),
        //             reward: parcel.reward
        //         } )
        //     }
        // }

    }

    dayAfter(){
        //console.log (this.name + ": what a wonderful new day!");
        this.emit('dayPassed', 'dayday');
    }

    get tile() {
        return this.#grid.getTile( Math.round(this.x), Math.round(this.y) );
    }

    async stepByStep ( incr_x, incr_y ) {
        var init_x = this.x
        var init_y = this.y
        this.x = ( this.x * 10 + incr_x*6 ) / 10; // this keep it rounded at .1
        this.y = ( this.y * 10 + incr_y*6 ) / 10; // this keep it rounded at .1
        for(let i=0; i<10; i++) {
            await new Promise( res => setTimeout(res, MOVEMENT_DURATION / 10))
            // this.x = ( this.x * 10 + incr_x ) / 10; // this keep it rounded at .1
            // this.y = ( this.y * 10 + incr_y ) / 10; // this keep it rounded at .1
            // console.log("moving into ", (init_x * 10 + incr_x * i ) / 10, this.y)
        }
        this.x = init_x + incr_x
        this.y = init_y + incr_y

        
    }

    moving = false;
    async move ( incr_x, incr_y ) {
        if ( this.moving ) // incr_x%1!=0 || incr_y%1!=0 ) // if still moving
            return false;
        let fromTile = this.tile;
        // if (!fromTile)
        //     return false;
        let toTile = this.#grid.getTile( this.x+incr_x, this.y+incr_y );
        if ( toTile && !toTile.blocked && toTile.lock() ) {
            // console.log(this.id, 'start move in', this.x+incr_x, this.y+incr_y)
            this.moving = true;
            await this.stepByStep( incr_x, incr_y );
            // console.log(this.id, 'done move in', this.x, this.y)
            this.moving = false;
            fromTile.unlock();
            // this.emitParcelSensing(); // NO! this is done outside
            if (this.name.localeCompare("Watame") == 0){
                this.#grid.totalFuel+= Math.floor(WATER_STORAGE/960);
            }else {
                this.#grid.totalFuel++;//-------------------------idk if here is the best place for this
            }
            return true;
        }
        // console.log(this.id, 'fail move in', this.x+incr_x, this.y+incr_y)
        return false;
    }

    up () {
        // console.log(this.id + ' move up')
        return this.move(0, 1);
    }

    down () {
        // console.log(this.id + ' move down')
        return this.move(0, -1);
    }

    left () {
        // console.log(this.id + ' move left')
        return this.move(-1, 0);
    }

    right () {
        // console.log(this.id + ' move right')
        return this.move(1, 0);
    }

    /**
     * @type {function(): void}
     */
    interact () {

        let robType = Array.from(this.name)[0];
        if (this.tile.delivery == true){
            if (robType === 'W'||robType === 'w'){
                this.#grid.totalWater += WATER_STORAGE;
                this.#grid.totalWater -= this.score;
                this.#grid.totalRefills++;
                this.score = WATER_STORAGE;
                //console.log (this.name + "refilled water");
                if (this.name.localeCompare("Watame") == 0){
                    this.#grid.updateDay();
                    console.log ("W is ready for tomorrow");
                }
            } else if (robType === 'H'||robType === 'h'){
                if (this.collectedPotato == true){
                    this.collectedPotato = false;
                    this.score+=9;
                    this.#grid.totalPotatoes++;
                }
            }

        }
        
        for ( const /**@type {Parcel} parcel*/ parcel of this.#grid.getParcels() ) {
            if ( parcel.x == this.x && parcel.y == this.y) {
                if (robType === 'W'||robType === 'w'){
                    if (parcel.reward>0 && parcel.reward <= (MAX_WATER_LEVEL_PLANT) && this.score >= (MAX_WATER_LEVEL_PLANT-parcel.reward) && parcel.growthStage<MAX_GROWTH_TIME){
                        this.score -= (MAX_WATER_LEVEL_PLANT-parcel.reward);
                        parcel.reward = MAX_WATER_LEVEL_PLANT;
                    } else if (parcel.reward>0 && parcel.reward <= (MAX_WATER_LEVEL_PLANT) && this.score > 0 && parcel.growthStage<MAX_GROWTH_TIME){
                        parcel.reward += this.score;
                        this.score = 0;
                    }
                } else if (robType === 'S'||robType === 's'){
                    if (parcel.reward==0){
                        parcel.reward = WATER_LEVEL_LIMIT;
                        parcel.growthStage = 0;
                        this.score += 1;
                    }
                } else if (robType === 'H'||robType === 'h'){
                    if (parcel.reward == -1 && this.collectedPotato == false){
                        parcel.growthStage = 0;
                        parcel.reward = 0;
                        this.collectedPotato = true;
                        this.score+=1;
                    }
                }
                if (robType === 'H'||robType === 'h'||robType === 'S'||robType === 's'){
                    this.#grid.completeJob();
                }
            }
        }



        
    }

    /**
     * @type {function([id:String]): void}
     */
    //-----------------------------------------------------------------remove or change to check -> post job--------------------------------------------------
    putDown ( ids = null ) {
        var tile = this.tile
        var sc = 0;
        var dropped = new Array();
        var toPutDown = Array.from( this.#carryingParcels );    // put down all parcels
        if ( ids && ids.length > 0 )                            // put down specified parcels
            toPutDown = toPutDown.filter( p => ids.includes( p.id ) );
        for ( const parcel of this.#carryingParcels ) {
            this.#carryingParcels.delete(parcel);
            parcel.carriedBy = null;
            // parcel.x = this.x;
            // parcel.y = this.y;
            dropped.push( parcel );
            if ( tile.delivery ) {
                sc += parcel.reward;
                this.#grid.deleteParcel( parcel.id );
            }
        }
        if ( sc > 0 )
            console.log( `${this.name}(${this.id}) putDown ${dropped.length} parcels (+ ${sc} pti)` )
        if ( dropped.length > 0 )
            this.emitOnePerTick( 'putdown', this, dropped );
        this.score += sc;
        return dropped;
    }


    getJob (cat) {
        //console.log ('Agent entered getJob');
        return this.#grid.giveJob(cat);
    }

    postJob () {
        let robType = Array.from(this.name)[0];

        for ( const /**@type {Parcel} parcel*/ parcel of this.#grid.getParcels() ) {
            if ( parcel.x == this.x && parcel.y == this.y) {
                
                let job = [parcel.x, parcel.y];


                let cat = 't';

                if (parcel.growthStage >= MAX_GROWTH_TIME && parcel.reward == -1 && !(robType === 'H'||robType === 'h')){
                    cat = 'H';
                } else if (parcel.reward <= 0  && !(robType === 'S'||robType === 's')){
                    cat = 'S';
                } else if (parcel.reward < WATER_LEVEL_LIMIT  && !(robType === 'W'||robType === 'w')){
                    cat = 'W';
                }
                if (cat!='t'){

                    this.#grid.receiveJob(job, cat);

                }
            }
        }





    }
}



module.exports = Agent;