import { useState } from 'react';
import { 
  Sparkles, 
  FolderOpen, 
  BarChart3, 
  User, 
  Search, 
  Settings, 
  Activity, 
  Code, 
  Menu, 
  X,
  Sliders,
  Play
} from 'lucide-react';

type Tab = 'dashboard' | 'admin' | 'analytics';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Simple connection state mock (will connect to FastAPI later)
  const isBackendConnected = true;

  const tabs = [
    { id: 'dashboard' as Tab, label: 'Recommendations', icon: Sparkles, desc: 'View customized matches' },
    { id: 'admin' as Tab, label: 'Admin Panel', icon: FolderOpen, desc: 'Manage products & datasets' },
    { id: 'analytics' as Tab, label: 'Analytics', icon: BarChart3, desc: 'View statistics & patterns' },
  ];

  return (
    <div className="min-h-screen bg-brand-darkBg text-slate-100 flex flex-col md:flex-row overflow-x-hidden">
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between px-6 py-4 bg-brand-darkSurface border-b border-brand-darkBorder z-20">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-lg text-white">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            RecEngine
          </span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-brand-darkSurface border-r border-brand-darkBorder z-30 transform 
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:relative md:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col justify-between
      `}>
        <div>
          {/* Logo Section */}
          <div className="hidden md:flex items-center gap-3 px-6 py-6 border-b border-brand-darkBorder">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-lg text-white">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent leading-none">
                RecEngine
              </h1>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">AI Recommendation</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-8 px-4 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-left
                    ${isActive 
                      ? 'bg-gradient-to-r from-indigo-600/20 to-violet-600/20 border border-indigo-500/30 text-white' 
                      : 'border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'}
                  `}
                >
                  <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <div>
                    <div className="font-medium text-sm">{tab.label}</div>
                    <div className="text-[10px] text-slate-500 font-light mt-0.5 leading-none">{tab.desc}</div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-brand-darkBorder">
          <div className="flex items-center gap-3 p-3 bg-brand-darkBg/60 border border-brand-darkBorder/40 rounded-xl">
            <div className="relative">
              <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
                <User className="w-5 h-5 text-indigo-400" />
              </div>
              <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-brand-darkSurface ${isBackendConnected ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            </div>
            <div>
              <div className="font-semibold text-xs text-slate-200">Developer Demo</div>
              <div className="text-[10px] text-slate-500 flex items-center gap-1 font-light mt-0.5">
                <Activity className="w-3 h-3 text-emerald-500" /> API Connected
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="hidden md:flex items-center justify-between px-8 py-5 border-b border-brand-darkBorder bg-brand-darkSurface/30 backdrop-blur-md">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4.5 h-4.5" />
            <input 
              type="text" 
              placeholder="Search products, recommendations..." 
              className="w-full bg-brand-darkBg/80 border border-brand-darkBorder focus:border-indigo-500/80 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none transition-colors"
              disabled
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-brand-darkBorder rounded-lg text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>FastAPI Port: 8000</span>
            </div>
            <button className="p-2 bg-slate-900 hover:bg-slate-800 border border-brand-darkBorder rounded-lg text-slate-400 hover:text-slate-200 transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Tab View Wrapper */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto space-y-8">
          
          {/* Dashboard/Recommendations Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">Recommendations Feed</h2>
                  <p className="text-slate-400 text-sm mt-1">Algorithmic similarity matches based on your configured interest profile.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all hover:-translate-y-0.5">
                  <Play className="w-4 h-4 fill-white" /> Compute Recommendations
                </button>
              </div>

              {/* Preference Setter Mock Card */}
              <div className="glass-panel rounded-2xl p-6">
                <div className="flex items-center gap-2 border-b border-brand-darkBorder pb-4 mb-4">
                  <Sliders className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-semibold text-sm text-slate-200">Interactive Interest Weights (Theory Demonstration)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {['Category Preference', 'Tag Overlap', 'Product Rating'].map((label, idx) => (
                    <div key={label} className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400 font-medium">{label} Weight</span>
                        <span className="text-indigo-400 font-semibold">{idx === 0 ? '50%' : idx === 1 ? '30%' : '20%'}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-900 border border-brand-darkBorder rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: idx === 0 ? '50%' : idx === 1 ? '30%' : '20%' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendation Cards Placeholder Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel glow-card rounded-2xl p-6 flex flex-col justify-between h-48 border border-brand-darkBorder transition-all duration-300">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="px-2.5 py-1 bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 text-xs font-semibold rounded-lg">SaaS Platform</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 text-xs font-medium">Match Confidence:</span>
                        <span className="text-indigo-400 text-sm font-bold">92.4%</span>
                      </div>
                    </div>
                    <h4 className="text-lg font-bold text-white mt-4">AutomateFlow CRM</h4>
                    <p className="text-slate-400 text-xs mt-1.5 line-clamp-2">A cloud-based CRM with dynamic visual mapping tools and automated pipeline integrations.</p>
                  </div>
                  <div className="border-t border-brand-darkBorder/40 pt-3 flex items-center justify-between text-[11px] text-slate-500">
                    <div>Tags: <span className="text-slate-300">crm, automation, cloud</span></div>
                    <div className="text-indigo-400 font-medium">Why? Match score based on Category similarity</div>
                  </div>
                </div>

                <div className="glass-panel glow-card rounded-2xl p-6 flex flex-col justify-between h-48 border border-brand-darkBorder transition-all duration-300">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="px-2.5 py-1 bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 text-xs font-semibold rounded-lg">DevOps</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 text-xs font-medium">Match Confidence:</span>
                        <span className="text-indigo-400 text-sm font-bold">85.1%</span>
                      </div>
                    </div>
                    <h4 className="text-lg font-bold text-white mt-4">LogShield Guardian</h4>
                    <p className="text-slate-400 text-xs mt-1.5 line-clamp-2">Real-time application log ingestion and anomaly warning dashboard powered by rules matching.</p>
                  </div>
                  <div className="border-t border-brand-darkBorder/40 pt-3 flex items-center justify-between text-[11px] text-slate-500">
                    <div>Tags: <span className="text-slate-300">logging, monitoring, devops</span></div>
                    <div className="text-indigo-400 font-medium">Why? Overlapping tag: monitoring</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Admin Tab */}
          {activeTab === 'admin' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Admin Management</h2>
                <p className="text-slate-400 text-sm mt-1">Configure products, categories, tags, and import datasets in JSON format.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-panel rounded-2xl p-6 space-y-4">
                  <h3 className="text-md font-bold text-white">Dataset Action Center</h3>
                  <p className="text-slate-400 text-xs">Import a custom seed catalog, or export products configuration into a standard JSON file.</p>
                  <div className="flex gap-4 pt-2">
                    <button className="flex-1 py-2.5 bg-slate-900 border border-brand-darkBorder hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition-colors" disabled>
                      Import JSON Dataset
                    </button>
                    <button className="flex-1 py-2.5 bg-slate-900 border border-brand-darkBorder hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition-colors" disabled>
                      Export Dataset
                    </button>
                  </div>
                </div>

                <div className="glass-panel rounded-2xl p-6 space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-md font-bold text-white">Product Catalog Inventory</h3>
                    <p className="text-slate-400 text-xs mt-1">Active items currently loaded in standard SQLite storage engine.</p>
                  </div>
                  <div className="flex justify-between items-center text-xs mt-4">
                    <span className="text-slate-400">Total Items Cataloged:</span>
                    <span className="px-2.5 py-1 bg-indigo-500/15 text-indigo-400 rounded-lg font-bold">12 Products</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">System Analytics</h2>
                <p className="text-slate-400 text-sm mt-1">Metrics tracking similarity distribution and user category preferences.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: 'Total Recommendations', value: '184', desc: 'Queries evaluated' },
                  { title: 'Most Popular Category', value: 'SaaS', desc: 'Highly rated interest' },
                  { title: 'Avg. Similarity Score', value: '78.2%', desc: 'Product matching mean' }
                ].map((stat) => (
                  <div key={stat.title} className="glass-panel rounded-2xl p-6 border border-brand-darkBorder">
                    <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">{stat.title}</span>
                    <div className="text-3xl font-extrabold text-white mt-2 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">{stat.value}</div>
                    <div className="text-slate-400 text-[11px] font-light mt-1.5">{stat.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="border-t border-brand-darkBorder bg-brand-darkSurface/10 py-5 text-center text-xs text-slate-500">
          <div className="flex justify-center items-center gap-1.5">
            <span>AI Recommendation Logic System</span>
            <span className="text-slate-700">•</span>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-indigo-400 transition-colors">
              <Code className="w-3.5 h-3.5" /> Source
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
