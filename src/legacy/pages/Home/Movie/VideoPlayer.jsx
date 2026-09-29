import { memo, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { FaRedo, FaServer } from "react-icons/fa";
import { fetchFullMovieStream, fetchFullTvStream } from "../Fetcher";

const VideoPlayer = ({ movieId, tvId, season, episode, title }) => {
  const [stream, setStream] = useState(null);
  const [sourceIdx, setSourceIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setStream(null);
    setSourceIdx(0);

    const loadStream = async () => {
      try {
        const data = tvId
          ? await fetchFullTvStream(tvId, season, episode)
          : await fetchFullMovieStream(movieId);
        if (!cancelled) setStream(data);
      } catch (streamError) {
        if (!cancelled) setError(streamError.message || "Unable to load stream sources.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadStream();
    return () => {
      cancelled = true;
    };
  }, [movieId, tvId, season, episode, retryKey]);

  const retry = () => setRetryKey((key) => key + 1);

  if (!movieId && !tvId) {
    return (
      <p className="p-6 text-center text-gray-400">
        This title does not have an IMDb stream ID yet.
      </p>
    );
  }

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2 px-1">
        <FaServer className="text-gray-400 text-sm mr-1" aria-hidden="true" />
        <span className="text-sm text-gray-400 font-medium mr-2">Source:</span>
        {(stream?.sources ?? []).map((source, index) => (
          <button
            key={source.embed_url}
            type="button"
            onClick={() => setSourceIdx(index)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${sourceIdx === index ? "bg-red-600 text-white shadow-md" : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"}`}
          >
            {source.name}
          </button>
        ))}
      </div>

      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden ring-1 ring-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            Loading stream sources…
          </div>
        )}
        {!loading && error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
            <p className="text-red-300">{error}</p>
            <button
              type="button"
              onClick={retry}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
            >
              <FaRedo aria-hidden="true" /> Retry
            </button>
          </div>
        )}
        {!loading && !error && stream?.sources?.[sourceIdx] && (
          <iframe
            key={stream.sources[sourceIdx].embed_url}
            src={stream.sources[sourceIdx].embed_url}
            allow="fullscreen *; picture-in-picture *; autoplay *; encrypted-media *; screen-wake-lock *;"
            allowFullScreen
            title={`${title || "Video"} stream`}
            referrerPolicy="origin"
            className="absolute inset-0 w-full h-full border-0"
          />
        )}
      </div>
    </div>
  );
};

VideoPlayer.propTypes = {
  movieId: PropTypes.string,
  tvId: PropTypes.string,
  season: PropTypes.number,
  episode: PropTypes.number,
  title: PropTypes.string,
};

export default memo(VideoPlayer);
