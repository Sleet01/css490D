/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/*jslint node: true, vars: true, white: true */
/*global vec2, CollisionInfo */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

/**
 * Static refrence to gEngine
 * @type gEngine
 */
var gEngine = gEngine || { };
    // initialize the variable while ensuring it is not redefined

/**
 * Default Constructor<p>
 * Physics engine supporting projection and impulse collision resolution. <p>
 * @class gEngine.Physics
 * @type gEngine.Physics
 */
gEngine.Physics = (function () {

    // Physics-wide flags
    var mMovement = false;
    var mSystemAcceleration = vec2.fromValues(0, -20);        // system-wide default acceleration
    
    var mPositionalCorrectionFlag = false;
    
    // correction rate constants
    var kRelaxationCount = 15;                  // number of relaxation iteration
    var kPosCorrectionRate = 0.8;               // percentage of separation to project objects


    // Borrowed from Physics ver 4.4
    var positionalCorrection = function (s1, s2, collisionInfo) {
        var s1InvMass = s1.mInvMass;
        var s2InvMass = s2.mInvMass;

        var num = (collisionInfo.getDepth() / (s1InvMass + s2InvMass)) * kPosCorrectionRate;
        var correctionAmount = vec2.create();
        vec2.scale(correctionAmount, collisionInfo.getNormal(), num);
        var moveAmount = vec2.create();
        vec2.scale(moveAmount, correctionAmount, -s1InvMass);
        s1.move(moveAmount);
        vec2.scale(moveAmount, correctionAmount, s2InvMass);
        s2.move(moveAmount);
    };

// Adapted from Ch 4.4 Physics impl.
    var resolveCollision = function (s1, s2, collisionInfo) {

        if ((s1.mInvMass === 0) && (s2.mInvMass === 0)) {
            return;
        }

        //  correct positions
        if (mPositionalCorrectionFlag) {
            positionalCorrection(s1, s2, collisionInfo);
        }

        var n = collisionInfo.getNormal();

// --- updated to vec2 standard --- //
        //the direction of collisionInfo is always from s1 to s2
        //but the Mass is inversed, so start scale with s2 and end scale with s1
        var start = vec2.create();
        vec2.scale(start, collisionInfo.mStart, (s2.mInvMass / (s1.mInvMass + s2.mInvMass)));
        var end = vec2.create();
        vec2.scale(end, collisionInfo.mEnd, (s1.mInvMass / (s1.mInvMass + s2.mInvMass)));
        var p = vec2.create();
        vec2.add(p, start, end);
        //r is vector from center of object to collision point
        var r1 = vec2.create();
        vec2.subtract(r1, p, s1.getCenter());
        var r2 = vec2.create();
        vec2.subtract(r2, p, s2.getCenter());

// --- updated to vec2 standard --- //
        //newV = V + mAngularVelocity cross R
        var v1 = vec2.create(); 
        var v2 = vec2.create();
        // s1.mAngularVelocity and r1.y, r1.x (r1[1] and r1[0]) are scalars
        vec2.add(v1, s1.mVelocity, vec2.fromValues(-1 * s1.mAngularVelocity * r1[1], s1.mAngularVelocity * r1[0]));
        vec2.add(v2, s2.mVelocity, vec2.fromValues(-1 * s2.mAngularVelocity * r2[1], s2.mAngularVelocity * r2[0]));
        var relativeVelocity = vec2.create();
        vec2.subtract(relativeVelocity, v2, v1);

// --- updated to vec2 standard --- //
        // Relative velocity in normal direction
        var rVelocityInNormal = vec2.dot(relativeVelocity, n);

        //if objects moving apart ignore
        if (rVelocityInNormal > 0) {
            return;
        }

        // compute and apply response impulses for each object    
        var newRestituion = Math.min(s1.mRestitution, s2.mRestitution);
        var newFriction = Math.min(s1.mFriction, s2.mFriction);

// --- updated to vec2 standard --- //
        //R cross N
        var R1crossN = vec3.create();
        vec2.cross(R1crossN, r1, n);
        var R2crossN = vec3.create();
        vec2.cross(R2crossN, r2, n);
        R1crossN = R1crossN[2];
        R2crossN = R2crossN[2];

        // Calc impulse scalar
        // the formula of jN can be found in http://www.myphysicslab.com/collision.html
        var jN = -(1 + newRestituion) * rVelocityInNormal;
        jN = jN / (s1.mInvMass + s2.mInvMass +
                R1crossN * R1crossN * s1.mInertia +
                R2crossN * R2crossN * s2.mInertia);

// --- updated to vec2 standard --- //
        //impulse is in direction of normal ( from s1 to s2)
        var impulse = vec2.clone(n);
        vec2.scale(impulse, impulse, jN);
        // impulse = F dt = m * △v
        // △v = impulse / m
        var scaledImpulse = vec2.create();
        vec2.scale(scaledImpulse, impulse, s1.mInvMass);
        vec2.subtract(s1.mVelocity, s1.mVelocity, scaledImpulse);
        vec2.scale(scaledImpulse, impulse, s2.mInvMass); // Probably a bug here.
        vec2.add(s2.mVelocity,s2.mVelocity, scaledImpulse);
        
        s1.mAngularVelocity -= R1crossN * jN * s1.mInertia;
        s2.mAngularVelocity += R2crossN * jN * s2.mInertia;

// --- updated to vec2 standard --- //
//      var tangent = relativeVelocity.subtract(n.scale(relativeVelocity.dot(n)));
        var tangent = vec2.create();
        vec2.scale(n, n, vec2.dot(relativeVelocity, n));
        vec2.subtract(tangent, relativeVelocity, n);

// --- updated to vec2 standard --- //
        //relativeVelocity.dot(tangent) should less than 0
        vec2.normalize(tangent, tangent);
        vec2.scale(tangent, tangent, -1);

// --- updated to vec2 standard --- //
        var R1crossT = vec3.create();
        vec2.cross(R1crossT, r1, tangent);
        var R2crossT = vec3.create();
        vec2.cross(R2crossT, r2, tangent);
        R1crossT = R1crossT[2];
        R2crossT = R2crossT[2];

// --- updated to vec2 standard --- //
        var jT = -(1 + newRestituion) * vec2.dot(relativeVelocity, tangent) * newFriction;
        jT = jT / (s1.mInvMass + s2.mInvMass + R1crossT * R1crossT * s1.mInertia + R2crossT * R2crossT * s2.mInertia);

        //friction should less than force in normal direction
        if (jT > jN) {
            jT = jN;
        }

// --- updated to vec2 standard --- //
        //impulse is from s1 to s2 (in opposite direction of velocity)
        impulse = vec2.create();
        vec2.scale(impulse, tangent, jT);

// --- updated to vec2 standard --- //
        var tempImpulse = vec2.create();
        vec2.scale(tempImpulse, impulse, s1.mInvMass);
        vec2.subtract(s1.mVelocity, s1.mVelocity, tempImpulse);
        vec2.scale(tempImpulse, impulse, s2.mInvMass);
        vec2.add(s2.mVelocity, s2.mVelocity, tempImpulse);
        
        s1.mAngularVelocity -= R1crossT * jT * s1.mInertia;
        s2.mAngularVelocity += R2crossT * jT * s2.mInertia;
    };
    
    var getSystemtAcceleration = function() { return mSystemAcceleration; };
    var getSystemMovement = function () { return mMovement; };
    var toggleSystemMovement = function () { mMovement = !mMovement; };
    var getPositionalCorrection = function () { return mPositionalCorrectionFlag; };
    var togglePositionalCorrection = function () { mPositionalCorrectionFlag = !mPositionalCorrectionFlag; };
    
    var processCollision = function(set, infoSet) {
        var i = 0, j, k;
        var iToj = vec2.create();
        var info = new CollisionInfo();
        for (k = 0; k < kRelaxationCount; k++){
            for (i = 0; i<set.size(); i++) {
                var objI = set.getObjectAt(i).getRigidBody(); // vice gEngine.Core.mAllObjects
                for (j = i+1; j<set.size(); j++) {
                    var objJ = set.getObjectAt(j).getRigidBody();
                    if (objI.boundTest(objJ)) {
                        if (objI.collisionTest(objJ, info)) {
                            // make sure info is always from i towards j
                            vec2.subtract(iToj, objJ.getCenter(), objI.getCenter());
                            if (vec2.dot(iToj, info.getNormal()) < 0)
                                info.changeDir();
                            // New from ch. 4.4 physics
                            resolveCollision(objI, objJ, info);
                            
                            infoSet.push(info);
                            info = new CollisionInfo();
                        }
                    }
                }
            }
        }
    };
    
    var mPublic = {
        getSystemAcceleration: getSystemtAcceleration,
        getSystemMovement: getSystemMovement,
        toggleSystemMovement: toggleSystemMovement,
        getPositionalCorrection: getPositionalCorrection,
        togglePositionalCorrection: togglePositionalCorrection,
        processCollision: processCollision
    };
    return mPublic;
}());