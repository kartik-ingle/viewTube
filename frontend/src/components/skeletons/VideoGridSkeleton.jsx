import React from 'react';

const VideoCardSkeleton = () => {
    return (
        <div className="flex flex-col gap-3">
            {/* Thumbnail Skeleton */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-white/5 skeleton">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-shimmer" />
            </div>

            <div className="flex gap-3 px-0.5">
                {/* Avatar Skeleton */}
                <div className="flex-shrink-0">
                    <div className="w-9 h-9 rounded-full bg-white/5 skeleton" />
                </div>

                <div className="flex flex-col flex-1 gap-2">
                    {/* Title Skeleton */}
                    <div className="h-4 bg-white/5 rounded w-[90%] skeleton" />
                    <div className="h-4 bg-white/5 rounded w-[70%] skeleton" />

                    {/* Meta Info Skeleton */}
                    <div className="flex gap-2 mt-1">
                        <div className="h-3 bg-white/5 rounded w-24 skeleton" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const VideoGridSkeleton = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-8 sm:gap-x-4 sm:gap-y-10">
            {Array.from({ length: 12 }).map((_, index) => (
                <VideoCardSkeleton key={index} />
            ))}
        </div>
    );
};

export default VideoGridSkeleton;
