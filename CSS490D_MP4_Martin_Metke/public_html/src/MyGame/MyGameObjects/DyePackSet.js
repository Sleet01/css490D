/* File: DyePackSet.js 
 *
 * Support for working with a set of DyePack objects
 * Inherits from GameObjectSet.js
 */

/*jslint node: true, vars: true */
/*global gEngine: false, GameObjectSet: false, BoundingBox */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!


function DyePackSet( bbox ) {
    GameObjectSet.call(this);
    this.mBBox = bbox;
}
gEngine.Core.inheritPrototype(DyePackSet, GameObjectSet);

DyePackSet.prototype.setBBox = function (bbox) {
  
    this.mBBox = bbox;
};

DyePackSet.prototype.getBBox = function () {
    return this.mBBox;
};

// Override to support deleting dead / out-of-bounds 
DyePackSet.prototype.update = function () {
    var i;
    var cleanup = [];
    for (i = 0; i < this.mSet.length; i++) {
        this.mSet[i].update();
    }
    //Check all objects for dead/out-of-bounds state
    for (i = 0; i < this.mSet.length; i++){
        if (this.mSet[i].isDead()){
            cleanup.push(i);
        }
        else if (this.mBBox.boundCollideStatus(this.mSet[i].getBBox()) 
                    === BoundingBox.eboundCollideStatus.eOutside){
            cleanup.push(i);
        }
        // May need to remove break; consider edge cases.
        //else{
        //    break;
        //}
    }
    // Cut out all dead objects registered so far
    for (i = 0; i < cleanup.length; i++) {
        this.mSet.splice(cleanup[i],1);
    }
    
};