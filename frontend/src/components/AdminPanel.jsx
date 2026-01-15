import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, Coins, Gamepad2, ShoppingBag, ArrowRightLeft, Database, 
  Settings, AlertTriangle, TrendingUp, Shield, RefreshCw, Search,
  ChevronRight, Pause, Play, Eye, Ban, CheckCircle, XCircle,
  DollarSign, Activity, BarChart3, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const API = process.env.REACT_APP_BACKEND_URL + "/api";

// Admin API helper
const adminApi = {
  headers: () => ({ "X-Admin-Key": localStorage.getItem("zwap_admin_key") || "" }),
  
  async get(endpoint) {
    const res = await fetch(`${API}/admin${endpoint}`, { headers: this.headers() });
    if (!res.ok) throw new Error(res.status === 401 ? "Unauthorized" : "API Error");
    return res.json();
  },
  
  async post(endpoint, data) {
    const res = await fetch(`${API}/admin${endpoint}`, {
      method: "POST",
      headers: { ...this.headers(), "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("API Error");
    return res.json();
  },
  
  async put(endpoint, data) {
    const res = await fetch(`${API}/admin${endpoint}`, {
      method: "PUT",
      headers: { ...this.headers(), "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("API Error");
    return res.json();
  },
};

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, subValue, color = "cyan", trend }) => (
  <motion.div 
    className={`p-4 rounded-xl border border-${color}-500/30 bg-${color}-500/5`}
    whileHover={{ scale: 1.02 }}
  >
    <div className="flex items-start justify-between">
      <div className={`w-10 h-10 rounded-lg bg-${color}-500/20 flex items-center justify-center`}>
        <Icon className={`w-5 h-5 text-${color}-400`} />
      </div>
      {trend && (
        <span className={`text-xs ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <p className="text-2xl font-bold text-white mt-3">{value}</p>
    <p className="text-sm text-gray-400">{label}</p>
    {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
  </motion.div>
);

// Section Tab Component
const SectionTab = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
      active ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'
    }`}
  >
    <Icon className="w-4 h-4" />
    <span className="text-sm font-medium">{label}</span>
  </button>
);

// Login Screen
const AdminLogin = ({ onLogin }) => {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  
  const handleLogin = async () => {
    localStorage.setItem("zwap_admin_key", key);
    try {
      await adminApi.get("/dashboard");
      onLogin();
    } catch {
      setError("Invalid admin key");
      localStorage.removeItem("zwap_admin_key");
    }
  };
  
  return (
    <div className="min-h-screen bg-[#050510] flex items-center justify-center p-4">
      <motion.div 
        className="w-full max-w-md p-8 rounded-2xl bg-[#0a0b1e] border border-cyan-500/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">ZWAP! Admin</h1>
          <p className="text-gray-400 text-sm mt-1">Enter your admin key to continue</p>
        </div>
        
        <Input
          type="password"
          placeholder="Admin Key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="mb-4 bg-gray-800 border-gray-700"
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
        />
        
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        
        <Button onClick={handleLogin} className="w-full bg-cyan-500 hover:bg-cyan-600">
          Access Admin Panel
        </Button>
      </motion.div>
    </div>
  );
};

// Dashboard Section
const DashboardSection = ({ data, onRefresh }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-bold text-white">Dashboard Overview</h2>
      <Button size="sm" variant="outline" onClick={onRefresh}>
        <RefreshCw className="w-4 h-4 mr-2" /> Refresh
      </Button>
    </div>
    
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard icon={Users} label="Total Users" value={data?.users?.total || 0} color="cyan" />
      <StatCard icon={Activity} label="Active Today" value={data?.users?.active_today || 0} color="green" />
      <StatCard icon={DollarSign} label="Plus Subscribers" value={data?.users?.plus_subscribers || 0} color="purple" />
      <StatCard icon={AlertTriangle} label="Suspended" value={data?.users?.suspended || 0} color="red" />
    </div>
    
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <StatCard icon={Coins} label="ZWAP Issued Today" value={data?.rewards?.issued_today_zwap?.toFixed(2) || "0"} color="cyan" />
      <StatCard icon={TrendingUp} label="zPts Issued Today" value={data?.rewards?.issued_today_zpts || 0} color="purple" />
      <StatCard icon={Gamepad2} label="Games Played Today" value={data?.activity?.games_played_today || 0} color="blue" />
    </div>
    
    {/* System Status */}
    <div className="p-4 rounded-xl border border-gray-700 bg-gray-800/30">
      <h3 className="text-white font-semibold mb-3">System Status</h3>
      <div className="flex flex-wrap gap-3">
        <div className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${data?.system?.claims_paused ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
          {data?.system?.claims_paused ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          Claims: {data?.system?.claims_paused ? 'Paused' : 'Active'}
        </div>
        <div className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${data?.system?.maintenance_mode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
          <Settings className="w-3 h-3" />
          Maintenance: {data?.system?.maintenance_mode ? 'On' : 'Off'}
        </div>
      </div>
    </div>
  </div>
);

// Users Section
const UsersSection = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  
  useEffect(() => { loadUsers(); }, []);
  
  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.get(`/users?limit=50${search ? `&search=${search}` : ''}`);
      setUsers(data.users || []);
    } catch { toast.error("Failed to load users"); }
    setLoading(false);
  };
  
  const suspendUser = async (wallet) => {
    try {
      await adminApi.post(`/users/${wallet}/suspend`, { reason: "Admin action" });
      toast.success("User suspended");
      loadUsers();
    } catch { toast.error("Failed to suspend user"); }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by wallet or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
            className="pl-10 bg-gray-800 border-gray-700"
          />
        </div>
        <Button onClick={loadUsers}><Search className="w-4 h-4" /></Button>
      </div>
      
      <div className="rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs text-gray-400">Wallet</th>
              <th className="px-4 py-3 text-left text-xs text-gray-400">Username</th>
              <th className="px-4 py-3 text-left text-xs text-gray-400">Tier</th>
              <th className="px-4 py-3 text-left text-xs text-gray-400">ZWAP</th>
              <th className="px-4 py-3 text-left text-xs text-gray-400">Status</th>
              <th className="px-4 py-3 text-left text-xs text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.wallet_address} className="border-t border-gray-800 hover:bg-gray-800/50">
                <td className="px-4 py-3 text-sm text-white font-mono">
                  {user.wallet_address?.slice(0, 8)}...{user.wallet_address?.slice(-4)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">{user.username || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${user.tier === 'plus' ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-700 text-gray-400'}`}>
                    {user.tier || 'starter'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-cyan-400">{user.zwap_balance?.toFixed(2) || "0"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${user.status === 'suspended' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                    {user.status || 'active'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button className="p-1 text-gray-400 hover:text-white"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => suspendUser(user.wallet_address)} className="p-1 text-gray-400 hover:text-red-400"><Ban className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <div className="p-8 text-center text-gray-400">Loading...</div>}
        {!loading && users.length === 0 && <div className="p-8 text-center text-gray-400">No users found</div>}
      </div>
    </div>
  );
};

// Treasury Section
const TreasurySection = () => {
  const [treasury, setTreasury] = useState(null);
  
  useEffect(() => { loadTreasury(); }, []);
  
  const loadTreasury = async () => {
    try {
      const data = await adminApi.get("/treasury");
      setTreasury(data);
    } catch { toast.error("Failed to load treasury"); }
  };
  
  const toggleClaims = async (pause) => {
    try {
      await adminApi.post("/treasury/action", { 
        action: pause ? "pause_claims" : "resume_claims", 
        reason: "Admin toggle" 
      });
      toast.success(pause ? "Claims paused" : "Claims resumed");
      loadTreasury();
    } catch { toast.error("Action failed"); }
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Treasury & Token Operations</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Database} label="Treasury Balance" value={treasury?.treasury_balance?.toFixed(2) || "—"} subValue="On-chain ZWAP" color="cyan" />
        <StatCard icon={Coins} label="Total Issued" value={treasury?.total_issued?.toFixed(0) || "0"} subValue="All time" color="purple" />
        <StatCard icon={TrendingUp} label="Total Claimed" value={treasury?.total_claimed?.toFixed(0) || "0"} color="green" />
        <StatCard icon={Activity} label="Circulating In-App" value={treasury?.circulating_in_app?.toFixed(0) || "0"} color="blue" />
      </div>
      
      {/* Emergency Controls */}
      <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          Emergency Controls
        </h3>
        <div className="flex gap-4">
          <Button 
            onClick={() => toggleClaims(true)} 
            variant="destructive"
            disabled={treasury?.claims_paused}
          >
            <Pause className="w-4 h-4 mr-2" /> Pause All Claims
          </Button>
          <Button 
            onClick={() => toggleClaims(false)} 
            className="bg-green-600 hover:bg-green-700"
            disabled={!treasury?.claims_paused}
          >
            <Play className="w-4 h-4 mr-2" /> Resume Claims
          </Button>
        </div>
        {treasury?.claims_paused && (
          <p className="text-red-400 text-sm mt-3">⚠️ Claims are currently PAUSED</p>
        )}
      </div>
    </div>
  );
};

// Games Config Section
const GamesSection = () => {
  const [games, setGames] = useState([]);
  
  useEffect(() => { loadGames(); }, []);
  
  const loadGames = async () => {
    try {
      const data = await adminApi.get("/config/games");
      setGames(data.games || []);
    } catch { toast.error("Failed to load games"); }
  };
  
  const toggleGame = async (gameId, enabled) => {
    try {
      await adminApi.post(`/config/games/${gameId}/toggle?enabled=${!enabled}`);
      toast.success(`Game ${!enabled ? 'enabled' : 'disabled'}`);
      loadGames();
    } catch { toast.error("Failed to toggle game"); }
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Games Configuration</h2>
      
      <div className="grid gap-4">
        {games.map((game) => (
          <div key={game.game_id} className="p-4 rounded-xl border border-gray-700 bg-gray-800/30 flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold">{game.name || game.game_id}</h3>
              <p className="text-gray-400 text-sm">
                Reward Rate: {game.reward_rate}x • Tier: {game.tier_required || 'starter'}
              </p>
            </div>
            <button
              onClick={() => toggleGame(game.game_id, game.enabled)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                game.enabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}
            >
              {game.enabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Admin Panel Component
export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [dashboardData, setDashboardData] = useState(null);
  
  useEffect(() => {
    // Check if already authenticated
    const key = localStorage.getItem("zwap_admin_key");
    if (key) {
      adminApi.get("/dashboard")
        .then((data) => { setIsAuthenticated(true); setDashboardData(data); })
        .catch(() => localStorage.removeItem("zwap_admin_key"));
    }
  }, []);
  
  const loadDashboard = async () => {
    try {
      const data = await adminApi.get("/dashboard");
      setDashboardData(data);
    } catch { toast.error("Failed to load dashboard"); }
  };
  
  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => { setIsAuthenticated(true); loadDashboard(); }} />;
  }
  
  const sections = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "users", label: "Users", icon: Users },
    { id: "treasury", label: "Treasury", icon: Database },
    { id: "games", label: "Games", icon: Gamepad2 },
    { id: "marketplace", label: "Marketplace", icon: ShoppingBag },
    { id: "swap", label: "Swap Config", icon: ArrowRightLeft },
    { id: "settings", label: "Settings", icon: Settings },
  ];
  
  return (
    <div className="min-h-screen bg-[#050510]">
      {/* Header */}
      <header className="bg-[#0a0b1e] border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-cyan-400" />
            <div>
              <h1 className="text-xl font-bold text-white">ZWAP! Admin</h1>
              <p className="text-xs text-gray-500">Mission Control</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => { localStorage.removeItem("zwap_admin_key"); setIsAuthenticated(false); }}
            className="text-gray-400 hover:text-white"
          >
            Logout
          </Button>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-gray-800">
          {sections.map((section) => (
            <SectionTab
              key={section.id}
              icon={section.icon}
              label={section.label}
              active={activeSection === section.id}
              onClick={() => setActiveSection(section.id)}
            />
          ))}
        </div>
        
        {/* Section Content */}
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {activeSection === "dashboard" && <DashboardSection data={dashboardData} onRefresh={loadDashboard} />}
          {activeSection === "users" && <UsersSection />}
          {activeSection === "treasury" && <TreasurySection />}
          {activeSection === "games" && <GamesSection />}
          {activeSection === "marketplace" && <div className="text-gray-400">Marketplace admin coming soon...</div>}
          {activeSection === "swap" && <div className="text-gray-400">Swap config coming soon...</div>}
          {activeSection === "settings" && <div className="text-gray-400">System settings coming soon...</div>}
        </motion.div>
      </div>
    </div>
  );
}
