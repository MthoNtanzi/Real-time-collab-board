import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useBoardStore from "../store/boardStore";
import Sidebar from "../components/UI/Sidebar";

export default function HomePage() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [boardName, setBoardName] = useState("");
    const [boardDescription, setBoardDescription] = useState("");
    const [boardNameError, setBoardNameError] = useState("");
    const boards = useBoardStore((state) => state.boards);
    const fetchBoards = useBoardStore((state) => state.fetchBoards);
    const createBoard = useBoardStore((state) => state.createBoard);
    const isLoading = useBoardStore((state) => state.isLoading);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBoards();
    }, []);

    const handleCreateBoard = async (e) => {
        e.preventDefault();
        if (!boardName.trim()) {
            setBoardNameError("Board name is required");
            return;
        }
        setBoardNameError("");
        const board = await createBoard({ name: boardName, description: boardDescription });
        if (board) {
            setBoardName("");
            setBoardDescription("");
            setShowCreateModal(false);
            navigate(`/board/${board.id}`);
        }
    };

    return (
        <div className="flex min-h-screen bg-blue-800 text-white">
            <Sidebar />

            <main className="flex-1 p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold">My Boards</h1>
                        <p className="text-gray-400 text-sm mt-1">Manage and collaborate on your projects</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 transition-colors px-4 py-2.5 rounded-lg text-sm font-medium"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Board
                    </button>
                </div>

                {/* Boards Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : boards.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <div className="w-16 h-16 bg-blue-900 rounded-2xl flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No boards yet</h3>
                        <p className="text-gray-400 text-sm mb-4">Create your first board to get started</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-indigo-600 hover:bg-indigo-500 transition-colors px-4 py-2 rounded-lg text-sm font-medium"
                        >
                            Create a board
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {boards.map((board) => (
                            <div
                                key={board.id}
                                onClick={() => navigate(`/board/${board.id}`)}
                                className="bg-blue-900 border border-white/10 rounded-xl p-5 cursor-pointer hover:border-indigo-500/50 hover:bg-blue-900/80 transition-all group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold"
                                        style={{ backgroundColor: board.background_color }}
                                    >
                                        {board.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full ${board.role === "owner" ? "bg-indigo-500/20 text-indigo-300" : "bg-purple-500/20 text-purple-300"}`}>
                                        {board.role}
                                    </span>
                                </div>
                                <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">
                                    {board.name}
                                </h3>
                                {board.description && (
                                    <p className="text-gray-400 text-xs mt-1 truncate">{board.description}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Create Board Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <div className="bg-blue-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold">Create a new board</h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleCreateBoard} className="flex flex-col gap-4">
                            <div>
                                <label className="text-sm text-gray-400 mb-1.5 block">Board name</label>
                                <input
                                    type="text"
                                    value={boardName}
                                    onChange={(e) => {
                                        setBoardName(e.target.value);
                                        if (e.target.value.trim()) setBoardNameError("");
                                    }}
                                    placeholder="e.g. Marketing Campaign"
                                    autoFocus
                                    className="w-full bg-blue-800 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                                />
                                {boardNameError && (
                                    <p className="text-red-400 text-xs mt-1">{boardNameError}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 mb-1.5 block">
                                    Description
                                    <span className="text-gray-500 ml-1">(optional)</span>
                                </label>
                                <textarea
                                    value={boardDescription}
                                    onChange={(e) => setBoardDescription(e.target.value)}
                                    placeholder="What is this board for?"
                                    rows={3}
                                    className="w-full bg-blue-800 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                                />
                            </div>
                            <div className="flex gap-3 mt-2">
                                <button
                                    type="submit"
                                    disabled={isLoading || !boardName.trim()}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors py-2.5 rounded-lg text-sm font-medium"
                                >
                                    {isLoading ? "Creating..." : "Create board"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 bg-blue-800 hover:bg-blue-700 border border-white/10 transition-colors py-2.5 rounded-lg text-sm font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}