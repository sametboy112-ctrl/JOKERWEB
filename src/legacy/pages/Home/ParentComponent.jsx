import { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BiUpArrowAlt, BiHomeAlt, BiMoviePlay, BiTv, BiSearch, BiBookmark } from 'react-icons/bi';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import Sidebar from './Sidebar';
import { buildBrowsePath, getCategoryBySlug } from './urlFilters';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../firebase";
import AuthModal from "../../components/AuthModal";
import { trackVisit } from "../../utils/analytics";

function ParentComponent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [scrollPosition, setScrollPosition] = useState(0);
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleOpenAuthModal = () => setIsAuthModalOpen(true);
    window.addEventListener('openAuthModal', handleOpenAuthModal);
    return () => window.removeEventListener('openAuthModal', handleOpenAuthModal);
  }, []);

  // Log a visitor analytics event on every page change.
  useEffect(() => {
    trackVisit(location.pathname);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const activePage =
    location.pathname === '/'                  ? 'home'
    : location.pathname.startsWith('/movies')  ? 'movies'
    : location.pathname.startsWith('/series')  ? 'series'
    : location.pathname.startsWith('/search')  ? 'search'
    : location.pathname.startsWith('/watchlist') ? 'watchlist'
    : location.pathname.startsWith('/movie/')  ? 'movies'
    : location.pathname.startsWith('/tv/')     ? 'series'
    : 'home';

  const handleScroll = useCallback(() => {
    setScrollPosition(window.scrollY);
  }, []);
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Hide bottom nav when the virtual keyboard is open (mobile)
  useEffect(() => {
    let timeoutId;
    const handleFocus = (e) => {
      const tag = e.target.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') {
        setKeyboardOpen(true);
      }
    };
    const handleBlur = (e) => {
      const tag = e.target.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') {
        // Delay closing slightly to prevent flicker if jumping between inputs
        timeoutId = setTimeout(() => {
          // Double check if focus moved to another input
          const activeTag = document.activeElement?.tagName?.toLowerCase();
          if (activeTag !== 'input' && activeTag !== 'textarea') {
            setKeyboardOpen(false);
          }
        }, 150);
      }
    };

    // Use capture phase for focus/blur as they are much more reliable than focusin/focusout bubbling on iOS PWAs
    document.addEventListener('focus', handleFocus, true);
    document.addEventListener('blur', handleBlur, true);

    const vv = window.visualViewport;
    const handleResize = () => {
      if (vv && vv.height < window.innerHeight * 0.85) {
        setKeyboardOpen(true);
      }
    };
    if (vv) vv.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('focus', handleFocus, true);
      document.removeEventListener('blur', handleBlur, true);
      if (vv) vv.removeEventListener('resize', handleResize);
    };
  }, []);

  const selectedGenreId = (() => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    if (pathParts[0] === 'movies' && pathParts[1]) {
      return getCategoryBySlug('movie', pathParts[1])?.id ?? null;
    }
    if (pathParts[0] === 'series' && pathParts[1]) {
      return getCategoryBySlug('tv', pathParts[1])?.id ?? null;
    }
    return searchParams.get('genre') ? Number(searchParams.get('genre')) : null;
  })();

  const handleNavigation = (page) => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    if (page === 'home')        navigate('/');
    else if (page === 'movies') navigate('/movies');
    else if (page === 'series') navigate('/series');
    else                        navigate(`/${page}`);
  };

  const handleGenreSelect = (genreId) => {
    const type = activePage === 'series' ? 'tv' : 'movie';
    window.scrollTo({ top: 0, behavior: 'auto' });
    navigate(buildBrowsePath(type, genreId, 'popularity.desc'));
  };

  return (
    <div className="min-h-screen relative text-white">
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigation}
        selectedGenreId={selectedGenreId}
        onGenreSelect={handleGenreSelect}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {scrollPosition > 300 && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-4 right-4 z-50 text-white p-3 rounded-full bg-white/10 hover:bg-white/20 shadow-lg hover:scale-110 transition-all duration-300"
          aria-label="Scroll to Top"
        >
          <BiUpArrowAlt className="text-2xl" />
        </button>
      )}

      {/* Page content */}
      <div className="md:pl-[84px] pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
        <Outlet />

        {/* Footer — home page only */}
        {location.pathname === '/' && <footer className="bg-[#0a0c12]">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-600">
            <div className="flex items-center gap-3">
              <span className="text-white font-black text-sm">JOKER<span className="text-red-500"> MOVIES</span></span>
              <span>·</span>
              <span>Developed by <span className="text-gray-400 font-semibold">Amos James</span></span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <span>© {new Date().getFullYear()} JOKER MOVIES</span>
                <span>·</span>
                <span>
                  Data by{' '}
                  <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white underline underline-offset-2 transition-colors">
                    TMDB
                  </a>
                </span>
              </div>
              <a href="//www.dmca.com/Protection/Status.aspx?ID=204cd8cc-b62c-4f4a-aa8b-939824095655" title="DMCA.com Protection Status" className="dmca-badge"> <img src ="https://images.dmca.com/Badges/dmca_protected_sml_120m.png?ID=204cd8cc-b62c-4f4a-aa8b-939824095655"  alt="DMCA.com Protection Status" /></a>  <script src="https://images.dmca.com/Badges/DMCABadgeHelper.min.js"> </script>
              <button
                onClick={() => navigate('/analytics')}
                className="text-gray-600 hover:text-gray-300 underline underline-offset-2 transition-colors"
              >
                Analytics
              </button>
            </div>
          </div>
        </footer>}
      </div>

      {/* Mobile bottom navigation — floating iOS-style dock */}
      <AnimatePresence>
        {!keyboardOpen && (
          <motion.nav
            key="mobile-dock"
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="md:hidden fixed left-3 right-3 bottom-[calc(env(safe-area-inset-bottom)+10px)] z-50"
          >
            <div className="flex items-center justify-around gap-0.5 px-1.5 py-1.5 rounded-[26px] bg-white/[0.07] backdrop-blur-2xl border border-white/[0.14] shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
              {[
                { id: 'home', icon: BiHomeAlt, label: 'Home' },
                { id: 'movies', icon: BiMoviePlay, label: 'Movies' },
                { id: 'series', icon: BiTv, label: 'TV' },
                { id: 'search', icon: BiSearch, label: 'Search' },
                { id: 'watchlist', icon: BiBookmark, label: 'Watchlist' },
              ].map(({ id, icon: Icon, label }) => {
                const isActive = activePage === id;
                return (
                  <motion.button
                    key={id}
                    onClick={() => handleNavigation(id)}
                    whileTap={{ scale: 0.84 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                    className="relative flex flex-col items-center justify-center gap-0.5 py-2 rounded-[20px] flex-1 min-w-0 focus:outline-none"
                  >
                    {isActive && (
                      <motion.span
                        layoutId="dockActivePill"
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        className="absolute inset-0 rounded-[20px] bg-red-500/15 ring-1 ring-red-400/30"
                      />
                    )}
                    <motion.span
                      animate={{ scale: isActive ? 1.15 : 1, y: isActive ? -1 : 0 }}
                      transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                      className={`relative z-10 flex ${isActive ? 'text-red-400' : 'text-gray-400'}`}
                    >
                      <Icon className="text-[22px]" />
                    </motion.span>
                    <span className={`relative z-10 text-[9px] font-semibold tracking-tight transition-colors duration-200 ${isActive ? 'text-red-400' : 'text-gray-500'}`}>
                      {label}
                    </span>
                  </motion.button>
                );
              })}

              {/* Mobile Profile/Auth Button */}
              {user ? (
                <motion.button
                  onClick={handleLogout}
                  whileTap={{ scale: 0.84 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  className="relative flex flex-col items-center justify-center gap-0.5 py-2 rounded-[20px] flex-1 min-w-0 text-red-500/80 focus:outline-none"
                >
                  <FaSignOutAlt className="text-[20px]" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Log Out</span>
                </motion.button>
              ) : (
                <motion.button
                  onClick={() => setIsAuthModalOpen(true)}
                  whileTap={{ scale: 0.84 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  className="relative flex flex-col items-center justify-center gap-0.5 py-2 rounded-[20px] flex-1 min-w-0 text-gray-400 focus:outline-none"
                >
                  <FaUserCircle className="text-[22px]" />
                  <span className="text-[9px] font-semibold">Log In</span>
                </motion.button>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Auth Modal Form */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}

export default ParentComponent;
