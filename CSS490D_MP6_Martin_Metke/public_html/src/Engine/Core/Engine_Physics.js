/*
 * File: Engine_Physics.js 
 * Engine component responsible for handling physics interactions
 */
/*jslint node: true, vars: true, evil: true */
/*global document, vec2*/
/* find out more about jslint: http://www.jslint.com/help.html */

//  Global variable EngineCore
//  the following syntax enforces there can only be one instance of EngineCore object
"use strict";  // Operate in Strict mode such that variables must be declared before used!

var gEngine = gEngine || { };
    // initialize the variable while ensuring it is not redefined

gEngine.Physics = (function () {
    
    var mAllObjects = gEngine.Core.getObjects();
        
    var collision = function () {

        var i, j;
        var collisionInfo;
        var centerDiff;
        
        for (i = 0; i < mAllObjects.length; ++i) {
            for (j = i + 1; j < mAllObjects.length; ++j){
                if (mAllObjects[i].boundTest(mAllObjects[j])){
                    
                    collisionInfo = new CollisionInfo();
                    if (mAllObjects[i].collisionTest(mAllObjects[j], collisionInfo)) {
                        //make sure the normal is always from object[i] to object[j]
                        centerDiff = vec2.create();
                        vec2.sub(centerDiff, mAllObjects[j].mPhysicsComponent.mCenter, mAllObjects[i].mPhysicsComponent.mCenter);
                        
                        if (vec2.dot(collisionInfo.getNormal(), centerDiff) < 0) {
                            collisionInfo.changeDir();
                        }
                        
                        //draw collision info (a black line that shows normal)
                        //gEngine.Core.registerCollision(collisionInfo); 

                    }
                }
            }
        }
    };
    
    // -- end of public methods

    var mPublic = {
        collision: collision
    };
    return mPublic;
}());
