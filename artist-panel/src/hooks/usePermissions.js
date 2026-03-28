import { useState, useEffect } from 'react';
import api from '../config/api';

// Cache permissions in memory
let cachedPermissions = null;
let cacheRole = null;

export const usePermissions = (role = 'artist') => {
  const [permissions, setPermissions] = useState(cachedPermissions || []);
  const [loading, setLoading] = useState(!cachedPermissions);

  useEffect(() => {
    if (cachedPermissions && cacheRole === role) {
      setPermissions(cachedPermissions);
      setLoading(false);
      return;
    }

    const fetchPermissions = async () => {
      try {
        const { data } = await api.get(`/api/permissions/role/${role}`);
        cachedPermissions = data.permissions || [];
        cacheRole = role;
        setPermissions(cachedPermissions);
      } catch {
        // Fallback to defaults if API fails
        const defaults = {
          artist: ['view_artist_dashboard', 'manage_bookings', 'manage_profile', 'view_analytics', 'manage_content', 'manage_schedule'],
          user:   ['view_home', 'book_artist', 'manage_wishlist', 'view_user_dashboard'],
          admin:  ['view_admin_dashboard', 'manage_users', 'manage_artists'],
        };
        setPermissions(defaults[role] || []);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [role]);

  const hasPermission = (permissionName) => permissions.includes(permissionName);
  const hasAnyPermission = (...names) => names.some(n => permissions.includes(n));

  return { permissions, loading, hasPermission, hasAnyPermission };
};
