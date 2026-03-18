import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useBoardStore from "../store/boardStore";
import { getSocket } from "../socket/socketClient";
import Sidebar from "../components/UI/Sidebar";
import PresenceAvatars from "../components/Presence/PresenceAvatars";
import ListColumn from "../components/List/ListColumn";
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

    const [showAddList, setShowAddList] = useState(false);
    const [listName, setListName] = useState("");
    const moveCard = useBoardStore((state) => state.moveCard);
    const [activeCard, setActiveCard] = useState(null);
    const [activeListId, setActiveListId] = useState(null);

    const [selectedCard, setSelectedCard] = useState(null);

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

        const overList = activeBoard.lists.find(
            (l) => l.id === overId || l.cards.some((c) => c.id === overId)
        );

        if (!overList) {
            setActiveCard(null);
            setActiveListId(null);
            return;
        }

        const overCards = overList.cards;
        const overIndex = overCards.findIndex((c) => c.id === overId);
        const newPosition = overIndex >= 0
            ? (overCards[overIndex - 1]?.position + overCards[overIndex]?.position) / 2 ||
            overCards[overIndex].position - 1
            : (overCards[overCards.length - 1]?.position || 0) + 1;

        moveCard(activeId, { listId: overList.id, position: newPosition });
        setActiveCard(null);
        setActiveListId(null);
    };

    useEffect(() => {
        fetchBoard(id);

        const socket = getSocket();
        if (socket) {
            socket.emit("board:join", id);
            socket.on("card:moved", handleCardMoved);
            socket.on("presence:update", handlePresenceUpdate);
        }

        return () => {
            if (socket) {
                socket.emit("board:leave", id);
                socket.off("card:moved", handleCardMoved);
                socket.off("presence:update", handlePresenceUpdate);
            }
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

    if (isLoading || !activeBoard) {
        return (
            <div className="flex min-h-screen bg-blue-800">
                <Sidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-blue-800 text-white">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Board Header */}
                <div className="flex items-center justify-between px-8 py-5 border-b border-white/10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/home")}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-lg font-bold">{activeBoard.name}</h1>
                            {activeBoard.description && (
                                <p className="text-gray-400 text-xs mt-0.5">{activeBoard.description}</p>
                            )}
                        </div>
                    </div>
                    <PresenceAvatars />
                </div>

                {/* Lists */}
                <div className="flex-1 overflow-x-auto px-8 py-6">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCorners}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="flex gap-4 h-full items-start">
                            {activeBoard.lists.map((list) => (
                                <ListColumn key={list.id} list={list} boardId={id} onCardClick={setSelectedCard} />
                            ))}

                            {/* Add List Button */}
                            <button
                                onClick={() => setShowAddList(true)}
                                className="w-72 flex-shrink-0 bg-blue-900/50 border border-white/10 border-dashed rounded-xl p-4 flex items-center gap-2 text-gray-400 hover:text-white hover:border-white/20 transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add a list
                            </button>
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

            {selectedCard && (
                <CardModal
                    cardId={selectedCard.cardId}
                    listId={selectedCard.listId}
                    onClose={() => setSelectedCard(null)}
                />
            )}
        </div>
    );
}