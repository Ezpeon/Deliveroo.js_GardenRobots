const config = {

    MAP_FILE: 'empty_map',    // options are 'default_map' (DEFAULT), 'empty_map', 'map_20', ...files in levels/maps

    PARCELS_GENERATION_INTERVAL: '2s',  // options are '1s', '2s' (DEFAULT), '5s', '10s'

    MOVEMENT_DURATION: 500,             // default is 500
    AGENTS_OBSERVATION_DISTANCE: 5,     // default is 5
    PARCELS_OBSERVATION_DISTANCE: 5,    // default is 5

    PARCEL_REWARD_AVG: 90,          // default is 30
    PARCEL_REWARD_VARIANCE: 10,     // default is 10
    PARCEL_DECADING_INTERVAL: '1s', // options are '1s', '2s', '5s', '10s', 'infinite' (DEFAULT)

    RANDOMLY_MOVING_AGENTS: 0,  // default is 2
    RANDOM_AGENT_SPEED: '2s',    // options are '1s', '2s' (DEFAULT), '5s', '10s'

    MAX_GROWTH_TIME_SECONDS: 200, //200 seconds default, could be less for quicker tests
    MAX_WATER_LEVEL_PLANT: 120   //120 (seconds) default
/*
*constants have to be chaged to make more sense of the simulation
*e.g. irl a plant dying from dehydration is not a matter of seconds, so there should be a big margin inbetween the times
*ofc this makes the simulation harder to implement
*/
}



const LEVEL = process.argv[2] || process.env.LEVEL;

try {
    if ( LEVEL ) {
        Object.assign( config, require( './levels/' + LEVEL ) );
        console.log( 'Level loaded:', LEVEL, config );
    } else
        console.log( 'Level not specified, using default config', config )
} catch ( error ) {
    console.error( 'Error while loading level', LEVEL, config )
}

module.exports = config


