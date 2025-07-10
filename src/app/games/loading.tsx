export default function Loading() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg max-w-2xl mx-auto"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 mb-4 mx-auto"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mx-auto mb-4"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-full"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
