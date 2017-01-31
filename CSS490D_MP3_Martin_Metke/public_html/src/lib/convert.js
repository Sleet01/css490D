/**
 * @fileoverview Conversion utilities to transform various coordinate systems
 * @author Martin Metke
 * @version 0.1
 */

Convert = window.Convert || {};

Convert = function () {

    // var mVar1 = null;

    // UV coords to pixel/texel coordinates, given UV coords, texel bounds
    uv2pxy = function() {

    };

    // pixel/texel XY coordinates to UV coordinates, given texel bounds
    pxy2uv = function() {

    };
  
    // Camera World coords to canvas pixel coords, given camera bounds and xy position
    wc2cxy = function() {
      
    };
  
    // Canvas world coords to camera WC coords, given camera bounds and xy position
    cxy2wc = function() {
      
    };
  
    // Convert WC coords to UV coords w/in a bounds, given WC coords, WC bounds
    wc2uv = function() {
        
    };

    uv2wc = function() {
        
    };
    
    // Calculate the aspect ratio of texture based on its info
    textureAR = function(textureInfo){
        return (textureInfo.mWidth / (textureInfo.mHeight));
    };
    
    getBounds = function(xForm) {
        var xFormPos = xForm.getPosition();
        var xFormSize = xForm.getSize();
        var mXorigin = xFormPos[0] - (xFormSize[0] / 2);
        var mYorigin = xFormPos[1] - (xFormSize[1] / 2);
        return [mXorigin, mYorigin, xFormSize[0], xFormSize[1]];
    };
    
    var mPublic = {
        "uv2pxy" : uv2pxy,
        "pxy2uv" : pxy2uv,
        "wc2cxy" : wc2cxy,
        "cxy2wc" : cxy2wc,
        "wc2uv"  : wc2uv,
        "uv2wc"  : uv2wc,
        "textureAR" : textureAR,
        "getBounds" : getBounds
    };
    return mPublic;

}();