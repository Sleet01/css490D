/* File: SpriteSource.js 
 *
 * Inherits from GameObject
 * Sets up a view of a spritesheet
 */

/*jslint node: true, vars: true */
/*global gEngine: false, GameObject: false, Convert: false */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!
/** @brief  Create a texture sheet and constrain it (and possibly an InteractiveBound)
 *          within a given camera.s
 * 
 * @param {TextureRenderable} renderableObj
 * @param {Camera} camera
 * @param {InteractiveBound} ib
 * @returns {SpriteSource}
 */
function SpriteSource(renderableObj, camera, ib = null) {
    GameObject.call(this, renderableObj);
    this.mCamera = camera;
    this.info = gEngine.Textures.getTextureInfo(this.mRenderComponent.getTexture());
    this.mInteractiveBound = ib;
    this.mBorder = new Renderable();
    this.mBackground = new Renderable();
    this.mMarkers = [];
    this.mMarkersPos = [];
    
    // Set colors for background and border Renderables
    this.mBorder.setColor([0.1, 0.1, 0.1, 1]);
    this.mBackground.setColor([0.5, 0.5, 0.5, 1]);
    
    // Center the sprite sheet texture in the provided camera
    this.scaleTexture();
    
    // Set the bounds on the InteractiveBorder, if it exists.  This prevents it
    // from scrolling outside of the bounds of this' texture.
    if (!(this.mInteractiveBound === null)) {
        this.mInteractiveBound.setBounds(Convert.getBounds(this.getXform()));
    }
    
    // Setup corner markers
    this._setupMarkers();
        
}
gEngine.Core.inheritPrototype(SpriteSource, GameObject);

/**@brief   Create the corner markers marking bounds of this' sprite sheet 
 * 
 */
SpriteSource.prototype._setupMarkers = function() {
    
    // Set positions of corner markers
    var texBounds = Convert.getBounds( this.getXform() );
    
    this.mMarkersPos = [ [ texBounds[0], texBounds[1]  ], // [ Xorigin, Yorigin ]
                         [ texBounds[0] + texBounds[2], texBounds[1] ],
                         [ texBounds[0] + texBounds[2], texBounds[1] + texBounds[3] ],
                         [ texBounds[0], texBounds[1] + texBounds[3]  ] 
                        ];  
    
    // Instantiate side markers
    for (var j = 0; j < 4; j++){
        var randColor = [ Math.random(), Math.random(), Math.random(), 1];
        this.mMarkers.push(new Renderable());
        this.mMarkers[j].setColor(randColor);
        // Set position
        this.mMarkers[j].getXform().setPosition( this.mMarkersPos[j][0], this.mMarkersPos[j][1]);
        this.mMarkers[j].getXform().setSize(3, 3);
    }
};

/* @brief   Centers and scales the texture which this object provides
 * 
 */
SpriteSource.prototype.scaleTexture = function() {
    //Find Aspect Ratio of texture and camera
    var mAR = Convert.textureAR(this.info);
    var cAR = Convert.cameraAR(this.mCamera);
    
    // Use the Transform of this object's TextureRenderable to determine bound
    var Xform = this.getXform();
    
    // Center on camera
    Xform.setPosition(this.mCamera.getWCXPos(), this.mCamera.getWCYPos());
    // If the image is wider than it is tall:
    if (mAR > 1) {
        if (mAR >= cAR){
            Xform.setWidth(this.mCamera.getWCWidth() * 0.95);
            Xform.setHeight(Xform.getWidth() / mAR);
        } else {
            Xform.setHeight(this.mCamera.getWCHeight() * 0.95);
        }
    }else{
        if (mAR <= cAR){
            Xform.setHeight(this.mCamera.getWCHeight() * 0.95);
            Xform.setWidth(Xform.getHeight() * mAR);
        } else {
            Xform.setWidth(this.mCamera.getWCWidth() * 0.95);
            Xform.setHeight(Xform.getWidth * mAR);
        }
    } 
    
    // Set up border location and size
    this.mBackground.getXform().setSize(Xform.getWidth(), Xform.getHeight());
    this.mBackground.getXform().setPosition(Xform.getXPos(), Xform.getYPos());
    this.mBorder.getXform().setSize(Xform.getWidth() + 0.5, Xform.getHeight() + 0.5);
    this.mBorder.getXform().setPosition(Xform.getXPos(), Xform.getYPos());
};

/**@brief   Assign an InteractiveBound object to this.
 * 
 * @param {InteractiveBound} ib
 */
SpriteSource.prototype.setInteractiveBound = function(ib) {
    if (!(this.mInteractiveBound === null)) {
        this.mInteractiveBound = ib;
        this.mInteractiveBound.setBounds(Convert.getBounds(this.getXform()));
    }
};

/**@brief   Grab the bounds info from this' sprite sheet, as WC coordinates
 * 
 * @returns {Array} WC bounds in [xOrigin, yOrigin, width, height] format
 */
SpriteSource.prototype.getTextureBounds = function (){
    var Xform = this.getXform();
    return [0, 0, Xform.getWidth(), Xform.getHeight()];
};

/**@brief   Assign a new texture to this object's TextureRenderable
 * @pre     Texture must already be loaded in the engine
 * @param {Texture} t
 */
SpriteSource.prototype.setTexture = function (t) { 
    this.renderComponent.mTexture = t;
    
};
/**@brief   This object draws its own background, corner markers, and texture
 * @pre     All objects must be instantiated
 * @param {ViewPortMatrix} cameraVPM
 */
SpriteSource.prototype.draw = function (cameraVPM) {

    this.mBorder.draw(cameraVPM);
    this.mBackground.draw(cameraVPM);
    this.mRenderComponent.draw(cameraVPM);
    for (var j = 0; j < this.mMarkers.length; j++){
        this.mMarkers[j].draw(cameraVPM);
    }
};