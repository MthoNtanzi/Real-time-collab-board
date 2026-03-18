import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import boardService from "../services/boardService";

export default function InvitePage() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    useEffect(() => {
        const joinBoard = async () => {
            try {
                const data = await boardService.joinBoard(token);
                if (data.board) {
                    navigate(`/board/${data.board.id}`);
                }
            } catch (err) {
                setError(err.response?.data?.error || "Invalid or expired invite link");
            }
        };
        joinBoard();
    }, [token]);

    if (error) {
        return (
            <div className="min-h-screen bg-blue-800 text-white flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold mb-2">Invite link invalid</h2>
                    <p className="text-gray-400 text-sm mb-6">{error}</p>
                    <button
                        onClick={() => navigate("/home")}
                        className="bg-indigo-600 hover:bg-indigo-500 transition-colors px-6 py-2.5 rounded-lg text-sm font-medium"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-blue-800 text-white flex items-center justify-center">
            <div className="text-center">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400 text-sm">Joining board...</p>
            </div>
        </div>
    );
}