/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Heart, 
  Plus, 
  X,
  Check,
  Music,
  Coffee,
  Plane,
  Camera as CameraIcon,
  Gamepad,
  Dumbbell,
  Palette,
  Utensils,
  Search,
  MessageCircle,
  User as UserIcon,
  Settings,
  Flame,
  Star,
  Send,
  MoreHorizontal,
  MapPin,
  Info,
  Github
} from 'lucide-react';

type Step = 'welcome' | 'basic' | 'photos' | 'interests' | 'bio' | 'complete' | 'main';
type MainTab = 'discover' | 'messages' | 'profile' | 'chat' | 'settings' | 'edit_profile';

const INTEREST_OPTIONS = [
  { id: 'travel', label: 'Travel', icon: <Plane size={16} /> },
  { id: 'music', label: 'Music', icon: <Music size={16} /> },
  { id: 'coffee', label: 'Coffee', icon: <Coffee size={16} /> },
  { id: 'gaming', label: 'Gaming', icon: <Gamepad size={16} /> },
  { id: 'fitness', label: 'Fitness', icon: <Dumbbell size={16} /> },
  { id: 'art', label: 'Art', icon: <Palette size={16} /> },
  { id: 'food', label: 'Food', icon: <Utensils size={16} /> },
  { id: 'photography', label: 'Photography', icon: <CameraIcon size={16} /> },
];

const MOCK_PROFILES = [
  {
    id: 1,
    name: 'Elena',
    age: 24,
    bio: 'Digital nomad & coffee addict. Looking for someone to explore hidden gems in the city.',
    photos: ['https://picsum.photos/seed/elena/600/800', 'https://picsum.photos/seed/elena2/600/800'],
    interests: ['travel', 'coffee', 'photography'],
    distance: '2 km away'
  },
  {
    id: 2,
    name: 'Marcus',
    age: 27,
    bio: 'Lover of all things tech and fitness. Let\'s hit the gym or talk about the future of AI.',
    photos: ['https://picsum.photos/seed/marcus/600/800', 'https://picsum.photos/seed/marcus2/600/800'],
    interests: ['fitness', 'gaming', 'music'],
    distance: '5 km away'
  },
  {
    id: 3,
    name: 'Sophie',
    age: 23,
    bio: 'Art is my life. Painting, museums, and late night walks.',
    photos: ['https://picsum.photos/seed/sophie/600/800', 'https://picsum.photos/seed/sophie2/600/800'],
    interests: ['art', 'music', 'travel'],
    distance: '1 km away'
  }
];

const MOCK_MESSAGES = [
  { id: 1, name: 'Elena', lastMessage: 'That sounds amazing! When are you free?', time: '2m ago', avatar: 'https://picsum.photos/seed/elena/100/100', unread: true },
  { id: 2, name: 'Marcus', lastMessage: 'Did you see the new release?', time: '1h ago', avatar: 'https://picsum.photos/seed/marcus/100/100', unread: false },
  { id: 3, name: 'Sophie', lastMessage: 'I loved that museum too!', time: '3h ago', avatar: 'https://picsum.photos/seed/sophie/100/100', unread: false },
];

