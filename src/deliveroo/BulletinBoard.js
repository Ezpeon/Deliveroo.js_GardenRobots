class Queue {
    constructor() {
        this.elements = [];
        this.head = 0;
        this.tail = 0;
        this.given=0;

    }
    enqueue(element) {
        //console.log ('enqueueing in the queue class: ' + element);
        this.elements[this.tail] = element;
        this.tail++;
        //console.log ('queue is now ' + this.length() + ' elements long');
        //console.log ('the first element is :' + this.peek());
    }
    dequeue() {
        //console.log('entered dequeue in queue');
        let ok = this.length();
        //console.log('this queue is ' + ok + ' long');
        let item;
        if (ok > 0 ){
            
            item = this.peek();
            this.head++;
            this.given++;

        } else {

            item = 'emptyQueueError';
        }
        return item;
    }
    peek() {
        return this.elements[this.head];
    }
    length() {
        return this.tail - this.head;
    }
    isEmpty() {
        return this.length === 0;
    }
}
//bboard should be an array of queues (?)


/* 
*Theorycrafting
*constructor should take in input an array
*for loop, for each category in the array create a queue with that category
*the array of catogories is memorized
*
*new function, get categories
*returns the array of categories
*
**/
class BulletinBoard {
    constructor() {

        this.completed=0;
        this.boards = [];
        this.boards['G'] = new Queue();
        this.boards['S'] = new Queue();
        this.boards['W'] = new Queue();
        this.boards['H'] = new Queue();
    }
    enqueue(element, category) {//at each function add category like this
        //console.log (element + " is being added to queue " + category);
        this.boards[category].enqueue(element)
    }
    dequeue(category) {
        //console.log('board entered dequeue for the queue: ' + category);
        let item = this.boards[category].dequeue();
        if (item != 'emptyQueueError'){
            //console.log (item + " is being collected from queue " + category);
        }
        return item;
    }
    peek(category) {
        return this.boards[category].peek();
    }
    length(category) {
        return this.boards[category].length();
    }
    isEmpty(category) {
        return this.boards[category].isEmpty();
    }
    
    totLength() {
        let ttt = 0;
        ttt += this.boards['G'].length();
        ttt += this.boards['W'].length();
        ttt += this.boards['S'].length();
        ttt += this.boards['H'].length();
        return ttt;
    }
    deltaJobs(){
        let d = 0;
        d += this.boards['G'].given;
        d += this.boards['W'].given;
        d += this.boards['S'].given;
        d += this.boards['H'].given;
        d -= this.completed;
        return d;

    }
}

module.exports = BulletinBoard