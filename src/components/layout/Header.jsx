import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import ThemeToggle from './ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { supabase } from '@/lib/supabase';




import { useAuth } from '../../context/AuthContext';
import CloudBaudLogo from '../common/CloudBaudLogo';

const Header = () => {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [industries, setIndustries] = useState([]);

  const [services, setServices] = useState([
    { name: 'Data Engineering', href: '/capabilities/data-engineering' },
    { name: 'AI Engineering', href: '/ai-engineering' },
    { name: 'App Dev', href: '/capabilities/custom-applications' },
    { name: 'Platforms', href: '/capabilities/devops-infrastructure' },
  ]);

  useEffect(() => {
    // Parallel fetch for Navigation and Industries
    const fetchData = async () => {
      try {
        const [navRes, indRes] = await Promise.all([
          supabase
            .from('site_navigation')
            .select('label, path')
            .eq('is_active', true)
            .order('order_index'),
          supabase
            .from('industries')
            .select('name, slug')
            .eq('is_active', true)
            .order('name')
        ]);

        if (navRes.data) {
          setServices(navRes.data.map(item => ({ name: item.label, href: item.path })));
        }
        
        if (indRes.data) {
          setIndustries(indRes.data);
        }
      } catch (error) {
        console.error('Error fetching header data:', error);
      }
    };
    fetchData();
  }, []);
  // ...existing code...
      </div>
    </header>
  );
};

export default Header;
