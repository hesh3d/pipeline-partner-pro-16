import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/contexts/I18nContext';
import { TrendingUp, Search as SearchIcon, MapPin, CheckCircle, DollarSign, BarChart3, PieChart, CheckCircle2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
export default function Dashboard() {
  const {
    t
  } = useI18n();
  const {
    user
  } = useAuth();
  const {
    data: settings
  } = useQuery({
    queryKey: ['user-settings', user?.id],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('user_settings').select('*').eq('user_id', user?.id).maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user
  });
  const {
    data: leadsStats
  } = useQuery({
    queryKey: ['leads-stats', user?.id],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('leads').select('id, closed_won, work_status, city, deal_price').eq('user_id', user?.id);
      if (error) throw error;
      const totalLeads = data?.length || 0;
      const closedWon = data?.filter(l => l.closed_won).length || 0;
      const uniqueCities = new Set(data?.map(l => l.city)).size;
      return {
        totalLeads,
        closedWon,
        uniqueCities
      };
    },
    enabled: !!user
  });
  const {
    data: searchStats
  } = useQuery({
    queryKey: ['search-stats', user?.id],
    queryFn: async () => {
      const {
        count,
        error
      } = await supabase.from('search_history').select('*', {
        count: 'exact',
        head: true
      }).eq('user_id', user?.id);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user
  });
  const closeRate = settings?.close_rate_percent || 10;
  const avgValue = settings?.avg_project_value || 2000;
  const baseLeadsWorth = (leadsStats?.totalLeads || 0) * (closeRate / 100) * avgValue;
  
  // Currency conversions (approximate rates)
  const currencyCards = [
    { currency: 'USD', symbol: '$', rate: 1, icon: DollarSign, gradient: 'from-emerald-500 to-teal-600' },
    { currency: 'EUR', symbol: '€', rate: 0.92, icon: DollarSign, gradient: 'from-blue-500 to-indigo-600' },
    { currency: 'JOD', symbol: 'د.أ', rate: 0.71, icon: DollarSign, gradient: 'from-purple-500 to-violet-600' },
    { currency: 'SAR', symbol: 'ر.س', rate: 3.75, icon: DollarSign, gradient: 'from-amber-500 to-orange-600' },
  ];

  // Mock data for charts
  const funnelData = [{
    stage: t('dashboard.searches'),
    value: searchStats || 45
  }, {
    stage: t('dashboard.identified'),
    value: leadsStats?.totalLeads || 120
  }, {
    stage: t('dashboard.saved'),
    value: Math.floor((leadsStats?.totalLeads || 32) * 0.7)
  }, {
    stage: t('dashboard.closed'),
    value: leadsStats?.closedWon || 4
  }];
  const stageDistribution = [{
    name: 'New',
    value: 45,
    color: '#7C3AED',
    gradient: 'url(#gradientPrimary)'
  }, {
    name: 'In Progress',
    value: 32,
    color: '#F59E0B',
    gradient: 'url(#gradientWarning)'
  }, {
    name: 'Proposal',
    value: 28,
    color: '#8B5CF6',
    gradient: 'url(#gradientAccent)'
  }, {
    name: 'Closed/Won',
    value: leadsStats?.closedWon || 15,
    color: '#10B981',
    gradient: 'url(#gradientSuccess)'
  }];
  const revenueByStage = [{
    stage: 'Closed/Won',
    revenue: (leadsStats?.closedWon || 15) * avgValue
  }, {
    stage: 'Proposal',
    revenue: 28 * avgValue
  }, {
    stage: 'In Progress',
    revenue: 32 * avgValue
  }, {
    stage: 'New',
    revenue: 45 * avgValue
  }];
  const cityData = [{
    city: 'Riyadh',
    count: 12
  }, {
    city: 'Jeddah',
    count: 8
  }, {
    city: 'Dubai',
    count: 7
  }, {
    city: 'Doha',
    count: 5
  }];
  const nextActions = [{
    id: 1,
    task: 'Follow up with Dental Clinic - Riyadh',
    dueDate: '2 days',
    priority: 'high'
  }, {
    id: 2,
    task: 'Send proposal to Beauty Salon - Jeddah',
    dueDate: '3 days',
    priority: 'medium'
  }, {
    id: 3,
    task: 'Schedule meeting with Restaurant - Dubai',
    dueDate: '5 days',
    priority: 'low'
  }];
  const kpis = [{
    title: t('dashboard.totalSearches'),
    value: searchStats || 0,
    icon: SearchIcon,
    change: '+12%',
    positive: true
  }, {
    title: t('dashboard.leadsFound'),
    value: leadsStats?.totalLeads || 0,
    icon: TrendingUp,
    change: '+28%',
    positive: true
  }, {
    title: t('dashboard.citiesSearched'),
    value: leadsStats?.uniqueCities || 0,
    icon: MapPin,
    change: '+5%',
    positive: true
  }, {
    title: t('dashboard.dealsClosed'),
    value: leadsStats?.closedWon || 0,
    icon: CheckCircle,
    change: '-2%',
    positive: false
  }];
  return <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Multi-Currency Leads Worth Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {currencyCards.map((card, idx) => {
          const worth = (baseLeadsWorth * card.rate).toFixed(0);
          return (
            <Card 
              key={card.currency} 
              className="hover-lift shadow-card border-border/50 transition-all duration-300 hover:shadow-elegant group overflow-hidden relative"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
              <CardContent className="p-6 relative">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg`}>
                    <card.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {card.currency}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2 font-medium">
                  {t('dashboard.leadsWorth')}
                </p>
                <p className="text-3xl font-display font-bold text-foreground mb-1">
                  {card.symbol} {parseInt(worth).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {leadsStats?.totalLeads || 0} leads × {closeRate}%
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => <Card key={kpi.title} className="hover-lift shadow-card border-border/50 transition-all duration-300 hover:shadow-elegant group" style={{
        animationDelay: `${idx * 100}ms`
      }}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-accent/50 group-hover:bg-accent transition-colors">
                  <kpi.icon className="h-5 w-5 text-accent-foreground" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${kpi.positive ? 'text-success' : 'text-danger'}`}>
                  {kpi.positive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  {kpi.change}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1 font-medium">{kpi.title}</p>
              <p className="text-4xl font-display font-bold text-foreground">{kpi.value.toLocaleString()}</p>
            </CardContent>
          </Card>)}
      </div>

      {/* Stage Distribution & Revenue by Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stage Distribution Donut */}
        <Card className="shadow-elegant border-border/50 hover-lift">
          <CardHeader>
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              {t('dashboard.stageDistribution')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <RechartsPieChart>
                <defs>
                  <linearGradient id="gradientPrimary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.8}/>
                  </linearGradient>
                  <linearGradient id="gradientWarning" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FBBF24" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.8}/>
                  </linearGradient>
                  <linearGradient id="gradientAccent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A78BFA" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                  </linearGradient>
                  <linearGradient id="gradientSuccess" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34D399" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <Pie 
                  data={stageDistribution} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={70} 
                  outerRadius={110} 
                  paddingAngle={3} 
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1000}
                  animationEasing="ease-out"
                >
                  {stageDistribution.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.gradient}
                      stroke="hsl(var(--background))"
                      strokeWidth={2}
                      style={{
                        filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '2px solid hsl(var(--border))',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    fontWeight: 600
                  }}
                  formatter={(value: number) => [`${value} leads`, '']}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                  wrapperStyle={{
                    paddingTop: '20px',
                    fontSize: '14px',
                    fontWeight: 500
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue by Stage */}
        <Card className="shadow-elegant border-border/50 hover-lift">
          <CardHeader>
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-success" />
              {t('dashboard.revenueByStage')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={revenueByStage} layout="vertical" margin={{ left: 10, right: 30 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#A78BFA" stopOpacity={1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--border))" 
                  strokeOpacity={0.3}
                  horizontal={true}
                  vertical={false}
                />
                <XAxis 
                  type="number" 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 500 }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <YAxis 
                  dataKey="stage" 
                  type="category" 
                  width={110} 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--foreground))', fontSize: 13, fontWeight: 600 }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '2px solid hsl(var(--border))',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    fontWeight: 600
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                  cursor={{ fill: 'hsl(var(--accent))', opacity: 0.1 }}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="url(#barGradient)" 
                  radius={[0, 12, 12, 0]}
                  animationBegin={200}
                  animationDuration={1000}
                  animationEasing="ease-out"
                  style={{
                    filter: 'drop-shadow(0px 2px 6px rgba(124, 58, 237, 0.3))',
                    cursor: 'pointer'
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel & Saved by City */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <Card className="shadow-elegant border-border/50 hover-lift">
          <CardHeader>
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              {t('dashboard.conversionFunnel')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {funnelData.map((item, index) => {
                const percentage = (item.value / Math.max(...funnelData.map(d => d.value)) * 100);
                const colors = [
                  { bg: 'from-primary to-primary-glow', text: 'text-primary', shadow: 'shadow-[0_0_20px_rgba(124,58,237,0.3)]' },
                  { bg: 'from-warning to-amber-400', text: 'text-warning', shadow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]' },
                  { bg: 'from-accent to-purple-400', text: 'text-accent', shadow: 'shadow-[0_0_20px_rgba(139,92,246,0.3)]' },
                  { bg: 'from-success to-emerald-400', text: 'text-success', shadow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]' }
                ];
                return (
                  <div key={index} className="space-y-3 group">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-foreground text-base">{item.stage}</span>
                      <span className={`text-base font-bold px-3 py-1 rounded-full bg-gradient-to-r ${colors[index].bg} text-white ${colors[index].shadow}`}>
                        {item.value}
                      </span>
                    </div>
                    <div className="relative w-full bg-muted rounded-full h-4 overflow-hidden shadow-inner">
                      <div 
                        className={`bg-gradient-to-r ${colors[index].bg} h-4 rounded-full transition-all duration-1000 ease-out ${colors[index].shadow} group-hover:scale-x-105 origin-left`}
                        style={{
                          width: `${percentage}%`,
                          animationDelay: `${index * 150}ms`
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                    </div>
                    <div className="flex justify-end">
                      <span className="text-xs text-muted-foreground font-medium">{percentage.toFixed(0)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Saved Leads by City */}
        <Card className="shadow-elegant border-border/50">
          <CardHeader>
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <MapPin className="h-5 w-5 text-accent-foreground" />
              {t('dashboard.savedByCity')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cityData.map((item, index) => <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors">
                  <span className="font-medium text-foreground">{item.city}</span>
                  <span className="text-sm font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">{item.count}</span>
                </div>)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Next Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="shadow-elegant border-border/50">
          <CardHeader>
            <CardTitle className="font-display text-xl">{t('dashboard.recentActivity')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="flex items-start gap-4 pb-4 border-b border-border last:border-0">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">Search performed in Dubai, UAE</p>
                    <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                  </div>
                </div>)}
            </div>
          </CardContent>
        </Card>

        {/* Next Actions */}
        <Card className="shadow-elegant border-border/50">
          <CardHeader>
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              {t('dashboard.nextActions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {nextActions.map(action => <div key={action.id} className="flex items-start gap-3 p-4 rounded-xl bg-accent/30 hover:bg-accent/50 transition-all duration-200 group cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{action.task}</p>
                    <p className="text-xs text-muted-foreground mt-1">Due in {action.dueDate}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium flex-shrink-0 ${action.priority === 'high' ? 'bg-danger/10 text-danger' : action.priority === 'medium' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}>
                    {action.priority}
                  </span>
                </div>)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
}