/**
 * @fileoverview Conversion utilities to transform various coordinate systems
 * @author Martin Metke
 * @version 0.1
 */

Convert = window.Convert || {};

// 
Convert = function () {

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
        "wc2uv"  : wc2uv,
        "wcScalar2uv" : wcScalar2uv,        
        "textureAR" : textureAR,
        "cameraAR"  : cameraAR,
        "getBounds" : getBounds
    };
    return mPublic;

}();