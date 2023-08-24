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
            counter = -1;
            parcel = grid.createParcel(0, 1);
            parcel = grid.createParcel(0, 3);
            parcel = grid.createParcel(0, 8);
            parcel = grid.createParcel(1, 0);
            parcel = grid.createParcel(2, 4);
            parcel = grid.createParcel(2, 7);
            parcel = grid.createParcel(3, 0);
            parcel = grid.createParcel(3, 11);
            parcel = grid.createParcel(4, 2);
            parcel = grid.createParcel(4, 4);
            parcel = grid.createParcel(4, 7);
            parcel = grid.createParcel(4, 9);
            parcel = grid.createParcel(7, 2);
            parcel = grid.createParcel(7, 7);
            parcel = grid.createParcel(7, 9);
            parcel = grid.createParcel(8, 0);
            parcel = grid.createParcel(8, 11);
            parcel = grid.createParcel(9, 4);
            parcel = grid.createParcel(9, 7);
            parcel = grid.createParcel(10, 0);
            parcel = grid.createParcel(10, 11);
            parcel = grid.createParcel(11, 1);
            parcel = grid.createParcel(11, 3);
            parcel = grid.createParcel(11, 8);
            parcel = grid.createParcel(11, 10);

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
