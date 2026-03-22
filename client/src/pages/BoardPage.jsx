import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useBoardStore from "../store/boardStore";
import useAuthStore from "../store/authStore";
import { getSocket } from "../socket/socketClient";
import Sidebar from "../components/UI/Sidebar";
import PresenceAvatars from "../components/Presence/PresenceAvatars";
import ListColumn from "../components/List/ListColumn";
import boardService from "../services/boardService";
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
} from "@dnd-kit/core";
import CardItem from "../components/Card/CardItem";
import CardModal from "../components/Card/CardModal";

export default function BoardPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const fetchBoard = useBoardStore((state) => state.fetchBoard);
    const activeBoard = useBoardStore((state) => state.activeBoard);
    const clearActiveBoard = useBoardStore((state) => state.clearActiveBoard);
    const handleCardMoved = useBoardStore((state) => state.handleCardMoved);
    const handlePresenceUpdate = useBoardStore((state) => state.handlePresenceUpdate);
    const createList = useBoardStore((state) => state.createList);
    const isLoading = useBoardStore((state) => state.isLoading);
    const currentUser = useAuthStore((state) => state.user);
    const deleteBoard = useBoardStore((state) => state.deleteBoard);
    const [copied, setCopied] = useState(false);
    const error = useBoardStore((state) => state.error);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [isOnline, setIsOnline] = useState(true);
    const [socketConnected, setSocketConnected] = useState(true);

    const [showAddList, setShowAddList] = useState(false);
    const [listName, setListName] = useState("");
    const moveCard = useBoardStore((state) => state.moveCard);
    const [activeCard, setActiveCard] = useState(null);
    const [activeListId, setActiveListId] = useState(null);

    const [selectedCard, setSelectedCard] = useState(null);
    const [inviteUrl, setInviteUrl] = useState(null);
    const [showInviteModal, setShowInviteModal] = useState(false);

    const handleCardMovedRef = useRef(handleCardMoved);
    const handlePresenceUpdateRef = useRef(handlePresenceUpdate);

    const handleCardCreated = useBoardStore((state) => state.handleCardCreated);
    const handleCardCreatedRef = useRef(handleCardCreated);

    const handleListCreated = useBoardStore((state) => state.handleListCreated);
    const handleListDeleted = useBoardStore((state) => state.handleListDeleted);
    const handleCardDeleted = useBoardStore((state) => state.handleCardDeleted);
    const handleCardUpdated = useBoardStore((state) => state.handleCardUpdated);

    const handleListCreatedRef = useRef(handleListCreated);
    const handleListDeletedRef = useRef(handleListDeleted);
    const handleCardDeletedRef = useRef(handleCardDeleted);
    const handleCardUpdatedRef = useRef(handleCardUpdated);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragStart = (event) => {
        const { active } = event;
        const card = activeBoard.lists
            .flatMap((l) => l.cards)
            .find((c) => c.id === active.id);
        const list = activeBoard.lists.find((l) =>
            l.cards.some((c) => c.id === active.id)
        );
        setActiveCard(card);
        setActiveListId(list?.id);
    };

    const handleDragOver = (event) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const activeList = activeBoard.lists.find((l) =>
            l.cards.some((c) => c.id === activeId)
        );
        const overList = activeBoard.lists.find(
            (l) => l.id === overId || l.cards.some((c) => c.id === overId)
        );

        if (!activeList || !overList || activeList.id === overList.id) return;

        const overCards = overList.cards;
        const overIndex = overCards.findIndex((c) => c.id === overId);
        const newPosition = overIndex >= 0
            ? (overCards[overIndex - 1]?.position + overCards[overIndex]?.position) / 2 ||
            overCards[overIndex].position - 1
            : (overCards[overCards.length - 1]?.position || 0) + 1;

        moveCard(activeId, { listId: overList.id, position: newPosition });
        setActiveListId(overList.id);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over) {
            setActiveCard(null);
            setActiveListId(null);
            return;
        }

        const activeId = active.id;
        const overId = over.id;

        // If dropped on itself, do nothing
        if (activeId === overId) {
            setActiveCard(null);
            setActiveListId(null);
            return;
        }

        const overList = activeBoard.lists.find(
            (l) => l.id === overId || l.cards.some((c) => c.id === overId)
        );

        if (!overList) {
            setActiveCard(null);
            setActiveListId(null);
            return;
        }

        // Check if card is already in this list at the same position
        const overCards = overList.cards;
        const overIndex = overCards.findIndex((c) => c.id === overId);
        const newPosition = overIndex >= 0
            ? (overCards[overIndex - 1]?.position + overCards[overIndex]?.position) / 2 ||
            overCards[overIndex].position - 1
            : (overCards[overCards.length - 1]?.position || 0) + 1;

        const currentCard = activeBoard.lists
            .flatMap((l) => l.cards)
            .find((c) => c.id === activeId);

        if (currentCard?.list_id === overList.id && currentCard?.position === newPosition) {
            setActiveCard(null);
            setActiveListId(null);
            return;
        }

        moveCard(activeId, { listId: overList.id, position: newPosition });
        setActiveCard(null);
        setActiveListId(null);
    };

    const handleCreateInvite = async () => {
        const data = await boardService.createInvite(id);
        if (data) {
            setInviteUrl(data.inviteUrl);
            setShowInviteModal(true);
        }
    };

    useEffect(() => {
        if (activeBoard) {
            document.title = `${activeBoard.name} | Taskward`;
        }
        return () => {
            document.title = "Taskward";
        };
    }, [activeBoard]);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
        }
        const handleOffline = () => {
            setIsOnline(false);
        }

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    useEffect(() => {
        handleCardMovedRef.current = handleCardMoved;
        handlePresenceUpdateRef.current = handlePresenceUpdate;
    }, [handleCardMoved, handlePresenceUpdate]);

    useEffect(() => {
        handleCardCreatedRef.current = handleCardCreated;
    }, [handleCardCreated]);

    useEffect(() => {
        fetchBoard(id);

        const socket = getSocket();
        if (socket) {


            socket.emit("board:join", id);

            const onCardMoved = (data) => {
                handleCardMovedRef.current(data);
            };
            const onPresenceUpdate = (data) => handlePresenceUpdateRef.current(data);
            const onCardCreated = (data) => handleCardCreatedRef.current(data);
            const onListCreated = (data) => handleListCreatedRef.current(data);
            const onListDeleted = (data) => handleListDeletedRef.current(data);
            const onCardDeleted = (data) => handleCardDeletedRef.current(data);
            const onCardUpdated = (data) => handleCardUpdatedRef.current(data);

            const onConnect = () => {
                setSocketConnected(true);
                socket.emit("board:join", id);
            };

            const onDisconnect = () => setSocketConnected(false);

            socket.on("card:moved", onCardMoved);
            socket.on("presence:update", onPresenceUpdate);
            socket.on("card:created", onCardCreated);
            socket.on("list:created", onListCreated);
            socket.on("list:deleted", onListDeleted);
            socket.on("card:deleted", onCardDeleted);
            socket.on("card:updated", onCardUpdated);
            socket.on("connect", onConnect);
            socket.on("disconnect", onDisconnect);

            return () => {
                socket.emit("board:leave", id);
                socket.off("card:moved", onCardMoved);
                socket.off("presence:update", onPresenceUpdate);
                socket.off("card:created", onCardCreated);
                socket.off("list:created", onListCreated);
                socket.off("list:deleted", onListDeleted);
                socket.off("card:deleted", onCardDeleted);
                socket.off("card:updated", onCardUpdated);
                socket.off("connect", onConnect);
                socket.off("disconnect", onDisconnect);
                clearActiveBoard();
            };
        }

        return () => {
            clearActiveBoard();
        };
    }, [id]);

    const handleAddList = async (e) => {
        e.preventDefault();
        if (!listName.trim()) return;
        await createList({ name: listName, boardId: id });
        setListName("");
        setShowAddList(false);
    };


    useEffect(() => {
        handleListCreatedRef.current = handleListCreated;
        handleListDeletedRef.current = handleListDeleted;
        handleCardDeletedRef.current = handleCardDeleted;
        handleCardUpdatedRef.current = handleCardUpdated;
    }, [handleListCreated, handleListDeleted, handleCardDeleted, handleCardUpdated]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen bg-blue-800">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    if (!activeBoard) {
        return (
            <div className="flex min-h-screen bg-blue-800">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div className="flex-1 flex items-center justify-center px-4">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-blue-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-xl text-white font-bold mb-2">Board not found</h2>
                        <p className="text-red-400 text-sm mb-6">
                            {error || "This board doesn't exist or you don't have access to it."}
                        </p>
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-gray-400 hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <button
                            onClick={() => navigate("/home")}
                            className="bg-indigo-600 hover:bg-indigo-500 hover:text-white transition-colors px-6 py-2.5 rounded-lg text-sm font-medium"
                        >
                            Go to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-blue-800 text-white">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Board Header */}
                <div className="flex items-center justify-between px-8 py-5 border-b border-white/10">

                    <div className="flex items-center justify-between gap-2 mr-8">
                        <button
                            onClick={() => navigate("/home")}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-lg font-bold truncate max-w-xs">{activeBoard.name}</h1>
                            {activeBoard.description && (
                                <p className="text-gray-400 text-xs mt-0.5">{activeBoard.description}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        {/* Invite Button */}
                        {activeBoard.owner_id === currentUser?.id && (
                            <button
                                onClick={handleCreateInvite}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 transition-colors px-3 py-1.5 rounded-lg text-sm font-medium"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                                Invite
                            </button>
                        )}

                        {/* Delete Button */}
                        {activeBoard.owner_id === currentUser?.id && (
                            <button
                                onClick={async () => {
                                    if (!window.confirm(`Delete "${activeBoard.name}" and everything in it?`)) return;
                                    await deleteBoard(activeBoard.id);
                                    navigate("/home");
                                }}
                                className="text-gray-400 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-white/10"
                                title="Delete board"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        )}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-gray-400 hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <PresenceAvatars />
                    </div>

                </div>

                {!isOnline && (
                    <div className="bg-red-500/10 border-b border-red-500/20 px-8 py-2.5 flex items-center gap-2">
                        <p className="text-red-400 text-sm">
                            You are offline. Changes will not be saved until your connection is restored.
                        </p>
                    </div>
                )}

                {!socketConnected && isOnline && (
                    <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-8 py-2.5 flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                        <p className="text-yellow-400 text-sm">
                            Reconnecting to real-time sync...
                        </p>
                    </div>
                )}

                {/* Lists */}
                <div className="flex-1 overflow-x-auto">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCorners}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="px-8 py-6 min-w-max">
                            <div className="flex gap-4 items-start">
                                {activeBoard.lists.map((list) => (
                                    <ListColumn key={list.id} list={list} boardId={id} onCardClick={setSelectedCard} />
                                ))}

                                {/* Add List Button */}
                                <button
                                    onClick={() => setShowAddList(true)}
                                    className="w-72 flex-shrink-0 bg-blue-900/70 border border-white/10 border-dashed rounded-xl p-4 flex items-center gap-2 text-gray-400 hover:text-white hover:border-white/20 transition-all"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add a list
                                </button>
                            </div>
                        </div>

                        <DragOverlay>
                            {activeCard && (
                                <CardItem card={activeCard} listId={activeListId} />
                            )}
                        </DragOverlay>
                    </DndContext>
                </div>
            </div>


            {/* Add List Modal */}
            {
                showAddList && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                        <div className="bg-blue-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold">Add a list</h2>
                                <button
                                    onClick={() => setShowAddList(false)}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleAddList} className="flex flex-col gap-4">
                                <div>
                                    <label className="text-sm text-gray-400 mb-1.5 block">List name</label>
                                    <input
                                        type="text"
                                        value={listName}
                                        onChange={(e) => setListName(e.target.value)}
                                        placeholder="e.g. To Do"
                                        autoFocus
                                        className="w-full bg-blue-800 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={!listName.trim()}
                                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors py-2.5 rounded-lg text-sm font-medium"
                                    >
                                        Add lists
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddList(false)}
                                        className="flex-1 bg-blue-800 hover:bg-blue-700 border border-white/10 transition-colors py-2.5 rounded-lg text-sm font-medium"
                                    >
                                        Cancel
                                    </button>

                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {
                selectedCard && (
                    <CardModal
                        cardId={selectedCard.cardId}
                        listId={selectedCard.listId}
                        onClose={() => setSelectedCard(null)}
                    />
                )
            }

            {
                showInviteModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                        <div className="bg-blue-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold">Invite to board</h2>
                                <button
                                    onClick={() => setShowInviteModal(false)}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <p className="text-sm text-gray-400 mb-4">
                                Share this link with anyone you want to invite to this board. The link expires in 7 days.
                            </p>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={inviteUrl || ""}
                                    readOnly
                                    className="flex-1 bg-blue-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                                />
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(inviteUrl);
                                        setCopied(true);
                                        setTimeout(() => {
                                            setCopied(false);
                                            setShowInviteModal(false);
                                        }, 1500);
                                    }}
                                    className="bg-indigo-600 hover:bg-indigo-500 transition-colors px-4 py-2 rounded-lg text-sm font-medium"
                                >
                                    {copied ? "Copied!" : "Copy"}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}