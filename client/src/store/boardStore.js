import { create } from "zustand";
import boardService from "../services/boardService";
import listService from "../services/listService";
import cardService from "../services/cardService";

const useBoardStore = create((set, get) => ({
    boards: [],
    activeBoard: null,
    presenceUsers: [],
    isLoading: false,
    error: null,

    fetchBoards: async () => {
        set({ isLoading: true, error: null });
        try {
            const boards = await boardService.getBoards();
            set({ boards, isLoading: false });
        } catch (err) {
            set({ error: err.response?.data?.error || "Failed to fetch boards", isLoading: false });
        }
    },

    fetchBoard: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const board = await boardService.getBoard(id);
            set({ activeBoard: board, isLoading: false });
        } catch (err) {
            set({ error: err.response?.data?.error || "Failed to fetch board", isLoading: false });
        }
    },

    createBoard: async ({ name, description, backgroundColor }) => {
        try {
            const board = await boardService.createBoard({ name, description, backgroundColor });
            set((state) => ({ boards: [board, ...state.boards] }));
            return board;
        } catch (err) {
            set({ error: err.response?.data?.error || "Failed to create board" });
        }
    },

    deleteBoard: async (id) => {
        try {
            await boardService.deleteBoard(id);
            set((state) => ({ boards: state.boards.filter((b) => b.id !== id) }));
        } catch (err) {
            set({ error: err.response?.data?.error || "Failed to delete board" });
        }
    },
    // List actions
    createList: async ({ name, boardId }) => {
        try {
            const list = await listService.createList({ name, boardId });
            set((state) => ({
                activeBoard: {
                    ...state.activeBoard,
                    lists: [...state.activeBoard.lists, { ...list, cards: [] }],
                },
            }));
        } catch (err) {
            set({ error: err.response?.data?.error || "Failed to create list" });
        }
    },

    deleteList: async (id) => {
        try {
            await listService.deleteList(id);
            set((state) => ({
                activeBoard: {
                    ...state.activeBoard,
                    lists: state.activeBoard.lists.filter((l) => l.id !== id),
                },
            }));
        } catch (err) {
            set({ error: err.response?.data?.error || "Failed to delete list" });
        }
    },

    // Card actions
    createCard: async ({ title, listId, boardId, description, dueDate }) => {
        try {
            const card = await cardService.createCard({ title, listId, boardId, description, dueDate });
            set((state) => ({
                activeBoard: {
                    ...state.activeBoard,
                    lists: state.activeBoard.lists.map((list) =>
                        list.id === listId
                            ? { ...list, cards: [...list.cards, card] }
                            : list
                    ),
                },
            }));
        } catch (err) {
            set({ error: err.response?.data?.error || "Failed to create card" });
        }
    },

    deleteCard: async (id, listId) => {
        try {
            await cardService.deleteCard(id);
            set((state) => ({
                activeBoard: {
                    ...state.activeBoard,
                    lists: state.activeBoard.lists.map((list) =>
                        list.id === listId
                            ? { ...list, cards: list.cards.filter((c) => c.id !== id) }
                            : list
                    ),
                },
            }));
        } catch (err) {
            set({ error: err.response?.data?.error || "Failed to delete card" });
        }
    },

    moveCard: async (cardId, { listId, position }) => {
        const state = get();
        const previousBoard = state.activeBoard;

        // Optimistic update
        set((state) => ({
            activeBoard: {
                ...state.activeBoard,
                lists: state.activeBoard.lists.map((list) => {
                    const filteredCards = list.cards.filter((c) => c.id !== cardId);

                    if (list.id === listId) {
                        const movedCard = previousBoard.lists
                            .flatMap((l) => l.cards)
                            .find((c) => c.id === cardId);
                        const updatedCards = [...filteredCards, { ...movedCard, list_id: listId, position }];

                        return { ...list, cards: updatedCards.sort((a, b) => a.position - b.position) };
                    }

                    return { ...list, cards: filteredCards };
                }),
            },
        }));

        try {
            await cardService.moveCard(cardId, { listId, position });

            // Emit socket event for real-time sync
            const { getSocket } = await import("../socket/socketClient");
            const socket = getSocket();
            if (socket) {
                socket.emit("card:move", {
                    cardId,
                    listId,
                    position,
                    boardId: previousBoard.id,
                });
            }
        } catch (err) {
            set({ activeBoard: previousBoard });
            set({ error: err.response?.data?.error || "Failed to move card" });
        }
    },

    // Socket actions
    handleCardMoved: ({ cardId, listId, position }) => {
        const state = get();
        const previousBoard = state.activeBoard;
        const movedCard = previousBoard.lists
            .flatMap((l) => l.cards)
            .find((c) => c.id === cardId);

        if (!movedCard) return;

        set((state) => ({
            activeBoard: {
                ...state.activeBoard,
                lists: state.activeBoard.lists.map((list) => {
                    const filteredCards = list.cards.filter((c) => c.id !== cardId);
                    if (list.id === listId) {
                        const updatedCards = [...filteredCards, { ...movedCard, list_id: listId, position }];
                        return { ...list, cards: updatedCards.sort((a, b) => a.position - b.position) };
                    }
                    return { ...list, cards: filteredCards };
                }),
            },
        }));
    },

    handlePresenceUpdate: ({ users }) => {
        set({ presenceUsers: users });
    },

    clearActiveBoard: () => {
        set({ activeBoard: null, presenceUsers: [] });
    },

    addComment: async (cardId, { body }) => {
        try {
            const comment = await cardService.createComment(cardId, { body });
            return comment;
        } catch (err) {
            set({ error: err.response?.data?.error || "Failed to add comment" });
        }
    },

    deleteComment: async (commentId) => {
        try {
            await cardService.deleteComment(commentId);
        } catch (err) {
            set({ error: err.response?.data?.error || "Failed to delete comment" });
        }
    },

    updateCard: async (cardId, { title, description, dueDate }) => {
        try {
            const updated = await cardService.updateCard(cardId, { title, description, dueDate });
            set((state) => ({
                activeBoard: {
                    ...state.activeBoard,
                    lists: state.activeBoard.lists.map((list) => ({
                        ...list,
                        cards: list.cards.map((card) =>
                            card.id === cardId ? { ...card, ...updated } : card
                        ),
                    })),
                },
            }));
            return updated;
        } catch (err) {
            set({ error: err.response?.data?.error || "Failed to update card" });
        }
    },
}));

export default useBoardStore;