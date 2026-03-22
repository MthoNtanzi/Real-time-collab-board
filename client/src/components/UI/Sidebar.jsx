import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import useBoardStore from "../../store/boardStore";

export default function Sidebar({ isOpen, onClose }) {
    const [boardsExpanded, setBoardsExpanded] = useState(true);
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const boards = useBoardStore((state) => state.boards);
    const navigate = useNavigate();
    const location = useLocation();
    const fetchBoards = useBoardStore((state) => state.fetchBoards);

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    useEffect(() => {
        fetchBoards();
    }, []);

    return (
        <>
            {/* Overlay — mobile only */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={`
                fixed top-0 left-0 h-screen z-40 w-48 bg-blue-900 border-r border-white/10 flex flex-col
                transform transition-transform duration-300 ease-in-out
                lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:z-auto
                ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            `}>
                {/* Logo */}
                <div className="px-6 py-5 border-b border-white/10">
                    <Link to="/home" className="flex items-center gap-2" onClick={onClose}>
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-sm">
                            T
                        </div>
                        <span className="font-semibold text-lg tracking-tight text-white">Taskward</span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
                    <Link
                        to="/home"
                        onClick={onClose}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${location.pathname === "/home"
                            ? "bg-indigo-600 text-white"
                            : "text-gray-300 hover:text-white hover:bg-white/10"
                            }`}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Home
                    </Link>

                    <div>
                        <button
                            onClick={() => setBoardsExpanded(!boardsExpanded)}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
                                </svg>
                                Boards
                            </div>
                            <svg
                                className={`w-3.5 h-3.5 transition-transform ${boardsExpanded ? "rotate-180" : ""}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {boardsExpanded && (
                            <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-white/10 pl-3">
                                {boards.length === 0 ? (
                                    <p className="text-xs text-gray-500 px-3 py-2">No boards yet</p>
                                ) : (
                                    boards.map((board) => (
                                        <Link
                                            key={board.id}
                                            to={`/board/${board.id}`}
                                            onClick={onClose}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors truncate ${location.pathname === `/board/${board.id}`
                                                ? "bg-indigo-600/30 text-indigo-300"
                                                : "text-gray-400 hover:text-white hover:bg-white/10"
                                                }`}
                                        >
                                            <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0 bg-indigo-500" />
                                            <span className="truncate">{board.name}</span>
                                        </Link>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </nav>

                {/* User */}
                <div className="px-3 py-4 border-t border-white/10">
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
                            style={{ backgroundColor: user?.avatar_color }}
                        >
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-gray-400 hover:text-white transition-colors"
                            title="Logout"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}