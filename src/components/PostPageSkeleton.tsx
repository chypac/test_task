const CommentSkeleton = () => (
  <div className="bg-gray-800 p-4 rounded-lg animate-pulse">
    <div className="h-4 bg-gray-700 rounded w-1/4 mb-3"></div>
    <div className="h-4 bg-gray-700 rounded w-full"></div>
  </div>
);

const PostPageSkeleton = () => {
  return (
    <div className="bg-gray-900 min-h-screen text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Back button skeleton */}
        <div className="h-10 w-24 bg-gray-700 rounded mb-8 animate-pulse"></div>

        {/* Post skeleton */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>

        {/* Comments section skeleton */}
        <div className="h-7 bg-gray-700 rounded w-1/3 mb-6 animate-pulse"></div>
        <div className="space-y-4">
          <CommentSkeleton />
          <CommentSkeleton />
          <CommentSkeleton />
        </div>
      </div>
    </div>
  );
};

export default PostPageSkeleton;
