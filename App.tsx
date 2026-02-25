import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, Map as MapIcon, BarChart3, Settings, 
  Search, Bell, Menu, Cpu, FileText, ChevronRight, X
} from 'lucide-react';
import CrimeMap from './components/Map/CrimeMap';
import StatsCard from './components/Dashboard/StatsCard';
import { DistrictRiskChart, CrimeTypeDistribution } from './components/Dashboard/Charts';
import Assistant from './components/Chat/Assistant';
import { MAP_DATASET_CRIMES, MAP_DATASET_LABELS, MAP_DATASET_REGION_TOTALS, MapDatasetKey, calculateRegionStatsFromTotals } from './services/mockData';
import { generateCrimeAnalysis } from './services/geminiService';
import { CrimeType, Language } from './types';
import { TRANSLATIONS } from './services/translations';

type CrimeFilterKey =
  | 'drugs'
  | 'extremism'
  | 'human_trafficking'
  | 'bribery'
  | 'extortion'
  | 'fraud'
  | 'theft'
  | 'intentional_homicide'
  | 'rape'
  | 'robbery'
  | 'looting'
  | 'hooliganism';

const DATASET_FILTER_KEYS: Record<MapDatasetKey, CrimeFilterKey[]> = {
  aniqlanadigan: ['drugs', 'extremism', 'human_trafficking', 'bribery'],
  kiber: ['extortion', 'fraud', 'theft'],
  oldini_olish: ['intentional_homicide', 'rape', 'robbery', 'looting', 'fraud', 'theft', 'hooliganism'],
};

const FILTER_LABELS: Record<Language, Record<CrimeFilterKey, string>> = {
  uz: {
    drugs: 'Giyohvandlik',
    extremism: 'Ekstremizm',
    human_trafficking: 'Odam savdosi',
    bribery: "Poraxo'rlik",
    extortion: 'Tovlamachilik',
    fraud: 'Firibgarlik',
    theft: "O'g'rilik",
    intentional_homicide: "Qasddan odam o'ldirish",
    rape: 'Nomusga tegish',
    robbery: 'Bosqinchilik',
    looting: 'Talonchilik',
    hooliganism: 'Bezorilik',
  },
  en: {
    drugs: 'Narcotics',
    extremism: 'Extremism',
    human_trafficking: 'Human trafficking',
    bribery: 'Bribery',
    extortion: 'Extortion',
    fraud: 'Fraud',
    theft: 'Theft',
    intentional_homicide: 'Intentional homicide',
    rape: 'Sexual assault',
    robbery: 'Robbery',
    looting: 'Looting',
    hooliganism: 'Hooliganism',
  },
  ru: {
    drugs: 'Наркотики',
    extremism: 'Экстремизм',
    human_trafficking: 'Торговля людьми',
    bribery: 'Взяточничество',
    extortion: 'Вымогательство',
    fraud: 'Мошенничество',
    theft: 'Кража',
    intentional_homicide: 'Умышленное убийство',
    rape: 'Изнасилование',
    robbery: 'Разбой',
    looting: 'Грабеж',
    hooliganism: 'Хулиганство',
  },
};

