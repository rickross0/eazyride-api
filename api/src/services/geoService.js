// ============================================================
// Geolocation Service — OSRM/Nominatim — v3.0.0
// ============================================================

const axios = require('axios');
const logger = require('../utils/logger');

const OSRM_URL = process.env.OSRM_URL || 'https://router.project-osrm.org';
const NOMINATIM_URL = process.env.NOMINATIM_URL || 'https://nominatim.openstreetmap.org';

// Get route between two points
const getRoute = async (origin, destination) => {
  try {
    const url = `${OSRM_URL}/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
    const response = await axios.get(url, {
      params: { overview: 'full', geometries: 'geojson' },
      timeout: 10000,
    });

    if (response.data.code !== 'Ok' || !response.data.routes.length) {
      throw new Error('No route found');
    }

    const route = response.data.routes[0];
    return {
      distance: route.distance, // meters
      duration: route.duration, // seconds
      geometry: route.geometry,
    };
  } catch (error) {
    logger.error('OSRM route error:', error.message);
    // Fallback to straight-line distance
    return fallbackRoute(origin, destination);
  }
};

// Reverse geocode coordinates
const reverseGeocode = async (lat, lng) => {
  try {
    const response = await axios.get(`${NOMINATIM_URL}/reverse`, {
      params: { lat, lon: lng, format: 'json', addressdetails: 1 },
      headers: { 'User-Agent': 'EazyRide-Haye/3.0.0' },
      timeout: 10000,
    });

    return {
      address: response.data.display_name,
      city: response.data.address?.city || response.data.address?.town || '',
      country: response.data.address?.country || 'Somalia',
    };
  } catch (error) {
    logger.error('Reverse geocode error:', error.message);
    return { address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`, city: '', country: 'Somalia' };
  }
};

// Search places (forward geocode)
const searchPlaces = async (query, { lat, lng } = {}) => {
  try {
    const params = {
      q: query,
      format: 'json',
      limit: 10,
      countrycodes: 'so',
      addressdetails: 1,
    };
    if (lat && lng) {
      params.lat = lat;
      params.lon = lng;
      params.viewbox = `${lng - 0.5},${lat + 0.5},${lng + 0.5},${lat - 0.5}`;
    }

    const response = await axios.get(`${NOMINATIM_URL}/search`, {
      params,
      headers: { 'User-Agent': 'EazyRide-Haye/3.0.0' },
      timeout: 10000,
    });

    return response.data.map(place => ({
      placeId: place.place_id,
      name: place.display_name,
      lat: parseFloat(place.lat),
      lng: parseFloat(place.lon),
      type: place.type,
      address: place.address,
    }));
  } catch (error) {
    logger.error('Place search error:', error.message);
    return [];
  }
};

// Fallback: straight-line distance (Haversine)
const fallbackRoute = (origin, destination) => {
  const R = 6371000; // meters
  const toRad = (deg) => deg * (Math.PI / 180);
  const dLat = toRad(destination.lat - origin.lat);
  const dLng = toRad(destination.lng - origin.lng);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(origin.lat)) * Math.cos(toRad(destination.lat)) *
    Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return { distance, duration: distance / 10, geometry: null }; // assume 36km/h
};

module.exports = { getRoute, reverseGeocode, searchPlaces };
