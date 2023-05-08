const Grid = require('../deliveroo/Grid');
const myClock =  require('../deliveroo/Clock');
const config =  require('../../config');



const PARCELS_GENERATION_INTERVAL = process.env.PARCELS_GENERATION_INTERVAL || config.PARCELS_GENERATION_INTERVAL || '2s';



/**
 * 
 * @param {Grid} grid 
 */
module.exports = function (grid) {
    var counter = 3;
    myClock.on( PARCELS_GENERATION_INTERVAL, () => {//------when a plant spot is generated, this should post a job on the bulletin board--------
        if (counter > 0){
            counter--;
            parcel = grid.createParcel(0, 4);
            counter--;
            parcel = grid.createParcel(1, 0);
            counter--;
            parcel = grid.createParcel(2, 4);
            counter--;
            parcel = grid.createParcel(9, 8);
            /* ---------------------------------change back to make them random again---------------------------------------------------
            let parcel;
            let trials = 0
            while ( ! parcel && trials++ < 100 ) {
                var x = Math.floor( Math.random() * (grid.getMapSize().width-2) ) + 1;
                var y = Math.floor( Math.random() * (grid.getMapSize().height-2) ) + 1;
                parcel = grid.createParcel(x, y);
            }*/
            // console.log('parcel created at', x, y, parcel.reward)

        }
    } )

}
