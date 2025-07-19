"use client";

interface User {
    id: string;
    name: string;
    email: string;
    role: "patient" | "doctor" | "admin";
}

interface UserHeaderProps {
    user: User;
    onLogout: () => void;
}

export function UserHeader({ user, onLogout }: UserHeaderProps) {
    const getRoleColor = (role: string) => {
        switch (role) {
            case "patient":
                return "bg-green-500/20 text-green-400 border-green-500/30";
            case "doctor":
                return "bg-blue-500/20 text-blue-400 border-blue-500/30";
            case "admin":
                return "bg-purple-500/20 text-purple-400 border-purple-500/30";
            default:
                return "bg-gray-500/20 text-gray-400 border-gray-500/30";
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case "patient":
                return "👤";
            case "doctor":
                return "👨‍⚕️";
            case "admin":
                return "👑";
            default:
                return "👤";
        }
    };

    return (
        <div className="bg-gray-800/90 backdrop-blur-sm border-b border-gray-700/50 p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xl text-white font-bold">
                        {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                    </div>
                    <div>
                        <div className="flex items-center space-x-3">
                            <h2 className="text-lg font-semibold text-white">
                                {user.name}
                            </h2>
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(
                                    user.role
                                )}`}>
                                {getRoleIcon(user.role)}{" "}
                                {user.role.charAt(0).toUpperCase() +
                                    user.role.slice(1)}
                            </span>
                        </div>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                        <p className="text-gray-500 text-xs">ID: {user.id}</p>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <div className="text-right mr-4">
                        <p className="text-xs text-gray-400">Logged in</p>
                        <p className="text-xs text-green-400">● Online</p>
                    </div>
                    <button
                        onClick={onLogout}
                        className="bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-xl hover:bg-red-500/30 transition-colors text-sm flex items-center space-x-2">
                        <span>🚪</span>
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
