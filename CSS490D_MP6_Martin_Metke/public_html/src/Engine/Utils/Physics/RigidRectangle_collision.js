/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/*jslint node: true, vars: true, evil: true, bitwise: true */
"use strict";
/*global RigidRectangle, vec2, CollisionInfo */

RigidRectangle.prototype.collisionTest = function (oObject, collisionInfo) {
    var status = false;
    if ( oObject.mPhysicsComponent.mType === "Circle") {
        status = this.collidedRectCirc(oObject.mPhysicsComponent, collisionInfo);
    } else {
        status = this.collidedRectRect(this, oObject.mPhysicsComponent, collisionInfo);
    }
    return status;
};

RigidRectangle.prototype.findSupportPoint = function (dir, ptOnEdge) {
    //the longest project length
    var vToEdge;
    var projection;
    var vertex = vec2.create();

    tmpSupport.mSupportPointDist = -9999999;
    tmpSupport.mSupportPoint = null;
    //check each vector of other object
    for (var i = 0; i < this.mVertices.length; i++) {
        //vToEdge = this.mVertices[i].subtract(ptOnEdge);
        var vToEdge = vec2.create();
        vec2.normalize(vertex, this.mVertices[i]);
        vec2.subtract(vToEdge,vertex,ptOnEdge );
        projection = vec2.dot(vToEdge, dir);
        
        //find the longest distance with certain edge
        //dir is -n direction, so the distance should be positive       
        if ((projection > 0) && (projection > tmpSupport.mSupportPointDist)) {
            tmpSupport.mSupportPoint = vertex;
            tmpSupport.mSupportPointDist = projection;
        }
    }
};

/**
 * Find the shortest axis that overlapping
 * @memberOf RigidRectangle
 * @param {RigidRectangle} otherRect  another rectangle that being tested
 * @param {CollisionInfo} collisionInfo  record the collision information
 * @returns {Boolean} true if has overlap part in all four directions.
 * the code is convert from http://gamedevelopment.tutsplus.com/tutorials/how-to-create-a-custom-2d-physics-engine-oriented-rigid-bodies--gamedev-8032
 */
RigidRectangle.prototype.findAxisLeastPenetration = function (otherRect, collisionInfo) {

    var n;
    var supportPoint;
    var vertex = vec2.create();

    var bestDistance = 999999;
    var bestIndex = null;

    var hasSupport = true;
    var i = 0;

    while ((hasSupport) && (i < this.mNormals.length)) {
        // Retrieve a face normal from A
        n = vec2.clone(this.mNormals[i]);
        vec2.normalize(n, n);

        // use -n as direction and the vectex on edge i as point on edge
        var dir = vec2.create();
        vec2.scale(dir, n, -1);
        vec2.normalize(dir, dir);
        var ptOnEdge = this.mVertices[i];
        // find the support on B
        // the point has longest distance with edge i 
        otherRect.findSupportPoint(dir, ptOnEdge);
        hasSupport = (tmpSupport.mSupportPoint !== null);
        
        //get the shortest support point depth
        if ((hasSupport) && (tmpSupport.mSupportPointDist < bestDistance)) {
            bestDistance = tmpSupport.mSupportPointDist;
            bestIndex = i;
            supportPoint = tmpSupport.mSupportPoint;
        }
        i = i + 1;
    }
    if (hasSupport) {
        //all four directions have support point
        //var bestVec = this.mNormals[bestIndex].scale(bestDistance);
        var bestVec = vec2.create();
        vec2.normalize(vertex, this.mNormals[bestIndex]);
        vec2.scale(bestVec, vertex, bestDistance);
        var spSum = vec2.create();
        vec2.add(spSum, supportPoint, bestVec);
        collisionInfo.setInfo(bestDistance, vertex, spSum);
    }
    return hasSupport;
};

RigidRectangle.prototype.collidedRectRect = function (r1, r2, collisionInfo) {

    var status1 = false;
    var status2 = false;
    /**
    * Check for collision between RigidRigidRectangle and RigidRigidRectangle
    * @param {RigidRectangle} r1 RigidRectangle object to check for collision status
    * @param {RigidRectangle} r2 RigidRectangle object to check for collision status against
    * @param {CollisionInfo} collisionInfo Collision info of collision
    * @returns {Boolean} true if collision occurs
    * @memberOf RigidRectangle
    */    
   var collisionInfoR1 = new CollisionInfo();
   var collisionInfoR2 = new CollisionInfo();

    //find Axis of Separation for both rectangle
    status1 = r1.findAxisLeastPenetration(r2, collisionInfoR1);

    if (status1) {
        status2 = r2.findAxisLeastPenetration(r1, collisionInfoR2);
        if (status2) {
            //if both of rectangles are overlapping, choose the shorter normal as the normal       
            if (collisionInfoR1.getDepth() < collisionInfoR2.getDepth()) {
                var depthVec = vec2.create();
                vec2.scale(depthVec, collisionInfoR1.getNormal(), collisionInfoR1.getDepth());
                var mStartDepth = vec2.create();
                vec2.subtract(mStartDepth, collisionInfoR1.mStart, depthVec);
                collisionInfo.setInfo(collisionInfoR1.getDepth(), collisionInfoR1.getNormal(), mStartDepth);
            } else {
                var revNormal = collisionInfoR2.getNormal();
                vec2.scale(revNormal, revNormal, -1);
                collisionInfo.setInfo(collisionInfoR2.getDepth(), revNormal, collisionInfoR2.mStart);
            }
        } 
    }
    return status1 && status2;
};

