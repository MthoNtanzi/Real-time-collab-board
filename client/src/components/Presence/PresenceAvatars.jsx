import useBoardStore from "../../store/boardStore";
import useAuthStore from "../../store/authStore";

export default function PresenceAvatars() {
    const presenceUsers = useBoardStore((state) => state.presenceUsers);
    const currentUser = useAuthStore((state) => state.user);

    const otherUsers = presenceUsers.filter((u) => u.id !== currentUser?.id);

    if (otherUsers.length === 0) return null;

    return (
        <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 mr-1">Also viewing:</span>
            <div className="flex -space-x-2">
                {otherUsers.slice(0, 4).map((user) => (
                    <div
                        key={user.id}
                        className="w-8 h-8 rounded-full border-2 border-gray-100 flex items-center justify-center text-xs font-semibold"
                        style={{ backgroundColor: user.avatar_color }}
                        title={user.name}
                    >
                        {user.name?.charAt(0).toUpperCase()}
                    </div>
                ))}
                {otherUsers.length > 4 && (
                    <div className="w-8 h-8 rounded-full border-2 border-gray-100 bg-blue-200 flex items-center justify-center text-xs font-semibold text-gray-300">
                        +{otherUsers.length - 4}
                    </div>
                )}
            </div>
        </div>
    );
}