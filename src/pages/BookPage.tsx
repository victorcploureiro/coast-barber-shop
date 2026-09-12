import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Service } from '@/types';

// Dentro do seu componente:
const [dbServices, setDbServices] = useState<Service[]>([]);
const [loadingServices, setLoadingServices] = useState(true);

useEffect(() => {
  async function fetchServices() {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('price', { ascending: true });

      if (!error && data) {
        setDbServices(data);
      }
    } catch (err) {
      console.error('Erro ao carregar serviços:', err);
    } finally {
      setLoadingServices(false);
    }
  }

  fetchServices();
}, []);