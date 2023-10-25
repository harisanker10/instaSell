const isInRadius = (cord1, cord2, distance) => {
    console.log(cord1, cord2, distance);
  
    if (geolib.getDistance(cord1, cord2) > distance * 1000) return false;
    return true;
  };

  module.exports = isInRadius;