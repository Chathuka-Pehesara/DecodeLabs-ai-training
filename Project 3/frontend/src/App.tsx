import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  FolderOpen, 
  BarChart3, 
  User, 
  Search, 
  Activity, 
  Code, 
  Menu, 
  X,
  Play,
  Trash2,
  Edit2,
  Download,
  Upload,
  RefreshCw,
  Info
} from 'lucide-react';
import { api } from './services/api';
import type { Product, Recommendation, Analytics } from './services/api';

type Tab = 'dashboard' | 'admin' | 'analytics';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  const tabs = [
    { id: 'dashboard' as Tab, label: 'Recommendations', icon: Sparkles, desc: 'View customized matches' },
    { id: 'admin' as Tab, label: 'Admin Panel', icon: FolderOpen, desc: 'Manage products & datasets' },
    { id: 'analytics' as Tab, label: 'Analytics', icon: BarChart3, desc: 'View statistics & patterns' },
  ];

  // ----------------------------------------------------
  // RECOMMENDATIONS / INTERESTS STATES
  // ----------------------------------------------------
  const [interests, setInterests] = useState<Record<string, number>>({
    SaaS: 5,
    DevOps: 3,
    Security: 2,
    Marketing: 0,
    Finance: 0
  });
  const [selectedTags, setSelectedTags] = useState<string[]>(['automation', 'cloud']);
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [limit, setLimit] = useState(5);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [recError, setRecError] = useState<string | null>(null);

  // Algorithm weight states (sum to 100% or get scaled in backend)
  const [wCategory, setWCategory] = useState(50);
  const [wTags, setWTags] = useState(30);
  const [wRating, setWRating] = useState(20);

  // ----------------------------------------------------
  // CATALOG SEARCH STATES
  // ----------------------------------------------------
  const [catalogSearch, setCatalogSearch] = useState('');

  // ----------------------------------------------------
  // ADMIN STATES
  // ----------------------------------------------------
  const [adminProducts, setAdminProducts] = useState<Product[]>([]);
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Admin form state
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('SaaS');
  const [formTags, setFormTags] = useState('');
  const [formRating, setFormRating] = useState(4.0);

  // ----------------------------------------------------
  // ANALYTICS STATES
  // ----------------------------------------------------
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Static list of categories and tags for settings
  const categoriesList = ['SaaS', 'DevOps', 'Security', 'Marketing', 'Finance'];
  const availableTags = [
    'automation', 'analytics', 'cloud', 'reporting', 'logging', 
    'monitoring', 'devops', 'security', 'database', 'encryption', 
    'seo', 'accounting', 'invoicing', 'collaboration', 'productivity', 
    'testing', 'auth', 'email', 'api', 'billing'
  ];

  // ----------------------------------------------------
  // CONNECTIONS & INITIALIZATION
  // ----------------------------------------------------
  useEffect(() => {
    checkConnection();
    // Default fetch
    fetchRecs();
  }, []);

  useEffect(() => {
    if (activeTab === 'admin') {
      fetchAdminProducts();
    } else if (activeTab === 'analytics') {
      fetchAnalyticsData();
    }
  }, [activeTab, catalogSearch]);

  const checkConnection = async () => {
    try {
      await api.getProducts();
      setIsBackendConnected(true);
    } catch (e) {
      setIsBackendConnected(false);
    }
  };

  const handleWeightChange = (type: 'category' | 'tags' | 'rating', value: number) => {
    if (type === 'category') {
      setWCategory(value);
      // Readjust weights to sum to 100
      const remaining = 100 - value;
      const sum = wTags + wRating;
      if (sum > 0) {
        setWTags(Math.round((wTags / sum) * remaining));
        setWRating(Math.round((wRating / sum) * remaining));
      } else {
        setWTags(Math.round(remaining / 2));
        setWRating(Math.round(remaining / 2));
      }
    } else if (type === 'tags') {
      setWTags(value);
      const remaining = 100 - value;
      const sum = wCategory + wRating;
      if (sum > 0) {
        setWCategory(Math.round((wCategory / sum) * remaining));
        setWRating(Math.round((wRating / sum) * remaining));
      } else {
        setWCategory(Math.round(remaining / 2));
        setWRating(Math.round(remaining / 2));
      }
    } else {
      setWRating(value);
      const remaining = 100 - value;
      const sum = wCategory + wTags;
      if (sum > 0) {
        setWCategory(Math.round((wCategory / sum) * remaining));
        setWTags(Math.round((wTags / sum) * remaining));
      } else {
        setWCategory(Math.round(remaining / 2));
        setWTags(Math.round(remaining / 2));
      }
    }
  };

  // ----------------------------------------------------
  // API SERVICE CALLS
  // ----------------------------------------------------

  const fetchRecs = async () => {
    setIsLoadingRecs(true);
    setRecError(null);
    
    // Scale interests to only non-zero values
    const activeInterests: Record<string, number> = {};
    Object.entries(interests).forEach(([cat, val]) => {
      if (val > 0) {
        activeInterests[cat] = val;
      }
    });

    try {
      const results = await api.getRecommendations({
        interests: activeInterests,
        tags: selectedTags,
        limit,
        weight_category: wCategory / 100,
        weight_tags: wTags / 100,
        weight_rating: wRating / 100
      });
      setRecs(results);
    } catch (err: any) {
      setRecError(err.message || 'Failed to calculate recommendations.');
    } finally {
      setIsLoadingRecs(false);
    }
  };


  const fetchAdminProducts = async () => {
    setIsAdminLoading(true);
    setAdminError(null);
    try {
      const res = await api.getProducts();
      setAdminProducts(res);
    } catch (err: any) {
      setAdminError(err.message || 'Failed to fetch catalog.');
    } finally {
      setIsAdminLoading(false);
    }
  };

  const fetchAnalyticsData = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await api.getAnalytics();
      setAnalytics(res);
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // ----------------------------------------------------
  // ADMIN HANDLERS
  // ----------------------------------------------------

  const handleCreateOrUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formId || !formName || !formDescription) {
      alert('Please fill out ID, Name, and Description.');
      return;
    }

    // Split tags string into list
    const parsedTags = formTags
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    const payload: Product = {
      id: formId,
      name: formName,
      description: formDescription,
      category: formCategory,
      tags: parsedTags,
      rating: formRating
    };

    setIsAdminLoading(true);
    setAdminError(null);

    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
      } else {
        await api.createProduct(payload);
      }
      // Reset form
      clearAdminForm();
      fetchAdminProducts();
    } catch (err: any) {
      setAdminError(err.message || 'Operation failed.');
    } finally {
      setIsAdminLoading(false);
    }
  };

  const handleEditClick = (prod: Product) => {
    setEditingProduct(prod);
    setFormId(prod.id);
    setFormName(prod.name);
    setFormDescription(prod.description);
    setFormCategory(prod.category);
    setFormTags(prod.tags.join(', '));
    setFormRating(prod.rating);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    setIsAdminLoading(true);
    try {
      await api.deleteProduct(id);
      fetchAdminProducts();
    } catch (err: any) {
      setAdminError(err.message || 'Failed to delete product.');
    } finally {
      setIsAdminLoading(false);
    }
  };

  const clearAdminForm = () => {
    setEditingProduct(null);
    setFormId('');
    setFormName('');
    setFormDescription('');
    setFormCategory('SaaS');
    setFormTags('');
    setFormRating(4.0);
  };

  const handleImportSeed = async () => {
    if (!confirm('This will delete all current products and reload the initial products.json dataset. Proceed?')) return;
    setIsAdminLoading(true);
    try {
      // Fetch products.json from our static file system via frontend assets or api endpoint
      // We call the api.exportCatalog or fetch products from database. But let's trigger import by reading catalog data.
      // We can just trigger the seeder logic in SQLite or import the 12 items.
      const seedResponse = await fetch('http://127.0.0.1:8000/api/admin/export');
      const seedData = await seedResponse.json();
      await api.importCatalog(seedData);
      fetchAdminProducts();
    } catch (err: any) {
      setAdminError(err.message || 'Import failed.');
    } finally {
      setIsAdminLoading(false);
    }
  };

  const handleExportCatalog = async () => {
    try {
      const data = await api.exportCatalog();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'products_export.json';
      link.click();
    } catch (err: any) {
      alert('Export failed: ' + err.message);
    }
  };

  const toggleTagSelection = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

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
                <Activity className={`w-3 h-3 ${isBackendConnected ? 'text-emerald-500' : 'text-rose-500 animate-pulse'}`} /> 
                {isBackendConnected ? 'API Connected' : 'API Offline'}
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
              placeholder="Query SQLite product catalog..." 
              value={catalogSearch}
              onChange={(e) => {
                setCatalogSearch(e.target.value);
              }}
              className="w-full bg-brand-darkBg/80 border border-brand-darkBorder focus:border-indigo-500/80 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none transition-colors"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-brand-darkBorder rounded-lg text-xs text-slate-400">
              <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              <span>FastAPI Port: 8000</span>
            </div>
            <button 
              onClick={checkConnection}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-brand-darkBorder rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Tab View Wrapper */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto space-y-8">
          
          {/* Dashboard/Recommendations Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">Recommendations Feed</h2>
                  <p className="text-slate-400 text-sm mt-1">Configure your interest parameters and run dynamic mathematical evaluations.</p>
                </div>
                <button 
                  onClick={fetchRecs}
                  disabled={isLoadingRecs || !isBackendConnected}
                  className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
                >
                  <Play className="w-4 h-4 fill-white" /> 
                  {isLoadingRecs ? 'Running Math Algorithms...' : 'Compute Recommendations'}
                </button>
              </div>

              {/* Grid: Preferences Side Panel & Recommendations Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Side: Interest Configs Panel */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Category preferences */}
                  <div className="glass-panel rounded-2xl p-6 space-y-5">
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-b border-brand-darkBorder/40 pb-2">Category Ratings</h3>
                    <div className="space-y-4">
                      {categoriesList.map((cat) => (
                        <div key={cat} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400 font-medium">{cat}</span>
                            <span className="text-indigo-400 font-semibold">{interests[cat] || 0} / 5</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="5" 
                            value={interests[cat] || 0}
                            onChange={(e) => setInterests({ ...interests, [cat]: parseInt(e.target.value) })}
                            className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tag Preferences */}
                  <div className="glass-panel rounded-2xl p-6 space-y-4">
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-b border-brand-darkBorder/40 pb-2">Interest Keywords</h3>
                    <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto pr-1">
                      {availableTags.map((tag) => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            onClick={() => toggleTagSelection(tag)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                              isSelected 
                                ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' 
                                : 'bg-brand-darkBg/60 border-brand-darkBorder text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            #{tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Algorithm weights overrides */}
                  <div className="glass-panel rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-brand-darkBorder/40 pb-2">
                      <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Engine Weights</h3>
                      <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 font-semibold">Total: 100%</span>
                    </div>
                    <div className="space-y-4 pt-1">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Category (Cosine)</span>
                          <span className="text-indigo-400 font-semibold">{wCategory}%</span>
                        </div>
                        <input 
                          type="range" min="0" max="100" value={wCategory}
                          onChange={(e) => handleWeightChange('category', parseInt(e.target.value))}
                          className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Tags (Jaccard)</span>
                          <span className="text-indigo-400 font-semibold">{wTags}%</span>
                        </div>
                        <input 
                          type="range" min="0" max="100" value={wTags}
                          onChange={(e) => handleWeightChange('tags', parseInt(e.target.value))}
                          className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">General Quality</span>
                          <span className="text-indigo-400 font-semibold">{wRating}%</span>
                        </div>
                        <input 
                          type="range" min="0" max="100" value={wRating}
                          onChange={(e) => handleWeightChange('rating', parseInt(e.target.value))}
                          className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Limit selection */}
                  <div className="glass-panel rounded-2xl p-4 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Top N Recommendations</span>
                    <select 
                      value={limit}
                      onChange={(e) => setLimit(parseInt(e.target.value))}
                      className="bg-brand-darkBg border border-brand-darkBorder rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      {[3, 5, 8, 10].map(n => (
                        <option key={n} value={n}>Top {n}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Right Side: Recommendations List Feed */}
                <div className="lg:col-span-2 space-y-6">
                  {recError && (
                    <div className="bg-rose-500/10 border border-rose-500/25 p-4 rounded-xl text-rose-400 text-xs flex gap-2">
                      <Info className="w-5 h-5 flex-shrink-0" />
                      <span>{recError}</span>
                    </div>
                  )}

                  {isLoadingRecs ? (
                    <div className="flex flex-col items-center justify-center py-28 space-y-4">
                      <div className="w-10 h-10 border-4 border-indigo-500/35 border-t-indigo-500 rounded-full animate-spin"></div>
                      <p className="text-slate-400 text-xs font-medium uppercase tracking-wider animate-pulse">Running calculations...</p>
                    </div>
                  ) : recs.length === 0 ? (
                    <div className="glass-panel rounded-2xl p-10 text-center space-y-3">
                      <div className="w-12 h-12 bg-slate-800 border border-brand-darkBorder rounded-xl flex items-center justify-center mx-auto text-slate-400">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-semibold text-slate-200">No Recommendations Loaded</h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">Set up your category/tag interests and click the button above to calculate similarity scores from SQLite data.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recs.map((rec, index) => (
                        <div 
                          key={rec.product.id}
                          className="glass-panel glow-card rounded-2xl p-6 border border-brand-darkBorder flex flex-col justify-between min-h-[170px] transition-all duration-300"
                        >
                          <div>
                            <div className="flex justify-between items-start">
                              <div className="flex gap-2">
                                <span className="px-2 py-0.5 bg-slate-900 border border-brand-darkBorder rounded text-[10px] text-slate-400 font-bold uppercase tracking-wider">#{index + 1}</span>
                                <span className="px-2.5 py-0.5 bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 text-xs font-semibold rounded-lg">{rec.product.category}</span>
                              </div>
                              <div className="flex items-center gap-1.5 bg-slate-900 border border-indigo-500/20 px-2.5 py-1 rounded-xl">
                                <span className="text-slate-500 text-[10px] font-semibold">Match Score:</span>
                                <span className="text-indigo-400 text-sm font-bold">{rec.confidence_score}%</span>
                              </div>
                            </div>
                            <h4 className="text-lg font-bold text-white mt-4">{rec.product.name}</h4>
                            <p className="text-slate-400 text-xs mt-1.5 line-clamp-3">{rec.product.description}</p>
                          </div>
                          
                          <div className="border-t border-brand-darkBorder/40 pt-4 mt-4 space-y-2 text-[11px]">
                            <div className="flex justify-between flex-wrap gap-2">
                              <div className="text-slate-500">Tags: <span className="text-slate-300">{rec.product.tags.join(', ')}</span></div>
                              <div className="text-slate-500 flex gap-3">
                                <span>Cosine: <span className="text-indigo-400">{rec.cosine_score}</span></span>
                                <span>Jaccard: <span className="text-indigo-400">{rec.jaccard_score}</span></span>
                                <span>Rating: <span className="text-indigo-400">{rec.rating_score}</span></span>
                              </div>
                            </div>
                            <div className="bg-brand-darkBg/50 p-2.5 rounded-lg border border-brand-darkBorder/30 text-indigo-300/90 font-medium">
                              {rec.explanation}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* Admin Tab */}
          {activeTab === 'admin' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Admin Management</h2>
                <p className="text-slate-400 text-sm mt-1">Direct SQLite write actions, seeder resets, and dataset imports/exports.</p>
              </div>

              {adminError && (
                <div className="bg-rose-500/10 border border-rose-500/25 p-4 rounded-xl text-rose-400 text-xs">
                  {adminError}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Form Column */}
                <div className="lg:col-span-1 glass-panel rounded-2xl p-6 self-start space-y-6">
                  <div className="flex justify-between items-center border-b border-brand-darkBorder/40 pb-2">
                    <h3 className="font-bold text-sm text-slate-200">
                      {editingProduct ? 'Edit Catalog Product' : 'Add New Product'}
                    </h3>
                    {editingProduct && (
                      <button 
                        onClick={clearAdminForm}
                        className="text-xs text-indigo-400 hover:text-indigo-300"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleCreateOrUpdateProduct} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-medium">Product ID</label>
                      <input 
                        type="text" 
                        placeholder="e.g. prod_13"
                        value={formId}
                        onChange={(e) => setFormId(e.target.value)}
                        disabled={!!editingProduct}
                        className="w-full bg-brand-darkBg border border-brand-darkBorder focus:border-indigo-500 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-0 disabled:opacity-50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-medium">Product Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. DataSync Scheduler"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full bg-brand-darkBg border border-brand-darkBorder focus:border-indigo-500 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-0"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-medium">Description</label>
                      <textarea 
                        placeholder="Detailed explanation of software capabilities..."
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        rows={3}
                        className="w-full bg-brand-darkBg border border-brand-darkBorder focus:border-indigo-500 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-0"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-medium">Category</label>
                      <select 
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full bg-brand-darkBg border border-brand-darkBorder focus:border-indigo-500 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
                      >
                        {categoriesList.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-medium">Tags (comma-separated)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. database, cloud, automation"
                        value={formTags}
                        onChange={(e) => setFormTags(e.target.value)}
                        className="w-full bg-brand-darkBg border border-brand-darkBorder focus:border-indigo-500 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-0"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-medium">Average Rating ({formRating})</label>
                      <input 
                        type="range" min="1.0" max="5.0" step="0.1" value={formRating}
                        onChange={(e) => setFormRating(parseFloat(e.target.value))}
                        className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={isAdminLoading}
                      className="w-full py-2.5 mt-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white rounded-xl text-xs font-semibold shadow transition-all duration-200"
                    >
                      {editingProduct ? 'Save Product Details' : 'Create Product Entry'}
                    </button>
                  </form>
                </div>

                {/* Table Column */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Database Seed Centers */}
                  <div className="glass-panel rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-white border-b border-brand-darkBorder/40 pb-2 mb-4">Dataset Import/Export Utilities</h3>
                    <div className="flex gap-4 flex-wrap">
                      <button 
                        onClick={handleImportSeed}
                        disabled={isAdminLoading}
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-brand-darkBorder hover:border-slate-700 text-xs font-semibold rounded-xl text-slate-300 hover:text-white transition-all"
                      >
                        <Upload className="w-4 h-4 text-indigo-400" /> Reset to Seeder JSON
                      </button>
                      <button 
                        onClick={handleExportCatalog}
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-brand-darkBorder hover:border-slate-700 text-xs font-semibold rounded-xl text-slate-300 hover:text-white transition-all"
                      >
                        <Download className="w-4 h-4 text-emerald-400" /> Export Database to JSON
                      </button>
                    </div>
                  </div>

                  {/* Catalog Inventory Table */}
                  <div className="glass-panel rounded-2xl overflow-hidden">
                    <div className="p-5 border-b border-brand-darkBorder/40">
                      <h3 className="text-sm font-bold text-white">Active Product Catalog ({adminProducts.length} items)</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-900/50 border-b border-brand-darkBorder text-slate-400 uppercase tracking-wider font-semibold">
                            <th className="p-4">ID</th>
                            <th className="p-4">Name</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Rating</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-darkBorder/40">
                          {isAdminLoading && adminProducts.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="p-8 text-center text-slate-500">Querying database inventory...</td>
                            </tr>
                          ) : adminProducts.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="p-8 text-center text-slate-500">SQLite product catalog is empty.</td>
                            </tr>
                          ) : (
                            adminProducts.map((prod) => (
                              <tr key={prod.id} className="hover:bg-slate-800/20 transition-colors">
                                <td className="p-4 font-mono text-slate-400">{prod.id}</td>
                                <td className="p-4 font-medium text-white">{prod.name}</td>
                                <td className="p-4">
                                  <span className="px-2 py-0.5 bg-slate-900 border border-brand-darkBorder rounded text-[10px] text-slate-300">{prod.category}</span>
                                </td>
                                <td className="p-4 font-semibold text-amber-400">{prod.rating} ★</td>
                                <td className="p-4 text-right flex justify-end gap-2">
                                  <button 
                                    onClick={() => handleEditClick(prod)}
                                    className="p-2 bg-slate-900 border border-brand-darkBorder rounded-lg text-slate-400 hover:text-indigo-400 hover:border-indigo-500/30 transition-all"
                                    title="Edit product"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteProduct(prod.id)}
                                    className="p-2 bg-slate-900 border border-brand-darkBorder rounded-lg text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-all"
                                    title="Delete product"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Analytics Tab (Integration Placeholder) */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">System Analytics</h2>
                <p className="text-slate-400 text-sm mt-1">Analytical statistics compiled from SQLite recommendation execution logs.</p>
              </div>

              {analyticsLoading ? (
                <div className="text-center py-20 text-slate-400">Loading metrics database logs...</div>
              ) : !analytics ? (
                <div className="text-center py-20 text-slate-400">No analytics data recorded. Run recommendations to write database events.</div>
              ) : (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-panel rounded-2xl p-6 border border-brand-darkBorder">
                      <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Total Queries Evaluated</span>
                      <div className="text-3xl font-extrabold text-white mt-2 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">{analytics.total_recommendations}</div>
                      <div className="text-slate-400 text-[11px] font-light mt-1.5">Recommendations calculated</div>
                    </div>
                    <div className="glass-panel rounded-2xl p-6 border border-brand-darkBorder">
                      <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Active Inventory Size</span>
                      <div className="text-3xl font-extrabold text-white mt-2 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">{analytics.total_products} Products</div>
                      <div className="text-slate-400 text-[11px] font-light mt-1.5">SQLite catalog entries</div>
                    </div>
                    <div className="glass-panel rounded-2xl p-6 border border-brand-darkBorder">
                      <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Avg. Match Confidence</span>
                      <div className="text-3xl font-extrabold text-white mt-2 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">{analytics.avg_confidence}%</div>
                      <div className="text-slate-400 text-[11px] font-light mt-1.5">Mean matching coefficient</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Category Popularity Card */}
                    <div className="glass-panel rounded-2xl p-6 space-y-4">
                      <h3 className="text-md font-bold text-white">Popularity of Queried Domains</h3>
                      <div className="space-y-3">
                        {Object.entries(analytics.popular_categories).length === 0 ? (
                          <div className="text-xs text-slate-500 py-4">No categories queried yet.</div>
                        ) : (
                          Object.entries(analytics.popular_categories).map(([cat, count]) => {
                            const maxVal = Math.max(...Object.values(analytics.popular_categories));
                            const percentage = maxVal > 0 ? (count / maxVal) * 100 : 0;
                            return (
                              <div key={cat} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="text-slate-300 font-medium">{cat}</span>
                                  <span className="text-indigo-400 font-semibold">{count} queries</span>
                                </div>
                                <div className="w-full h-2 bg-slate-900 border border-brand-darkBorder rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 animate-pulse" style={{ width: `${percentage}%` }}></div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                    {/* Similarity Score Distribution Card */}
                    <div className="glass-panel rounded-2xl p-6 space-y-6 flex flex-col justify-between">
                      <div>
                        <h3 className="text-md font-bold text-white">Confidence Score Distribution</h3>
                        <p className="text-slate-500 text-xs mt-1">Frequencies of top matches sorted by score ranges.</p>
                      </div>
                      
                      <div className="h-44 flex items-end justify-around gap-4 pt-4 border-b border-brand-darkBorder/40">
                        {(() => {
                          const dist = analytics.similarity_distribution || { '90s': 0, '80s': 0, '70s': 0, 'below_70': 0 };
                          const values = Object.values(dist);
                          const maxVal = Math.max(...values, 1);
                          
                          const ranges = [
                            { key: '90s', label: '90-100%' },
                            { key: '80s', label: '80-89%' },
                            { key: '70s', label: '70-79%' },
                            { key: 'below_70', label: '< 70%' }
                          ];
                          
                          return ranges.map(({ key, label }) => {
                            const count = dist[key] || 0;
                            const barHeight = (count / maxVal) * 100;
                            
                            return (
                              <div key={key} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                                <div className="text-[10px] text-indigo-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  {count} queries
                                </div>
                                <div className="w-full bg-slate-900/50 border border-brand-darkBorder/30 rounded-t-lg overflow-hidden flex items-end h-28 relative">
                                  <div 
                                    className="w-full bg-gradient-to-t from-indigo-600/40 to-indigo-500 border-t border-indigo-400/30 group-hover:brightness-110 transition-all duration-300 rounded-t-md"
                                    style={{ height: `${Math.max(barHeight, 4)}%` }}
                                  ></div>
                                </div>
                                <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">{label}</span>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
