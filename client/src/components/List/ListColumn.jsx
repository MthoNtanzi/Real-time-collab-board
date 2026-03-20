import { useState } from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import useBoardStore from "../../store/boardStore";
import CardItem from "../Card/CardItem";

export default function ListColumn({ list, boardId, onCardClick }) {
    const [showAddCard, setShowAddCard] = useState(false);
    const [cardTitle, setCardTitle] = useState("");
    const createCard = useBoardStore((state) => state.createCard);
    const deleteList = useBoardStore((state) => state.deleteList);

    const { setNodeRef: setDroppableRef } = useDroppable({
        id: list.id,
    });

    const handleAddCard = async (e) => {
        e.preventDefault();
        if (!cardTitle.trim()) return;
        await createCard({ title: cardTitle, listId: list.id, boardId });
        setCardTitle("");
        setShowAddCard(false);
    };

    const handleDeleteList = async () => {
        if (!window.confirm(`Delete "${list.name}" and all its cards?`)) return;
        await deleteList(list.id);
    };

    return (
        <div className="w-72 flex-shrink-0 bg-blue-600 rounded-xl flex p-3 flex-col max-h-[calc(100vh-10rem)]">
            {/* List Header */}
            <div className="flex items-center justify-between bg-indigo-600 px-4 py-3 rounded-full">
                <h3 className="font-bold text-sm text-white truncate">{list.name}</h3>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{list.cards.length}</span>
                    <button
                        onClick={handleDeleteList}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Cards */}
            <div ref={setDroppableRef} className="flex-1 overflow-y-auto py-3 flex flex-col gap-2">
                <SortableContext
                    items={list.cards.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {list.cards.map((card) => (
                        <CardItem key={card.id} card={card} listId={list.id} onCardClick={onCardClick} />
                    ))}
                </SortableContext>
            </div>

            {/* Add Card */}
            <div className="px-3 py-3 border-t border-white/10">
                {showAddCard ? (
                    <form onSubmit={handleAddCard} className="flex flex-col gap-2">
                        <input
                            type="text"
                            value={cardTitle}
                            onChange={(e) => setCardTitle(e.target.value)}
                            placeholder="Card title"
                            autoFocus
                            className="w-full bg-blue-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={!cardTitle.trim()}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors py-1.5 rounded-lg text-xs font-medium"
                            >
                                Add card
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddCard(false);
                                    setCardTitle("");
                                }}
                                className="flex-1 bg-blue-800 hover:bg-blue-700 border border-white/10 transition-colors py-1.5 rounded-lg text-xs font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <button
                        onClick={() => setShowAddCard(true)}
                        className="w-full flex items-center gap-2 text-gray-400 hover:text-white hover:bg-white/5 transition-colors px-2 py-1.5 rounded-lg text-sm"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add a card
                    </button>
                )}
            </div>
        </div>
    );
}