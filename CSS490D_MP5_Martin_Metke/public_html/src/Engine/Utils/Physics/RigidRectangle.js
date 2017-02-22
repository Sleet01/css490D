/* File: RigidRectangle.js 
 *
 * Contains logic for a RigidBody (rectangle) physics "object"
 */

/*jslint node: true, vars: true */
/*global vec2, vec3, BoundingBox, GameObject, RigidShape, gEngine */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function RigidRectangle( object = null ){
    RigidShape.call(this, object);
}
gEngine.Core.inheritPrototype(RigidRectangle, RigidShape);