const getDeterministicCrimeFilterKey = (crimeId: string, dataset: MapDatasetKey): CrimeFilterKey => {
  const options = DATASET_FILTER_KEYS[dataset];
  if (options.length === 0) return 'theft';

  let hash = 0;
  for (let i = 0; i < crimeId.length; i++) {
    hash = (hash * 31 + crimeId.charCodeAt(i)) >>> 0;
  }

  return options[hash % options.length];
};

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'map'>('map');
  const [activeMapDataset, setActiveMapDataset] = useState<MapDatasetKey>('aniqlanadigan');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrimeFilter, setSelectedCrimeFilter] = useState<'All' | CrimeFilterKey>('All');
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [language, setLanguage] = useState<Language>('uz');

  const t = TRANSLATIONS[language];
  const currentCrimes = MAP_DATASET_CRIMES[activeMapDataset];
  const currentFilterKeys = DATASET_FILTER_KEYS[activeMapDataset];
  
  useEffect(() => {
    setSelectedCrimeFilter('All');
  }, [activeMapDataset, language]);

  // Derived state
  const filteredCrimes = useMemo(() => {
    return currentCrimes.filter(crime => {
      const matchesSearch = crime.district.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            crime.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType =
        selectedCrimeFilter === 'All' ||
        getDeterministicCrimeFilterKey(crime.id, activeMapDataset) === selectedCrimeFilter;
      return matchesSearch && matchesType;
    });
  }, [searchQuery, selectedCrimeFilter, currentCrimes, activeMapDataset]);

  const stats = useMemo(() => {
    const totals = MAP_DATASET_REGION_TOTALS[activeMapDataset].filter((item) =>
      item.regionName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const defaultType = filteredCrimes[0]?.type ?? CrimeType.THEFT;
    return calculateRegionStatsFromTotals(totals, defaultType);
  }, [activeMapDataset, searchQuery, filteredCrimes]);

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const summary = await generateCrimeAnalysis(stats, filteredCrimes, language);
      setAiSummary(summary);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30 overflow-hidden">
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-950/95 z-[100] backdrop-blur-md md:hidden flex flex-col p-6 animate-in fade-in slide-in-from-left-4 duration-300">
           <div className="flex justify-between items-center mb-10">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Shield className="text-white" size={24} />
                </div>
                <span className="font-bold text-2xl tracking-tight text-white">{t.app_title}</span>
             </div>
             <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-900 rounded-full text-slate-400 hover:text-white border border-slate-800">
               <X size={24} />
             </button>
           </div>
           <nav className="flex flex-col gap-4">
              <button 
                onClick={() => { setActiveTab('map'); setActiveMapDataset('aniqlanadigan'); setIsMobileMenuOpen(false); }} 
                className={`p-4 rounded-2xl flex items-center gap-4 transition-all ${activeTab === 'map' && activeMapDataset === 'aniqlanadigan' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'bg-slate-900/50 text-slate-400 border border-slate-800/50'}`}
              >
                <MapIcon size={22} /> <span className="font-semibold text-lg">{MAP_DATASET_LABELS[language].aniqlanadigan}</span>
              </button>
              <button 
                onClick={() => { setActiveTab('map'); setActiveMapDataset('kiber'); setIsMobileMenuOpen(false); }} 
                className={`p-4 rounded-2xl flex items-center gap-4 transition-all ${activeTab === 'map' && activeMapDataset === 'kiber' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'bg-slate-900/50 text-slate-400 border border-slate-800/50'}`}
              >
                <MapIcon size={22} /> <span className="font-semibold text-lg">{MAP_DATASET_LABELS[language].kiber}</span>
              </button>
              <button 
                onClick={() => { setActiveTab('map'); setActiveMapDataset('oldini_olish'); setIsMobileMenuOpen(false); }} 
                className={`p-4 rounded-2xl flex items-center gap-4 transition-all ${activeTab === 'map' && activeMapDataset === 'oldini_olish' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'bg-slate-900/50 text-slate-400 border border-slate-800/50'}`}
              >
                <MapIcon size={22} /> <span className="font-semibold text-lg">{MAP_DATASET_LABELS[language].oldini_olish}</span>
              </button>
              <button 
                onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} 
                className={`p-4 rounded-2xl flex items-center gap-4 transition-all ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'bg-slate-900/50 text-slate-400 border border-slate-800/50'}`}
              >
                <BarChart3 size={22} /> <span className="font-semibold text-lg">{t.nav_analytics}</span>
              </button>
              <div className="h-px bg-slate-800/50 my-2"></div>
              <button className="p-4 rounded-2xl flex items-center gap-4 bg-slate-900/50 text-slate-400 border border-slate-800/50"><FileText size={22} /> <span className="font-semibold text-lg">{t.nav_reports}</span></button>
              <button className="p-4 rounded-2xl flex items-center gap-4 bg-slate-900/50 text-slate-400 border border-slate-800/50"><Settings size={22} /> <span className="font-semibold text-lg">{t.nav_system}</span></button>
              <button 
                onClick={() => { setIsChatOpen(true); setIsMobileMenuOpen(false); }} 
                className="p-5 rounded-2xl flex items-center justify-center gap-4 bg-gradient-to-br from-blue-600 to-indigo-700 text-white mt-8 shadow-2xl shadow-blue-600/30 font-bold text-lg"
              >
                <Cpu size={24} /> {t.nav_assistant}
              </button>
           </nav>
        </div>
      )}

      {/* Desktop Sidebar Navigation */}
      <aside className="w-20 lg:w-64 bg-slate-900 border-r border-slate-800/50 flex flex-col justify-between hidden md:flex z-50">
        <div>
          <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-800/50">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Shield className="text-white" size={20} />
            </div>
            <span className="ml-3 font-bold text-xl hidden lg:block tracking-tight text-white">{t.app_title}</span>
          </div>

          <nav className="mt-8 space-y-2 px-3">
            <button 
              onClick={() => { setActiveTab('map'); setActiveMapDataset('aniqlanadigan'); }}
              className={`w-full flex items-center p-3.5 rounded-xl transition-all duration-200 ${activeTab === 'map' && activeMapDataset === 'aniqlanadigan' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'}`}
            >
              <MapIcon size={20} />
              <span className="ml-3 font-semibold hidden lg:block">{MAP_DATASET_LABELS[language].aniqlanadigan}</span>
            </button>
            <button 
              onClick={() => { setActiveTab('map'); setActiveMapDataset('kiber'); }}
              className={`w-full flex items-center p-3.5 rounded-xl transition-all duration-200 ${activeTab === 'map' && activeMapDataset === 'kiber' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'}`}
            >
              <MapIcon size={20} />
              <span className="ml-3 font-semibold hidden lg:block">{MAP_DATASET_LABELS[language].kiber}</span>
            </button>
            <button 
              onClick={() => { setActiveTab('map'); setActiveMapDataset('oldini_olish'); }}
              className={`w-full flex items-center p-3.5 rounded-xl transition-all duration-200 ${activeTab === 'map' && activeMapDataset === 'oldini_olish' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'}`}
            >
              <MapIcon size={20} />
              <span className="ml-3 font-semibold hidden lg:block">{MAP_DATASET_LABELS[language].oldini_olish}</span>
            </button>
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center p-3.5 rounded-xl transition-all duration-200 ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'}`}
            >
              <BarChart3 size={20} />
              <span className="ml-3 font-semibold hidden lg:block">{t.nav_analytics}</span>
            </button>
             <div className="h-px bg-slate-800/50 my-6 mx-2"></div>
            <button className="w-full flex items-center p-3.5 rounded-xl text-slate-400 hover:bg-slate-800/80 hover:text-slate-100 transition-all">
              <FileText size={20} />
              <span className="ml-3 font-semibold hidden lg:block">{t.nav_reports}</span>
            </button>
             <button className="w-full flex items-center p-3.5 rounded-xl text-slate-400 hover:bg-slate-800/80 hover:text-slate-100 transition-all">
              <Settings size={20} />
              <span className="ml-3 font-semibold hidden lg:block">{t.nav_system}</span>
            </button>
          </nav>
        </div>

        <div className="p-4">
          <button 
            onClick={() => setIsChatOpen(true)}
            className="w-full bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white p-4 rounded-2xl shadow-xl shadow-blue-600/10 flex items-center justify-center gap-2 transition-all hover:scale-[1.03] active:scale-95"
          >
            <Cpu size={22} />
            <span className="hidden lg:block font-bold text-sm tracking-wide">{t.nav_assistant}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 bg-slate-900/70 backdrop-blur-xl border-b border-slate-800/50 flex items-center justify-between px-4 md:px-8 z-40 sticky top-0 shrink-0">
          <div className="flex items-center gap-4">
             <button 
                className="md:hidden text-slate-400 hover:text-white p-2 bg-slate-800/50 rounded-lg transition-colors" 
                onClick={() => setIsMobileMenuOpen(true)}
             >
               <Menu size={20} />
             </button>
             <h2 className="text-lg md:text-2xl font-bold text-white tracking-tight truncate max-w-[140px] sm:max-w-none">
               {activeTab === 'dashboard' ? t.header_dashboard : t.header_map}
             </h2>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
             {/* Language Switcher */}
             <div className="flex items-center bg-slate-950/80 rounded-xl p-1 border border-slate-800/50 shadow-inner">
               {(['uz', 'en', 'ru'] as Language[]).map((lang) => (
                 <button 
                    key={lang}
                    onClick={() => setLanguage(lang)} 
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${language === lang ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                 >{lang.toUpperCase()}</button>
               ))}
             </div>

            <div className="relative hidden xl:block">
              <Search className="absolute left-3.5 top-2.5 text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder={t.search_placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950/50 border border-slate-800/50 text-sm rounded-xl pl-11 pr-4 py-2.5 w-64 lg:w-72 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
              />
            </div>
            
            <button className="relative p-2.5 text-slate-400 hover:text-white bg-slate-800/50 rounded-xl transition-all hidden sm:flex border border-slate-800/50 hover:border-slate-700">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900"></span>
            </button>
          </div>
        </header>

        {/* Main Content Scrollable Area */}
        <div className="flex-1 overflow-hidden flex flex-col pt-4">
          {/* Filters Bar (Common) */}
          <div className="px-4 md:px-8 py-5 flex flex-wrap gap-4 items-center justify-between shrink-0 bg-slate-950/20">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide w-full md:w-auto">
                <button 
                  onClick={() => setSelectedCrimeFilter('All')}
                  className={`px-5 py-2 rounded-xl text-sm font-bold border transition-all whitespace-nowrap ${selectedCrimeFilter === 'All' ? 'bg-white text-slate-950 border-white shadow-lg' : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:border-slate-600'}`}
                >
                  {t.filter_all}
                </button>
                {currentFilterKeys.map((typeKey) => (
                  <button 
                    key={typeKey}
                    onClick={() => setSelectedCrimeFilter(typeKey)}
                    className={`px-5 py-2 rounded-xl text-sm font-bold border transition-all whitespace-nowrap ${selectedCrimeFilter === typeKey ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20' : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:border-slate-600'}`}
                  >
                    {FILTER_LABELS[language][typeKey]}
                  </button>
                ))}
              </div>
              
              <button 
                onClick={handleRunAnalysis}
                disabled={isAnalyzing}
                className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all font-bold text-sm disabled:opacity-50 ml-auto md:ml-0 border border-blue-500/20"
              >
                {isAnalyzing ? <span className="animate-pulse flex items-center gap-2"><Cpu size={16} className="animate-spin-slow"/> {t.btn_analyzing}</span> : <><Cpu size={16} /> {t.btn_analyze}</>}
              </button>
          </div>

          <div className="flex-1 overflow-hidden px-4 md:px-8 pb-8 pt-0">
            
            {/* AI Analysis Summary Panel */}
            {aiSummary && ( activeTab === 'dashboard' || activeTab === 'map' ) && (
              <div className="mb-6 bg-gradient-to-br from-slate-900 to-slate-900 border border-blue-500/30 rounded-2xl p-5 animate-in fade-in slide-in-from-top-4 shrink-0 overflow-y-auto max-h-48 shadow-2xl relative group">
                <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none"></div>
                <h3 className="text-blue-400 font-bold mb-3 flex items-center gap-2.5 text-base uppercase tracking-wider"><Cpu size={18} className="text-blue-500"/> {t.ai_analysis_title}</h3>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line font-medium">{aiSummary}</p>
              </div>
            )}

            {activeTab === 'dashboard' ? (
              <div className="space-y-6 overflow-y-auto h-full pb-20 pr-1 scrollbar-thin">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <StatsCard 
                    title={t.stat_total} 
                    value={filteredCrimes.length} 
                    icon={Shield} 
                    trend="up" 
                    trendValue={`12% ${t.trend_up}`}
                  />
                  <StatsCard 
                    title={t.stat_risk} 
                    value={stats.filter(s => s.riskScore > 70).length} 
                    icon={MapIcon} 
                    color="text-red-500"
                    subtext={t.stat_risk_sub}
                  />
                  <StatsCard 
                    title={t.stat_response} 
                    value="8.2 min" 
                    icon={Settings} 
                    color="text-emerald-500"
                    trend="down"
                    trendValue={t.stat_response_trend}
                  />
                  <StatsCard 
                    title={t.stat_solved} 
                    value="42%" 
                    icon={FileText} 
                    color="text-purple-500"
                    subtext={t.stat_solved_sub}
                  />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6 shadow-xl">
                    <h3 className="font-bold text-white mb-6 text-lg tracking-tight">{t.chart_risk}</h3>
                    <DistrictRiskChart stats={stats} crimes={filteredCrimes} />
                  </div>
                  <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6 shadow-xl overflow-y-auto">
                    <h3 className="font-bold text-white mb-6 text-lg tracking-tight">{t.chart_types}</h3>
                    <CrimeTypeDistribution stats={stats} crimes={filteredCrimes} />
                  </div>
                </div>

                {/* Table */}
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl overflow-hidden shadow-xl">
                  <div className="p-6 border-b border-slate-800/50 flex justify-between items-center bg-slate-900/50">
                    <h3 className="font-bold text-white text-lg tracking-tight">{t.table_title}</h3>
                    <button className="px-4 py-1.5 rounded-lg bg-slate-800 text-blue-400 hover:text-blue-300 hover:bg-slate-700 transition-all font-bold text-xs flex items-center gap-1.5">{t.table_view_all} <ChevronRight size={14}/></button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-950 text-slate-500">
                        <tr>
                          <th className="px-6 py-4 font-bold uppercase text-[11px] tracking-widest">{t.col_id}</th>
                          <th className="px-6 py-4 font-bold uppercase text-[11px] tracking-widest">{t.col_type}</th>
                          <th className="px-6 py-4 font-bold uppercase text-[11px] tracking-widest">{t.col_district}</th>
                          <th className="px-6 py-4 font-bold uppercase text-[11px] tracking-widest">{t.col_severity}</th>
                          <th className="px-6 py-4 font-bold uppercase text-[11px] tracking-widest">{t.col_date}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {filteredCrimes.slice(0, 8).map(crime => (
                          <tr key={crime.id} className="hover:bg-slate-800/40 transition-colors group">
                            <td className="px-6 py-4 font-mono text-slate-500 group-hover:text-slate-400">{crime.id}</td>
                            <td className="px-6 py-4 text-slate-100 font-bold">{crime.type}</td>
                            <td className="px-6 py-4 text-slate-400 font-medium group-hover:text-slate-300">{crime.district}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-tight ${
                                crime.severity === 'Critical' ? 'bg-red-950/60 text-red-400 border border-red-900/50 shadow-sm shadow-red-900/10' :
                                crime.severity === 'High' ? 'bg-orange-950/60 text-orange-400 border border-orange-900/50 shadow-sm shadow-orange-900/10' :
                                'bg-emerald-950/60 text-emerald-400 border border-emerald-900/50 shadow-sm shadow-emerald-900/10'
                              }`}>
                                {crime.severity}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-500 font-medium group-hover:text-slate-400">{new Date(crime.date).toLocaleDateString(language)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              // Live Map View with Left Stats
              <div className="flex flex-col lg:flex-row h-full gap-5">
                
                {/* Statistics Sidebar - Left on Desktop, Bottom on Mobile */}
                <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-4 overflow-y-auto pr-1 pb-4 order-2 lg:order-1 h-[50%] lg:h-full scrollbar-thin">
                   <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/50 shadow-xl group hover:border-blue-500/30 transition-all">
                      <h3 className="text-slate-500 text-[11px] font-black uppercase tracking-[0.15em] mb-2">{t.stat_total}</h3>
                      <div className="text-4xl font-black text-white group-hover:text-blue-400 transition-colors">{filteredCrimes.length}</div>
                   </div>
                   
                   <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/50 shadow-xl flex-1 min-h-[300px] hover:border-blue-500/30 transition-all overflow-y-auto overflow-x-hidden flex flex-col pb-2">
                      <h3 className="text-slate-500 text-[11px] font-black uppercase tracking-[0.15em] mb-4">{t.chart_risk}</h3>
                      <div className="flex-1 min-h-0">
                        <DistrictRiskChart stats={stats} crimes={filteredCrimes} />
                      </div>
                   </div>

                   {/* <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/50 shadow-xl flex-1 min-h-[260px] hover:border-blue-500/30 transition-all overflow-hidden flex flex-col">
                      <h3 className="text-slate-500 text-[11px] font-black uppercase tracking-[0.15em] mb-4">{t.chart_types}</h3>
                       <div className="flex-1 min-h-0">
                        <CrimeTypeDistribution stats={stats} crimes={filteredCrimes} />
                      </div>
                   </div> */}
                </div>

                {/* Map Container */}
                <div className="flex-1 rounded-2xl overflow-hidden border border-slate-800/50 shadow-2xl relative order-1 lg:order-2 h-[50%] lg:h-full bg-slate-900">
                   <CrimeMap
                     crimes={filteredCrimes}
                     language={language}
                     datasetLabel={MAP_DATASET_LABELS[language][activeMapDataset]}
                   />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Floating Chat Assistant */}
      <Assistant 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        crimes={filteredCrimes}
        stats={stats}
        language={language}
      />
    </div>
  );
}

export default App;
