import ReactPlayer from 'react-player';
import { useState } from 'react';

const VideoPlayer = ({ url }) => {
    console.log('VideoPlayer Native Rendering with URL:', url);
    return (
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
            <video
                src={url}
                className="w-full h-full"
                controls
                playsInline
                crossOrigin="anonymous"
            >
                Your browser does not support the video tag.
            </video>
        </div>
    );
};

export default VideoPlayer;