const { Server } = require('socket.io');
const myGrid = require('./grid');
const Authentication = require('./deliveroo/Authentication');
const BulletinBoard = require('./deliveroo/BulletinBoard');


const myAuthenticator = new Authentication( myGrid )

const io = new Server( {
    cors: {
        origin: "*", // http://localhost:3000",
        methods: ["GET", "POST"]
    }
} );

io.on('connection', (socket) => {
    


    /**
     * Authenticate socket on agent
     */
    const me = myAuthenticator.authenticate(socket);
    if ( !me ) return;
    socket.broadcast.emit( 'hi ', socket.id, me.id, me.name );

    

    /**
     * Emit map (tiles)
     */
    for (const tile of myGrid.getTiles()) {
        // console.log(tile)
        if ( !tile.blocked ) {

            socket.emit( 'tile', tile.x, tile.y, tile.delivery );

            //socket.emit( 'tile', {tx, ty, td} );

        }
    }
    
    for (const tile of myGrid.getTiles()) {
        // console.log(tile)
        let tx = tile.x;
        let ty = tile.y;
        let td = tile.delivery;
        if ( !tile.blocked ) {

            //console.log ("emitting tile " + tx + " " + ty);
            socket.emit( 'openTile', {tx, ty, td} );

            //socket.emit( 'tile', {tx, ty, td} );

        }
    }

    
    /**
     * Emit me
     */

    // Emit you
    me.on( 'agent', ({id, name, x, y, score}) => {
        // console.log( 'emit you', id, name, x, y, score );
        socket.emit( 'you', {id, name, x, y, score} );
    } );
    // console.log( 'emit you', id, name, x, y, score );
    socket.emit( 'you', {id, name, x, y, score} = me );
    


    /**
     * Emit sensing
     */

    // Parcels
    me.on( 'parcels sensing', (parcels) => {
        // console.log('emit parcels sensing', ...parcels);
        socket.emit('parcels sensing', parcels )
    } );
    me.emitParcelSensing();

    // Agents
    me.on( 'agents sensing', (agents) => {
        // console.log('emit agents sensing', ...agents); // {id, name, x, y, score}
        socket.emit( 'agents sensing', agents );
    } );
    me.emitAgentSensing();

    me.on ('dayPassed', d =>{
        socket.emit( 'the dawn of a new day', d);
    });
    


    /**
     * Actions
     */
    
    socket.on('move', async (direction, acknowledgementCallback) => {
        // console.log(me.id, me.x, me.y, direction);
        try {
            const moving = me[direction]();
            if ( acknowledgementCallback )
                acknowledgementCallback( await moving ); //.bind(me)()
        } catch (error) { console.error(direction, 'is not a method of agent'); console.error(error) }
    });

    socket.on('interact', async (acknowledgementCallback) => {
        //const picked = me.interact()
        if ( acknowledgementCallback )
            try {
                acknowledgementCallback( me.interact() )
            } catch (error) { console.error(error) }
    });
    //-----------------------------------------------------------remove-------------------------------------------------------------
    socket.on('putdown', async (selected, acknowledgementCallback) => {
        try {
            const dropped = me.putDown( selected )
            if ( acknowledgementCallback )
                acknowledgementCallback( dropped )
        } catch (error) { console.error(error) }
    });


//************************************************************************job handling************************************************************************************
    socket.on('offerJob', async (acknowledgementCallback) => {
        try {
            me.postJob();

        } catch (error) { console.error(error) }
    });
    
    socket.on('requestJob', async (category, acknowledgementCallback) => {
        //console.log('someone requested a job');
        try {
            //console.log('ioServer entered try catch');
            nextJob = me.getJob(category);
            socket.emit( 'extractedJob', nextJob);
            if (acknowledgementCallback)
                acknowledgementCallback(nextJob)
        } catch (error) { console.error(error) }
    });


    /**
     * Communication
     */

    socket.on( 'say', (toId, msg, acknowledgementCallback) => {
        
        console.log( me.id, me.name, 'say ', toId, msg );

        for ( let socket of myAuthenticator.getSockets( toId )() ) {
            
            // console.log( me.id, me.name, 'emit \'msg\' on socket', socket.id, msg );
            socket.emit( 'msg', me.id, me.name, msg );

        }

        try {
            if (acknowledgementCallback) acknowledgementCallback( 'successfull' )
        } catch (error) { console.log( me.id, 'acknowledgement of \'say\' not possible' ) }

    } )

    socket.on( 'ask', (toId, msg, replyCallback) => {
        console.log( me.id, me.name, 'ask', toId, msg );

        for ( let socket of myAuthenticator.getSockets( toId )() ) {
            
            // console.log( me.id, 'socket', socket.id, 'emit msg', ...args );
            socket.emit( 'msg', me.id, me.name, msg, (reply) => {

                try {
                    console.log( toId, 'replied', reply );
                    replyCallback( reply )
                } catch (error) { console.log( me.id, 'error while trying to acknowledge reply' ) }

            } );

        }

    } )

    socket.on( 'shout', (msg, acknowledgementCallback) => {

        console.log( me.id, me.name, 'shout', msg );

        socket.broadcast.emit( 'msg', me.id, me.name, msg );

        try {
            if (acknowledgementCallback) acknowledgementCallback( 'successfull' )
        } catch (error) { console.log( me.id, 'acknowledgement of \'shout\' not possible' ) }
        
    } )


});



module.exports = io;