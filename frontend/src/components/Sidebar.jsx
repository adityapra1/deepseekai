import React, { useState, useEffect } from "react";
import { Search, PanelLeftClose, Plus, MoreHorizontal, LogOut } from "lucide-react"; 
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import axios from "axios"; 

function Sidebar({ onClose }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const [, setAuthUser] = useAuth();
  const navigate = useNavigate();
  
  const [historyGroups, setHistoryGroups] = useState([]);
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);

  // Load history strictly from local storage (No fake data)
  const loadHistory = () => {
    if (user) {
      const stored = localStorage.getItem(`promtHistory_${user._id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Extract only the user's actual real messages
        const realMessages = parsed
          .filter(msg => msg.role === "user")
          .map(msg => msg.content)
          .reverse(); // Newest first

        if (realMessages.length > 0) {
          // Put your real history under a "Recent Chats" heading
          setHistoryGroups([
            {
              title: "Recent Chats",
              items: realMessages
            }
          ]);
        } else {
          setHistoryGroups([]);
        }
      } else {
        setHistoryGroups([]);
      }
    }
  };

  useEffect(() => {
    loadHistory();
    // Listen for custom event from Promt.jsx to update live
    window.addEventListener("chatUpdated", loadHistory);
    return () => window.removeEventListener("chatUpdated", loadHistory);
  }, []);

  const handleLogout = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:4002/api/v1/user/logout",
        {
          withCredentials: true,
        }
      );

      localStorage.removeItem("user");
      localStorage.removeItem("token");
      alert(data.message);
      setAuthUser(null);
      navigate("/login");
    } catch (error) {
      alert(error?.response?.data?.errors || "Logout Failed");
    }
  };

  return (
    <>
      {/* ➤ Sidebar Specific Hover-Only Scrollbar */}
      <style>{`
        .sidebar-scroll {
          overflow-y: auto;
          overflow-x: hidden;
          scrollbar-width: thin;
          scrollbar-color: transparent transparent;
          transition: scrollbar-color 0.3s ease;
        }
        .sidebar-scroll:hover {
          scrollbar-color: #4b5563 transparent;
        }
        
        .sidebar-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background-color: transparent; /* Invisible by default */
          border-radius: 10px;
        }
        .sidebar-scroll:hover::-webkit-scrollbar-thumb {
          background-color: #4b5563; /* Shows up on hover */
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #6b7280;
        }
      `}</style>

      <div className="h-full flex flex-col justify-between bg-[#1a1a1c] md:bg-[#1e1e1e] border-r border-gray-800">
        
        {/* Header & History Container */}
        <div className="flex flex-col flex-1 overflow-hidden pt-3">
          
          {/* Top Header */}
          <div className="flex justify-between items-center mb-6 px-3">
            <div className="flex items-center gap-2 text-blue-500">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5c-2.48 0-4.5-2.02-4.5-4.5S8.52 7.5 11 7.5s4.5 2.02 4.5 4.5c0 .76-.19 1.48-.52 2.11l-1.39-1.39c.26-.45.41-.97.41-1.53 0-1.65-1.35-3-3-3s-3 1.35-3 3 1.35 3 3 3c.56 0 1.08-.15 1.53-.41l1.39 1.39C13.48 16.31 12.76 16.5 11 16.5z"/>
              </svg>
              <div className="text-xl font-bold text-gray-200 tracking-wide">deepseek</div>
            </div>
            <div className="flex items-center gap-1">
              <button className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-md hover:bg-gray-800">
                <Search className="w-5 h-5" />
              </button>
              <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-md hover:bg-gray-800">
                <PanelLeftClose className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* New Chat Button */}
          <div className="px-3">
            <button className="w-full flex items-center justify-center gap-2 bg-[#2a2a2f] hover:bg-[#35353b] text-gray-200 px-4 py-2.5 rounded-full mb-4 transition-colors font-medium text-sm">
              <Plus className="w-4 h-4" />
              New chat
            </button>
          </div>

          {/* Scrollable History List */}
          <div className="flex-1 sidebar-scroll pb-4">
            {historyGroups.length > 0 ? (
              historyGroups.map((group, gIndex) => (
                <div key={gIndex} className="mb-5 last:mb-0">
                  <div className="text-[12px] text-gray-500 font-medium mb-1.5 px-4 tracking-wide uppercase">
                    {group.title}
                  </div>
                  <div className="flex flex-col gap-0.5 px-2">
                    {group.items.map((item, iIndex) => (
                      <button
                        key={iIndex}
                        className="w-full text-left px-2 py-2 rounded-lg hover:bg-[#2a2a2f] text-[#d1d5db] transition-colors text-sm truncate"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-sm mt-10 text-center">
                No chat history yet
              </div>
            )}
          </div>
        </div>

        {/* Footer Area */}
        <div className="p-3 flex-shrink-0 relative">
          <button 
            onClick={() => setShowLogoutMenu(!showLogoutMenu)}
            className="w-full flex items-center justify-between hover:bg-[#2a2a2f] p-2 rounded-xl transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <img
                src="https://i.pravatar.cc/32"
                alt="profile"
                className="rounded-full w-8 h-8 flex-shrink-0"
              />
              <span className="text-gray-300 font-medium text-sm truncate">
                {user ? user?.firstName : "My Profile"}
              </span>
            </div>
            <MoreHorizontal className="w-5 h-5 text-gray-500 flex-shrink-0" />
          </button>

          {/* Floating Logout Menu */}
          {showLogoutMenu && user && (
            <div className="absolute bottom-16 left-3 right-3 bg-[#2a2a2f] border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 text-red-400 text-sm px-4 py-3 hover:bg-[#35353b] transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Sidebar;