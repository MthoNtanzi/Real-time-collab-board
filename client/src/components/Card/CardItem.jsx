import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import useBoardStore from "../../store/boardStore";

export default function CardItem({ card, listId, onCardClick }) {
    const [showDelete, setShowDelete] = useState(false);
    const deleteCard = useBoardStore((state) => state.deleteCard);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: card.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const handleDelete = async (e) => {
        e.stopPropagation();
        if (!window.confirm(`Delete "${card.title}"?`)) return;
        await deleteCard(card.id, listId);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`bg-blue-800 border border-white/10 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-indigo-500/50 transition-all group ${isDragging ? "shadow-lg shadow-indigo-500/20" : ""}`}
            onMouseEnter={() => setShowDelete(true)}
            onMouseLeave={() => setShowDelete(false)}
            onClick={() => onCardClick({ cardId: card.id, listId })}
        >
            <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-white truncate leading-snug line-clamp-2">{card.title}</p>
                {showDelete && (
                    <button
                        onClick={handleDelete}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="text-gray-400 hover:text-red-400 transition-colors flex-shrink-0"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {card.description && (
                <p className="text-xs text-gray-400 mt-1.5 leading-snug line-clamp-2">
                    {card.description}
                </p>
            )}

            {card.due_date && (
                <div className="flex items-center gap-1 mt-2">
                    <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs text-gray-400">
                        {new Date(card.due_date).toLocaleDateString()}
                    </span>
                </div>
            )}

            <div className="flex items-center justify-between mt-2">
                <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold"
                    style={{ backgroundColor: card.creator_avatar }}
                    title={card.creator_name}
                >
                    {card.creator_name?.charAt(0).toUpperCase()}
                </div>
            </div>
        </div>
    );
}