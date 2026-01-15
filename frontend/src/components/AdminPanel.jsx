import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, Coins, Gamepad2, ShoppingBag, ArrowRightLeft, Database, 
  Settings, AlertTriangle, TrendingUp, Shield, RefreshCw, Search,
  Pause, Play, Eye, Ban, Plus, Trash2, Edit, Save, X,
  DollarSign, Activity, BarChart3, Lock, Footprints, Bell, Globe
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
  
  async delete(endpoint) {
    const res = await fetch(`${API}/admin${endpoint}`, {
      method: "DELETE",
      headers: this.headers(),
    });
    if (!res.ok) throw new Error("API Error");
    return res.json();
  },
};

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, subValue, color = "cyan" }) => (
  <div className={`p-4 rounded-xl border border-${color}-500/30 bg-gradient-to-br from-${color}-500/10 to-transparent`}>
    <div className="flex items-start justify-between">
      <div className={`w-10 h-10 rounded-lg bg-${color}-500/20 flex items-center justify-center`}>
        <Icon className={`w-5 h-5 text-${color}-400`} />
      </div>
    </div>
    <p className="text-2xl font-bold text-white mt-3">{value}</p>
    <p className="text-sm text-gray-400">{label}</p>
    {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
  </div>
);

// Section Tab Component
const SectionTab = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
      active ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
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
  const [loading, setLoading] = useState(false);
  
  const handleLogin = async () => {
    setLoading(true);
    localStorage.setItem("zwap_admin_key", key);
    try {
      await adminApi.get("/dashboard");
      onLogin();
    } catch {
      setError("Invalid admin key");
      localStorage.removeItem("zwap_admin_key");
    }
    setLoading(false);
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
          <p className="text-gray-400 text-sm mt-1">Mission Control Access</p>
        </div>
        
        <Input
          type="password"
          placeholder="Admin Key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="mb-4 bg-gray-800 border-gray-700 h-12"
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
        />
        
        {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
        
        <Button onClick={handleLogin} disabled={loading} className="w-full h-12 bg-cyan-500 hover:bg-cyan-600">
          {loading ? "Verifying..." : "Access Admin Panel"}
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
      <Button size="sm" variant="outline" onClick={onRefresh} className="border-gray-700">
        <RefreshCw className="w-4 h-4 mr-2" /> Refresh
      </Button>
    </div>
    
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard icon={Users} label="Total Users" value={data?.users?.total || 0} color="cyan" />
      <StatCard icon={Activity} label="Active Today" value={data?.users?.active_today || 0} color="green" />
      <StatCard icon={DollarSign} label="Plus Subscribers" value={data?.users?.plus_subscribers || 0} color="purple" />
      <StatCard icon={AlertTriangle} label="Suspended" value={data?.users?.suspended || 0} color="red" />
    </div>
    
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard icon={Coins} label="ZWAP Issued Today" value={(data?.rewards?.issued_today_zwap || 0).toFixed(2)} color="cyan" />
      <StatCard icon={TrendingUp} label="zPts Issued Today" value={data?.rewards?.issued_today_zpts || 0} color="purple" />
      <StatCard icon={Gamepad2} label="Games Played Today" value={data?.activity?.games_played_today || 0} color="blue" />
    </div>
    
    <div className="p-4 rounded-xl border border-gray-700 bg-gray-800/30">
      <h3 className="text-white font-semibold mb-3">System Status</h3>
      <div className="flex flex-wrap gap-3">
        <div className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-2 ${data?.system?.claims_paused ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
          {data?.system?.claims_paused ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          Claims: {data?.system?.claims_paused ? 'Paused' : 'Active'}
        </div>
        <div className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-2 ${data?.system?.maintenance_mode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
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
  const [selectedUser, setSelectedUser] = useState(null);
  
  useEffect(() => { loadUsers(); }, []);
  
  const loadUsers = async (searchTerm = "") => {
    setLoading(true);
    try {
      const data = await adminApi.get(`/users?limit=50${searchTerm ? `&search=${searchTerm}` : ''}`);
      setUsers(data.users || []);
    } catch { toast.error("Failed to load users"); }
    setLoading(false);
  };
  
  const suspendUser = async (wallet) => {
    if (!confirm("Suspend this user?")) return;
    try {
      await adminApi.post(`/users/${wallet}/suspend`, { reason: "Admin action" });
      toast.success("User suspended");
      loadUsers(search);
    } catch { toast.error("Failed to suspend user"); }
  };
  
  const unsuspendUser = async (wallet) => {
    try {
      await adminApi.post(`/users/${wallet}/unsuspend`);
      toast.success("User unsuspended");
      loadUsers(search);
    } catch { toast.error("Failed to unsuspend user"); }
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">User Management</h2>
      
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by wallet or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadUsers(search)}
            className="pl-10 bg-gray-800 border-gray-700 h-10"
          />
        </div>
        <Button onClick={() => loadUsers(search)} className="h-10 bg-cyan-600 hover:bg-cyan-700">
          <Search className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-800/80">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Wallet</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Username</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Tier</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">ZWAP</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {users.map((user) => (
                <tr key={user.wallet_address} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-sm text-white font-mono">
                    {user.wallet_address?.slice(0, 8)}...{user.wallet_address?.slice(-4)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">{user.username || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${user.tier === 'plus' ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-700 text-gray-400'}`}>
                      {user.tier || 'starter'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-cyan-400 font-medium">{user.zwap_balance?.toFixed(2) || "0"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${user.status === 'suspended' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                      {user.status || 'active'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => setSelectedUser(user)} className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white">
                        <Eye className="w-4 h-4" />
                      </button>
                      {user.status === 'suspended' ? (
                        <button onClick={() => unsuspendUser(user.wallet_address)} className="p-1.5 rounded hover:bg-green-900/50 text-gray-400 hover:text-green-400">
                          <Play className="w-4 h-4" />
                        </button>
                      ) : (
                        <button onClick={() => suspendUser(user.wallet_address)} className="p-1.5 rounded hover:bg-red-900/50 text-gray-400 hover:text-red-400">
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading && <div className="p-8 text-center text-gray-400">Loading users...</div>}
        {!loading && users.length === 0 && <div className="p-8 text-center text-gray-400">No users found</div>}
      </div>
      
      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <motion.div 
            className="bg-[#0f1029] border border-gray-700 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg">User Details</h3>
              <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-gray-800/50 rounded-lg">
                <p className="text-xs text-gray-500">Wallet Address</p>
                <p className="text-white font-mono text-sm break-all">{selectedUser.wallet_address}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-xs text-gray-500">Username</p>
                  <p className="text-white">{selectedUser.username || "Not set"}</p>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-xs text-gray-500">Tier</p>
                  <p className="text-white capitalize">{selectedUser.tier || "starter"}</p>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-xs text-gray-500">ZWAP Balance</p>
                  <p className="text-cyan-400 font-bold">{selectedUser.zwap_balance?.toFixed(4) || "0"}</p>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-xs text-gray-500">Z Points</p>
                  <p className="text-purple-400 font-bold">{selectedUser.zpts_balance || "0"}</p>
                </div>
              </div>
            </div>
            <Button onClick={() => setSelectedUser(null)} className="w-full mt-4 bg-gray-700 hover:bg-gray-600">
              Close
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// Treasury Section
const TreasurySection = () => {
  const [treasury, setTreasury] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => { loadTreasury(); }, []);
  
  const loadTreasury = async () => {
    setLoading(true);
    try {
      const data = await adminApi.get("/treasury");
      setTreasury(data);
    } catch { toast.error("Failed to load treasury"); }
    setLoading(false);
  };
  
  const toggleClaims = async (pause) => {
    if (!confirm(pause ? "Pause all claims?" : "Resume claims?")) return;
    try {
      await adminApi.post("/treasury/action", { action: pause ? "pause_claims" : "resume_claims", reason: "Admin toggle" });
      toast.success(pause ? "Claims paused" : "Claims resumed");
      loadTreasury();
    } catch { toast.error("Action failed"); }
  };
  
  if (loading) return <div className="text-gray-400 text-center py-8">Loading treasury data...</div>;
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Treasury & Token Operations</h2>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Database} label="Treasury Balance" value={treasury?.treasury_balance?.toFixed(2) || "—"} subValue="On-chain ZWAP" color="cyan" />
        <StatCard icon={Coins} label="Total Issued" value={(treasury?.total_issued || 0).toFixed(0)} subValue="All time" color="purple" />
        <StatCard icon={TrendingUp} label="Total Claimed" value={(treasury?.total_claimed || 0).toFixed(0)} color="green" />
        <StatCard icon={Activity} label="In-App Circulating" value={(treasury?.circulating_in_app || 0).toFixed(0)} color="blue" />
      </div>
      
      <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          Emergency Controls
        </h3>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => toggleClaims(true)} variant="destructive" disabled={treasury?.claims_paused} className="bg-red-600 hover:bg-red-700">
            <Pause className="w-4 h-4 mr-2" /> Pause All Claims
          </Button>
          <Button onClick={() => toggleClaims(false)} className="bg-green-600 hover:bg-green-700" disabled={!treasury?.claims_paused}>
            <Play className="w-4 h-4 mr-2" /> Resume Claims
          </Button>
        </div>
        {treasury?.claims_paused && (
          <p className="text-red-400 text-sm mt-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Claims are currently PAUSED
          </p>
        )}
      </div>
    </div>
  );
};

// Games Section
const GamesSection = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => { loadGames(); }, []);
  
  const loadGames = async () => {
    setLoading(true);
    try {
      const data = await adminApi.get("/config/games");
      setGames(data.games || []);
    } catch { toast.error("Failed to load games"); }
    setLoading(false);
  };
  
  const toggleGame = async (gameId, currentlyEnabled) => {
    try {
      await adminApi.post(`/config/games/${gameId}/toggle?enabled=${!currentlyEnabled}`);
      toast.success(`Game ${!currentlyEnabled ? 'enabled' : 'disabled'}`);
      loadGames();
    } catch { toast.error("Failed to toggle game"); }
  };
  
  if (loading) return <div className="text-gray-400 text-center py-8">Loading games...</div>;
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Games Configuration</h2>
      
      <div className="grid gap-3">
        {games.map((game) => (
          <div key={game.game_id} className="p-4 rounded-xl border border-gray-700 bg-gray-800/30 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">{game.name || game.game_id}</h3>
                <p className="text-gray-400 text-sm">
                  Reward: {game.reward_rate || 1}x • Tier: {game.tier_required || 'starter'}
                </p>
              </div>
            </div>
            <button
              onClick={() => toggleGame(game.game_id, game.enabled)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                game.enabled ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
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

// Marketplace Section
const MarketplaceSection = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  
  useEffect(() => { loadItems(); }, []);
  
  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await adminApi.get("/marketplace/items");
      setItems(data.items || []);
    } catch { toast.error("Failed to load items"); }
    setLoading(false);
  };
  
  const deleteItem = async (itemId) => {
    if (!confirm("Delete this item?")) return;
    try {
      await adminApi.delete(`/marketplace/items/${itemId}`);
      toast.success("Item deleted");
      loadItems();
    } catch { toast.error("Failed to delete item"); }
  };
  
  if (loading) return <div className="text-gray-400 text-center py-8">Loading marketplace...</div>;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Marketplace Management</h2>
        <Button className="bg-cyan-600 hover:bg-cyan-700">
          <Plus className="w-4 h-4 mr-2" /> Add Item
        </Button>
      </div>
      
      <div className="grid gap-3">
        {items.length === 0 ? (
          <div className="text-gray-400 text-center py-8">No marketplace items</div>
        ) : (
          items.map((item) => (
            <div key={item.id || item.name} className="p-4 rounded-xl border border-gray-700 bg-gray-800/30 flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gray-700 overflow-hidden flex-shrink-0">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-gray-500" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold truncate">{item.name}</h3>
                <p className="text-gray-400 text-sm truncate">{item.description}</p>
                <div className="flex gap-3 mt-1">
                  <span className="text-cyan-400 text-sm">{item.price_zwap} ZWAP</span>
                  <span className="text-purple-400 text-sm">{item.price_zpoints} zPts</span>
                </div>
              </div>
              <div className="flex gap-1">
                <button className="p-2 rounded hover:bg-gray-700 text-gray-400 hover:text-white">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => deleteItem(item.id)} className="p-2 rounded hover:bg-red-900/50 text-gray-400 hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Swap Config Section
const SwapConfigSection = () => {
  const [config, setConfig] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => { loadConfig(); }, []);
  
  const loadConfig = async () => {
    setLoading(true);
    try {
      const data = await adminApi.get("/config/swap");
      setConfig(data.tokens || []);
    } catch { toast.error("Failed to load swap config"); }
    setLoading(false);
  };
  
  const toggleToken = async (symbol, currentlyEnabled) => {
    try {
      await adminApi.put(`/config/swap/${symbol}`, { 
        token_symbol: symbol, 
        enabled: !currentlyEnabled,
        external_url: "https://jumper.exchange"
      });
      toast.success(`${symbol} ${!currentlyEnabled ? 'enabled' : 'disabled'}`);
      loadConfig();
    } catch { toast.error("Failed to update"); }
  };
  
  if (loading) return <div className="text-gray-400 text-center py-8">Loading swap config...</div>;
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Swap Configuration</h2>
      <p className="text-gray-400 text-sm">Control which tokens can be swapped via external services.</p>
      
      <div className="grid gap-3">
        {config.map((token) => (
          <div key={token.token_symbol} className="p-4 rounded-xl border border-gray-700 bg-gray-800/30 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <ArrowRightLeft className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">{token.token_symbol}</h3>
                <p className="text-gray-500 text-xs truncate max-w-[200px]">{token.external_url}</p>
              </div>
            </div>
            <button
              onClick={() => toggleToken(token.token_symbol, token.enabled)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                token.enabled ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              }`}
            >
              {token.enabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Settings Section
const SettingsSection = () => {
  const [config, setConfig] = useState({});
  const [walkConfig, setWalkConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => { loadConfigs(); }, []);
  
  const loadConfigs = async () => {
    setLoading(true);
    try {
      const [system, walk] = await Promise.all([
        adminApi.get("/config/system"),
        adminApi.get("/config/walk")
      ]);
      setConfig(system || {});
      setWalkConfig(walk || {});
    } catch { toast.error("Failed to load settings"); }
    setLoading(false);
  };
  
  const saveWalkConfig = async () => {
    setSaving(true);
    try {
      await adminApi.put("/config/walk", walkConfig);
      toast.success("Walk config saved");
    } catch { toast.error("Failed to save"); }
    setSaving(false);
  };
  
  const toggleMaintenance = async () => {
    try {
      await adminApi.put("/config/system", { ...config, maintenance_mode: !config.maintenance_mode });
      toast.success(`Maintenance mode ${!config.maintenance_mode ? 'enabled' : 'disabled'}`);
      loadConfigs();
    } catch { toast.error("Failed to update"); }
  };
  
  if (loading) return <div className="text-gray-400 text-center py-8">Loading settings...</div>;
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">System Settings</h2>
      
      {/* System Controls */}
      <div className="p-4 rounded-xl border border-gray-700 bg-gray-800/30 space-y-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Globe className="w-5 h-5 text-cyan-400" />
          System Controls
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white">Maintenance Mode</p>
            <p className="text-gray-500 text-sm">Show maintenance message to all users</p>
          </div>
          <button
            onClick={toggleMaintenance}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              config.maintenance_mode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-700 text-gray-400'
            }`}
          >
            {config.maintenance_mode ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>
      
      {/* Walk-to-Earn Config */}
      <div className="p-4 rounded-xl border border-gray-700 bg-gray-800/30 space-y-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Footprints className="w-5 h-5 text-green-400" />
          Walk-to-Earn Settings
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-gray-400 text-sm block mb-1">Daily Step Cap</label>
            <Input
              type="number"
              value={walkConfig.daily_step_cap || 10000}
              onChange={(e) => setWalkConfig({ ...walkConfig, daily_step_cap: parseInt(e.target.value) })}
              className="bg-gray-800 border-gray-700"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm block mb-1">Steps per ZWAP</label>
            <Input
              type="number"
              value={walkConfig.steps_per_zwap || 1000}
              onChange={(e) => setWalkConfig({ ...walkConfig, steps_per_zwap: parseInt(e.target.value) })}
              className="bg-gray-800 border-gray-700"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm block mb-1">Steps per zPt</label>
            <Input
              type="number"
              value={walkConfig.steps_per_zpt || 100}
              onChange={(e) => setWalkConfig({ ...walkConfig, steps_per_zpt: parseInt(e.target.value) })}
              className="bg-gray-800 border-gray-700"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm block mb-1">Anti-Cheat Threshold</label>
            <Input
              type="number"
              value={walkConfig.anti_cheat_spike_threshold || 5000}
              onChange={(e) => setWalkConfig({ ...walkConfig, anti_cheat_spike_threshold: parseInt(e.target.value) })}
              className="bg-gray-800 border-gray-700"
            />
          </div>
        </div>
        <Button onClick={saveWalkConfig} disabled={saving} className="bg-cyan-600 hover:bg-cyan-700">
          <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Walk Config'}
        </Button>
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
      <header className="bg-[#0a0b1e] border-b border-gray-800 px-4 py-3 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-7 h-7 text-cyan-400" />
            <div>
              <h1 className="text-lg font-bold text-white">ZWAP! Admin</h1>
              <p className="text-xs text-gray-500">Mission Control</p>
            </div>
          </div>
          <Button 
            size="sm"
            variant="ghost" 
            onClick={() => { localStorage.removeItem("zwap_admin_key"); setIsAuthenticated(false); }}
            className="text-gray-400 hover:text-white"
          >
            Logout
          </Button>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="flex gap-2 mb-6 pb-4 border-b border-gray-800 overflow-x-auto">
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
        
        <motion.div key={activeSection} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {activeSection === "dashboard" && <DashboardSection data={dashboardData} onRefresh={loadDashboard} />}
          {activeSection === "users" && <UsersSection />}
          {activeSection === "treasury" && <TreasurySection />}
          {activeSection === "games" && <GamesSection />}
          {activeSection === "marketplace" && <MarketplaceSection />}
          {activeSection === "swap" && <SwapConfigSection />}
          {activeSection === "settings" && <SettingsSection />}
        </motion.div>
      </div>
    </div>
  );
}
