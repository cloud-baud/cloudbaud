import React from 'react';
import { UniversalSettingsPage as CommonSettingsPage } from 'synolic.core';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';


/**
 * UniversalSettingsPage
 * 
 * A wrapper for the CommonFeatures UniversalSettingsPage component.
 * Connects the cross-app settings UI to CloudBaud's specific Auth and Supabase logic.
 * This version uses the full CommonFeatures Master Page shell for parity with NRI Essentials.
 */
const UniversalSettingsPage = () => {
  const { user, signOut, enrollMfa, verifyMfa, unenrollMfa } = useAuth();
  const navigate = useNavigate();
  
  const [orgData, setOrgData] = React.useState(null);
  const [locsData, setLocsData] = React.useState([]);

  React.useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      // 1. Fetch organization linked to user (via profiles or default)
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();
      
      if (profile?.organization_id) {
        const { data: org } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', profile.organization_id)
          .single();
        if (org) setOrgData(org);

        const { data: locs } = await supabase
          .from('locations')
          .select('*')
          .eq('organization_id', profile.organization_id);
        if (locs) setLocsData(locs);
      }
    };
    fetchData();
  }, [user]);

  // Handlers for persistence
  const handlers = {
    onSaveProfile: async (data) => {
      // 1. Update Auth Metadata (for session)
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: data.fullName,
          job_title: data.jobTitle,
          bio: data.bio,
          website: data.website,
          avatar_url: data.avatarUrl
        }
      });
      if (authError) throw authError;

      // 2. Update Public Profiles table (for global access)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: data.fullName,
          avatar_url: data.avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (profileError) console.error('Failed to sync profile to DB:', profileError);
      
      toast.success('Profile updated successfully');
    },

    onUploadAvatar: async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath);

      return publicUrl;
    },
    
    onSaveAppearance: async (data) => {
      // Save global branding to profiles if admin
      if (user?.role === 'tenant-admin' || user?.role === 'client-admin' || user?.role === 'tenant_admin') {
        const { error } = await supabase
          .from('profiles')
          .update({ 
            avatar_url: data.logoUrl, // Using avatar_url for logo temporarily or custom field
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
        if (error) console.error('Failed to sync branding to DB:', error);
      }
      toast.success('Appearance settings saved');
    },
    
    onSaveNavigation: async (navItems, sidebarSections) => {
      const { error } = await supabase.auth.updateUser({
        data: {
          portal_nav_active: navItems,
          sidebar_nav_items: sidebarSections
        }
      });
      if (error) throw error;
      
      // Dispatch events for immediate UI feedback in the layout
      window.dispatchEvent(new CustomEvent('portal-nav-update'));
      window.dispatchEvent(new CustomEvent('sidebar-nav-update'));
      
      toast.success('Navigation layout updated');
    },

    onSaveOrganization: async (data) => {
      const { error } = await supabase
        .from('organizations')
        .upsert({ ...data, updated_at: new Date().toISOString() });
      
      if (error) throw error;
      setOrgData(data);
      toast.success('Organization profile updated');
    },

    onSaveLocations: async (locs) => {
      // 1. Delete removed locations (if any)
      const existingIds = locsData.map(l => l.id);
      const newIds = locs.map(l => l.id);
      const toDelete = existingIds.filter(id => !newIds.includes(id));

      if (toDelete.length > 0) {
        await supabase.from('locations').delete().in('id', toDelete);
      }

      // 2. Upsert current locations
      const { error } = await supabase.from('locations').upsert(locs);
      
      if (error) throw error;
      setLocsData(locs);
      toast.success('Locations synchronized');
    },
    
    onUploadLogo: async (file) => {
      // Basic implementation for avatar/logo upload
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Math.random()}.${fileExt}`;
      const filePath = `logos/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath);
        
      return publicUrl;
    },

    onListMfaFactors: async () => {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      return data || { all: [], active: [] };
    },

    onEnrollMfa: async () => {
      return await enrollMfa();
    },

    onVerifyMfa: async (factorId, code) => {
      return await verifyMfa(factorId, code);
    },

    onUnenrollMfa: async (factorId) => {
      return await unenrollMfa(factorId);
    },

    onClose: () => navigate('/workspace')
  };

  // Convert Auth user to standardized SettingsUser format
  const mappedUser = user ? {
    id: user.id || '',
    email: user.email || '',
    fullName: user.full_name || user.user_metadata?.full_name || user.email?.split('@')[0],
    jobTitle: user.job_title || user.user_metadata?.job_title || 'Team Member',
    avatarUrl: user.avatar_url || user.user_metadata?.avatar_url || '',
    role: user.role || 'user',
    user_metadata: {
      ...user.user_metadata,
      organization: orgData,
      locations: locsData
    }
  } : null;

  const CloudBaudLogo = (
    <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => navigate('/workspace')}>
      <img src="/src/assets/images/CB_logo_transparent.png" className="h-10 w-auto object-contain shrink-0" alt="CloudBaud" />
      <span className="font-bold text-xl text-white hidden xl:inline tracking-tight">CloudBaud</span>
    </div>
  );

  return (
    <div className="w-full h-screen overflow-hidden">
      <CommonSettingsPage 
        user={mappedUser} 
        appId="cloudbaud"
        logo={CloudBaudLogo}
        onSignOut={signOut}
        handlers={handlers}
      />
    </div>
  );
};

export default UniversalSettingsPage;
