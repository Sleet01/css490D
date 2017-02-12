/* File: DyePack.js 
 *
 * Abstracts a game object's behavior and apparance
 */

/*jslint node: true, vars: true */
/*global vec2, vec3, BoundingBox, gEngine, GameObject */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function DyePack(renderableObj) {
    GameObject.call(this, renderableObj);
    this.mCurrentFrontDir = vec2.fromValues(1, 0);
    this.mSpeed = 10;
    this.lifetime = 0;
    this.maxLifeTime = 120;
    this.dead = false;
}
gEngine.Core.inheritPrototype(DyePack, GameObject);

DyePack.prototype.update = function() {
    GameObject.prototype.update.call(this);
    this.lifetime += 1;
    if (this.lifetime >= this.maxLifeTime){
        this.dead = true;
    }
};

DyePack.prototype.isDead = function() {
    return this.dead;
};