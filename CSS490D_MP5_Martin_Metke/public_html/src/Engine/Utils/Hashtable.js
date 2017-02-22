/** A small hashtable function; used to remember collisions briefly
 * Based on: http://stackoverflow.com/questions/10892322/javascript-hashtable-use-object-key/10908885#10908885
 * @returns {HashTable}
 */

function Hashtable(){
    var hash = new Object();
    this.put = function(key, value){
        if(typeof key === "string"){
            hash[key] = value;
        }
        else{
            if(key._hashtableUniqueId === undefined){
                key._hashtableUniqueId = UniqueId.prototype.generateId();
            }
            hash[key._hashtableUniqueId] = value;
        }

    };

    this.get = function(key){
        if(typeof key === "string"){
            return hash[key];
        }
        if(key._hashtableUniqueId === undefined){
            return undefined;
        }
        return hash[key._hashtableUniqueId];
    };
    
    this.remove = function (key) {
        if(typeof key === "string"){
            delete hash[key];
            return true;
        }
        if(key._hashtableUniqueId === undefined){
            return false;
        }
        delete hash[key._hashtableUniqueId];
        delete key._hashtableUniqueId;
        return true;
    };
    
    this.getKeys = function () {
        var keys = [];
        for (var key in hash) {
            if (hash.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        return keys;
    };
    
}

function UniqueId(){

}

UniqueId.prototype._id = 0;
UniqueId.prototype.generateId = function(){
    return (++UniqueId.prototype._id).toString();
};