/**
 * Check for collision between RigidRectangle and Circle
 * @param {Circle} otherCir circle to check for collision status against
 * @param {CollisionInfo} collisionInfo Collision info of collision
 * @returns {Boolean} true if collision occurs
 * @memberOf RigidRectangle
 */
RigidRectangle.prototype.collidedRectCirc = function (otherCir, collisionInfo) {

    var inside = true;
    var bestDistance = -99999;
    var nearestEdge = 0;
    var i;
    var v = vec2.create();
    var vertex = vec2.create();
    var nVertex = vec2.create();
    var circ2Pos, projection;
    for (i = 0; i < 4; i++) {
        //find the nearest face for center of circle        
        circ2Pos = otherCir.mCenter;
        // Determine direction to center from this vertex
        vec2.subtract(v, circ2Pos, this.mVertices[i]);
        // Make a true "normal" in the direction from this.mVertices[i+1%4] -> this.mNormals[i]
        vec2.subtract(vertex, this.mNormals[i], this.mVertices[(i+1)%4] );
        vec2.normalize(vertex, vertex);
        projection = vec2.dot(v, vertex);
        if (projection > 0) {
            //if the center of circle is outside of rectangle
            bestDistance = projection;
            nearestEdge = i;
            inside = false;
            break;
        }
        if (projection > bestDistance) {
            bestDistance = projection;
            nearestEdge = i;
        }
    }
    var dis, normal, radiusVec;
    if (!inside) {
        //the center of circle is outside of rectangle

        //v1 is from left vertex of face to center of circle 
        //v2 is from left vertex of face to right vertex of face
        var v1 = vec2.create();
        var v2 = vec2.create();
        vec2.subtract(v1, circ2Pos, this.mVertices[nearestEdge]);
        vec2.subtract(v2, this.mVertices[(nearestEdge + 1) % 4], this.mVertices[nearestEdge]);

        var dot = vec2.dot(v1, v2);
        
        normal = vec2.clone(v1);
        vec2.normalize(normal, normal);

        if (dot < 0) {
            //the center of circle is in corner region of mVertex[nearestEdge]
            dis = vec2.length(v1);
            //compare the distance with radium to decide collision
            if (dis > otherCir.mRRadius) {
                return false;
            }

            radiusVec = vec2.create();
            vec2.scale(radiusVec, normal, -otherCir.mRRadius);
            var radiusSum = vec2.create();
            vec2.add(radiusSum, circ2Pos, radiusVec);
            collisionInfo.setInfo(otherCir.mRRadius - dis, normal, radiusSum);
        } else {
            //the center of circle is in corner region of mVertex[nearestEdge+1]

            //v1 is from right vertex of face to center of circle 
            //v2 is from right vertex of face to left vertex of face
            v1 = vec2.create();
            vec2.subtract(v1, circ2Pos, this.mVertices[(nearestEdge + 1) % 4]);
            vec2.scale(v2, v2, -1);
            dot = vec2.dot(v1, v2); 
            if (dot < 0) {
                dis = vec2.length(v1);
                //compare the distance with radium to decide collision
                if (dis > otherCir.mRRadius) {
                    return false;
                }
                normal = vec2.clone(v1);
                vec2.normalize(normal, normal);
                radiusVec = vec2.create();
                vec2.scale(radiusVec, normal, -otherCir.mRRadius);
                var radiusSum = vec2.create();
                vec2.add(radiusSum, circ2Pos, radiusVec);
                collisionInfo.setInfo(otherCir.mRRadius - dis, normal, radiusSum);
            } else {
                //the center of circle is in face region of face[nearestEdge]
                if (bestDistance < otherCir.mRRadius) {
                    radiusVec = vec2.create();
//                    normal = vec2.clone(v1);
//                    vec2.normalize(normal, normal);
                    vec2.subtract(vertex, this.mNormals[nearestEdge], this.mVertices[(nearestEdge+1)%4]);
                    vec2.normalize(vertex, vertex);
                    vec2.scale(radiusVec, vertex, otherCir.mRRadius);
                    var radiusDiff = vec2.create();
                    vec2.subtract(radiusDiff, circ2Pos, radiusVec);
                    
                    collisionInfo.setInfo(otherCir.mRRadius - bestDistance, vertex, radiusDiff);
                } else {
                    return false;
                }
            }
        }
    } else {
        //the center of circle is inside of rectangle
        radiusVec = vec2.create();
        vec2.normalize(vertex, this.mNormals[nearestEdge]);
        vec2.scale(radiusVec, vertex,otherCir.mRRadius);
        var radiusDiff = vec2.create();
        vec2.subtract(radiusDiff, circ2Pos, radiusVec);
        collisionInfo.setInfo(otherCir.mRRadius - bestDistance, vertex, radiusDiff);
    }
    return true;
};

var SupportStruct = function () {
    this.mSupportPoint = null;
    this.mSupportPointDist = 0;
};
var tmpSupport = new SupportStruct();