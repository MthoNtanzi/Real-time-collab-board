import { useState, useEffect } from "react";
import useAuthStore from "../../store/authStore";
import useBoardStore from "../../store/boardStore";
import cardService from "../../services/cardService";

export default function CardModal({ cardId, listId, onClose }) {
    const [card, setCard] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [commentBody, setCommentBody] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const currentUser = useAuthStore((state) => state.user);
    const addComment = useBoardStore((state) => state.addComment);
    const deleteComment = useBoardStore((state) => state.deleteComment);
    const deleteCard = useBoardStore((state) => state.deleteCard);
    const updateCard = useBoardStore((state) => state.updateCard);

    useEffect(() => {
        const fetchCard = async () => {
            setIsLoading(true);
            const data = await cardService.getCard(cardId);
            setCard(data);
            setTitle(data.title);
            setDescription(data.description || "");
            setDueDate(data.due_date ? new Date(data.due_date).toISOString().split("T")[0] : "");
            setIsLoading(false);
        };
        fetchCard();
    }, [cardId]);

    const handleSave = async () => {
        const updated = await updateCard(cardId, {
            title: title.trim(),
            description: description.trim(),
            dueDate: dueDate || null,
        });
        if (updated) {
            setCard((prev) => ({ ...prev, ...updated }));
            setIsEditing(false);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!commentBody.trim()) return;
        const comment = await addComment(cardId, { body: commentBody.trim() });
        if (comment) {
            setCard((prev) => ({ ...prev, comments: [...prev.comments, comment] }));
            setCommentBody("");
        }
    };

    const handleDeleteComment = async (commentId) => {
        await deleteComment(commentId);
        setCard((prev) => ({
            ...prev,
            comments: prev.comments.filter((c) => c.id !== commentId),
        }));
    };

    const handleDeleteCard = async () => {
        if (!window.confirm(`Delete "${card.title}"?`)) return;
        await deleteCard(cardId, listId);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-blue-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Modal Header */}
                        <div className="flex items-start justify-between p-6 border-b border-white/10">
                            <div className="flex-1 mr-4">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full bg-blue-800 border border-white/10 rounded-lg px-3 py-2 text-white font-bold text-lg focus:outline-none focus:border-indigo-500 transition-colors"
                                        autoFocus
                                    />
                                ) : (
                                    <h2 className="text-lg font-bold text-white">{card.title}</h2>
                                )}
                                <div className="flex items-center gap-2 mt-1">
                                    <div
                                        className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold"
                                        style={{ backgroundColor: card.creator_avatar }}
                                    >
                                        {card.creator_name?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-xs text-gray-400">Created by {card.creator_name}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={handleSave}
                                            className="bg-indigo-600 hover:bg-indigo-500 transition-colors px-3 py-1.5 rounded-lg text-xs font-medium"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="bg-blue-800 hover:bg-blue-700 border border-white/10 transition-colors px-3 py-1.5 rounded-lg text-xs font-medium"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                )}
                                <button
                                    onClick={handleDeleteCard}
                                    className="text-gray-400 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-white/10"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 flex flex-col gap-6">
                            {/* Description */}
                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                                    Description
                                </label>
                                {isEditing ? (
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Add a description..."
                                        rows={4}
                                        className="w-full bg-blue-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                                    />
                                ) : (
                                    <p className="text-sm text-gray-300 leading-relaxed">
                                        {card.description || <span className="text-gray-500 italic">No description</span>}
                                    </p>
                                )}
                            </div>

                            {/* Due Date */}
                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                                    Due Date
                                </label>
                                {isEditing ? (
                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="bg-blue-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                    />
                                ) : (
                                    <p className="text-sm text-gray-300">
                                        {card.due_date
                                            ? new Date(card.due_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                                            : <span className="text-gray-500 italic">No due date</span>
                                        }
                                    </p>
                                )}
                            </div>

                            {/* Comments */}
                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 block">
                                    Comments ({card.comments.length})
                                </label>

                                <div className="flex flex-col gap-4 mb-4">
                                    {card.comments.length === 0 ? (
                                        <p className="text-sm text-gray-500 italic">No comments yet</p>
                                    ) : (
                                        card.comments.map((comment) => (
                                            <div key={comment.id} className="flex gap-3">
                                                <div
                                                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                                                    style={{ backgroundColor: comment.author_avatar }}
                                                >
                                                    {comment.author_name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-xs font-semibold text-white">{comment.author_name}</span>
                                                        <span className="text-xs text-gray-500">
                                                            {new Date(comment.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-300 mt-1 leading-relaxed">{comment.body}</p>
                                                    {comment.author_id === currentUser?.id && (
                                                        <button
                                                            onClick={() => handleDeleteComment(comment.id)}
                                                            className="text-xs text-gray-500 hover:text-red-400 transition-colors mt-1"
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Add Comment */}
                                <form onSubmit={handleAddComment} className="flex gap-3">
                                    <div
                                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                                        style={{ backgroundColor: currentUser?.avatar_color }}
                                    >
                                        {currentUser?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 flex gap-2">
                                        <input
                                            type="text"
                                            value={commentBody}
                                            onChange={(e) => setCommentBody(e.target.value)}
                                            placeholder="Write a comment..."
                                            className="flex-1 bg-blue-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!commentBody.trim()}
                                            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors px-4 py-2 rounded-lg text-sm font-medium"
                                        >
                                            Post
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}