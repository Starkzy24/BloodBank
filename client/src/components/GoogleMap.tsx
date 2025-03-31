import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface MapProps {
  apiKey?: string;
}

interface Hospital {
  id: number;
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  bloodTypes?: string[];
  distance?: number;
}

interface FilterOptions {
  bloodType: string;
  location: string;
  radius: number;
}

const GoogleMap: React.FC<MapProps> = ({ apiKey }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationSearchInput, setLocationSearchInput] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    bloodType: '',
    location: '',
    radius: 10,
  });
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Query to fetch hospitals data
  const { data: hospitals, isLoading, error } = useQuery<Hospital[]>({
    queryKey: ['/api/hospitals'],
  });

  // Load Google Maps API script
  useEffect(() => {
    if (window.google?.maps || !mapRef.current) return;

    const googleMapsApiKey = apiKey || process.env.GOOGLE_MAPS_API_KEY || '';
    
    if (!googleMapsApiKey) {
      setLoadError('Google Maps API key is missing');
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsMapLoaded(true);
    };
    script.onerror = () => {
      setLoadError('Failed to load Google Maps API');
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [apiKey]);

  // Initialize map when API is loaded
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;

    try {
      // Try to get user's location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(userPos);

          // Initialize map centered at user's location
          const newMap = new google.maps.Map(mapRef.current!, {
            center: userPos,
            zoom: 12,
            mapTypeControl: true,
            streetViewControl: false,
            fullscreenControl: true,
          });

          setMap(newMap);

          // Add marker for user's location
          new google.maps.Marker({
            position: userPos,
            map: newMap,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2,
            },
            title: 'Your Location',
          });
        },
        () => {
          // Default location if user denies location access
          const defaultPos = { lat: 40.7128, lng: -74.006 }; // New York City
          setUserLocation(defaultPos);

          const newMap = new google.maps.Map(mapRef.current!, {
            center: defaultPos,
            zoom: 12,
            mapTypeControl: true,
            streetViewControl: false,
            fullscreenControl: true,
          });

          setMap(newMap);
        }
      );
    } catch (error) {
      console.error('Error initializing map:', error);
      setLoadError('Failed to initialize map');
    }
  }, [isMapLoaded]);

  // Update markers when hospitals data changes or map is available
  useEffect(() => {
    if (!map || !hospitals) return;

    // Clear existing markers
    markers.forEach((marker) => marker.setMap(null));
    const newMarkers: google.maps.Marker[] = [];

    // Add markers for each hospital
    hospitals.forEach((hospital) => {
      try {
        const position = {
          lat: parseFloat(hospital.latitude),
          lng: parseFloat(hospital.longitude),
        };

        if (isNaN(position.lat) || isNaN(position.lng)) {
          console.warn(`Invalid coordinates for hospital: ${hospital.name}`);
          return;
        }

        // Create info window content
        const contentString = `
          <div style="padding: 10px; max-width: 200px;">
            <h3 style="margin-top: 0; font-weight: bold;">${hospital.name}</h3>
            <p style="margin-bottom: 5px;">${hospital.address}</p>
            ${
              hospital.bloodTypes
                ? `<p style="margin-bottom: 0;">Available blood types: ${hospital.bloodTypes.join(
                    ', '
                  )}</p>`
                : ''
            }
            ${
              hospital.distance
                ? `<p style="margin-bottom: 0; font-style: italic;">Distance: ${hospital.distance.toFixed(
                    1
                  )} km</p>`
                : ''
            }
          </div>
        `;

        const infoWindow = new google.maps.InfoWindow({
          content: contentString,
        });

        // Create marker
        const marker = new google.maps.Marker({
          position,
          map,
          title: hospital.name,
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
          },
        });

        // Add click listener
        marker.addListener('click', () => {
          infoWindow.open({
            anchor: marker,
            map,
          });
        });

        newMarkers.push(marker);
      } catch (error) {
        console.error(`Error creating marker for hospital ${hospital.name}:`, error);
      }
    });

    setMarkers(newMarkers);
  }, [map, hospitals]);

  // Handle search form submission
  const handleSearch = async () => {
    if (!map) return;

    let searchLocation = userLocation;

    // If there's a location search input, geocode it
    if (locationSearchInput && isMapLoaded) {
      try {
        const geocoder = new google.maps.Geocoder();
        const result = await geocoder.geocode({ address: locationSearchInput });
        
        if (result.results.length > 0) {
          const location = result.results[0].geometry.location;
          searchLocation = { lat: location.lat(), lng: location.lng() };
          
          // Center map on the new location
          map.setCenter(searchLocation);
          
          // Update marker for user's location
          markers.forEach(marker => {
            if (marker.getTitle() === 'Your Location') {
              marker.setMap(null);
            }
          });
          
          new google.maps.Marker({
            position: searchLocation,
            map,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2,
            },
            title: 'Your Location',
          });
        }
      } catch (error) {
        console.error('Geocoding error:', error);
      }
    }

    // Update filters
    setFilters({
      ...filters,
      location: locationSearchInput,
    });
  };

  // Render loading state
  if (!isMapLoaded || isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Find Nearest Blood Banks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p>Loading map...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render error state
  if (loadError || error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Find Nearest Blood Banks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[400px] text-destructive">
            <AlertTriangle className="h-8 w-8 mb-4" />
            <p>{loadError || 'Failed to load blood bank data'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Find Nearest Blood Banks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium mb-1 block">Blood Type</label>
            <Select
              value={filters.bloodType}
              onValueChange={(value) => setFilters({ ...filters, bloodType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any Blood Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any Blood Type</SelectItem>
                <SelectItem value="A+">A+</SelectItem>
                <SelectItem value="A-">A-</SelectItem>
                <SelectItem value="B+">B+</SelectItem>
                <SelectItem value="B-">B-</SelectItem>
                <SelectItem value="AB+">AB+</SelectItem>
                <SelectItem value="AB-">AB-</SelectItem>
                <SelectItem value="O+">O+</SelectItem>
                <SelectItem value="O-">O-</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Your Location</label>
            <Input
              type="text"
              placeholder="Enter your location"
              value={locationSearchInput}
              onChange={(e) => setLocationSearchInput(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Search Radius</label>
            <Select
              value={filters.radius.toString()}
              onValueChange={(value) => setFilters({ ...filters, radius: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="10 km" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 km</SelectItem>
                <SelectItem value="10">10 km</SelectItem>
                <SelectItem value="25">25 km</SelectItem>
                <SelectItem value="50">50 km</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end mb-4">
          <Button type="button" onClick={handleSearch} className="bg-primary">
            Search
          </Button>
        </div>
        
        <div ref={mapRef} className="w-full h-[400px] rounded-lg overflow-hidden" />
        
        {hospitals && hospitals.length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium mb-3">Nearby Blood Banks</h3>
            <div className="space-y-4">
              {hospitals.map((hospital) => (
                <div key={hospital.id} className="border p-4 rounded-lg">
                  <div className="flex justify-between">
                    <h5 className="font-medium">{hospital.name}</h5>
                    <span className="text-sm bg-green-100 dark:bg-green-900 text-accent px-2 py-1 rounded">
                      Available
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{hospital.address}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 inline mr-1 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      </svg>
                      {hospital.bloodTypes ? hospital.bloodTypes.join(', ') : 'All types'} available
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {hospital.distance ? `${hospital.distance.toFixed(1)} km away` : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoogleMap;
