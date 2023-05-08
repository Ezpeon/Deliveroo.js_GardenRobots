const Observable =  require('./Observable')
const Xy =  require('./Xy')
const myClock =  require('./Clock')
const config =  require('../../config')



const PARCEL_REWARD_AVG = process.env.PARCEL_REWARD_AVG || config.PARCEL_REWARD_AVG || 30;
const PARCEL_REWARD_VARIANCE = process.env.PARCEL_REWARD_VARIANCE || config.PARCEL_REWARD_VARIANCE || 10;
const PARCEL_DECADING_INTERVAL = process.env.PARCEL_DECADING_INTERVAL || config.PARCEL_DECADING_INTERVAL || 'infinite';
const MAX_GROWTH_TIME = config.MAX_GROWTH_TIME || 200;
const MAX_WATER_LEVEL_PLANT = config.MAX_WATER_LEVEL_PLANT || 120;
const PLANT_DECAY_RATE = 4;

//---------------------------------------------------------------change name-----------------------------------------------------------

class Parcel extends Xy {
    
    static #lastId = 0;
    
    // #grid;
    id;
    reward;//----------------------------------------------change to time left-------------------------------------------------
    carriedBy;//----------------------------------------------------remove carrying related functions-----------------------------
    growthStage;
    
    /**
     * @constructor Parcel
     */
    constructor (x, y, carriedBy = null, reward ) {
        super(x, y);

        this.carriedBy = carriedBy;
        this.growthStage = 0;
        this.interceptValueSet('carriedBy');

        // Follow carrier
        var lastCarrier = null;
        const followCarrier = (agent) => {
            this.x = agent.x;
            this.y = agent.y;
        }
        this.on( 'carriedBy', (parcel) => {
            if ( lastCarrier )
                lastCarrier.off( 'xy', followCarrier )
            if ( this.carriedBy )
                this.carriedBy.on( 'xy', followCarrier )
            lastCarrier = this.carriedBy;
        } )
        
        this.id = 'p' + Parcel.#lastId++;

        this.interceptValueSet('reward');
        //this.reward = reward || Math.floor( Math.random()*PARCEL_REWARD_VARIANCE*2 + PARCEL_REWARD_AVG-PARCEL_REWARD_VARIANCE );
        this.reward = 0;

        const decay = () => {
            //change decay, the plant does not disappear, it stays at 0
            
            
            if ( this.reward > 0 && this.growthStage <= MAX_GROWTH_TIME) {

                let rngNow = Math.random();
                let rngt5 = rngNow*5.0;
                let rngt5f = Math.floor(rngt5);
                let waterRelative = (this.reward*1.0)/(MAX_WATER_LEVEL_PLANT*1.0);
                //console.log ("rngNow is " + rngNow + " rngt5 is " + rngt5 + " rngt5f is " + rngt5f );
                if (rngt5f==0){
                    if (this.reward - PLANT_DECAY_RATE >= 0){
                        this.reward-=PLANT_DECAY_RATE;
                    }else {
                        this.reward = 0;
                    }
                }
                let growthThisSecond = Math.floor(rngt5f*3.0*waterRelative);
                this.growthStage += growthThisSecond;
                console.log ("plant is growing: growth increased by " + growthThisSecond + " to " + this.growthStage);
            } else if (this.growthStage > MAX_GROWTH_TIME){
                this.reward = -1;
                console.log ("this plant is grown: " + this.growthStage);
            } else if (this.reward <= 0){
                this.growthStage = 0;
                console.log ("this plant is dead: " + this.growthStage + " " + this.reward);
            }
        };
        myClock.on( PARCEL_DECADING_INTERVAL, decay );
    }

}



module.exports = Parcel;