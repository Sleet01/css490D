/* File: PatrolSet.js 
 *
 * Support for working with a set of Patrol objects
 * Inherits from GameObjectSet.js
 */

/*jslint node: true, vars: true */
/*global gEngine: false, GameObjectSet: false, BoundingBox */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!


function PatrolSet( bbox = null ) {
    GameObjectSet.call(this);
    this.mBBox = bbox;
}
gEngine.Core.inheritPrototype(PatrolSet, GameObjectSet);

// Set the bounding box if it wasn't set at instantiation.
PatrolSet.prototype.setBBox = function (bbox) {
  
    this.mBBox = bbox;
};

// Return this' BoundingBox for intersection / escape checks
PatrolSet.prototype.getBBox = function () {
    return this.mBBox;
};

// Override to support deleting dead / out-of-bounds 
PatrolSet.prototype.update = function () {
    var i;
    var cleanup = [];
    var reverse = [];
    var bbox = null;
    // Do the actual updates
    for (i = 0; i < this.mSet.length; i++) {
        this.mSet[i].update();
    }
    //Check all objects for dead/out-of-bounds state
    for (i = 0; i < this.mSet.length; i++){
        if (this.mSet[i].isDead()){
            cleanup.push(i);
        }
        else {
            
            bbox = this.mSet[i].getBBox();
            if (this.mBBox.boundCollideStatus(bbox) === BoundingBox.eboundCollideStatus.eOutside){
                cleanup.push(i);
            } else{
                if( this.mBBox.boundCollideStatus(bbox) !== BoundingBox.eboundCollideStatus.eInside){
                    reverse.push(i);
                }   
            }
        }
    }
    
    // Tell all the edge-touching patrols to reverse
    for (i = 0; i < reverse.length; i++) {
        this.mSet[reverse[i]].reverse(this.mBBox);
    }
    
    // Cut out all dead objects registered so far
    for (i = 0; i < cleanup.length; i++) {
        this.mSet.splice(cleanup[i],1);
    }
    
    
};