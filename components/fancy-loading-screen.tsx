export function FancyLoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200 dark:border-gray-700 animate-pulse">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500 dark:border-blue-400 border-t-transparent animate-spin absolute top-0 left-0 [animation-duration:0.6s]"></div>
        </div>
        <div className="absolute -inset-1 rounded-full border border-blue-500/50 dark:border-blue-400/50 animate-ping"></div>
      </div>
    </div>
  )
}

