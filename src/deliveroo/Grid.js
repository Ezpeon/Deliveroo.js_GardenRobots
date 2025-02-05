const Observable =  require('./Observable')
const Tile =  require('./Tile')
const Agent =  require('./Agent')
const myClock =  require('./Clock')
const Parcel = require('./Parcel');
const Xy = require('./Xy');
const BulletinBoard = require('./BulletinBoard');


const fs = require('fs');



/**
 * @class Grid
 */
class Grid extends Observable {
    /** @type {Array<Tile>} */
    #tiles;
    /** @type {Map<string, Agent>} */
    #agents;
    /** @type {Map<string, Parcel>} */
    #parcels;
    
    /** @type {BulletinBoard} #board */
    #board;

    totalWater = 0;
    totalRefills = 0;
    totalFuel = 0;
    totalPotatoes = 0;
    hourcounter = 0;
    day = 0;
    dayCycleUpdateFlag = false;
    
    /**
     * @constructor Grid
     */
    constructor ( map = new Array(20).map( c=>new Array(20) ) ) {
        super();
        
        var Xlength = map.length;
        var Ylength = map.length;
        this.#tiles = Array.from(map).map( (column, x) => {
            return Array.from(column).map( (value, y) => new Tile(
                this, x, y, !value, ( ((x==0 && y==11) ||(x==0 && y==10) ||(x==1 && y==11) ||(x==6 && y==5)) ? true : false )
            ) )
        } );
        // console.log( this.#tiles.map( c=>c.map( t=>t.x+' '+t.y+' ' ) ) )
        
        // this.#tiles = [];
        // for (let x = 0; x < 10; x++) {
        //     let column = [];
        //     for (var y = 0; y < 10; y++) {
        //         column.push(new Tile(this, x, y))
        //     }
        //     this.#tiles.push(column);
        // }

        this.#agents = new Map();
        this.#parcels = new Map();
        this.#board = new BulletinBoard();
        
        for (let x = 0; x < map.length; x++) {
            const column = map[x];
            for (let y = 0; y < column.length; y++) {
                const value = column[y];
                if ( value > 1 )
                    this.createParcel( x, y, null, value );
            }
            
        }


        const doDayLightCycle = () => {
            
            console.log('today is the day: ' + this.getDay());
            console.log('are we updating: ' + this.dayCycleUpdateFlag);
            
            if (this.dayCycleUpdateFlag == true){
                this.dayCycleUpdateFlag = false;
                this.tomorrow();
            }
        };


        const upBoard = () => { //--update board function--
            console.log ('delta jobs is ' + this.#board.deltaJobs() + ' and length total is ' + this.#board.totLength());
            //console.log ('total water is ' + this.totalWater + ' from '+ this.totalRefills +' refills and total fuel is '+ this.totalFuel);
            //console.log ('the robots collected ' + this.totalPotatoes + ' fruits in total');
            if (this.#board.deltaJobs() == 0 && this.#board.totLength() == 0){

                doDayLightCycle();           

                /*
                for ( const parcel of this.getParcels() ) {
                
                    //let {id, x, y, carriedBy, reward} = parcel;
                    //this.receiveJob ([x,y], 'W');
                }*/
            } 
        };
        const saveData = () => {
            this.hourcounter ++;
            let outstr = ('today is the day: ' + this.getDay()) + '\n' + ('total water is ' + this.totalWater + ' from '+ this.totalRefills +' refills and total fuel is '+ this.totalFuel) + '\n' + ('the robots collected ' + this.totalPotatoes + ' fruits in total');
            let allok = new Promise( (res, rej) => {
                fs.writeFile(this.hourcounter + 'h_out.txt', outstr, err => {
                    if (err)
                        rej(err)
                    else // console.log("File written successfully");
                        res(this.hourcounter + 'h_out.txt')
                })
            })

            
        };

        myClock.on ('10s', upBoard );
        myClock.on ('1h', saveData );
        

    }

    *getTiles ( [x1,x2,y1,y2]=[0,10000,0,10000] ) {
        const xLength = ( this.#tiles.length ? this.#tiles.length : 0 );
        const yLength = ( this.#tiles.length && this.#tiles[0].length ? this.#tiles[0].length : 0 );
        x1 = Math.max(0,x1)
        x2 = Math.min(xLength,x2);
        y1 = Math.max(0,y1)
        y2 = Math.min(yLength,y2);
        // console.log(xLength, yLength, x1, x2, y1, y2)
        for ( let x = x1; x < x2; x++ )
            for ( let y = y1; y < y2; y++ ) {
                var tile = this.#tiles.at(x).at(y);
                if ( tile ) yield tile;
            }
        // return Array.from(this.#tiles).flat();
    }

    getMapSize () {
        return { width: this.#tiles.length, height:this.#tiles.at(0).length }
    }

    /**
     * @type {function(number,number): Tile}
     */
    getTile ( x, y ) {
        if ( x < 0 || y < 0)
            return null;
        // x = Math.round(x)
        // y = Math.round(y)
        let column = this.#tiles.at(x)
        return column ? column.at(y) : null;
    }

    /**
     * @type {function(): string[]}
     */
    getAgentIds () {
        return this.#agents.keys();
    }
    
    getAgents () {
        return this.#agents.values();
    }

    getAgent ( id ) {
        return this.#agents.get( id );
    }

    /**
     * @type {function({id:string,name:string}): Agent}
     */
    createAgent ( options = {} ) {
        
        // Instantiate
        var me = new Agent( this, options );
        this.emit( 'agent created', me );

        // Register
        this.#agents.set(me.id, me);

        // Grid scoped events propagation
        me.on( 'xy', this.emit.bind(this, 'agent xy') );
        me.on( 'score', this.emit.bind(this, 'agent score') );
        // me.on( 'pickup', this.emit.bind(this, 'agent pickup') );
        // me.on( 'putdown', this.emit.bind(this, 'agent putdown') );
        // me.on( 'agent', this.emit.bind(this, 'agent') );
        
        const notMeAndWithin5 = ( fn ) => {
            return function (it, ...args) {
                if ( ( ! it.id || me.id != it.id ) && Xy.distance(me, it) < 5 )
                    fn (it, ...args)
            }
        }

        const ifNotMeAndWithin5EmitSensendAgents = notMeAndWithin5( me.emitAgentSensing.bind(me) );

        // On mine and others movement emit SensendAgents
        this.on( 'agent xy', me.emitAgentSensing.bind(me) )
        
        // On agent disconnect emit agentSensing
        // this.on( 'agent disconnect', me.emitAgentSensing.bind(me) )

        // On others score emit SensendAgents
        this.on( 'agent score', ifNotMeAndWithin5EmitSensendAgents )

        

        /**
         * Call wrapped function just once every nextTick.
         * @function postpone
         */
        function postpone ( finallyDo ) {
            var promiseFired = false;
            return async (...args) => {
                promiseFired = false;
                process.nextTick( () => { // https://jinoantony.com/blog/setimmediate-vs-process-nexttick-in-nodejs
                    if ( !promiseFired ) {
                        promiseFired = true;
                        finallyDo(...args);
                    }
                } );
            }
        }

        const thisGrid = this;
        const within5 = ( fn ) => {
            return function (p, ...args) {
                console.log(this) // this should be parcel since specified by .bind in emitting parcel state. NO x, y in parcel
                if ( Xy.distance(me, this) < 5 )
                    fn (p, ...args)
            }
        }

        // On parcel
        this.on( 'parcel', postpone( me.emitParcelSensing.bind(me) ) );
        me.on( 'xy', postpone( me.emitParcelSensing.bind(me) ) );

        return me;
    }

    deleteAgent ( agent ) {
        if ( agent.tile )
            agent.tile.unlock();
        agent.x = undefined;
        agent.y = undefined;
        agent.removeAllListeners('xy');
        agent.removeAllListeners('score');
        agent.removeAllListeners('agent');
        agent.removeAllListeners('agents sensing');
        agent.removeAllListeners('parcels sensing');
        this.#agents.delete( agent.id );
        this.emit( 'agent deleted', agent );
    }



    /**
     * @type {function(Number, Number): Parcel}
     */
    createParcel ( x, y ) {
        var tile = this.getTile( x, y );
        if ( !tile || tile.blocked )
            return false;
        
        // Instantiate and add to Tile
        var parcel = new Parcel( x, y, null, this);



        //this.receiveJob([x, y], 'W');

        // tile.addParcel( parcel );
        this.#parcels.set( parcel.id, parcel )

        parcel.once( 'expired', (...args) => {
            this.deleteParcel( parcel.id );
        } );

        // Grid scoped event propagation
        this.emit( 'parcel', parcel )
        parcel.on( 'reward', this.emit.bind(this, 'parcel') );
        parcel.on( 'carriedBy', this.emit.bind(this, 'parcel') );

        return parcel;
    }

    /**
     * @type {function(): IterableIterator<Parcel>}
     */
    getParcels () {
        return this.#parcels.values();
    }

    /**
     * @type {function(String):boolean}
     */
    deleteParcel ( id ) {
        return this.#parcels.delete( id );
    }


    giveJob(cat){
        //console.log('grid entered giveJob');
        return this.#board.dequeue(cat);
    }

    receiveJob(job, cat){
        this.#board.enqueue(job, cat);
        
    }
    completeJob(){
        this.#board.completed++;
    }
    getDay(){
        return this.day;
    }
    updateDay(){
        this.dayCycleUpdateFlag = true;
    }
    tomorrow(){

        if (this.day%50==0){
            let outstr = ('today is the day: ' + this.getDay()) + '\n' + ('total water is ' + this.totalWater + ' from '+ this.totalRefills +' refills and total fuel is '+ this.totalFuel) + '\n' + ('the robots collected ' + this.totalPotatoes + ' fruits in total');
            let allok = new Promise( (res, rej) => {
                fs.writeFile('day' + this.day + '_out.txt', outstr, err => {
                    if (err)
                        rej(err)
                    else // console.log("File written successfully");
                        res('day' + this.day + '_out.txt')
                })
            })
        }


        this.day++;
        
        for (var [key, value] of this.#agents){
            this.comunicateDayPassing(this.getAgent(key));
        }
    }
    comunicateDayPassing(AG){
        //console.log ("i am telling " + AG.name + " that a day has passed");
        AG.dayAfter();
    }

}


module.exports = Grid;