export default function App() {
  const [step, setStep] = useState<Step>('main');
  const [activeTab, setActiveTab] = useState<MainTab>('discover');
  const [selectedChat, setSelectedChat] = useState<typeof MOCK_MESSAGES[0] | null>(null);
  const [showMatch, setShowMatch] = useState(false);
  const [githubToken, setGithubToken] = useState<string | null>(null);
  const [githubRepos, setGithubRepos] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: 'Alex',
    age: '24',
    gender: 'non-binary',
    lookingFor: '',
    interests: ['music', 'travel', 'coffee'],
    bio: 'Exploring the digital frontier. 🚀',
    photos: ['https://picsum.photos/seed/me/600/800'],
  });

  const [discoverIndex, setDiscoverIndex] = useState(0);

  const nextStep = (current: Step) => {
    const steps: Step[] = ['welcome', 'basic', 'photos', 'interests', 'bio', 'complete', 'main'];
    const index = steps.indexOf(current);
    if (index < steps.length - 1) setStep(steps[index + 1]);
  };

  const prevStep = (current: Step) => {
    const steps: Step[] = ['welcome', 'basic', 'photos', 'interests', 'bio', 'complete', 'main'];
    const index = steps.indexOf(current);
    if (index > 0) setStep(steps[index - 1]);
  };

  const toggleInterest = (id: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter(i => i !== id)
        : [...prev.interests, id]
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          photos: [...prev.photos, reader.result as string].slice(0, 6)
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const currentProfile = MOCK_PROFILES[discoverIndex % MOCK_PROFILES.length];

  const handleLike = () => {
    // Randomly show match for demo purposes
    if (Math.random() > 0.5) {
      setShowMatch(true);
    } else {
      setDiscoverIndex(prev => prev + 1);
    }
  };

  const handleConnectGitHub = async () => {
    try {
      const response = await fetch('/api/auth/github/url');
      if (!response.ok) throw new Error('Failed to get auth URL');
      const { url } = await response.json();

      const authWindow = window.open(url, 'github_oauth', 'width=600,height=700');
      if (!authWindow) alert('Please allow popups to connect GitHub.');
    } catch (error) {
      console.error('GitHub connect error:', error);
    }
  };

  const fetchGitHubRepos = async (token: string) => {
    try {
      const response = await fetch('/api/github/repos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setGithubRepos(data);
      }
    } catch (error) {
      console.error('Failed to fetch repos:', error);
    }
  };

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GITHUB_AUTH_SUCCESS') {
        setGithubToken(event.data.token);
        fetchGitHubRepos(event.data.token);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0502] text-white font-sans selection:bg-orange-500/30 overflow-hidden relative">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-orange-900/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-900/10 rounded-full blur-[120px]" />
      </div>

      <main className="relative z-10 max-w-md mx-auto min-h-screen flex flex-col">
        <AnimatePresence mode="wait">
          {step === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex-1 flex flex-col justify-center items-center text-center space-y-8 px-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-orange-500 blur-2xl opacity-20 animate-pulse" />
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center shadow-2xl shadow-orange-500/20 relative z-10">
                  <Heart className="text-white fill-current" size={48} />
                </div>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-5xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                  SoulSync
                </h1>
                <p className="text-lg text-white/60 font-light max-w-[280px]">
                  Find your resonance in the digital age. Let's build your profile.
                </p>
              </div>

              <button
                onClick={() => nextStep('welcome')}
                className="group relative px-8 py-4 bg-white text-black rounded-full font-semibold overflow-hidden transition-all hover:scale-105 active:scale-95"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Get Started <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </motion.div>
          )}

          {step === 'main' && (
            <motion.div
              key="main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col h-screen"
            >
              {/* Header */}
              <header className="px-6 py-4 flex justify-between items-center bg-black/20 backdrop-blur-xl border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center">
                    <Heart size={16} className="text-white fill-current" />
                  </div>
                  <span className="font-bold tracking-tight text-xl">SoulSync</span>
                </div>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <Settings size={20} className="text-white/60" />
                </button>
              </header>

              {/* Content Area */}
              <div className="flex-1 overflow-hidden relative">
                <AnimatePresence mode="wait">
                  {activeTab === 'discover' && (
                    <motion.div
                      key="discover"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      className="h-full p-4 flex flex-col"
                    >
                      <div className="flex-1 relative group">
                        <motion.div 
                          key={currentProfile.id}
                          initial={{ x: 300, opacity: 0, rotate: 10 }}
                          animate={{ x: 0, opacity: 1, rotate: 0 }}
                          className="absolute inset-0 rounded-[32px] overflow-hidden shadow-2xl"
                        >
                          <img 
                            src={currentProfile.photos[0]} 
                            alt={currentProfile.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                          
                          <div className="absolute bottom-0 left-0 w-full p-8 space-y-4">
                            <div className="flex items-end justify-between">
                              <div>
                                <h3 className="text-4xl font-bold flex items-center gap-3">
                                  {currentProfile.name}, {currentProfile.age}
                                  <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
                                </h3>
                                <div className="flex items-center gap-2 text-white/60 text-sm mt-1">
                                  <MapPin size={14} />
                                  {currentProfile.distance}
                                </div>
                              </div>
                              <button className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                                <Info size={20} />
                              </button>
                            </div>

                            <p className="text-white/80 line-clamp-2 font-light leading-relaxed">
                              {currentProfile.bio}
                            </p>

                            <div className="flex flex-wrap gap-2">
                              {currentProfile.interests.map(id => {
                                const interest = INTEREST_OPTIONS.find(i => i.id === id);
                                return (
                                  <span key={id} className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium flex items-center gap-1.5">
                                    {interest?.icon}
                                    {interest?.label}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        </motion.div>
                      </div>

                      {/* Action Buttons */}
                      <div className="py-6 flex justify-center items-center gap-6">
                        <button 
                          onClick={() => setDiscoverIndex(prev => prev + 1)}
                          className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-rose-500 hover:bg-rose-500/10 transition-all active:scale-90"
                        >
                          <X size={32} />
                        </button>
                        <button className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 hover:bg-blue-400/10 transition-all active:scale-90">
                          <Star size={24} className="fill-current" />
                        </button>
                        <button 
                          onClick={handleLike}
                          className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-green-500 hover:bg-green-500/10 transition-all active:scale-90"
                        >
                          <Heart size={32} className="fill-current" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'messages' && (
                    <motion.div
                      key="messages"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="h-full flex flex-col"
                    >
                      <div className="px-6 py-4">
                        <h2 className="text-2xl font-bold">Messages</h2>
                        <div className="mt-4 relative">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                          <input 
                            type="text" 
                            placeholder="Search matches..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-orange-500/50 transition-colors"
                          />
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto px-6 space-y-2">
                        <div className="py-2">
                          <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4">New Matches</h3>
                          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                            {[1, 2, 3, 4, 5].map(i => (
                              <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2">
                                <div className="w-16 h-16 rounded-2xl p-0.5 bg-gradient-to-br from-orange-500 to-rose-600">
                                  <img src={`https://picsum.photos/seed/match${i}/100/100`} className="w-full h-full object-cover rounded-[14px] border-2 border-black" referrerPolicy="no-referrer" />
                                </div>
                                <span className="text-xs font-medium text-white/60">Match</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="py-2">
                          <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4">Recent Conversations</h3>
                          <div className="space-y-4">
                            {MOCK_MESSAGES.map(msg => (
                              <button 
                                key={msg.id}
                                onClick={() => {
                                  setSelectedChat(msg);
                                  setActiveTab('chat');
                                }}
                                className="w-full flex items-center gap-4 group"
                              >
                                <div className="relative">
                                  <img src={msg.avatar} className="w-14 h-14 rounded-2xl object-cover" referrerPolicy="no-referrer" />
                                  {msg.unread && <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-black" />}
                                </div>
                                <div className="flex-1 text-left">
                                  <div className="flex justify-between items-center">
                                    <span className="font-bold">{msg.name}</span>
                                    <span className="text-xs text-white/30">{msg.time}</span>
                                  </div>
                                  <p className={`text-sm line-clamp-1 ${msg.unread ? 'text-white font-medium' : 'text-white/40'}`}>
                                    {msg.lastMessage}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'chat' && selectedChat && (
                    <motion.div
                      key="chat"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      className="h-full flex flex-col bg-black/40"
                    >
                      <div className="px-6 py-4 flex items-center gap-4 border-b border-white/5">
                        <button onClick={() => setActiveTab('messages')} className="p-2 -ml-2 text-white/60">
                          <ChevronLeft size={24} />
                        </button>
                        <img src={selectedChat.avatar} className="w-10 h-10 rounded-xl object-cover" referrerPolicy="no-referrer" />
                        <div className="flex-1">
                          <h3 className="font-bold text-sm">{selectedChat.name}</h3>
                          <span className="text-[10px] text-green-500 flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                            Online
                          </span>
                        </div>
                        <button className="p-2 text-white/60">
                          <MoreHorizontal size={20} />
                        </button>
                      </div>

                      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                        <div className="flex justify-center">
                          <span className="text-[10px] text-white/20 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">Today</span>
                        </div>
                        <div className="flex flex-col gap-4">
                          <div className="max-w-[80%] bg-white/5 rounded-2xl rounded-tl-none p-4 text-sm text-white/80">
                            Hey! I saw your profile and loved your travel photos. Where was that last one taken?
                          </div>
                          <div className="max-w-[80%] bg-orange-500 self-end rounded-2xl rounded-tr-none p-4 text-sm text-white">
                            Thanks! That was in Iceland last summer. It was breathtaking!
                          </div>
                          <div className="max-w-[80%] bg-white/5 rounded-2xl rounded-tl-none p-4 text-sm text-white/80">
                            {selectedChat.lastMessage}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-black/40 backdrop-blur-xl border-t border-white/5">
                        <div className="flex items-center gap-3">
                          <button className="p-3 bg-white/5 rounded-2xl text-white/40">
                            <Plus size={20} />
                          </button>
                          <div className="flex-1 relative">
                            <input 
                              type="text" 
                              placeholder="Type a message..."
                              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:outline-none focus:border-orange-500/50"
                            />
                          </div>
                          <button className="p-3 bg-orange-500 rounded-2xl text-white shadow-lg shadow-orange-500/20">
                            <Send size={20} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'profile' && (
                    <motion.div
                      key="profile"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="h-full overflow-y-auto"
                    >
                      <div className="p-6 space-y-8 pb-24">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="relative">
                            <div className="w-32 h-32 rounded-[40px] p-1 bg-gradient-to-br from-orange-500 to-rose-600">
                              <img src={formData.photos[0]} className="w-full h-full object-cover rounded-[36px] border-4 border-black" referrerPolicy="no-referrer" />
                            </div>
                            <button className="absolute bottom-0 right-0 p-2.5 bg-white text-black rounded-2xl shadow-xl">
                              <CameraIcon size={18} />
                            </button>
                          </div>
                          <div className="text-center">
                            <h2 className="text-2xl font-bold">{formData.name}, {formData.age}</h2>
                            <p className="text-white/40 text-sm">Premium Member</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div 
                            onClick={() => setActiveTab('settings')}
                            className="bg-white/5 border border-white/10 rounded-3xl p-4 flex flex-col items-center gap-1 cursor-pointer hover:bg-white/10 transition-colors"
                          >
                            <Settings size={20} className="text-white/40" />
                            <span className="text-[10px] uppercase font-bold tracking-tighter text-white/40">Settings</span>
                          </div>
                          <div className="bg-gradient-to-br from-orange-500 to-rose-600 rounded-3xl p-4 flex flex-col items-center gap-1 shadow-lg shadow-orange-500/20 cursor-pointer hover:scale-105 transition-transform">
                            <Flame size={20} className="text-white" />
                            <span className="text-[10px] uppercase font-bold tracking-tighter text-white">Boost</span>
                          </div>
                          <div 
                            onClick={() => setActiveTab('edit_profile')}
                            className="bg-white/5 border border-white/10 rounded-3xl p-4 flex flex-col items-center gap-1 cursor-pointer hover:bg-white/10 transition-colors"
                          >
                            <Palette size={20} className="text-white/40" />
                            <span className="text-[10px] uppercase font-bold tracking-tighter text-white/40">Edit</span>
                          </div>
                        </div>

                        {/* GitHub Integration */}
                        <div className="space-y-4">
                          <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest">Digital Footprint</h3>
                          {!githubToken ? (
                            <button 
                              onClick={handleConnectGitHub}
                              className="w-full flex items-center justify-center gap-3 py-4 bg-[#24292e] hover:bg-[#2c3238] rounded-2xl font-bold transition-all border border-white/10"
                            >
                              <Github size={20} />
                              Connect GitHub
                            </button>
                          ) : (
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Github size={18} className="text-white/60" />
                                  <span className="text-sm font-bold">GitHub Connected</span>
                                </div>
                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                              </div>
                              <div className="space-y-2">
                                {githubRepos.map(repo => (
                                  <div key={repo.id} className="flex items-center justify-between text-xs text-white/60 bg-white/5 p-2 rounded-lg">
                                    <span className="truncate max-w-[150px]">{repo.name}</span>
                                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded uppercase">{repo.language || 'Code'}</span>
                                  </div>
                                ))}
                                {githubRepos.length === 0 && <p className="text-xs text-white/30 italic">Fetching repositories...</p>}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-6">
                          <div className="space-y-3">
                            <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest">My Bio</h3>
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-5 text-white/80 font-light italic leading-relaxed">
                              "{formData.bio}"
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest">My Interests</h3>
                            <div className="flex flex-wrap gap-2">
                              {formData.interests.map(id => {
                                const interest = INTEREST_OPTIONS.find(i => i.id === id);
                                return (
                                  <span key={id} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-medium flex items-center gap-2">
                                    {interest?.icon}
                                    {interest?.label}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={() => setStep('welcome')}
                          className="w-full py-4 bg-white/5 border border-white/10 text-rose-500 rounded-2xl font-bold hover:bg-rose-500/10 transition-colors"
                        >
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'settings' && (
                    <motion.div
                      key="settings"
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      className="h-full flex flex-col"
                    >
                      <div className="px-6 py-4 flex items-center gap-4 border-b border-white/5">
                        <button onClick={() => setActiveTab('profile')} className="p-2 -ml-2 text-white/60">
                          <ChevronLeft size={24} />
                        </button>
                        <h2 className="text-xl font-bold">Settings</h2>
                      </div>
                      <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        <div className="space-y-4">
                          <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest">Account Settings</h3>
                          <div className="space-y-2">
                            {['Phone Number', 'Email', 'Connected Accounts'].map(item => (
                              <button key={item} className="w-full flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
                                <span className="text-sm">{item}</span>
                                <ChevronRight size={16} className="text-white/20" />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest">Discovery Settings</h3>
                          <div className="space-y-2">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Distance Radius</span>
                                <span className="text-sm text-orange-500 font-bold">50 km</span>
                              </div>
                              <input type="range" className="w-full accent-orange-500" />
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">Age Range</span>
                                <span className="text-sm text-orange-500 font-bold">18 - 35</span>
                              </div>
                              <input type="range" className="w-full accent-orange-500" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'edit_profile' && (
                    <motion.div
                      key="edit_profile"
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 50 }}
                      className="h-full flex flex-col"
                    >
                      <div className="px-6 py-4 flex items-center justify-between border-b border-white/5">
                        <button onClick={() => setActiveTab('profile')} className="text-white/60 font-medium">Cancel</button>
                        <h2 className="text-xl font-bold">Edit Profile</h2>
                        <button onClick={() => setActiveTab('profile')} className="text-orange-500 font-bold">Done</button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        <div className="grid grid-cols-3 gap-3 aspect-[3/4]">
                          {[...Array(6)].map((_, i) => (
                            <div key={i} className="relative rounded-2xl border-2 border-dashed border-white/10 overflow-hidden">
                              {formData.photos[i] ? (
                                <img src={formData.photos[i]} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Plus size={24} className="text-white/20" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="space-y-4">
                          <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest">About Me</h3>
                          <textarea 
                            value={formData.bio}
                            onChange={(e) => setFormData({...formData, bio: e.target.value})}
                            className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-orange-500/50 resize-none"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom Navigation */}
              {activeTab !== 'chat' && activeTab !== 'edit_profile' && activeTab !== 'settings' && (
                <nav className="px-8 py-6 bg-black/40 backdrop-blur-2xl border-t border-white/5 flex justify-between items-center">
                  <button 
                    onClick={() => setActiveTab('discover')}
                    className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'discover' ? 'text-orange-500 scale-110' : 'text-white/30 hover:text-white/60'}`}
                  >
                    <Flame size={24} className={activeTab === 'discover' ? 'fill-current' : ''} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Discover</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('messages')}
                    className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'messages' ? 'text-orange-500 scale-110' : 'text-white/30 hover:text-white/60'}`}
                  >
                    <div className="relative">
                      <MessageCircle size={24} className={activeTab === 'messages' ? 'fill-current' : ''} />
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-black" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Chats</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('profile')}
                    className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'profile' ? 'text-orange-500 scale-110' : 'text-white/30 hover:text-white/60'}`}
                  >
                    <UserIcon size={24} className={activeTab === 'profile' ? 'fill-current' : ''} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Profile</span>
                  </button>
                </nav>
              )}
            </motion.div>
          )}

          {step === 'basic' && (
            <motion.div
              key="basic"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="flex-1 flex flex-col space-y-8 pt-12 px-6"
            >
              <div className="space-y-2">
                <span className="text-orange-500 text-xs font-bold tracking-widest uppercase">Step 01</span>
                <h2 className="text-4xl font-bold tracking-tight">The Basics</h2>
                <p className="text-white/50">Tell us who you are.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wider ml-1">First Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Alex"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-orange-500/50 transition-colors text-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/40 uppercase tracking-wider ml-1">Age</label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      placeholder="24"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-orange-500/50 transition-colors text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/40 uppercase tracking-wider ml-1">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-orange-500/50 transition-colors text-lg appearance-none"
                    >
                      <option value="" className="bg-neutral-900">Select</option>
                      <option value="man" className="bg-neutral-900">Man</option>
                      <option value="woman" className="bg-neutral-900">Woman</option>
                      <option value="non-binary" className="bg-neutral-900">Non-binary</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-auto flex gap-4 pb-12">
                <button onClick={() => prevStep('basic')} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <ChevronLeft size={24} />
                </button>
                <button
                  disabled={!formData.name || !formData.age || !formData.gender}
                  onClick={() => nextStep('basic')}
                  className="flex-1 py-4 bg-white text-black rounded-2xl font-bold disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-95"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {step === 'photos' && (
            <motion.div
              key="photos"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="flex-1 flex flex-col space-y-8 pt-12 px-6"
            >
              <div className="space-y-2">
                <span className="text-orange-500 text-xs font-bold tracking-widest uppercase">Step 02</span>
                <h2 className="text-4xl font-bold tracking-tight">Your Photos</h2>
                <p className="text-white/50">Add at least 2 photos to continue.</p>
              </div>

              <div className="grid grid-cols-3 gap-3 aspect-[3/4]">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="relative rounded-2xl border-2 border-dashed border-white/10 overflow-hidden group">
                    {formData.photos[i] ? (
                      <>
                        <img src={formData.photos[i]} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <button 
                          onClick={() => removePhoto(i)}
                          className="absolute top-2 right-2 p-1 bg-black/50 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <label className="absolute inset-0 flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors">
                        <Plus size={24} className="text-white/20" />
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-auto flex gap-4 pb-12">
                <button onClick={() => prevStep('photos')} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <ChevronLeft size={24} />
                </button>
                <button
                  disabled={formData.photos.length < 1}
                  onClick={() => nextStep('photos')}
                  className="flex-1 py-4 bg-white text-black rounded-2xl font-bold disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-95"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {step === 'interests' && (
            <motion.div
              key="interests"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="flex-1 flex flex-col space-y-8 pt-12 px-6"
            >
              <div className="space-y-2">
                <span className="text-orange-500 text-xs font-bold tracking-widest uppercase">Step 03</span>
                <h2 className="text-4xl font-bold tracking-tight">Interests</h2>
                <p className="text-white/50">Pick things you love.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {INTEREST_OPTIONS.map((interest) => (
                  <button
                    key={interest.id}
                    onClick={() => toggleInterest(interest.id)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                      formData.interests.includes(interest.id)
                        ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20'
                        : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                    }`}
                  >
                    {interest.icon}
                    <span className="font-medium">{interest.label}</span>
                  </button>
                ))}
              </div>

              <div className="mt-auto flex gap-4 pb-12">
                <button onClick={() => prevStep('interests')} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <ChevronLeft size={24} />
                </button>
                <button
                  disabled={formData.interests.length < 3}
                  onClick={() => nextStep('interests')}
                  className="flex-1 py-4 bg-white text-black rounded-2xl font-bold disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-95"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {step === 'bio' && (
            <motion.div
              key="bio"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="flex-1 flex flex-col space-y-8 pt-12 px-6"
            >
              <div className="space-y-2">
                <span className="text-orange-500 text-xs font-bold tracking-widest uppercase">Step 04</span>
                <h2 className="text-4xl font-bold tracking-tight">Your Bio</h2>
                <p className="text-white/50">Write a little something about yourself.</p>
              </div>

              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="I'm a..."
                className="w-full h-48 bg-white/5 border border-white/10 rounded-3xl p-6 focus:outline-none focus:border-orange-500/50 transition-colors text-lg resize-none font-light italic"
              />

              <div className="mt-auto flex gap-4 pb-12">
                <button onClick={() => prevStep('bio')} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <ChevronLeft size={24} />
                </button>
                <button
                  disabled={!formData.bio}
                  onClick={() => nextStep('bio')}
                  className="flex-1 py-4 bg-white text-black rounded-2xl font-bold disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-95"
                >
                  Finish
                </button>
              </div>
            </motion.div>
          )}

          {step === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col justify-center items-center text-center space-y-8 px-6"
            >
              <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center shadow-2xl shadow-green-500/20">
                <Check size={48} className="text-white" />
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-bold tracking-tight">You're All Set!</h2>
                <p className="text-white/50">Your profile is ready. Time to find your resonance.</p>
              </div>
              <button
                onClick={() => nextStep('complete')}
                className="w-full py-4 bg-white text-black rounded-full font-bold transition-all hover:scale-105 active:scale-95"
              >
                Enter SoulSync
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Match Overlay */}
      <AnimatePresence>
        {showMatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="space-y-12"
            >
              <div className="space-y-4">
                <h2 className="text-6xl font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-rose-600">
                  IT'S A MATCH!
                </h2>
                <p className="text-white/60">You and {currentProfile.name} have liked each other.</p>
              </div>

              <div className="flex items-center justify-center -space-x-8">
                <motion.div 
                  initial={{ x: -50, rotate: -10 }}
                  animate={{ x: 0, rotate: -5 }}
                  className="w-40 h-56 rounded-3xl border-4 border-white overflow-hidden shadow-2xl"
                >
                  <img src={formData.photos[0]} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </motion.div>
                <motion.div 
                  initial={{ x: 50, rotate: 10 }}
                  animate={{ x: 0, rotate: 5 }}
                  className="w-40 h-56 rounded-3xl border-4 border-white overflow-hidden shadow-2xl"
                >
                  <img src={currentProfile.photos[0]} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </motion.div>
              </div>

              <div className="w-full space-y-4">
                <button 
                  onClick={() => {
                    setShowMatch(false);
                    setSelectedChat({
                      id: Date.now(),
                      name: currentProfile.name,
                      lastMessage: 'Say hi!',
                      time: 'Just now',
                      avatar: currentProfile.photos[0],
                      unread: true
                    });
                    setActiveTab('chat');
                  }}
                  className="w-full py-5 bg-white text-black rounded-3xl font-bold shadow-xl transition-all hover:scale-105 active:scale-95"
                >
                  Send a Message
                </button>
                <button 
                  onClick={() => {
                    setShowMatch(false);
                    setDiscoverIndex(prev => prev + 1);
                  }}
                  className="w-full py-5 bg-white/10 border border-white/20 text-white rounded-3xl font-bold transition-all hover:bg-white/20"
                >
                  Keep Swiping
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar for Setup */}
      {step !== 'welcome' && step !== 'complete' && step !== 'main' && (
        <div className="fixed bottom-0 left-0 w-full h-1 bg-white/5">
          <motion.div 
            className="h-full bg-orange-500"
            initial={{ width: '0%' }}
            animate={{ 
              width: step === 'basic' ? '25%' : 
                     step === 'photos' ? '50%' : 
                     step === 'interests' ? '75%' : '100%' 
            }}
          />
        </div>
      )}
    </div>
  );
}
