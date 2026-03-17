import { Link } from "react-router-dom";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-blue-800 text-white">
            {/* Navbar */}
            <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-sm">
                        T
                    </div>
                    <span className="font-semibold text-lg tracking-tight">Taskward</span>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        to="/login"
                        className="text-sm font-semibold text-gray-400 hover:text-white transition-colors px-4 py-2"
                    >
                        Sign in
                    </Link>
                    <Link
                        to="/register"
                        className="text-sm bg-indigo-600 hover:bg-indigo-500 transition-colors px-4 py-2 rounded-lg font-medium"
                    >
                        Get started
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <div className="flex flex-col items-center text-center px-8 pt-24 pb-16">
                <div className="inline-flex items-center gap-2 bg-indigo-950 border border-indigo-800 text-indigo-300 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                    Real-time collaboration for modern teams
                </div>

                <h1 className="text-5xl sm:text-6xl font-bold tracking-tight max-w-3xl leading-tight mb-6">
                    Manage your work,{" "}
                    <span className="text-purple-400">
                        together in real time
                    </span>
                </h1>

                <p className="text-gray-400 text-lg max-w-xl mb-10">
                    Taskward is a collaborative Kanban board that keeps your team in sync.
                    Drag, drop, and watch changes appear instantly for everyone.
                </p>
                <div className="flex items-center gap-4">
                    <Link
                        to="/register"
                        className="bg-indigo-600 hover:bg-indigo-950 transition-colors px-6 py-3 rounded-lg font-medium text-sm"
                    >
                        Start for free
                    </Link>
                    <Link
                        to="/login"
                        className="text-sm text-gray-400 hover:text-white hover:bg-indigo-600 transition-colors px-6 py-3 rounded-lg border border-white/10 hover:border-transparent"
                    >
                        Sign in to your account
                    </Link>
                </div>
            </div>
        </div>
    );
}