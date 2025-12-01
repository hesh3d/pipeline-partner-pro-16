import { LayoutDashboard, Search, List, BookmarkCheck, Trash2, Settings, LogOut, Sun, Moon, Languages, Clock } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, SidebarHeader, useSidebar } from '@/components/ui/sidebar';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useState, useEffect } from 'react';
const menuItems = [{
  title: 'nav.dashboard',
  url: '/dashboard',
  icon: LayoutDashboard
}, {
  title: 'nav.searchLeads',
  url: '/search',
  icon: Search
}, {
  title: 'nav.listLeads',
  url: '/leads',
  icon: List
}, {
  title: 'nav.savedLeads',
  url: '/saved',
  icon: BookmarkCheck
}, {
  title: 'nav.deletedLeads',
  url: '/deleted',
  icon: Trash2
}, {
  title: 'nav.settings',
  url: '/settings',
  icon: Settings
}];
export function AppSidebar() {
  const {
    state
  } = useSidebar();
  const location = useLocation();
  const {
    t,
    locale,
    setLocale
  } = useI18n();
  const {
    user,
    signOut
  } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const collapsed = state === 'collapsed';
  const currentPath = location.pathname;
  const isActive = (path: string) => currentPath === path;
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setDarkMode(!darkMode);
  };
  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'ar' : 'en');
  };
  const userInitials = user?.email?.substring(0, 2).toUpperCase() || 'U';
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: locale === 'en'
    });
  };
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  return <Sidebar collapsible="none" className="w-64 border-r border-border">
      <SidebarHeader className="border-b border-border/50 p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <div className="h-3 w-3 rounded-full bg-success animate-pulse" />
            <div className="absolute inset-0 h-3 w-3 rounded-full bg-success animate-ping opacity-75" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 text-foreground">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-lg font-semibold font-display">{formatTime(currentTime)}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{formatDate(currentTime)}</p>
          </div>
        </div>
        
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map(item => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-12">
                    <NavLink to={item.url} end className="hover:bg-accent/80 transition-all duration-200 rounded-lg px-4 text-base" activeClassName="bg-primary text-primary-foreground font-semibold shadow-sm">
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span className="ml-3">{t(item.title)}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50">
        <div className="p-4 space-y-3">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={toggleDarkMode} className="flex-1 justify-start gap-2">
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span className="text-xs">{darkMode ? 'Light' : 'Dark'}</span>
            </Button>
            <Button variant="outline" size="sm" onClick={toggleLocale} className="flex-1 justify-start gap-2">
              <Languages className="h-4 w-4" />
              <span className="text-xs">{locale === 'en' ? 'ع' : 'EN'}</span>
            </Button>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start p-3 h-auto hover:bg-accent">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="text-sm font-semibold">{userInitials}</AvatarFallback>
                </Avatar>
                <div className="ml-3 text-left flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.email}</p>
                  <p className="text-xs text-muted-foreground">CraftFolio</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={signOut} className="text-danger">
                <LogOut className="h-4 w-4 mr-2" />
                {t('auth.signout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
    </Sidebar>;
}