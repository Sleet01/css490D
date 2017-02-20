/*
 * File: Engine_Physics.js 
 * Engine component responsible for handling physics interactions
 */
/*jslint node: true, vars: true, evil: true */
/*global document */
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
        for (i =5; i < mAllObjects.length; ++i) {
            for (j = i + 1; j < mAllObjects.length; ++j){
                if (mAllObjects[i].boundTest(mAllObjects[j])){
                    if (mAllObjects[i].collisionTest(mAllObjects[j])) {
                        //bounce;
                        mAllObjects[i].reflect();
                        mAllObjects[j].reflect();
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
