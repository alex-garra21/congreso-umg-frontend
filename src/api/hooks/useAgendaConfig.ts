import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';

export interface AgendaConfig {
  row_height: number;
  font_size_title: number;
  font_size_time: number;
  font_size_speaker: number;
  card_padding: number;
  card_border_radius: number;
}

export const defaultConfig: AgendaConfig = {
  row_height: 6,
  font_size_title: 13,
  font_size_time: 10,
  font_size_speaker: 10,
  card_padding: 14,
  card_border_radius: 18
};

const CACHE_KEY = 'agenda_visual_config';

const getInitialConfig = (): AgendaConfig => {
  if (typeof window === 'undefined') return defaultConfig;
  const saved = localStorage.getItem(CACHE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return defaultConfig;
    }
  }
  return defaultConfig;
};

export function useAgendaConfig() {
  const [config, setConfig] = useState<AgendaConfig>(getInitialConfig());
  const [loading, setLoading] = useState(true);

  const fetchConfig = async () => {
    try {
      const { data } = await supabase
        .from('config_agenda')
        .select('*')
        .eq('id', 'current')
        .single();

      if (data) {
        setConfig(data);
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      }
    } catch (err) {
      console.error('Error fetching agenda config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const updateConfig = async (newConfig: Partial<AgendaConfig>) => {
    try {
      const { error } = await supabase
        .from('config_agenda')
        .update(newConfig)
        .eq('id', 'current');
      
      if (!error) {
        const updated = { ...config, ...newConfig };
        setConfig(updated);
        localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
        return { success: true };
      }
      return { success: false, error };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  return { config, loading, updateConfig, refresh: fetchConfig };
}
