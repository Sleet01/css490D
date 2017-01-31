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
    // Bounds is in the form [xOrigin, yOrigin, Width, Height] in WC.
    wc2uv = function(aPosition, aBounds) {
        var xUVPos = 0;
        var yUVPos = 0;

        xUVPos = Convert.wcScalar2uv(aPosition[0] - aBounds[0], aBounds[2]);
        yUVPos = Convert.wcScalar2uv(aPosition[1] - aBounds[1], aBounds[3]);
        
        return [xUVPos, yUVPos];
    };
    
    // convert one WC dimension (width, height, diagonal, etc.) to a UV based
    // on a given arbitrary measurement, starting from some origin-value.
    wcScalar2uv = function(scalar, wcDimension) {
        var uvPos = 0;
        
        if(scalar < 0) { uvPos = 0; }
        else if(scalar >=  wcDimension) { uvPos = 1; }
        else {uvPos = (scalar / wcDimension); }
        
        return uvPos;
    };
    
    uv2wc = function() {
        
    };
    
    // Calculate the aspect ratio of texture based on its info
    textureAR = function(textureInfo){
        return (textureInfo.mWidth / (textureInfo.mHeight));
    };
    
    cameraAR = function(camera){
        return (camera.getWCWidth() / (camera.getWCHeight()));
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
        "wcScalar2uv" : wcScalar2uv,        
        "uv2wc"  : uv2wc,
        "textureAR" : textureAR,
        "cameraAR"  : cameraAR,
        "getBounds" : getBounds
    };
    return mPublic;

}();