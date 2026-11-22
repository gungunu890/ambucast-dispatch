import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ambulanceAPI, predictionAPI, allocationAPI, mlAPI, socket } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { DEMO_HOTSPOTS, DEMO_AMBULANCES } from '@/lib/demoData';

// Set to true to show sample data when real data isn't available:
//  - zone predictions (hotspots) are ALWAYS the sample data
//  - ambulances use real data when the backend returns some, otherwise the sample fleet
// Set to false to go back to real data everywhere.
export const USE_SAMPLE_DATA = true;

// Auto-fetch ambulances with 15 min intervals, real-time updates via Socket.IO
export const useAmbulances = () => {
  const setAmbulances = useAppStore((state) => state.setAmbulances);
  const autoFetchEnabled = useAppStore((state) => state.autoFetchEnabled);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['ambulances'],
    queryFn: async () => {
      if (!USE_SAMPLE_DATA) {
        const response = await ambulanceAPI.fetchAll();
        setAmbulances(response.data);
        return response.data;
      }

      // Try the real fleet first; fall back to the sample fleet if it's empty or unreachable
      try {
        const response = await ambulanceAPI.fetchAll();
        if (Array.isArray(response.data) && response.data.length > 0) {
          setAmbulances(response.data);
          return response.data;
        }
      } catch (error) {
        console.error('Failed to fetch ambulances, using sample fleet:', error);
      }
      return DEMO_AMBULANCES;
    },
    // initialData puts the sample fleet on screen on the very first render.
    // initialDataUpdatedAt: 0 marks it as stale, so the real fleet is still fetched right away.
    initialData: USE_SAMPLE_DATA ? DEMO_AMBULANCES : undefined,
    initialDataUpdatedAt: 0,
    refetchInterval: autoFetchEnabled ? 15 * 60 * 1000 : false, // 15 minutes if enabled
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  // Some pages read ambulances from the store, so keep the store in sync with the query data
  useEffect(() => {
    if (query.data) {
      setAmbulances(query.data);
    }
  }, [query.data, setAmbulances]);

  // Real-time updates via WebSocket
  useEffect(() => {
    const onAmbulanceUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['ambulances'] });
    };

    socket.on('ambulance:moved', onAmbulanceUpdate);
    socket.on('ambulance:status', onAmbulanceUpdate);

    return () => {
      socket.off('ambulance:moved', onAmbulanceUpdate);
      socket.off('ambulance:status', onAmbulanceUpdate);
    };
  }, [queryClient]);

  return query;
};

// Auto-fetch hotspots with 12 min intervals using the backend pipeline
// (or return the shared sample data when USE_SAMPLE_DATA is true)
export const useHotspots = () => {
  const setHotspots = useAppStore((state) => state.setHotspots);
  const autoFetchEnabled = useAppStore((state) => state.autoFetchEnabled);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['hotspots'],
    queryFn: async () => {
      if (USE_SAMPLE_DATA) {
        return DEMO_HOTSPOTS;
      }
      try {
        const response = await predictionAPI.getHotspots();
        setHotspots(response.data);
        return response.data;
      } catch (error) {
        console.error('Failed to fetch hotspots:', error);
        return [];
      }
    },
    // initialData makes the sample data available on the very first render
    initialData: USE_SAMPLE_DATA ? DEMO_HOTSPOTS : undefined,
    refetchInterval: !USE_SAMPLE_DATA && autoFetchEnabled ? 12 * 60 * 1000 : false, // 12 minutes if enabled
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  // Some pages read hotspots from the store, so keep the store in sync with the query data
  useEffect(() => {
    if (query.data) {
      setHotspots(query.data);
    }
  }, [query.data, setHotspots]);

  // Real-time updates via WebSocket
  useEffect(() => {
    const onHotspotUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['hotspots'] });
    };

    socket.on('pipeline:updated', onHotspotUpdate);
    socket.on('predictions:new', onHotspotUpdate);

    return () => {
      socket.off('pipeline:updated', onHotspotUpdate);
      socket.off('predictions:new', onHotspotUpdate);
    };
  }, [queryClient]);

  return query;
};

// Automatic allocation runs - triggered periodically
export const useAutoAllocation = () => {
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');

  useEffect(() => {
    // Run allocation every 30 minutes automatically
    const allocationInterval = setInterval(async () => {
      try {
        setStatus('running');
        await allocationAPI.runAllocation();
        setStatus('success');
        // Reset status after 2 seconds
        setTimeout(() => setStatus('idle'), 2000);
      } catch (error) {
        console.error('Auto-allocation failed:', error);
        setStatus('error');
        setTimeout(() => setStatus('idle'), 3000);
      }
    }, 30 * 60 * 1000); // 30 minutes

    // Run once on component mount
    (async () => {
      try {
        setStatus('running');
        await allocationAPI.runAllocation();
        setStatus('success');
        setTimeout(() => setStatus('idle'), 2000);
      } catch (error) {
        console.error('Initial allocation failed:', error);
        setStatus('error');
      }
    })();

    return () => clearInterval(allocationInterval);
  }, []);

  return { status };
};

// System health monitoring
export const useRealTimeUpdates = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [systemHealth, setSystemHealth] = useState<{
    backend: boolean;
    mlApi: boolean;
    database: boolean;
  }>({ backend: false, mlApi: false, database: false });

  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Immediate health check on component mount
    const performHealthCheck = async () => {
      try {
        // Check backend
        await ambulanceAPI.fetchAll();
        setSystemHealth((prev) => ({ ...prev, backend: true }));
      } catch {
        setSystemHealth((prev) => ({ ...prev, backend: false }));
      }

      try {
        // Check ML API
        await mlAPI.health();
        setSystemHealth((prev) => ({ ...prev, mlApi: true }));
      } catch {
        setSystemHealth((prev) => ({ ...prev, mlApi: false }));
      }

      try {
        // Check database (via ambulances endpoint which tests DB connection)
        await ambulanceAPI.fetchAll();
        setSystemHealth((prev) => ({ ...prev, database: true }));
      } catch {
        setSystemHealth((prev) => ({ ...prev, database: false }));
      }
    };

    performHealthCheck();

    // Health check every 30 seconds (more frequent)
    const healthInterval = setInterval(performHealthCheck, 30000);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      clearInterval(healthInterval);
    };
  }, []);

  return { isConnected, systemHealth };
};
