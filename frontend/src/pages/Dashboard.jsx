import { useState, useEffect, useRef } from "react";
import { fetchCryptos, addCrypto } from "../services/api";
import CryptoCard from "../components/CryptoCard";
import { useNavigate } from "react-router-dom";
import coinList from "../data/coins.json";
import { RiLogoutBoxLine } from "react-icons/ri";

export default function Dashboard() {
  const navigate = useNavigate();

  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showPopup, setShowPopup] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const [isAdding, setIsAdding] = useState(false);

  const popupRef = useRef(null);
  const searchInputRef = useRef(null);

  // Redirect if no token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  // Load cryptos
  const loadCryptos = async () => {
    setLoading(true);
    try {
      const res = await fetchCryptos();
      setCryptos(res.data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch crypto data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCryptos();
  }, []);

  // Suggestions
  useEffect(() => {
    if (!searchInput.trim()) {
      setSuggestions([]);
      return;
    }

    const query = searchInput.toLowerCase();

    const filtered = coinList.filter(
      (coin) =>
        coin.name.toLowerCase().includes(query) ||
        coin.symbol.toLowerCase().includes(query) ||
        coin.id.toLowerCase().includes(query)
    );

    setSuggestions(filtered.slice(0, 10));
  }, [searchInput]);

  // Close popup if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        closePopup();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Add crypto
  const handleAddCrypto = async (symbol) => {
    const cryptoToAdd = (symbol || searchInput.trim()).toLowerCase();

    if (!cryptoToAdd) {
      setError("Please enter a cryptocurrency symbol");
      return;
    }

    if (isAdding) return;

    setIsAdding(true);
    setError("");

    try {
      const result = await addCrypto(cryptoToAdd);

      if (result.success) {
        await loadCryptos();
        closePopup();
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      let errorMessage =
        err.response?.data?.message || err.message || "Failed to add coin";

      if (err.response?.status === 429) {
        errorMessage = "Too many requests. Please wait a few seconds.";
      }

      // If coin already exists → refresh dashboard
      if (errorMessage.toLowerCase().includes("exists")) {
        await loadCryptos();
        closePopup();
        setIsAdding(false);
        return;
      }

      setError(errorMessage);
    } finally {
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCrypto();
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setSearchInput("");
    setSuggestions([]);
    setError("");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Crypto Dashboard
            </h1>
            <p className="text-gray-400">
              Track your favorite ❤️ cryptocurrencies
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            <RiLogoutBoxLine className="inline-block text-xl" /> Logout
          </button>
        </header>

        {/* LOADING */}
        {loading && (
          <div className="text-center text-white py-10">
            Loading your cryptocurrencies...
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="bg-red-900 text-red-200 p-4 rounded mb-4">
            {error}
          </div>
        )}

        {/* CRYPTO GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cryptos.map((crypto) => (
            <CryptoCard
              key={crypto.id || crypto.symbol}
              crypto={crypto}
              onDelete={(deletedId) =>
                setCryptos((prev) =>
                  prev.filter((c) => c.id !== deletedId)
                )
              }
            />
          ))}

          {/* ADD CARD */}
          <div
            className="bg-gray-700/40 hover:bg-gray-600 cursor-pointer flex items-center justify-center rounded-xl h-48"
            onClick={() => {
              setShowPopup(true);
              setTimeout(() => searchInputRef.current?.focus(), 100);
            }}
          >
            <span className="text-white text-4xl">+</span>
          </div>
        </div>

        {/* POPUP */}
        {showPopup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div
              ref={popupRef}
              className="bg-gray-800 rounded-xl p-6 w-80"
            >
              <h3 className="text-lg font-bold text-white mb-4">
                Add Cryptocurrency
              </h3>

              <input
                ref={searchInputRef}
                type="text"
                placeholder="bitcoin, btc, ripple..."
                value={searchInput}
                onChange={(e) =>
                  setSearchInput(e.target.value.toLowerCase())
                }
                onKeyDown={handleKeyDown}
                className="w-full bg-gray-700 text-white rounded px-3 py-2 mb-3"
              />

              {suggestions.length > 0 && (
                <ul className="max-h-40 overflow-y-auto space-y-2 mb-3">
                  {suggestions.map((coin) => (
                    <li
                      key={coin.id}
                      onClick={() => {
                        setSearchInput(coin.id.toLowerCase());
                        setSuggestions([]);
                      }}
                      className="cursor-pointer p-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
                    >
                      {coin.name} ({coin.symbol.toUpperCase()})
                    </li>
                  ))}
                </ul>
              )}

              <button
                onClick={() => handleAddCrypto()}
                disabled={!searchInput.trim() || isAdding}
                className="w-full bg-blue-600 text-white py-2 rounded-lg"
              >
                {isAdding ? "Adding..." : `Add ${searchInput}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}